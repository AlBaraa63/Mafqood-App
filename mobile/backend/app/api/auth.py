"""
Authentication Routes
=====================

Endpoints for user registration, login, and token management.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.core.logging import get_logger
from app.models import User, RefreshToken
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    TokenResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    MessageResponse,
)
from .deps import get_current_user, get_client_ip, get_user_agent


logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account and return authentication tokens.",
)
async def register(
    user_data: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user account.
    
    - Validates email uniqueness
    - Hashes password securely
    - Creates access and refresh tokens
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create user
    user = User(
        email=user_data.email.lower(),
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        is_venue=user_data.is_venue,
    )
    
    db.add(user)
    await db.flush()  # Get user.id
    
    # Create tokens
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
    )
    refresh_token, token_id = create_refresh_token(user_id=str(user.id))
    
    # Store refresh token
    refresh_token_record = RefreshToken(
        user_id=user.id,
        token_id=token_id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    db.add(refresh_token_record)
    
    await db.commit()
    await db.refresh(user)
    
    logger.info("User registered", user_id=str(user.id), email=user.email)
    
    return TokenResponse(
        user=UserResponse.model_validate(user),
        token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login user",
    description="Authenticate user and return tokens.",
)
async def login(
    credentials: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate user with email and password.
    
    - Validates credentials
    - Updates last login timestamp
    - Creates new access and refresh tokens
    """
    # Find user
    result = await db.execute(
        select(User).where(
            User.email == credentials.email.lower(),
            User.is_active == True,
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    
    # Create tokens
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
    )
    refresh_token, token_id = create_refresh_token(user_id=str(user.id))
    
    # Store refresh token
    refresh_token_record = RefreshToken(
        user_id=user.id,
        token_id=token_id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    db.add(refresh_token_record)
    
    await db.commit()
    await db.refresh(user)
    
    logger.info("User logged in", user_id=str(user.id), email=user.email)
    
    return TokenResponse(
        user=UserResponse.model_validate(user),
        token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Get new access token using refresh token.",
)
async def refresh_token(
    data: RefreshTokenRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Refresh access token using a valid refresh token.
    
    - Validates refresh token
    - Rotates refresh token (old one is invalidated)
    - Returns new access and refresh tokens
    """
    # Verify token
    token_data = verify_token(data.refresh_token, token_type="refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    # Find the refresh token record
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_id == token_data.token_id,
            RefreshToken.revoked_at == None,
        )
    )
    token_record = result.scalar_one_or_none()
    
    if not token_record or not token_record.is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or expired",
        )
    
    # Revoke old token
    token_record.revoked_at = datetime.now(timezone.utc)
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == token_record.user_id, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new tokens
    access_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
    )
    new_refresh_token, new_token_id = create_refresh_token(user_id=str(user.id))
    
    # Store new refresh token
    new_token_record = RefreshToken(
        user_id=user.id,
        token_id=new_token_id,
        expires_at=datetime.now(timezone.utc).replace(day=datetime.now().day + 30),
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    db.add(new_token_record)
    
    await db.commit()
    
    return TokenResponse(
        user=UserResponse.model_validate(user),
        token=access_token,
        refresh_token=new_refresh_token,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout user",
    description="Revoke refresh token to logout.",
)
async def logout(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    Logout user by revoking their refresh token.
    """
    token_data = verify_token(data.refresh_token, token_type="refresh")
    
    if token_data:
        # Find and revoke the token
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_id == token_data.token_id,
                RefreshToken.revoked_at == None,
            )
        )
        token_record = result.scalar_one_or_none()
        
        if token_record:
            token_record.revoked_at = datetime.now(timezone.utc)
            await db.commit()
    
    return MessageResponse(message="Logged out successfully")


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset",
    description="Send password reset email.",
)
async def forgot_password(
    data: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    Request password reset.
    
    Sends reset email if account exists. Always returns success
    to prevent email enumeration.
    """
    result = await db.execute(
        select(User).where(User.email == data.email.lower())
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Create reset token
        reset_token = create_password_reset_token(user.email)
        
        # TODO: Send email with reset link
        # background_tasks.add_task(send_password_reset_email, user.email, reset_token)
        
        logger.info("Password reset requested", email=user.email)
    
    # Always return success to prevent email enumeration
    return MessageResponse(message="If the email exists, a reset link will be sent")


@router.get(
    "/users/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get the current authenticated user's profile.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Get current user profile."""
    return UserResponse.model_validate(current_user)


@router.put(
    "/users/me",
    response_model=UserResponse,
    summary="Update current user",
    description="Update the current authenticated user's profile.",
)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Update current user profile."""
    
    # Update fields that are provided
    update_data = user_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    logger.info("User updated profile", user_id=str(current_user.id))
    
    return UserResponse.model_validate(current_user)
