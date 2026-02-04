"""
Notification Routes
===================

Endpoints for managing user notifications.
"""

from datetime import datetime, timezone
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import get_logger
from app.models import User, Notification
from app.schemas import (
    NotificationResponse,
    NotificationListResponse,
    MessageResponse,
)
from app.schemas.notification import NotificationMarkReadResponse
from .deps import get_current_user


logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    summary="Get notifications",
    description="Get the current user's notifications.",
)
async def get_notifications(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    unread_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationListResponse:
    """
    Get user's notifications.
    
    Returns paginated list with unread count.
    """
    # Base query
    base_query = select(Notification).where(
        Notification.user_id == current_user.id,
        Notification.expires_at > datetime.now(timezone.utc),
    )
    
    if unread_only:
        base_query = base_query.where(Notification.is_read == False)
    
    # Count total
    count_query = select(func.count()).select_from(base_query.subquery())
    total = await db.execute(count_query)
    total_count = total.scalar() or 0
    
    # Count unread
    unread_query = select(func.count()).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
        Notification.expires_at > datetime.now(timezone.utc),
    )
    unread_result = await db.execute(unread_query)
    unread_count = unread_result.scalar() or 0
    
    # Get paginated results
    offset = (page - 1) * page_size
    notifications_query = (
        base_query
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    
    result = await db.execute(notifications_query)
    notifications = result.scalars().all()
    
    return NotificationListResponse(
        notifications=[
            NotificationResponse.model_validate(n) for n in notifications
        ],
        total=total_count,
        unread_count=unread_count,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total_count,
    )


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
    summary="Get notification",
    description="Get a specific notification by ID.",
)
async def get_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationResponse:
    """Get a specific notification."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return NotificationResponse.model_validate(notification)


@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark notification as read",
    description="Mark a specific notification as read.",
)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationResponse:
    """Mark a notification as read."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(notification)
    
    return NotificationResponse.model_validate(notification)


@router.put(
    "/read-all",
    response_model=NotificationMarkReadResponse,
    summary="Mark all as read",
    description="Mark all unread notifications as read.",
)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationMarkReadResponse:
    """Mark all notifications as read."""
    now = datetime.now(timezone.utc)
    
    # Update all unread notifications
    result = await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .values(is_read=True, read_at=now)
    )
    
    await db.commit()
    
    count = result.rowcount
    
    logger.info(
        "Marked all notifications as read",
        user_id=str(current_user.id),
        count=count,
    )
    
    return NotificationMarkReadResponse(
        message="All notifications marked as read",
        count=count,
    )


@router.delete(
    "/{notification_id}",
    response_model=MessageResponse,
    summary="Delete notification",
    description="Delete a specific notification.",
)
async def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Delete a notification."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    await db.delete(notification)
    await db.commit()
    
    return MessageResponse(message="Notification deleted")
