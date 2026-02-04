"""
API routes for lost and found items.
"""

import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.embeddings import get_image_embedding_async, find_top_matches
from app.config import (
    LOST_DIR,
    FOUND_DIR,
    ALLOWED_EXTENSIONS,
    MAX_IMAGE_SIZE,
    TOP_K_MATCHES,
)


router = APIRouter(prefix="/api", tags=["items"])


# ===== Helper Functions =====

def validate_image_file(file: UploadFile) -> None:
    """
    Validate that the uploaded file is an acceptable image.
    
    Args:
        file: The uploaded file
        
    Raises:
        HTTPException: If validation fails
    """
    # Check file extension
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )
    
    # Check content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )


async def save_upload_file(file: UploadFile, directory: Path) -> str:
    """
    Save an uploaded file to disk with a unique filename.
    
    Args:
        file: The uploaded file
        directory: Directory to save the file in
        
    Returns:
        Relative path to the saved file
        
    Raises:
        HTTPException: If save fails
    """
    try:
        # Generate unique filename
        ext = Path(file.filename).suffix if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = directory / unique_filename
        
        # Read and save file
        contents = await file.read()
        
        # Check file size
        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {MAX_IMAGE_SIZE / 1024 / 1024:.1f}MB",
            )
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return relative path
        return str(file_path.relative_to(directory.parent))
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )


def compute_matches(
    db: Session,
    query_embedding: List[float],
    target_type: str,
) -> List[schemas.MatchResult]:
    """
    Find similar items by comparing embeddings.
    
    Args:
        db: Database session
        query_embedding: Embedding of the query item
        target_type: Type of items to match against ("lost" or "found")
        
    Returns:
        List of match results with similarity scores
    """
    # Get all candidates with embeddings
    candidates = crud.get_items_with_embeddings(db, target_type)
    
    if not candidates:
        return []
    
    # Find top matches
    matches = find_top_matches(query_embedding, candidates, top_k=TOP_K_MATCHES)
    
    # Convert to response format
    match_results = []
    for item_id, similarity in matches:
        item = crud.get_item_by_id(db, item_id)
        if item:
            item_response = crud.item_to_response(item)
            match_results.append(
                schemas.MatchResult(item=item_response, similarity=similarity)
            )
    
    return match_results


# ===== Endpoints =====

@router.post("/lost", response_model=schemas.LostItemResponse, status_code=status.HTTP_201_CREATED)
async def report_lost_item(
    file: UploadFile = File(..., description="Image of the lost item"),
    title: str = Form(..., min_length=1, max_length=200),
    description: str = Form(None),
    location_type: str = Form(...),
    location_detail: str = Form(None),
    time_frame: str = Form(...),
    db: Session = Depends(get_db),
) -> schemas.LostItemResponse:
    """
    Report a lost item.
    
    Accepts multipart form data with an image and item details.
    Returns the created item along with AI-suggested matches from found items.
    """
    # Validate image
    validate_image_file(file)
    
    # Save image
    # TODO: Apply privacy blurring here before saving (future enhancement)
    image_path = await save_upload_file(file, LOST_DIR)
    
    try:
        # Compute embedding asynchronously (non-blocking)
        full_path = Path(image_path)
        if not full_path.is_absolute():
            full_path = LOST_DIR.parent / image_path
        
        embedding = await get_image_embedding_async(full_path)
        
        # Create item data
        item_data = schemas.ItemCreate(
            title=title,
            description=description,
            location_type=location_type,
            location_detail=location_detail,
            time_frame=time_frame,
        )
        
        # Save to database
        db_item = crud.create_item(
            db,
            item_type="lost",
            data=item_data,
            image_path=str(image_path),
            embedding=embedding,
        )
        
        # Find matches in found items
        matches = compute_matches(db, embedding, target_type="found")
        
        # Prepare response
        item_response = crud.item_to_response(db_item)
        
        return schemas.LostItemResponse(item=item_response, matches=matches)
        
    except Exception as e:
        # Clean up saved file on error
        try:
            (LOST_DIR.parent / image_path).unlink(missing_ok=True)
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process item: {str(e)}",
        )


