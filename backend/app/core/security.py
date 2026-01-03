"""
Security Module
===============

Handles password hashing, JWT token creation and verification.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from enum import Enum
import uuid
import logging

from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

from .config import settings


# Setup logger
logger = logging.getLogger(__name__)

# Password hashing context with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SecurityErrorCode(str, Enum):
    """Security-related error codes."""
    
    # Password errors
    PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT"
    PASSWORD_TOO_WEAK = "PASSWORD_TOO_WEAK"
    PASSWORD_HASH_FAILED = "PASSWORD_HASH_FAILED"
    PASSWORD_VERIFY_FAILED = "PASSWORD_VERIFY_FAILED"
    INVALID_PASSWORD_HASH = "INVALID_PASSWORD_HASH"
    
    # Token errors
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    TOKEN_INVALID = "TOKEN_INVALID"
    TOKEN_MALFORMED = "TOKEN_MALFORMED"
    TOKEN_TYPE_MISMATCH = "TOKEN_TYPE_MISMATCH"
    TOKEN_MISSING_CLAIMS = "TOKEN_MISSING_CLAIMS"
    TOKEN_CREATION_FAILED = "TOKEN_CREATION_FAILED"
    
    # General errors
    INVALID_INPUT = "INVALID_INPUT"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"


class SecurityError(Exception):
    """Custom exception for security-related errors."""
    
    def __init__(
        self,
        code: SecurityErrorCode,
        message: str,
        details: Optional[dict] = None
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "error_code": self.code.value,
            "message": self.message,
            "details": self.details
        }


class TokenData:
    """Decoded token data structure."""
    
    def __init__(
        self,
        user_id: str,
        email: Optional[str] = None,
        token_type: str = "access",
        token_id: Optional[str] = None,
    ):
        self.user_id = user_id
        self.email = email
        self.token_type = token_type
        self.token_id = token_id
    
    def __repr__(self) -> str:
        return f"TokenData(user_id={self.user_id}, email={self.email}, type={self.token_type})"


class TokenVerificationResult:
    """Result of token verification with detailed error info."""
    
    def __init__(
        self,
        success: bool,
        data: Optional[TokenData] = None,
        error_code: Optional[SecurityErrorCode] = None,
        error_message: Optional[str] = None
    ):
        self.success = success
        self.data = data
        self.error_code = error_code
        self.error_message = error_message
    
    @classmethod
    def ok(cls, data: TokenData) -> "TokenVerificationResult":
        """Create a successful result."""
        return cls(success=True, data=data)
    
    @classmethod
    def error(cls, code: SecurityErrorCode, message: str) -> "TokenVerificationResult":
        """Create an error result."""
        return cls(success=False, error_code=code, error_message=message)


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password meets security requirements.
    
    Args:
        password: Password to validate
        
    Returns:
        tuple[bool, Optional[str]]: (is_valid, error_message)
    """
    if not password:
        return False, "Password cannot be empty"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    if not has_upper:
        return False, "Password must contain at least one uppercase letter"
    
    if not has_lower:
        return False, "Password must contain at least one lowercase letter"
    
    if not has_digit:
        return False, "Password must contain at least one number"
    
    return True, None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: The plain text password
        hashed_password: The bcrypt hashed password
        
    Returns:
        bool: True if password matches, False otherwise
        
    Raises:
        SecurityError: If password verification fails due to invalid hash
    """
    if not plain_password:
        logger.warning("Password verification attempted with empty password")
        return False
    
    if not hashed_password:
        logger.warning("Password verification attempted with empty hash")
        return False
    
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        if not result:
            logger.debug("Password verification failed - incorrect password")
        return result
    except UnknownHashError as e:
        logger.error(f"Invalid password hash format: {e}")
        raise SecurityError(
            code=SecurityErrorCode.INVALID_PASSWORD_HASH,
            message="Invalid password hash format",
            details={"error": str(e)}
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        raise SecurityError(
            code=SecurityErrorCode.PASSWORD_VERIFY_FAILED,
            message="Failed to verify password",
            details={"error": str(e)}
        )


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        str: Bcrypt hashed password
        
    Raises:
        SecurityError: If password hashing fails
    """
    if not password:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="Cannot hash empty password"
        )
    
    # Validate password strength
    is_valid, error_msg = validate_password_strength(password)
    if not is_valid:
        raise SecurityError(
            code=SecurityErrorCode.PASSWORD_TOO_WEAK,
            message=error_msg or "Password does not meet security requirements"
        )
    
    try:
        hashed = pwd_context.hash(password)
        logger.debug("Password hashed successfully")
        return hashed
    except Exception as e:
        logger.error(f"Password hashing failed: {e}")
        raise SecurityError(
            code=SecurityErrorCode.PASSWORD_HASH_FAILED,
            message="Failed to hash password",
            details={"error": str(e)}
        )


