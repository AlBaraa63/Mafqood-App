"""
Celery Application Configuration
================================

Celery worker setup for async task processing.
"""

from celery import Celery  # type: ignore

from app.core.config import settings


# Create Celery app
celery_app = Celery(
    "mafqood",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.image_processing",
        "app.tasks.matching",
        "app.tasks.notifications",
    ],
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task execution settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Rate limiting
    task_annotations={
        "app.tasks.image_processing.*": {
            "rate_limit": "30/m",  # 30 per minute
        },
        "app.tasks.matching.*": {
            "rate_limit": "20/m",
        },
    },
    
    # Task routing
    task_routes={
        "app.tasks.image_processing.*": {"queue": "ai"},
        "app.tasks.matching.*": {"queue": "ai"},
        "app.tasks.notifications.*": {"queue": "notifications"},
    },
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_concurrency=2,  # For CPU-bound AI tasks
    
    # Beat schedule for periodic tasks
    beat_schedule={
        "cleanup-expired-tokens": {
            "task": "app.tasks.maintenance.cleanup_expired_tokens",
            "schedule": 3600.0,  # Every hour
        },
        "cleanup-expired-notifications": {
            "task": "app.tasks.maintenance.cleanup_expired_notifications",
            "schedule": 86400.0,  # Daily
        },
    },
)
