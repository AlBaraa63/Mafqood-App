"""
Notification Schemas
====================

Pydantic schemas for notification endpoints.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
import uuid

from pydantic import BaseModel, Field, ConfigDict


class NotificationType(str, Enum):
    """Type of notification."""
    MATCH = "match"
    MESSAGE = "message"
    UPDATE = "update"
    SYSTEM = "system"
    CLAIM = "claim"


class NotificationResponse(BaseModel):
    """Schema for notification response."""
    
    id: uuid.UUID = Field(..., description="Notification unique identifier")
    type: NotificationType = Field(..., description="Notification type")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    
    # Related entities
    item_id: Optional[uuid.UUID] = Field(None, description="Related item ID")
    match_id: Optional[uuid.UUID] = Field(None, description="Related match ID")
    
    # Status
    is_read: bool = Field(..., description="Whether notification is read")
    read_at: Optional[datetime] = Field(None, description="When notification was read")
    
    # Timestamps
    created_at: datetime = Field(..., description="Notification creation time")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "type": "match",
                "title": "New Match Found!",
                "message": "We found a potential match for your lost iPhone",
                "item_id": "550e8400-e29b-41d4-a716-446655440001",
                "match_id": "550e8400-e29b-41d4-a716-446655440002",
                "is_read": False,
                "read_at": None,
                "created_at": "2026-01-03T15:01:00Z"
            }
        }
    )


class NotificationListResponse(BaseModel):
    """Paginated list of notifications with summary."""
    
    notifications: List[NotificationResponse] = Field(
        ...,
        description="List of notifications"
    )
    total: int = Field(..., description="Total notifications count")
    unread_count: int = Field(..., description="Unread notifications count")
    page: int = Field(..., description="Current page")
    page_size: int = Field(..., description="Items per page")
    has_more: bool = Field(..., description="Whether more notifications exist")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "notifications": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "type": "match",
                        "title": "New Match Found!",
                        "message": "We found a potential match for your lost iPhone",
                        "item_id": "550e8400-e29b-41d4-a716-446655440001",
                        "match_id": "550e8400-e29b-41d4-a716-446655440002",
                        "is_read": False,
                        "read_at": None,
                        "created_at": "2026-01-03T15:01:00Z"
                    }
                ],
                "total": 5,
                "unread_count": 3,
                "page": 1,
                "page_size": 20,
                "has_more": False
            }
        }
    )


class NotificationMarkReadResponse(BaseModel):
    """Response after marking notification(s) as read."""
    
    message: str = Field(..., description="Success message")
    count: int = Field(..., description="Number of notifications marked as read")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Notifications marked as read",
                "count": 3
            }
        }
    )