def create_access_token(
    user_id: str,
    email: str,
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[dict] = None,
) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User's unique identifier
        email: User's email address
        expires_delta: Optional custom expiration time
        additional_claims: Optional additional JWT claims
        
    Returns:
        str: Encoded JWT access token
        
    Raises:
        SecurityError: If token creation fails
    """
    if not user_id:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="User ID is required for token creation"
        )
    
    if not email:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="Email is required for token creation"
        )
    
    try:
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.access_token_expire_minutes
            )
        
        to_encode = {
            "sub": user_id,
            "email": email,
            "type": "access",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "jti": str(uuid.uuid4()),  # JWT ID for token tracking
        }
        
        if additional_claims:
            # Prevent overwriting critical claims
            protected_claims = {"sub", "type", "exp", "iat", "jti"}
            for key in protected_claims:
                if key in additional_claims:
                    logger.warning(f"Attempted to override protected claim: {key}")
                    del additional_claims[key]
            to_encode.update(additional_claims)
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )
        
        logger.debug(f"Access token created for user: {user_id}")
        return encoded_jwt
        
    except Exception as e:
        logger.error(f"Failed to create access token: {e}")
        raise SecurityError(
            code=SecurityErrorCode.TOKEN_CREATION_FAILED,
            message="Failed to create access token",
            details={"error": str(e)}
        )


def create_refresh_token(
    user_id: str,
    expires_delta: Optional[timedelta] = None,
) -> tuple[str, str]:
    """
    Create a JWT refresh token.
    
    Args:
        user_id: User's unique identifier
        expires_delta: Optional custom expiration time
        
    Returns:
        tuple[str, str]: (encoded refresh token, token_id for storage)
        
    Raises:
        SecurityError: If token creation fails
    """
    if not user_id:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="User ID is required for refresh token creation"
        )
    
    try:
        token_id = str(uuid.uuid4())
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                days=settings.refresh_token_expire_days
            )
        
        to_encode = {
            "sub": user_id,
            "type": "refresh",
            "jti": token_id,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )
        
        logger.debug(f"Refresh token created for user: {user_id}")
        return encoded_jwt, token_id
        
    except Exception as e:
        logger.error(f"Failed to create refresh token: {e}")
        raise SecurityError(
            code=SecurityErrorCode.TOKEN_CREATION_FAILED,
            message="Failed to create refresh token",
            details={"error": str(e)}
        )


def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: The JWT token to verify
        token_type: Expected token type ("access" or "refresh")
        
    Returns:
        Optional[TokenData]: Decoded token data or None if invalid
    """
    result = verify_token_detailed(token, token_type)
    return result.data if result.success else None


