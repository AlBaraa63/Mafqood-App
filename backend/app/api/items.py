"""
Item Routes
===========

Endpoints for creating and managing lost/found items.
"""

from datetime import datetime, timezone
from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, BackgroundTasks
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.logging import get_logger
from app.core.config import settings
from app.models import User, Item, Match
from app.models.item import ItemType, ItemStatus, ItemCategory, ContactMethod
from app.schemas import (
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    ItemWithMatchesResponse,
    HistoryResponse,
    MessageResponse,
)
from app.schemas.item import ItemSubmitResponse, MatchInItemResponse, MatchedItemResponse
from app.services.ai.matching_service import MatchingService
from .deps import get_current_user


logger = get_logger(__name__)

# Initialize matching service
matching_service = MatchingService()
router = APIRouter(prefix="/api/v1", tags=["Items"])


async def process_item_image(item_id: uuid.UUID, file: UploadFile) -> str:
    """
    Process and upload item image.
    Saves image to local uploads directory.
    """
    from pathlib import Path
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("./uploads/items")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Read file content
    image_data = await file.read()
    
    # Save original image
    image_path = upload_dir / f"{item_id}.jpg"
    image_path.write_bytes(image_data)
    
    # Create thumbnail (simple copy for now)
    thumb_path = upload_dir / f"{item_id}_thumb.jpg"
    thumb_path.write_bytes(image_data)
    
    return f"/uploads/items/{item_id}.jpg"


