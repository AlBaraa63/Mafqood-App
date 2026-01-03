"""
Notification service for managing user notifications.
Currently provides mock implementation - to be connected to real notification system.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class Notification(BaseModel):
    """Notification data model."""
    id: str
    type: str  # "match", "message", "system"
    title: str
    message: str
    created_at: datetime
    is_read: bool = False
    item_id: Optional[str] = None


class NotificationService:
    """Service for managing user notifications."""
    
    def __init__(self, user_id: Optional[int] = None):
        self.user_id = user_id
        # In production, this would connect to a notification database/service
        self._notifications: List[Notification] = []
    
    def get_notifications(
        self,
        unread_only: bool = False,
        limit: int = 50,
    ) -> List[Notification]:
        """
        Get user's notifications.
        
        Args:
            unread_only: If True, only return unread notifications
            limit: Maximum number of notifications to return
            
        Returns:
            List of notifications
        """
        notifications = self._notifications
        
        if unread_only:
            notifications = [n for n in notifications if not n.is_read]
        
        return notifications[:limit]
    
    def mark_as_read(self, notification_id: str) -> bool:
        """
        Mark a notification as read.
        
        Args:
            notification_id: ID of notification to mark
            
        Returns:
            True if found and marked, False if not found
        """
        for notification in self._notifications:
            if notification.id == notification_id:
                notification.is_read = True
                return True
        return False
    
    def mark_all_as_read(self) -> int:
        """
        Mark all notifications as read.
        
        Returns:
            Number of notifications marked
        """
        count = 0
        for notification in self._notifications:
            if not notification.is_read:
                notification.is_read = True
                count += 1
        return count
    
    def create_match_notification(
        self,
        item_id: str,
        match_item_id: str,
        similarity: float,
    ) -> Notification:
        """
        Create a notification for a new match.
        
        Args:
            item_id: ID of the user's item
            match_item_id: ID of the matched item
            similarity: Similarity score (0-1)
            
        Returns:
            Created notification
        """
        notification = Notification(
            id=f"notif-{len(self._notifications) + 1}",
            type="match",
            title="New Match Found!",
            message=f"We found a {int(similarity * 100)}% match for your item.",
            created_at=datetime.utcnow(),
            is_read=False,
            item_id=item_id,
        )
        
        self._notifications.insert(0, notification)
        return notification
    
    def get_unread_count(self) -> int:
        """Get count of unread notifications."""
        return sum(1 for n in self._notifications if not n.is_read)