def verify_token_detailed(token: str, token_type: str = "access") -> TokenVerificationResult:
    """
    Verify and decode a JWT token with detailed error information.
    
    Args:
        token: The JWT token to verify
        token_type: Expected token type ("access" or "refresh")
        
    Returns:
        TokenVerificationResult: Result with data or error details
    """
    if not token:
        logger.warning("Token verification attempted with empty token")
        return TokenVerificationResult.error(
            SecurityErrorCode.TOKEN_INVALID,
            "Token is required"
        )
    
    if not token_type or token_type not in ["access", "refresh", "password_reset"]:
        logger.warning(f"Invalid token type requested: {token_type}")
        return TokenVerificationResult.error(
            SecurityErrorCode.INVALID_INPUT,
            "Invalid token type specified"
        )
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        actual_type = payload.get("type")
        token_id = payload.get("jti")
        
        if user_id is None:
            logger.warning("Token missing user ID claim")
            return TokenVerificationResult.error(
                SecurityErrorCode.TOKEN_MISSING_CLAIMS,
                "Token is missing required claims (user ID)"
            )
        
        if actual_type != token_type:
            logger.warning(f"Token type mismatch: expected {token_type}, got {actual_type}")
            return TokenVerificationResult.error(
                SecurityErrorCode.TOKEN_TYPE_MISMATCH,
                f"Invalid token type. Expected {token_type} token"
            )
        
        token_data = TokenData(
            user_id=user_id,
            email=email,
            token_type=actual_type or "access",
            token_id=token_id,
        )
        
        logger.debug(f"Token verified successfully for user: {user_id}")
        return TokenVerificationResult.ok(token_data)
        
    except ExpiredSignatureError:
        logger.info("Token has expired")
        return TokenVerificationResult.error(
            SecurityErrorCode.TOKEN_EXPIRED,
            "Token has expired. Please login again"
        )
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return TokenVerificationResult.error(
            SecurityErrorCode.TOKEN_INVALID,
            "Invalid or malformed token"
        )
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {e}")
        return TokenVerificationResult.error(
            SecurityErrorCode.UNKNOWN_ERROR,
            "An error occurred while verifying the token"
        )


