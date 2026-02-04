"""
Health Check Routes
===================

Endpoints for monitoring application health.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.schemas import HealthResponse


router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check the health of the API and its dependencies.",
)
async def health_check(
    db: AsyncSession = Depends(get_db),
) -> HealthResponse:
    """
    Comprehensive health check endpoint.
    
    Checks:
    - Database connectivity
    - Redis connectivity (TODO)
    - S3 connectivity (TODO)
    """
    services = {}
    
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        services["database"] = "healthy"
    except Exception as e:
        services["database"] = f"unhealthy: {str(e)}"
    
    # TODO: Check Redis
    services["redis"] = "healthy"  # Placeholder
    
    # TODO: Check S3
    services["storage"] = "healthy"  # Placeholder
    
    # TODO: Check Celery workers
    services["ai_worker"] = "healthy"  # Placeholder
    
    # Determine overall status
    all_healthy = all(
        status == "healthy" for status in services.values()
    )
    
    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        version=settings.api_version,
        timestamp=datetime.now(timezone.utc),
        services=services,
    )


@router.get(
    "/",
    summary="Root endpoint",
    description="API welcome message.",
)
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.api_version,
        "environment": settings.app_env,
        "docs": "/docs",
        "health": "/health",
    }
