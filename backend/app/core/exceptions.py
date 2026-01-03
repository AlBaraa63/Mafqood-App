"""
Custom Exceptions
=================

Application-specific exceptions with proper HTTP status codes.
"""

from typing import Any, Optional, Dict


class MafqoodException(Exception):
    """Base exception for all Mafqood application errors."""
    
    def __init__(
        self,
        message: str = "An error occurred",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(MafqoodException):
    """Raised when authentication fails."""
    
    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=401, details=details)


class AuthorizationError(MafqoodException):
    """Raised when user lacks required permissions."""
    
    def __init__(
        self,
        message: str = "Permission denied",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=403, details=details)


class NotFoundError(MafqoodException):
    """Raised when a requested resource is not found."""
    
    def __init__(
        self,
        resource: str = "Resource",
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        message = f"{resource} not found"
        if resource_id:
            message = f"{resource} with id '{resource_id}' not found"
        
        super().__init__(message=message, status_code=404, details=details)


class ConflictError(MafqoodException):
    """Raised when there's a conflict (e.g., duplicate entry)."""
    
    def __init__(
        self,
        message: str = "Resource already exists",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=409, details=details)


class ValidationError(MafqoodException):
    """Raised when request validation fails."""
    
    def __init__(
        self,
        message: str = "Validation error",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=422, details=details)


class RateLimitError(MafqoodException):
    """Raised when rate limit is exceeded."""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded. Please try again later.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=429, details=details)


class StorageError(MafqoodException):
    """Raised when file storage operations fail."""
    
    def __init__(
        self,
        message: str = "Storage operation failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=500, details=details)


class AIProcessingError(MafqoodException):
    """Raised when AI/ML processing fails."""
    
    def __init__(
        self,
        message: str = "AI processing failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message=message, status_code=500, details=details)


class ExternalServiceError(MafqoodException):
    """Raised when external service call fails."""
    
    def __init__(
        self,
        service: str = "External service",
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        msg = message or f"{service} is unavailable"
        super().__init__(message=msg, status_code=503, details=details)
