"""
API Routes
==========

FastAPI router definitions for all API endpoints.
"""

from .auth import router as auth_router
from .items import router as items_router
from .matches import router as matches_router
from .notifications import router as notifications_router
from .health import router as health_router

__all__ = [
    "auth_router",
    "items_router",
    "matches_router",
    "notifications_router",
    "health_router",
]
