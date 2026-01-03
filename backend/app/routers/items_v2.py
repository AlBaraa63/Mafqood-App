"""
API routes for lost and found items.
Refactored to use service layer for cleaner separation of concerns.
"""

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status, Header
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.services.item_service import ItemService
from app.services.matching_service import MatchingService
from app.constants import ALLOWED_EXTENSIONS, MAX_IMAGE_SIZE
from app.config import LOST_DIR, FOUND_DIR


router = APIRouter(tags=["items"])


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


async def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Optionally extract user ID from JWT token.
    Returns None if no token is provided (for anonymous reports).
    """
    if not authorization:
        return None
    
    from app.auth import get_token_user_id
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    token = parts[1]
    user_id_str = get_token_user_id(token)
    
    if not user_id_str:
        return None
    
    try:
        return int(user_id_str)
    except ValueError:
        return None


# ===== Endpoints =====

@router.post("/lost", response_model=schemas.LostItemResponse, status_code=status.HTTP_201_CREATED)
async def report_lost_item(
    file: UploadFile = File(..., description="Image of the lost item"),
    title: str = Form(..., min_length=1, max_length=200),
    description: Optional[str] = Form(None),
    location_type: str = Form(...),
    location_detail: Optional[str] = Form(None),
    time_frame: str = Form(...),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> schemas.LostItemResponse:
    """
    Report a lost item.
    
    Accepts multipart form data with an image and item details.
    Returns the created item along with AI-suggested matches from found items.
    """
    # Validate image
    validate_image_file(file)
    
    # Read image data
    image_data = await file.read()
    
    # Check file size
    if len(image_data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {MAX_IMAGE_SIZE / 1024 / 1024:.1f}MB",
        )
    
    try:
        # Use item service for business logic
        item_service = ItemService(db)
        db_item, matches = await item_service.create_item(
            item_type="lost",
            image_data=image_data,
            title=title,
            description=description,
            location_type=location_type,
            location_detail=location_detail,
            time_frame=time_frame,
            user_id=user_id,
        )
        
        # Prepare response
        item_response = crud.item_to_response(db_item)
        
        return schemas.LostItemResponse(item=item_response, matches=matches)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process item: {str(e)}",
        )


@router.post("/found", response_model=schemas.FoundItemResponse, status_code=status.HTTP_201_CREATED)
async def report_found_item(
    file: UploadFile = File(..., description="Image of the found item"),
    title: str = Form(..., min_length=1, max_length=200),
    description: Optional[str] = Form(None),
    location_type: str = Form(...),
    location_detail: Optional[str] = Form(None),
    time_frame: str = Form(...),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> schemas.FoundItemResponse:
    """
    Report a found item.
    
    Accepts multipart form data with an image and item details.
    Returns the created item along with AI-suggested matches from lost items.
    """
    # Validate image
    validate_image_file(file)
    
    # Read image data
    image_data = await file.read()
    
    # Check file size
    if len(image_data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {MAX_IMAGE_SIZE / 1024 / 1024:.1f}MB",
        )
    
    try:
        # Use item service for business logic
        item_service = ItemService(db)
        db_item, matches = await item_service.create_item(
            item_type="found",
            image_data=image_data,
            title=title,
            description=description,
            location_type=location_type,
            location_detail=location_detail,
            time_frame=time_frame,
            user_id=user_id,
        )
        
        # Prepare response
        item_response = crud.item_to_response(db_item)
        
        return schemas.FoundItemResponse(item=item_response, matches=matches)
        
    except Exception as e:
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
    item_service = ItemService(db)
    items = item_service.get_items_by_type("lost", skip=skip, limit=limit)
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
    item_service = ItemService(db)
    items = item_service.get_items_by_type("found", skip=skip, limit=limit)
    items_response = [crud.item_to_response(item) for item in items]
    
    return schemas.ItemListResponse(items=items_response, count=len(items_response))


@router.get("/history", response_model=schemas.HistoryResponse)
def get_user_history(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> schemas.HistoryResponse:
    """
    Get user activity with matches.
    
    If authenticated, returns only user's items.
    If anonymous, returns all items (for demo purposes).
    """
    item_service = ItemService(db)
    lost_with_matches, found_with_matches = item_service.get_user_history(user_id=user_id)
    
    return schemas.HistoryResponse(
        lost_items=lost_with_matches,
        found_items=found_with_matches,
    )


@router.get("/items/{item_id}", response_model=schemas.ItemInDBBase)
def get_item(item_id: int, db: Session = Depends(get_db)) -> schemas.ItemInDBBase:
    """
    Get a specific item by ID.
    """
    item_service = ItemService(db)
    item = item_service.get_item_by_id(item_id)
    
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )
    
    return crud.item_to_response(item)


@router.get("/items/{item_id}/matches", response_model=schemas.ItemWithMatches)
def get_item_matches(item_id: int, db: Session = Depends(get_db)) -> schemas.ItemWithMatches:
    """
    Get matches for a specific item.
    """
    item_service = ItemService(db)
    item = item_service.get_item_by_id(item_id)
    
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )
    
    matching_service = MatchingService(db)
    matches = matching_service.get_matches_for_item(item_id)
    item_response = crud.item_to_response(item)
    
    return schemas.ItemWithMatches(item=item_response, matches=matches)


@router.delete("/items/{item_id}", response_model=schemas.MessageResponse)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> schemas.MessageResponse:
    """
    Delete an item by ID.
    """
    item_service = ItemService(db)
    
    # Check if item exists
    item = item_service.get_item_by_id(item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found",
        )
    
    # Check authorization (if user_id is provided, verify ownership)
    if user_id is not None and item.user_id is not None and item.user_id != user_id:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this item",
        )
    
    item_service.delete_item(item_id)
    
    return schemas.MessageResponse(
        success=True,
        message=f"Item {item_id} deleted successfully",
    )
