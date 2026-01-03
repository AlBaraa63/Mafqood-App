"""
API routes for lost and found items.
"""

import uuid
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app import crud, schemas, models
from app.database import get_db
from app.ai_services import process_image_for_report
from app.embeddings import get_image_embedding_async, find_top_matches
from app.config import LOST_DIR, FOUND_DIR
from app.constants import ALLOWED_EXTENSIONS, MAX_IMAGE_SIZE, TOP_K_MATCHES


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
    background_tasks: BackgroundTasks,
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
    
    # Read image data
    image_data = await file.read()
    
    # Run image processing pipeline (saves image internally)
    processed_data = process_image_for_report(image_data, "lost")
    image_path = processed_data["image_path"]
    analysis_results = processed_data["analysis"]
    
    # --- AI-Powered Auto-fill/Enhancement ---
    
    # Auto-fill/enhance description with AI-extracted text
    ai_description = analysis_results.get("extracted_text")
    if ai_description:
        description = f"{description or ''} [AI OCR: {ai_description}]".strip()
    
    # Auto-fill/enhance title with AI-detected object
    ai_object = analysis_results.get("detected_object")
    if ai_object and (not title or title.lower() == 'lost item'):
        title = f"Lost {ai_object.capitalize()}"
    elif ai_object and title and ai_object.lower() not in title.lower():
        title = f"{title} ({ai_object.capitalize()})"
    
    # --- End AI-Powered Auto-fill/Enhancement ---
    
    try:
        # Compute embedding asynchronously (non-blocking)
        full_path = Path(LOST_DIR.parent / image_path)
        
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
    background_tasks: BackgroundTasks,
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
    
    # Read image data
    image_data = await file.read()
    
    # Run image processing pipeline (saves image internally)
    processed_data = process_image_for_report(image_data, "found")
    image_path = processed_data["image_path"]
    analysis_results = processed_data["analysis"]
    
    # --- AI-Powered Auto-fill/Enhancement ---
    
    # Auto-fill/enhance description with AI-extracted text
    ai_description = analysis_results.get("extracted_text")
    if ai_description:
        description = f"{description or ''} [AI OCR: {ai_description}]".strip()
    
    # Auto-fill/enhance title with AI-detected object
    ai_object = analysis_results.get("detected_object")
    if ai_object and (not title or title.lower() == 'found item'):
        title = f"Found {ai_object.capitalize()}"
    elif ai_object and title and ai_object.lower() not in title.lower():
        title = f"{title} ({ai_object.capitalize()})"
    
    # --- End AI-Powered Auto-fill/Enhancement ---
    
    try:
        # Compute embedding asynchronously (non-blocking)
        full_path = Path(FOUND_DIR.parent / image_path)
        
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


# ===== Authentication & User Management Endpoints =====
# Mock implementation for demo purposes

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse

class MessageResponse(BaseModel):
    message: str

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    created_at: datetime
    is_read: bool
    item_id: Optional[str] = None

class NotificationsListResponse(BaseModel):
    notifications: List[NotificationResponse]

# Mock user data for demo
MOCK_USER = {
    "id": "user-1",
    "email": "demo@mafqood.ae",
    "full_name": "Demo User",
    "phone": "+971501234567",
}

MOCK_TOKEN = "mock-jwt-token-12345"


@router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint. For demo purposes, accepts any credentials.
    In production, this would verify against a real user database.
    """
    return AuthResponse(
        success=True,
        token=MOCK_TOKEN,
        user=UserResponse(**MOCK_USER)
    )


@router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register new user endpoint. For demo purposes, always succeeds.
    In production, this would create a real user in the database.
    """
    new_user = {
        "id": f"user-{user_data.email}",
        "email": user_data.email,
        "full_name": user_data.full_name,
        "phone": user_data.phone,
    }
    
    return AuthResponse(
        success=True,
        token=MOCK_TOKEN,
        user=UserResponse(**new_user)
    )


@router.post("/auth/logout", response_model=MessageResponse)
async def logout():
    """
    Logout endpoint. For demo purposes, always succeeds.
    """
    return MessageResponse(message="Logged out successfully")


@router.post("/auth/forgot-password", response_model=MessageResponse)
async def forgot_password(data: dict):
    """
    Forgot password endpoint. For demo purposes, always succeeds.
    """
    return MessageResponse(
        message="If this email is registered, you will receive a reset link shortly."
    )


@router.get("/users/me", response_model=UserResponse)
async def get_current_user(db: Session = Depends(get_db)):
    """
    Get current user profile. For demo purposes, returns mock user.
    In production, this would get the user from the JWT token.
    """
    return UserResponse(**MOCK_USER)


@router.put("/users/me", response_model=UserResponse)
async def update_current_user(
    update_data: dict,
    db: Session = Depends(get_db)
):
    """
    Update current user profile. For demo purposes, returns updated mock user.
    """
    updated_user = MOCK_USER.copy()
    if "full_name" in update_data:
        updated_user["full_name"] = update_data["full_name"]
    if "phone" in update_data:
        updated_user["phone"] = update_data["phone"]
    
    return UserResponse(**updated_user)


@router.get("/notifications", response_model=NotificationsListResponse)
async def get_notifications(db: Session = Depends(get_db)):
    """
    Get user notifications. For demo purposes, returns empty list.
    """
    return NotificationsListResponse(notifications=[])


@router.post("/notifications/{notification_id}/read", response_model=MessageResponse)
async def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    """
    Mark a notification as read. For demo purposes, always succeeds.
    """
    return MessageResponse(message="Notification marked as read")


@router.post("/notifications/read-all", response_model=MessageResponse)
async def mark_all_notifications_read(db: Session = Depends(get_db)):
    """
    Mark all notifications as read. For demo purposes, always succeeds.
    """
    return MessageResponse(message="All notifications marked as read")
