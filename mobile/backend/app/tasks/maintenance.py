"""
Maintenance Tasks
=================

Periodic maintenance and cleanup tasks.
"""

import asyncio
from datetime import datetime, timedelta

from celery import shared_task  # type: ignore

from app.core.logging import get_logger
from app.core.database import get_db_context


logger = get_logger(__name__)


@shared_task(
    bind=True,
    name="app.tasks.maintenance.cleanup_expired_tokens",
)
def cleanup_expired_tokens(self) -> dict:
    """
    Clean up expired refresh tokens.
    
    Returns:
        Cleanup result
    """
    return asyncio.get_event_loop().run_until_complete(
        _cleanup_tokens_async()
    )


async def _cleanup_tokens_async() -> dict:
    """Async implementation of cleanup_expired_tokens."""
    from sqlalchemy import delete
    from app.models import RefreshToken
    
    async with get_db_context() as db:
        result = await db.execute(
            delete(RefreshToken).where(
                RefreshToken.expires_at < datetime.utcnow()
            )
        )
        await db.commit()
        
        deleted = result.rowcount
    
    logger.info("Expired tokens cleaned up", count=deleted)
    
    return {"deleted": deleted}


@shared_task(
    bind=True,
    name="app.tasks.maintenance.cleanup_expired_notifications",
)
def cleanup_expired_notifications(self) -> dict:
    """
    Clean up expired notifications.
    
    Returns:
        Cleanup result
    """
    return asyncio.get_event_loop().run_until_complete(
        _cleanup_notifications_async()
    )


async def _cleanup_notifications_async() -> dict:
    """Async implementation of cleanup_expired_notifications."""
    from sqlalchemy import delete
    from app.models import Notification
    
    async with get_db_context() as db:
        result = await db.execute(
            delete(Notification).where(
                Notification.expires_at < datetime.utcnow()
            )
        )
        await db.commit()
        
        deleted = result.rowcount
    
    logger.info("Expired notifications cleaned up", count=deleted)
    
    return {"deleted": deleted}


@shared_task(
    bind=True,
    name="app.tasks.maintenance.cleanup_old_audit_logs",
)
def cleanup_old_audit_logs(self, days: int = 90) -> dict:
    """
    Clean up old audit logs.
    
    Args:
        days: Delete logs older than this many days
        
    Returns:
        Cleanup result
    """
    return asyncio.get_event_loop().run_until_complete(
        _cleanup_audit_logs_async(days)
    )


async def _cleanup_audit_logs_async(days: int) -> dict:
    """Async implementation of cleanup_old_audit_logs."""
    from sqlalchemy import delete
    from app.models import AuditLog
    
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    async with get_db_context() as db:
        result = await db.execute(
            delete(AuditLog).where(AuditLog.created_at < cutoff)
        )
        await db.commit()
        
        deleted = result.rowcount
    
    logger.info("Old audit logs cleaned up", count=deleted, days=days)
    
    return {"deleted": deleted, "older_than_days": days}


@shared_task(
    bind=True,
    name="app.tasks.maintenance.update_item_statistics",
)
def update_item_statistics(self) -> dict:
    """
    Update various item statistics.
    
    Returns:
        Statistics update result
    """
    return asyncio.get_event_loop().run_until_complete(
        _update_statistics_async()
    )


async def _update_statistics_async() -> dict:
    """Async implementation of update_item_statistics."""
    from sqlalchemy import func, select
    from app.models import Item, Match
    from app.models.item import ItemStatus
    
    async with get_db_context() as db:
        # Get counts
        total_items = await db.scalar(select(func.count(Item.id)))
        open_items = await db.scalar(
            select(func.count(Item.id)).where(Item.status == ItemStatus.OPEN)
        )
        total_matches = await db.scalar(select(func.count(Match.id)))
    
    stats = {
        "total_items": total_items,
        "open_items": open_items,
        "total_matches": total_matches,
    }
    
    logger.info("Statistics updated", **stats)
    
    return stats


@shared_task(
    bind=True,
    name="app.tasks.maintenance.health_check",
)
def health_check(self) -> dict:
    """
    Perform system health check.
    
    Returns:
        Health check result
    """
    return asyncio.get_event_loop().run_until_complete(
        _health_check_async()
    )


async def _health_check_async() -> dict:
    """Async implementation of health_check."""
    from sqlalchemy import text
    
    results = {
        "database": False,
        "redis": False,
        "storage": False,
    }
    
    # Check database
    try:
        async with get_db_context() as db:
            await db.execute(text("SELECT 1"))
            results["database"] = True
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
    
    # Check Redis
    try:
        import redis
        from app.core.config import settings
        
        r = redis.from_url(settings.redis_url)
        r.ping()
        results["redis"] = True
    except Exception as e:
        logger.error("Redis health check failed", error=str(e))
    
    # Check storage
    try:
        from app.services.storage import get_storage_service
        
        storage = get_storage_service()
        # Just check if storage is accessible
        results["storage"] = True
    except Exception as e:
        logger.error("Storage health check failed", error=str(e))
    
    results["healthy"] = all(results.values())
    
    return results
