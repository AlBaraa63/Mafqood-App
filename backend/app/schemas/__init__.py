"""
API Schemas
===========

Pydantic schemas for request/response validation.
"""

from .user import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    TokenResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from .item import (
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    ItemWithMatchesResponse,
    ItemListResponse,
    HistoryResponse,
)
from .match import (
    MatchResponse,
    MatchConfirmRequest,
    MatchListResponse,
)
from .notification import (
    NotificationResponse,
    NotificationListResponse,
)
from .common import (
    MessageResponse,
    PaginationParams,
    PaginatedResponse,
    HealthResponse,
)

__all__ = [
    # User
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "TokenResponse",
    "RefreshTokenRequest",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    # Item
    "ItemCreate",
    "ItemUpdate",
    "ItemResponse",
    "ItemWithMatchesResponse",
    "ItemListResponse",
    "HistoryResponse",
    # Match
    "MatchResponse",
    "MatchConfirmRequest",
    "MatchListResponse",
    # Notification
    "NotificationResponse",
    "NotificationListResponse",
    # Common
    "MessageResponse",
    "PaginationParams",
    "PaginatedResponse",
    "HealthResponse",
]
