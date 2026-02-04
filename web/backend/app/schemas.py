"""
Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ===== Base Schemas =====

class ItemBase(BaseModel):
    """Base schema for item data."""
    title: str = Field(..., min_length=1, max_length=200, description="Short description of the item")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed description")
    location_type: str = Field(..., description="Type of location (Mall, Taxi, Metro, etc.)")
    location_detail: Optional[str] = Field(None, max_length=200, description="Specific place details")
    time_frame: str = Field(..., description="When the item was lost/found")


class ItemCreate(ItemBase):
    """Schema for creating a new item (used with multipart form data)."""
    pass


# ===== Database Schemas =====

class ItemInDBBase(BaseModel):
    """Schema for item as stored in database."""
    id: int
    type: str  # "lost" or "found"
    title: str
    description: Optional[str]
    location_type: str
    location_detail: Optional[str]
    time_frame: str
    image_url: str  # URL path to access the image
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ItemInDB(ItemInDBBase):
    """Extended schema including embedding (for internal use)."""
    embedding: List[float]


# ===== Match Schemas =====

class MatchResult(BaseModel):
    """Schema for a single match result."""
    item: ItemInDBBase
    similarity: float = Field(..., ge=0.0, le=1.0, description="Similarity score (0-1)")
    
    model_config = ConfigDict(from_attributes=True)


class ItemWithMatches(BaseModel):
    """Schema for an item with its matches."""
    item: ItemInDBBase
    matches: List[MatchResult]


# ===== Response Schemas =====

class LostItemResponse(BaseModel):
    """Response after creating a lost item report."""
    item: ItemInDBBase
    matches: List[MatchResult] = Field(default_factory=list, description="Top matches from found items")


class FoundItemResponse(BaseModel):
    """Response after creating a found item report."""
    item: ItemInDBBase
    matches: List[MatchResult] = Field(default_factory=list, description="Top matches from lost items")


class HistoryResponse(BaseModel):
    """Response for user activity/history."""
    lost_items: List[ItemWithMatches]
    found_items: List[ItemWithMatches]


class ItemListResponse(BaseModel):
    """Response for list of items."""
    items: List[ItemInDBBase]
    count: int


# ===== Health Check =====

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: datetime
