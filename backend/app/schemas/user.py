"""
User Schemas
============

Pydantic schemas for user and authentication endpoints.
"""

from datetime import datetime
from typing import Optional
import uuid
import re

from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict


# Password validation regex
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$"
)


class UserBase(BaseModel):
    """Base user schema with common fields."""
    
    email: EmailStr = Field(..., description="User email address")
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="User's full name"
    )


class UserCreate(UserBase):
    """Schema for user registration."""
    
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
    )
    phone: Optional[str] = Field(
        None,
        pattern=r"^\+?[0-9]{10,15}$",
        description="Phone number with country code"
    )
    is_venue: bool = Field(
        default=False,
        description="Whether this is a venue account"
    )
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be at least 8 characters with 1 uppercase, "
                "1 lowercase, and 1 number"
            )
        return v
    
    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        """Clean and validate full name."""
        v = " ".join(v.split())  # Normalize whitespace
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "ahmad@example.com",
                "password": "SecurePass123!",
                "full_name": "Ahmad Ali",
                "phone": "+971501234567",
                "is_venue": False
            }
        }
    )


class UserLogin(BaseModel):
    """Schema for user login."""
    
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "ahmad@example.com",
                "password": "SecurePass123!"
            }
        }
    )


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=255,
        description="User's full name"
    )
    phone: Optional[str] = Field(
        None,
        pattern=r"^\+?[0-9]{10,15}$",
        description="Phone number with country code"
    )
    preferred_language: Optional[str] = Field(
        None,
        pattern=r"^(en|ar)$",
        description="Preferred language (en or ar)"
    )
    fcm_token: Optional[str] = Field(
        None,
        max_length=512,
        description="Firebase Cloud Messaging token"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "Ahmad Ali Updated",
                "phone": "+971509999999",
                "preferred_language": "ar"
            }
        }
    )


class UserResponse(BaseModel):
    """Schema for user response (public profile)."""
    
    id: uuid.UUID = Field(..., description="User unique identifier")
    email: EmailStr = Field(..., description="User email address")
    full_name: str = Field(..., description="User's full name")
    phone: Optional[str] = Field(None, description="Phone number")
    avatar_url: Optional[str] = Field(None, description="Avatar image URL")
    is_venue: bool = Field(..., description="Whether this is a venue account")
    is_verified: bool = Field(..., description="Email verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "ahmad@example.com",
                "full_name": "Ahmad Ali",
                "phone": "+971501234567",
                "avatar_url": "https://cdn.mafqood.ae/avatars/uuid.jpg",
                "is_venue": False,
                "is_verified": True,
                "created_at": "2026-01-03T10:00:00Z"
            }
        }
    )


class UserBrief(BaseModel):
    """Brief user info for item responses."""
    
    id: uuid.UUID
    full_name: str
    avatar_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    
    user: UserResponse = Field(..., description="User profile")
    token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "ahmad@example.com",
                    "full_name": "Ahmad Ali",
                    "phone": "+971501234567",
                    "avatar_url": None,
                    "is_venue": False,
                    "is_verified": False,
                    "created_at": "2026-01-03T10:00:00Z"
                },
                "token": "eyJhbGciOiJIUzI1NiIs...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
            }
        }
    )


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request."""
    
    refresh_token: str = Field(..., description="Current refresh token")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
            }
        }
    )


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    
    email: EmailStr = Field(..., description="User email address")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "ahmad@example.com"
            }
        }
    )


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""
    
    token: str = Field(..., description="Password reset token from email")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password"
    )
    
    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be at least 8 characters with 1 uppercase, "
                "1 lowercase, and 1 number"
            )
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIs...",
                "new_password": "NewSecurePass123!"
            }
        }
    )
