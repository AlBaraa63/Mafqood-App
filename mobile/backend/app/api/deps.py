"""
API Dependencies
================

Shared dependencies for FastAPI route handlers.
"""

from typing import Optional
import uuid

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_token, TokenData
from app.core.exceptions import AuthenticationError, NotFoundError
from app.models import User


# HTTP Bearer token extractor
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Get current user from JWT token (optional).
    
    Returns None if no token provided or token is invalid.
    """
    if not credentials:
        return None
    
    token_data = verify_token(credentials.credentials, token_type="access")
    if not token_data:
        return None
    
    try:
        user_id = uuid.UUID(token_data.user_id)
    except ValueError:
        return None
    
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Raises HTTPException 401 if not authenticated.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = verify_token(credentials.credentials, token_type="access")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = uuid.UUID(token_data.user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current user, must be email verified.
    
    Raises HTTPException 403 if not verified.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )
    return current_user


def get_client_ip(request: Request) -> str:
    """
    Extract client IP from request.
    
    Handles X-Forwarded-For header for proxied requests.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # First IP in the list is the client
        return forwarded.split(",")[0].strip()
    
    if request.client:
        return request.client.host
    
    return "unknown"


def get_user_agent(request: Request) -> str:
    """Extract user agent from request headers."""
    return request.headers.get("User-Agent", "unknown")
