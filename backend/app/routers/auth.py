"""
Authentication router for user registration, login, and profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app import schemas, crud
from app.database import get_db
from app.auth import verify_password, create_access_token, get_token_user_id

router = APIRouter(prefix="/auth", tags=["authentication"])


# ===== Authentication Endpoints =====

@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    - Checks if email is already registered
    - Hashes the password securely
    - Creates user in database
    - Returns JWT token and user profile
    """
    # Check if user already exists
    existing_user = crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please use a different email or login.",
        )
    
    # Create new user
    try:
        user = crud.create_user(db, user_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    # Convert to response schema
    user_response = crud.user_to_response(user)
    
    return schemas.AuthResponse(
        success=True,
        token=access_token,
        user=user_response,
    )


@router.post("/login", response_model=schemas.AuthResponse)
async def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    - Validates email and password
    - Returns JWT token and user profile
    """
    # Get user by email
    user = crud.get_user_by_email(db, credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Check if user is active
    if not user.is_active:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    # Convert to response schema
    user_response = crud.user_to_response(user)
    
    return schemas.AuthResponse(
        success=True,
        token=access_token,
        user=user_response,
    )


@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(request: dict, db: Session = Depends(get_db)):
    """
    Initiate password reset process.
    
    TODO: Implement email sending with reset token
    For now, returns success message for any valid email.
    """
    email = request.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required",
        )
    
    # Check if user exists (but don't reveal if email is not found for security)
    user = crud.get_user_by_email(db, email)
    
    # Always return success to prevent email enumeration
    return schemas.MessageResponse(
        success=True,
        message="If an account exists with this email, you will receive password reset instructions.",
    )


# ===== User Profile Endpoints =====

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """
    Dependency to extract and validate user ID from JWT token.
    
    Expects Authorization header in format: "Bearer <token>"
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication format. Use: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = parts[1]
    
    # Decode token and get user ID
    user_id_str = get_token_user_id(token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    return user_id


@router.get("/users/me", response_model=schemas.UserResponse)
async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get current user's profile.
    
    Requires valid JWT token in Authorization header.
    """
    user = crud.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return crud.user_to_response(user)


@router.put("/users/me", response_model=schemas.UserResponse)
async def update_current_user(
    user_data: schemas.UserUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Update current user's profile.
    
    Can update: full_name, phone, password
    Requires valid JWT token in Authorization header.
    """
    user = crud.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Update user
    updated_user = crud.update_user(db, user, user_data)
    
    return crud.user_to_response(updated_user)
