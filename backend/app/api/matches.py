"""
Match Routes
============

Endpoints for viewing and managing item matches.
"""

from datetime import datetime, timezone
from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.logging import get_logger
from app.models import User, Item, Match, Notification
from app.models.match import MatchStatus, MatchConfidence
from app.models.notification import NotificationType
from app.models.item import ItemType, ItemStatus
from app.schemas import (
    MatchResponse,
    MatchConfirmRequest,
    MatchListResponse,
    MessageResponse,
)
from .deps import get_current_user


logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/matches", tags=["Matches"])


@router.get(
    "",
    response_model=MatchListResponse,
    summary="Get user's matches",
    description="Get all matches for the current user's items.",
)
async def get_matches(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: Optional[MatchStatus] = Query(None, alias="status"),
    confidence_filter: Optional[MatchConfidence] = Query(None, alias="confidence"),
    min_similarity: float = Query(default=0.5, ge=0, le=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchListResponse:
    """
    Get all matches for the current user's items.
    
    Includes both matches where user's item is the source or target.
    """
    # Get user's item IDs
    items_query = select(Item.id).where(Item.user_id == current_user.id)
    items_result = await db.execute(items_query)
    user_item_ids = [row[0] for row in items_result.all()]
    
    if not user_item_ids:
        return MatchListResponse(
            matches=[],
            total=0,
            page=page,
            page_size=page_size,
            has_more=False,
            pending_count=0,
            confirmed_count=0,
        )
    
    # Base query for matches involving user's items
    base_query = select(Match).where(
        or_(
            Match.user_item_id.in_(user_item_ids),
            Match.matched_item_id.in_(user_item_ids),
        ),
        Match.similarity_score >= min_similarity,
    )
    
    if status_filter:
        base_query = base_query.where(Match.status == status_filter)
    
    if confidence_filter:
        base_query = base_query.where(Match.confidence == confidence_filter)
    
    # Count total
    count_query = select(func.count()).select_from(base_query.subquery())
    total = await db.execute(count_query)
    total_count = total.scalar() or 0
    
    # Get paginated results
    offset = (page - 1) * page_size
    matches_query = (
        base_query
        .options(
            selectinload(Match.user_item).selectinload(Item.user),
            selectinload(Match.matched_item).selectinload(Item.user),
        )
        .order_by(Match.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    
    result = await db.execute(matches_query)
    matches = result.scalars().all()
    
    # Count pending and confirmed
    pending_query = (
        select(func.count())
        .select_from(Match)
        .where(
            or_(
                Match.user_item_id.in_(user_item_ids),
                Match.matched_item_id.in_(user_item_ids),
            ),
            Match.status == MatchStatus.PENDING,
        )
    )
    pending_result = await db.execute(pending_query)
    pending_count = pending_result.scalar() or 0
    
    confirmed_query = (
        select(func.count())
        .select_from(Match)
        .where(
            or_(
                Match.user_item_id.in_(user_item_ids),
                Match.matched_item_id.in_(user_item_ids),
            ),
            Match.status == MatchStatus.CLAIMED,
        )
    )
    confirmed_result = await db.execute(confirmed_query)
    confirmed_count = confirmed_result.scalar() or 0
    
    # Transform to response
    match_responses = []
    for match in matches:
        # Determine if user owns the user_item or matched_item
        viewer_is_user_item_owner = match.user_item_id in user_item_ids
        
        match_responses.append(
            MatchResponse.from_match(match, viewer_is_user_item_owner)
        )
    
    return MatchListResponse(
        matches=match_responses,
        total=total_count,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total_count,
        pending_count=pending_count,
        confirmed_count=confirmed_count,
    )


@router.get(
    "/{match_id}",
    response_model=MatchResponse,
    summary="Get match details",
    description="Get detailed information about a specific match.",
)
async def get_match(
    match_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchResponse:
    """
    Get match details by ID.
    
    Marks the match as viewed by the current user.
    """
    result = await db.execute(
        select(Match)
        .where(Match.id == match_id)
        .options(
            selectinload(Match.user_item).selectinload(Item.user),
            selectinload(Match.matched_item).selectinload(Item.user),
        )
    )
    match = result.scalar_one_or_none()
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    # Check if user owns one of the items
    viewer_is_user_item_owner = match.user_item.user_id == current_user.id
    viewer_is_matched_item_owner = match.matched_item.user_id == current_user.id
    
    if not (viewer_is_user_item_owner or viewer_is_matched_item_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this match",
        )
    
    # Mark as viewed
    if viewer_is_user_item_owner and not match.user_item_owner_viewed:
        match.user_item_owner_viewed = True
        match.user_item_owner_viewed_at = datetime.now(timezone.utc)
        await db.commit()
    elif viewer_is_matched_item_owner and not match.matched_item_owner_viewed:
        match.matched_item_owner_viewed = True
        match.matched_item_owner_viewed_at = datetime.now(timezone.utc)
        await db.commit()
    
    return MatchResponse.from_match(match, viewer_is_user_item_owner)


@router.post(
    "/{match_id}/confirm",
    response_model=MatchResponse,
    summary="Confirm or reject match",
    description="Confirm or reject a match.",
)
async def confirm_match(
    match_id: uuid.UUID,
    confirm_data: MatchConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchResponse:
    """
    Confirm or reject a match.
    
    When both parties confirm, contact info is exchanged.
    """
    result = await db.execute(
        select(Match)
        .where(Match.id == match_id)
        .options(
            selectinload(Match.user_item).selectinload(Item.user),
            selectinload(Match.matched_item).selectinload(Item.user),
        )
    )
    match = result.scalar_one_or_none()
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    # Check if user owns one of the items
    viewer_is_user_item_owner = match.user_item.user_id == current_user.id
    viewer_is_matched_item_owner = match.matched_item.user_id == current_user.id
    
    if not (viewer_is_user_item_owner or viewer_is_matched_item_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm this match",
        )
    
    # Update confirmation status
    if viewer_is_user_item_owner:
        match.user_item_owner_confirmed = confirm_data.confirmed
        if confirm_data.notes:
            match.user_item_owner_notes = confirm_data.notes
    else:
        match.matched_item_owner_confirmed = confirm_data.confirmed
        if confirm_data.notes:
            match.matched_item_owner_notes = confirm_data.notes
    
    # Update match status based on confirmations
    if match.is_rejected:
        match.status = MatchStatus.REJECTED
    elif match.is_confirmed_by_both:
        match.status = MatchStatus.CLAIMED
        
        # Update item statuses
        match.user_item.status = ItemStatus.MATCHED
        match.matched_item.status = ItemStatus.MATCHED
        
        # Create notifications for both parties
        await _create_claim_notification(db, match, current_user)
    elif confirm_data.confirmed:
        match.status = MatchStatus.CONTACTED
        
        # Notify the other party
        await _create_confirmation_notification(db, match, current_user)
    
    await db.commit()
    await db.refresh(match)
    
    logger.info(
        "Match confirmation updated",
        match_id=str(match_id),
        user_id=str(current_user.id),
        confirmed=confirm_data.confirmed,
    )
    
    return MatchResponse.from_match(match, viewer_is_user_item_owner)


async def _create_confirmation_notification(
    db: AsyncSession,
    match: Match,
    confirming_user: User,
) -> None:
    """Create notification when one party confirms a match."""
    # Determine who to notify
    if match.user_item.user_id == confirming_user.id:
        notify_user_id = match.matched_item.user_id
        item_title = match.matched_item.title
    else:
        notify_user_id = match.user_item.user_id
        item_title = match.user_item.title
    
    notification = Notification(
        user_id=notify_user_id,
        type=NotificationType.MATCH,
        title="Match Confirmed!",
        message=f"Someone confirmed a match for '{item_title}'. Please review and confirm.",
        item_id=match.user_item_id if match.user_item.user_id == notify_user_id else match.matched_item_id,
        match_id=match.id,
    )
    db.add(notification)


async def _create_claim_notification(
    db: AsyncSession,
    match: Match,
    confirming_user: User,
) -> None:
    """Create notifications when both parties confirm (claim successful)."""
    # Notify both parties
    for user_id, item in [
        (match.user_item.user_id, match.user_item),
        (match.matched_item.user_id, match.matched_item),
    ]:
        notification = Notification(
            user_id=user_id,
            type=NotificationType.CLAIM,
            title="Item Matched Successfully! 🎉",
            message=f"Both parties have confirmed the match for '{item.title}'. Contact info is now available.",
            item_id=item.id,
            match_id=match.id,
        )
        db.add(notification)