@router.post(
    "/lost",
    response_model=ItemSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a lost item",
    description="Submit a lost item report with image.",
)
async def create_lost_item(
    image: UploadFile = File(..., description="Item image"),
    title: str = Form(..., min_length=3, max_length=255),
    description: Optional[str] = Form(None, max_length=2000),
    category: ItemCategory = Form(default=ItemCategory.OTHER),
    brand: Optional[str] = Form(None, max_length=100),
    color: Optional[str] = Form(None, max_length=50),
    location: str = Form(..., min_length=2, max_length=255),
    location_detail: Optional[str] = Form(None, max_length=500),
    location_type: Optional[str] = Form(None, max_length=50),
    latitude: Optional[float] = Form(None, ge=-90, le=90),
    longitude: Optional[float] = Form(None, ge=-180, le=180),
    date_time: datetime = Form(...),
    contact_method: ContactMethod = Form(default=ContactMethod.IN_APP),
    contact_phone: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemSubmitResponse:
    """
    Submit a lost item report.
    
    - Uploads and processes image
    - Creates item record
    - Queues AI processing for matching
    - Returns immediate matches if found
    """
    # Create item
    item = Item(
        user_id=current_user.id,
        type=ItemType.LOST,
        status=ItemStatus.OPEN,
        title=title,
        description=description,
        category=category,
        brand=brand,
        color=color,
        location=location,
        location_detail=location_detail,
        location_type=location_type,
        latitude=latitude,
        longitude=longitude,
        date_time=date_time,
        contact_method=contact_method,
        contact_phone=contact_phone,
        contact_email=contact_email,
        image_url="",  # Placeholder, will be updated
    )
    
    db.add(item)
    await db.flush()
    
    # Process and upload image
    image_url = await process_item_image(item.id, image)
    item.image_url = image_url
    item.thumbnail_url = image_url.replace(".jpg", "_thumb.jpg")
    
    await db.commit()
    await db.refresh(item)
    
    # Process image with AI for matching
    matches_found = []
    try:
        # Read image data for AI processing
        await image.seek(0)
        image_data = await image.read()
        
        # Process item and find matches
        result = await matching_service.process_item(
            item_id=item.id,
            image_data=image_data,
            db=db,
        )
        
        logger.info(
            "AI processing complete",
            item_id=str(item.id),
            matches_found=result.matches_found,
            ai_category=result.ai_category,
        )
        
        # Fetch created matches with related items
        if result.matches_found > 0:
            match_result = await db.execute(
                select(Match)
                .options(selectinload(Match.matched_item))
                .where(Match.user_item_id == item.id)
                .order_by(Match.similarity_score.desc())
            )
            db_matches = match_result.scalars().all()
            
            for m in db_matches:
                matched_item = m.matched_item
                matches_found.append(MatchInItemResponse(
                    id=m.id,
                    matched_item=MatchedItemResponse(
                        id=matched_item.id,
                        type=matched_item.type.value,
                        title=matched_item.title,
                        image_url=matched_item.image_url,
                        thumbnail_url=matched_item.thumbnail_url,
                        location=matched_item.location,
                        date_time=matched_item.date_time,
                        category=matched_item.category.value,
                    ),
                    similarity=m.similarity_score,
                    confidence=m.confidence.value,
                    status=m.status.value,
                    created_at=m.created_at,
                ))
    except Exception as e:
        logger.error(
            "AI processing failed",
            error=str(e),
            error_type=type(e).__name__,
            item_id=str(item.id),
        )
        # Continue without AI matches - item is still created
    
    logger.info(
        "Lost item created",
        item_id=str(item.id),
        user_id=str(current_user.id),
        category=category.value,
    )
    
    # Check if AI processing succeeded
    ai_error = None if item.ai_processed else "AI processing unavailable - your item was saved but automatic matching is pending"
    
    return ItemSubmitResponse(
        item=ItemResponse.model_validate(item),
        matches=matches_found,
        match_count=len(matches_found),
        ai_error=ai_error,
    )


@router.post(
    "/found",
    response_model=ItemSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a found item",
    description="Submit a found item report with image.",
)
async def create_found_item(
    image: UploadFile = File(..., description="Item image"),
    title: str = Form(..., min_length=3, max_length=255),
    description: Optional[str] = Form(None, max_length=2000),
    category: ItemCategory = Form(default=ItemCategory.OTHER),
    brand: Optional[str] = Form(None, max_length=100),
    color: Optional[str] = Form(None, max_length=50),
    location: str = Form(..., min_length=2, max_length=255),
    location_detail: Optional[str] = Form(None, max_length=500),
    location_type: Optional[str] = Form(None, max_length=50),
    latitude: Optional[float] = Form(None, ge=-90, le=90),
    longitude: Optional[float] = Form(None, ge=-180, le=180),
    date_time: datetime = Form(...),
    contact_method: ContactMethod = Form(default=ContactMethod.IN_APP),
    contact_phone: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemSubmitResponse:
    """
    Submit a found item report.
    
    Same flow as lost item, but for found items.
    """
    # Create item
    item = Item(
        user_id=current_user.id,
        type=ItemType.FOUND,
        status=ItemStatus.OPEN,
        title=title,
        description=description,
        category=category,
        brand=brand,
        color=color,
        location=location,
        location_detail=location_detail,
        location_type=location_type,
        latitude=latitude,
        longitude=longitude,
        date_time=date_time,
        contact_method=contact_method,
        contact_phone=contact_phone,
        contact_email=contact_email,
        image_url="",
    )
    
    db.add(item)
    await db.flush()
    
    # Process image
    image_url = await process_item_image(item.id, image)
    item.image_url = image_url
    item.thumbnail_url = image_url.replace(".jpg", "_thumb.jpg")
    
    await db.commit()
    await db.refresh(item)
    
    # Process image with AI for matching
    matches_found = []
    try:
        # Read image data for AI processing
        await image.seek(0)
        image_data = await image.read()
        
        # Process item and find matches
        result = await matching_service.process_item(
            item_id=item.id,
            image_data=image_data,
            db=db,
        )
        
        logger.info(
            "AI processing complete",
            item_id=str(item.id),
            matches_found=result.matches_found,
            ai_category=result.ai_category,
        )
        
        # Fetch created matches with related items
        if result.matches_found > 0:
            match_result = await db.execute(
                select(Match)
                .options(selectinload(Match.matched_item))
                .where(Match.user_item_id == item.id)
                .order_by(Match.similarity_score.desc())
            )
            db_matches = match_result.scalars().all()
            
            for m in db_matches:
                matched_item = m.matched_item
                matches_found.append(MatchInItemResponse(
                    id=m.id,
                    matched_item=MatchedItemResponse(
                        id=matched_item.id,
                        type=matched_item.type.value,
                        title=matched_item.title,
                        image_url=matched_item.image_url,
                        thumbnail_url=matched_item.thumbnail_url,
                        location=matched_item.location,
                        date_time=matched_item.date_time,
                        category=matched_item.category.value,
                    ),
                    similarity=m.similarity_score,
                    confidence=m.confidence.value,
                    status=m.status.value,
                    created_at=m.created_at,
                ))
    except Exception as e:
        logger.error(
            "AI processing failed",
            error=str(e),
            error_type=type(e).__name__,
            item_id=str(item.id),
        )
        # Continue without AI matches - item is still created
    
    logger.info(
        "Found item created",
        item_id=str(item.id),
        user_id=str(current_user.id),
        category=category.value,
    )
    
    # Check if AI processing succeeded
    ai_error = None if item.ai_processed else "AI processing unavailable - your item was saved but automatic matching is pending"
    
    return ItemSubmitResponse(
        item=ItemResponse.model_validate(item),
        matches=matches_found,
        match_count=len(matches_found),
        ai_error=ai_error,
    )


@router.get(
    "/history",
    response_model=HistoryResponse,
    summary="Get user's item history",
    description="Get all lost and found items submitted by the current user.",
)
async def get_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: Optional[ItemStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HistoryResponse:
    """
    Get user's item history with matches.
    
    Returns both lost and found items with their associated matches.
    """
    # Base query for user's items
    base_query = select(Item).where(Item.user_id == current_user.id)
    
    if status_filter:
        base_query = base_query.where(Item.status == status_filter)
    
    # Get lost items with matches
    lost_query = (
        base_query
        .where(Item.type == ItemType.LOST)
        .options(selectinload(Item.user_matches).selectinload(Match.matched_item))
        .order_by(Item.created_at.desc())
    )
    lost_result = await db.execute(lost_query)
    lost_items = lost_result.scalars().all()
    
    # Get found items with matches
    found_query = (
        base_query
        .where(Item.type == ItemType.FOUND)
        .options(selectinload(Item.matched_in).selectinload(Match.user_item))
        .order_by(Item.created_at.desc())
    )
    found_result = await db.execute(found_query)
    found_items = found_result.scalars().all()
    
    # Transform to response format
    lost_with_matches = []
    for item in lost_items:
        matches = [
            MatchInItemResponse(
                id=m.id,
                matched_item=MatchedItemResponse.model_validate(m.matched_item),
                similarity=m.similarity_score,
                confidence=m.confidence.value,
                status=m.status.value,
                created_at=m.created_at,
            )
            for m in item.user_matches
        ]
        lost_with_matches.append(
            ItemWithMatchesResponse(
                item=ItemResponse.model_validate(item),
                matches=matches,
            )
        )
    
    found_with_matches = []
    for item in found_items:
        matches = [
            MatchInItemResponse(
                id=m.id,
                matched_item=MatchedItemResponse.model_validate(m.user_item),
                similarity=m.similarity_score,
                confidence=m.confidence.value,
                status=m.status.value,
                created_at=m.created_at,
            )
            for m in item.matched_in
        ]
        found_with_matches.append(
            ItemWithMatchesResponse(
                item=ItemResponse.model_validate(item),
                matches=matches,
            )
        )
    
    return HistoryResponse(
        lost_items=lost_with_matches,
        found_items=found_with_matches,
    )


@router.get(
    "/items/{item_id}",
    response_model=ItemResponse,
    summary="Get item details",
    description="Get detailed information about a specific item.",
)
async def get_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemResponse:
    """
    Get item details by ID.
    
    Increments view count for items not owned by the current user.
    """
    result = await db.execute(
        select(Item)
        .where(Item.id == item_id)
        .options(selectinload(Item.user))
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    
    # Increment view count if not owner
    if item.user_id != current_user.id:
        item.view_count += 1
        await db.commit()
    
    response = ItemResponse.model_validate(item)
    
    # Include owner info
    from app.schemas.user import UserBrief
    response.owner = UserBrief.model_validate(item.user)
    
    return response


@router.delete(
    "/items/{item_id}",
    response_model=MessageResponse,
    summary="Delete item",
    description="Delete an item (must be owner).",
)
async def delete_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    Delete an item.
    
    Only the item owner can delete it.
    """
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this item",
        )
    
    await db.delete(item)
    await db.commit()
    
    logger.info("Item deleted", item_id=str(item_id), user_id=str(current_user.id))
    
    return MessageResponse(message="Item deleted successfully")


@router.put(
    "/items/{item_id}",
    response_model=ItemResponse,
    summary="Update item",
    description="Update an item (must be owner).",
)
async def update_item(
    item_id: uuid.UUID,
    item_data: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemResponse:
    """
    Update an item.
    
    Only the item owner can update it.
    """
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this item",
        )
    
    # Update fields
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    await db.commit()
    await db.refresh(item)
    
    logger.info("Item updated", item_id=str(item_id), user_id=str(current_user.id))
    
    return ItemResponse.model_validate(item)


@router.get(
    "/items/{item_id}/matches",
    response_model=List[MatchInItemResponse],
    summary="Get item matches",
    description="Get all matches for a specific item.",
)
async def get_item_matches(
    item_id: uuid.UUID,
    min_similarity: float = Query(default=0.5, ge=0, le=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[MatchInItemResponse]:
    """
    Get matches for an item.
    
    Only the item owner can see the matches.
    """
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view matches for this item",
        )
    
    # Get matches based on item type
    if item.type == ItemType.LOST:
        matches_query = (
            select(Match)
            .where(
                Match.user_item_id == item_id,
                Match.similarity_score >= min_similarity,
            )
            .options(selectinload(Match.matched_item))
            .order_by(Match.similarity_score.desc())
        )
    else:
        matches_query = (
            select(Match)
            .where(
                Match.matched_item_id == item_id,
                Match.similarity_score >= min_similarity,
            )
            .options(selectinload(Match.user_item))
            .order_by(Match.similarity_score.desc())
        )
    
    result = await db.execute(matches_query)
    matches = result.scalars().all()
    
    # Transform to response
    response = []
    for match in matches:
        matched_item = match.matched_item if item.type == ItemType.LOST else match.user_item
        response.append(
            MatchInItemResponse(
                id=match.id,
                matched_item=MatchedItemResponse.model_validate(matched_item),
                similarity=match.similarity_score,
                confidence=match.confidence.value,
                status=match.status.value,
                created_at=match.created_at,
            )
        )
    
    return response


@router.post(
    "/items/{item_id}/reprocess",
    response_model=MessageResponse,
    summary="Reprocess item AI matching",
    description="Retry AI processing for an item that failed or needs re-matching.",
)
async def reprocess_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    Reprocess an item's AI matching.
    
    Useful for:
    - Items where AI processing failed
    - Items that need re-matching after fixes
    - Manual retry of failed processing
    """
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reprocess this item",
        )
    
    # Read image from disk
    from pathlib import Path
    image_path = Path(f"./uploads/items/{item.id}.jpg")
    
    if not image_path.exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file not found on server",
        )
    
    image_data = image_path.read_bytes()
    
    # Process item with AI
    try:
        result = await matching_service.process_item(
            item_id=item.id,
            image_data=image_data,
            db=db,
        )
        
        logger.info(
            "Item reprocessed successfully",
            item_id=str(item.id),
            matches_found=result.matches_found,
            ai_category=result.ai_category,
        )
        
        return MessageResponse(
            message=f"Item reprocessed successfully. Found {result.matches_found} potential matches."
        )
        
    except Exception as e:
        logger.error(
            "Item reprocessing failed",
            error=str(e),
            error_type=type(e).__name__,
            item_id=str(item.id),
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing failed: {str(e)}",
        )

