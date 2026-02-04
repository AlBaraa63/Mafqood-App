"""
Notification Tasks
==================

Celery tasks for push notifications.
"""

import asyncio
from typing import Optional, Dict, Any, List

from celery import shared_task  # type: ignore

from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
    name="app.tasks.notifications.send_push_notification",
)
def send_push_notification(
    self,
    user_id: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
) -> dict:
    """
    Send push notification to a user.
    
    Args:
        user_id: User UUID string
        title: Notification title
        body: Notification body
        data: Additional data payload
        
    Returns:
        Send result
    """
    return asyncio.get_event_loop().run_until_complete(
        _send_push_async(user_id, title, body, data)
    )


async def _send_push_async(
    user_id: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]],
) -> dict:
    """Async implementation of send_push_notification."""
    from sqlalchemy import select
    from app.models import User
    from app.core.database import get_db_context
    import uuid
    
    async with get_db_context() as db:
        result = await db.execute(
            select(User).where(User.id == uuid.UUID(user_id))
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return {"success": False, "error": "User not found"}
        
        if not user.fcm_token:
            logger.info("User has no FCM token", user_id=user_id)
            return {"success": False, "error": "No FCM token"}
        
        # Send via Firebase Cloud Messaging
        success = await _send_fcm_message(
            token=user.fcm_token,
            title=title,
            body=body,
            data=data or {},
        )
        
        return {
            "success": success,
            "user_id": user_id,
        }


async def _send_fcm_message(
    token: str,
    title: str,
    body: str,
    data: Dict[str, Any],
) -> bool:
    """Send message via Firebase Cloud Messaging."""
    try:
        import firebase_admin  # type: ignore
        from firebase_admin import credentials, messaging  # type: ignore
        
        # Initialize Firebase if not already done
        if not firebase_admin._apps:
            # In production, use proper credentials
            if settings.firebase_credentials_path:
                cred = credentials.Certificate(settings.firebase_credentials_path)
                firebase_admin.initialize_app(cred)
            else:
                logger.warning("Firebase credentials not configured")
                return False
        
        # Create message
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data={k: str(v) for k, v in data.items()},
            token=token,
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    icon="ic_notification",
                    color="#4A90A4",
                ),
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        badge=1,
                        sound="default",
                    ),
                ),
            ),
        )
        
        # Send
        response = messaging.send(message)
        logger.info("FCM message sent", response=response)
        
        return True
        
    except Exception as e:
        logger.error("Failed to send FCM message", error=str(e))
        return False


@shared_task(
    bind=True,
    name="app.tasks.notifications.send_bulk_notifications",
)
def send_bulk_notifications(
    self,
    user_ids: List[str],
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
) -> dict:
    """
    Send push notification to multiple users.
    
    Args:
        user_ids: List of user UUID strings
        title: Notification title
        body: Notification body
        data: Additional data payload
        
    Returns:
        Bulk send result
    """
    results = {
        "total": len(user_ids),
        "success": 0,
        "failed": 0,
    }
    
    for user_id in user_ids:
        result = asyncio.get_event_loop().run_until_complete(
            _send_push_async(user_id, title, body, data)
        )
        if result.get("success"):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    return results


@shared_task(
    bind=True,
    name="app.tasks.notifications.send_match_notification",
)
def send_match_notification(
    self,
    match_id: str,
    user_id: str,
    match_confidence: str,
) -> dict:
    """
    Send notification about a new match.
    
    Args:
        match_id: Match UUID string
        user_id: User to notify
        match_confidence: 'high', 'medium', or 'low'
        
    Returns:
        Send result
    """
    confidence_messages = {
        "high": "Great news! We found a high-confidence match for your item.",
        "medium": "Good news! We found a potential match for your item.",
        "low": "We found a possible match for your item.",
    }
    
    body = confidence_messages.get(match_confidence, confidence_messages["medium"])
    
    return asyncio.get_event_loop().run_until_complete(
        _send_push_async(
            user_id=user_id,
            title="🎯 Match Found!",
            body=body,
            data={
                "type": "match",
                "match_id": match_id,
            },
        )
    )


@shared_task(
    bind=True,
    name="app.tasks.notifications.send_match_confirmation_notification",
)
def send_match_confirmation_notification(
    self,
    match_id: str,
    confirming_user_id: str,
    other_user_id: str,
) -> dict:
    """
    Notify user that the other party confirmed a match.
    
    Args:
        match_id: Match UUID string
        confirming_user_id: User who confirmed
        other_user_id: User to notify
        
    Returns:
        Send result
    """
    return asyncio.get_event_loop().run_until_complete(
        _send_push_async(
            user_id=other_user_id,
            title="✅ Match Confirmed!",
            body="The other party has confirmed this match. You can now exchange contact information.",
            data={
                "type": "match_confirmed",
                "match_id": match_id,
            },
        )
    )