@router.post("/found", response_model=schemas.FoundItemResponse, status_code=status.HTTP_201_CREATED)
async def report_found_item(
    file: UploadFile = File(..., description="Image of the found item"),
    title: str = Form(..., min_length=1, max_length=200),
    description: str = Form(None),
    location_type: str = Form(...),
    location_detail: str = Form(None),
    time_frame: str = Form(...),
    db: Session = Depends(get_db),
) -> schemas.FoundItemResponse:
    """
    Report a found item.
    
    Accepts multipart form data with an image and item details.
    Returns the created item along with AI-suggested matches from lost items.
    """
    # Validate image
    validate_image_file(file)
    
    # Save image
    # TODO: Apply privacy blurring here before saving (future enhancement)
    image_path = await save_upload_file(file, FOUND_DIR)
    
    try:
        # Compute embedding asynchronously (non-blocking)
        full_path = Path(image_path)
        if not full_path.is_absolute():
            full_path = FOUND_DIR.parent / image_path
        
        embedding = await get_image_embedding_async(full_path)
        
        # Create item data
        item_data = schemas.ItemCreate(
            title=title,
            description=description,
            location_type=location_type,
            location_detail=location_detail,
            time_frame=time_frame,
        )
        
        # Save to database
        db_item = crud.create_item(
            db,
            item_type="found",
            data=item_data,
            image_path=str(image_path),
            embedding=embedding,
        )
        
        # Find matches in lost items
        matches = compute_matches(db, embedding, target_type="lost")
        
        # Prepare response
        item_response = crud.item_to_response(db_item)
        
        return schemas.FoundItemResponse(item=item_response, matches=matches)
        
    except Exception as e:
        # Clean up saved file on error
        try:
            (FOUND_DIR.parent / image_path).unlink(missing_ok=True)
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process item: {str(e)}",
        )


@router.get("/lost", response_model=schemas.ItemListResponse)
def get_lost_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> schemas.ItemListResponse:
    """
    Get all lost items.
    
    Useful for admin/debugging or displaying all lost items in the UI.
    """
    items = crud.get_items_by_type(db, "lost", skip=skip, limit=limit)
    items_response = [crud.item_to_response(item) for item in items]
    
    return schemas.ItemListResponse(items=items_response, count=len(items_response))


@router.get("/found", response_model=schemas.ItemListResponse)
def get_found_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> schemas.ItemListResponse:
    """
    Get all found items.
    
    Useful for admin/debugging or displaying all found items in the UI.
    """
    items = crud.get_items_by_type(db, "found", skip=skip, limit=limit)
    items_response = [crud.item_to_response(item) for item in items]
    
    return schemas.ItemListResponse(items=items_response, count=len(items_response))


@router.get("/history", response_model=schemas.HistoryResponse)
def get_user_history(db: Session = Depends(get_db)) -> schemas.HistoryResponse:
    """
    Get user activity with matches.
    
    For now, treats all items as belonging to a single demo user.
    Returns both lost and found items with their respective matches.
    """
    # Get all lost items
    lost_items = crud.get_items_by_type(db, "lost", limit=1000)
    lost_with_matches = []
    
    for item in lost_items:
        embedding = item.get_embedding()
        matches = compute_matches(db, embedding, target_type="found")
        item_response = crud.item_to_response(item)
        lost_with_matches.append(
            schemas.ItemWithMatches(item=item_response, matches=matches)
        )
    
    # Get all found items
    found_items = crud.get_items_by_type(db, "found", limit=1000)
    found_with_matches = []
    
    for item in found_items:
        embedding = item.get_embedding()
        matches = compute_matches(db, embedding, target_type="lost")
        item_response = crud.item_to_response(item)
        found_with_matches.append(
            schemas.ItemWithMatches(item=item_response, matches=matches)
        )
    
    return schemas.HistoryResponse(
        lost_items=lost_with_matches,
        found_items=found_with_matches,
    )


@router.get("/items/{item_id}", response_model=schemas.ItemInDBBase)
def get_item(item_id: int, db: Session = Depends(get_db)) -> schemas.ItemInDBBase:
    """
    Get a specific item by ID.
    """
    item = crud.get_item_by_id(db, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )
    
    return crud.item_to_response(item)
