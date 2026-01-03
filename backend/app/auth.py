"""
Authentication utilities for JWT token generation and password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt  # type: ignore
from passlib.context import CryptContext  # type: ignore

from app.constants import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    PWD_CONTEXT_SCHEMES,
    PWD_CONTEXT_DEPRECATED,
)

# Password hashing context
pwd_context = CryptContext(schemes=PWD_CONTEXT_SCHEMES, deprecated=PWD_CONTEXT_DEPRECATED)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password from the database
    
    Returns:
        True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plain text password to hash
    
    Returns:
        The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of claims to encode in the token
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: The JWT token string to decode
    
    Returns:
        Dictionary of token claims if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_token_user_id(token: str) -> Optional[str]:
    """
    Extract user ID from a JWT token.
    
    Args:
        token: The JWT token string
    
    Returns:
        User ID if token is valid, None otherwise
    """
    payload = decode_access_token(token)
    if payload is None:
        return None
    
    return payload.get("sub")  # "sub" is standard JWT claim for subject (user ID)
