"""
API routes for notifications.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app import schemas
from app.database import get_db
from app.services.notification_service import NotificationService


router = APIRouter(tags=["notifications"])


# ===== Response Models =====

class NotificationResponse(BaseModel):
    """Notification data for API responses."""
    id: str
    type: str
    title: str
    message: str
    created_at: datetime
    is_read: bool
    item_id: Optional[str] = None


class NotificationsListResponse(BaseModel):
    """List of notifications response."""
    notifications: List[NotificationResponse]
    unread_count: int


# ===== Helper Functions =====

async def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Optionally extract user ID from JWT token.
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

@router.get("/notifications", response_model=NotificationsListResponse)
async def get_notifications(
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> NotificationsListResponse:
    """
    Get user notifications.
    """
    notification_service = NotificationService(user_id)
    notifications = notification_service.get_notifications()
    
    return NotificationsListResponse(
        notifications=[
            NotificationResponse(
                id=n.id,
                type=n.type,
                title=n.title,
                message=n.message,
                created_at=n.created_at,
                is_read=n.is_read,
                item_id=n.item_id,
            )
            for n in notifications
        ],
        unread_count=notification_service.get_unread_count(),
    )


@router.post("/notifications/{notification_id}/read", response_model=schemas.MessageResponse)
async def mark_notification_read(
    notification_id: str,
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> schemas.MessageResponse:
    """
    Mark a notification as read.
    """
    notification_service = NotificationService(user_id)
    success = notification_service.mark_as_read(notification_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification {notification_id} not found",
        )
    
    return schemas.MessageResponse(
        success=True,
        message="Notification marked as read",
    )


@router.post("/notifications/read-all", response_model=schemas.MessageResponse)
async def mark_all_notifications_read(
    user_id: Optional[int] = Depends(get_optional_user_id),
) -> schemas.MessageResponse:
    """
    Mark all notifications as read.
    """
    notification_service = NotificationService(user_id)
    count = notification_service.mark_all_as_read()
    
    return schemas.MessageResponse(
        success=True,
        message=f"Marked {count} notifications as read",
    )