def create_password_reset_token(email: str) -> str:
    """
    Create a password reset token (short-lived).
    
    Args:
        email: User's email address
        
    Returns:
        str: Encoded JWT token for password reset
        
    Raises:
        SecurityError: If token creation fails
    """
    if not email:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="Email is required for password reset token"
        )
    
    # Basic email validation
    if "@" not in email or "." not in email:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="Invalid email format"
        )
    
    try:
        expire = datetime.now(timezone.utc) + timedelta(hours=1)
        
        to_encode = {
            "sub": email.lower().strip(),
            "type": "password_reset",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "jti": str(uuid.uuid4()),
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )
        
        logger.info(f"Password reset token created for: {email}")
        return encoded_jwt
        
    except Exception as e:
        logger.error(f"Failed to create password reset token: {e}")
        raise SecurityError(
            code=SecurityErrorCode.TOKEN_CREATION_FAILED,
            message="Failed to create password reset token",
            details={"error": str(e)}
        )


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify a password reset token and extract email.
    
    Args:
        token: The password reset token
        
    Returns:
        Optional[str]: Email address or None if invalid
    """
    result = verify_password_reset_token_detailed(token)
    return result.get("email") if result.get("success") else None


def verify_password_reset_token_detailed(token: str) -> dict:
    """
    Verify a password reset token with detailed error information.
    
    Args:
        token: The password reset token
        
    Returns:
        dict: Result with email or error details
    """
    if not token:
        return {
            "success": False,
            "error_code": SecurityErrorCode.TOKEN_INVALID.value,
            "message": "Reset token is required"
        }
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        
        email = payload.get("sub")
        token_type = payload.get("type")
        
        if not email or not isinstance(email, str):
            return {
                "success": False,
                "error_code": SecurityErrorCode.TOKEN_MISSING_CLAIMS.value,
                "message": "Token is missing email claim"
            }
        
        if token_type != "password_reset":
            return {
                "success": False,
                "error_code": SecurityErrorCode.TOKEN_TYPE_MISMATCH.value,
                "message": "Invalid token type for password reset"
            }
        
        logger.info(f"Password reset token verified for: {email}")
        return {
            "success": True,
            "email": email
        }
        
    except ExpiredSignatureError:
        logger.info("Password reset token has expired")
        return {
            "success": False,
            "error_code": SecurityErrorCode.TOKEN_EXPIRED.value,
            "message": "Password reset link has expired. Please request a new one"
        }
    except JWTError as e:
        logger.warning(f"Password reset token verification failed: {e}")
        return {
            "success": False,
            "error_code": SecurityErrorCode.TOKEN_INVALID.value,
            "message": "Invalid or malformed password reset token"
        }
    except Exception as e:
        logger.error(f"Unexpected error during password reset token verification: {e}")
        return {
            "success": False,
            "error_code": SecurityErrorCode.UNKNOWN_ERROR.value,
            "message": "An error occurred while verifying the reset token"
        }


def create_email_verification_token(email: str, user_id: str) -> str:
    """
    Create an email verification token.
    
    Args:
        email: User's email address
        user_id: User's unique identifier
        
    Returns:
        str: Encoded JWT token for email verification
        
    Raises:
        SecurityError: If token creation fails
    """
    if not email or not user_id:
        raise SecurityError(
            code=SecurityErrorCode.INVALID_INPUT,
            message="Email and user ID are required for email verification token"
        )
    
    try:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
        
        to_encode = {
            "sub": user_id,
            "email": email.lower().strip(),
            "type": "email_verification",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "jti": str(uuid.uuid4()),
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )
        
        logger.info(f"Email verification token created for: {email}")
        return encoded_jwt
        
    except Exception as e:
        logger.error(f"Failed to create email verification token: {e}")
        raise SecurityError(
            code=SecurityErrorCode.TOKEN_CREATION_FAILED,
            message="Failed to create email verification token",
            details={"error": str(e)}
        )


def verify_email_verification_token(token: str) -> dict:
    """
    Verify an email verification token.
    
    Args:
        token: The email verification token
        
    Returns:
        dict: Result with user_id and email or error details
    """
    if not token:
        return {
            "success": False,
            "error_code": SecurityErrorCode.TOKEN_INVALID.value,
            "message": "Verification token is required"
        }
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        token_type = payload.get("type")
        
        if not user_id or not email:
            return {
                "success": False,
                "error_code": SecurityErrorCode.TOKEN_MISSING_CLAIMS.value,
                "message": "Token is missing required claims"
            }
        
        if token_type != "email_verification":
            return {
                "success": False,
                "error_code": SecurityErrorCode.TOKEN_TYPE_MISMATCH.value,
                "message": "Invalid token type for email verification"
            }
        
        logger.info(f"Email verification token verified for: {email}")
        return {
            "success": True,
            "user_id": user_id,
            "email": email
        }
        
    except ExpiredSignatureError:
        logger.info("Email verification token has expired")
        return {
            "success": False,
            "error_code": SecurityErrorCode.TOKEN_EXPIRED.value,
            "message": "Verification link has expired. Please request a new one"
        }
    except JWTError as e:
        logger.warning(f"Email verification token verification failed: {e}")
        return {
            "success": False,
            "error_code": SecurityErrorCode.TOKEN_INVALID.value,
            "message": "Invalid or malformed verification token"
        }
    except Exception as e:
        logger.error(f"Unexpected error during email verification: {e}")
        return {
            "success": False,
            "error_code": SecurityErrorCode.UNKNOWN_ERROR.value,
            "message": "An error occurred while verifying the token"
        }


# Error messages for API responses
ERROR_MESSAGES = {
    SecurityErrorCode.PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
    SecurityErrorCode.PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, and numbers",
    SecurityErrorCode.PASSWORD_HASH_FAILED: "An error occurred while securing your password",
    SecurityErrorCode.PASSWORD_VERIFY_FAILED: "An error occurred while verifying your password",
    SecurityErrorCode.INVALID_PASSWORD_HASH: "Account security error. Please contact support",
    SecurityErrorCode.TOKEN_EXPIRED: "Your session has expired. Please login again",
    SecurityErrorCode.TOKEN_INVALID: "Invalid authentication token",
    SecurityErrorCode.TOKEN_MALFORMED: "Malformed authentication token",
    SecurityErrorCode.TOKEN_TYPE_MISMATCH: "Invalid token type",
    SecurityErrorCode.TOKEN_MISSING_CLAIMS: "Invalid token structure",
    SecurityErrorCode.TOKEN_CREATION_FAILED: "Failed to create authentication token",
    SecurityErrorCode.INVALID_INPUT: "Invalid input provided",
    SecurityErrorCode.UNKNOWN_ERROR: "An unexpected error occurred",
}


def get_error_message(code: SecurityErrorCode) -> str:
    """Get user-friendly error message for error code."""
    return ERROR_MESSAGES.get(code, "An unexpected error occurred")
