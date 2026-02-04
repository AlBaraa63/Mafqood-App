"""
Common Schemas
==============

Shared schemas used across multiple endpoints.
"""

from datetime import datetime
from typing import Generic, TypeVar, Optional, List, Any

from pydantic import BaseModel, Field, ConfigDict


T = TypeVar("T")


class MessageResponse(BaseModel):
    """Simple message response."""
    
    message: str = Field(..., description="Response message")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Operation completed successfully"
            }
        }
    )


class PaginationParams(BaseModel):
    """Query parameters for pagination."""
    
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for database query."""
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""
    
    items: List[T] = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    has_more: bool = Field(..., description="Whether more items exist")
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        page_size: int,
    ) -> "PaginatedResponse[T]":
        """Create paginated response from items."""
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total,
        )


class ServiceHealth(BaseModel):
    """Health status of a service."""
    
    status: str = Field(..., description="Service status")
    latency_ms: Optional[float] = Field(None, description="Response latency in ms")
    error: Optional[str] = Field(None, description="Error message if unhealthy")


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = Field(..., description="Overall health status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(..., description="Current server timestamp")
    services: dict[str, str] = Field(
        ...,
        description="Health status of individual services"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "timestamp": "2026-01-03T10:00:00Z",
                "services": {
                    "database": "healthy",
                    "redis": "healthy",
                    "storage": "healthy"
                }
            }
        }
    )


class ErrorDetail(BaseModel):
    """Error detail for validation errors."""
    
    loc: List[str] = Field(..., description="Error location")
    msg: str = Field(..., description="Error message")
    type: str = Field(..., description="Error type")


class ErrorResponse(BaseModel):
    """Standard error response."""
    
    success: bool = Field(default=False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    details: Optional[List[ErrorDetail]] = Field(None, description="Validation error details")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": False,
                "error": "Validation error",
                "details": [
                    {
                        "loc": ["body", "email"],
                        "msg": "Invalid email format",
                        "type": "value_error"
                    }
                ]
            }
        }
    )
