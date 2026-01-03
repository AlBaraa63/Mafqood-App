"""
Item Schemas
============

Pydantic schemas for lost and found item endpoints.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
import uuid

from pydantic import BaseModel, Field, field_validator, ConfigDict

from .user import UserBrief


class ItemType(str, Enum):
    """Type of item report."""
    LOST = "lost"
    FOUND = "found"


class ItemStatus(str, Enum):
    """Status of the item."""
    OPEN = "open"
    MATCHED = "matched"
    CLAIMED = "claimed"
    CLOSED = "closed"


class ItemCategory(str, Enum):
    """Category of the item."""
    PHONE = "phone"
    WALLET = "wallet"
    BAG = "bag"
    ID = "id"
    JEWELRY = "jewelry"
    ELECTRONICS = "electronics"
    KEYS = "keys"
    DOCUMENTS = "documents"
    CLOTHING = "clothing"
    ACCESSORIES = "accessories"
    OTHER = "other"


class ContactMethod(str, Enum):
    """Preferred contact method."""
    PHONE = "phone"
    EMAIL = "email"
    IN_APP = "in_app"


class ItemCreate(BaseModel):
    """Schema for creating a lost or found item."""
    
    type: ItemType = Field(..., description="Type of item (lost or found)")
    
    # Item details
    title: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Item title/name"
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Detailed description of the item"
    )
    category: ItemCategory = Field(
        default=ItemCategory.OTHER,
        description="Item category"
    )
    brand: Optional[str] = Field(
        None,
        max_length=100,
        description="Brand name if applicable"
    )
    color: Optional[str] = Field(
        None,
        max_length=50,
        description="Primary color of the item"
    )
    
    # Location
    location: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Location where item was lost/found"
    )
    location_detail: Optional[str] = Field(
        None,
        max_length=500,
        description="Detailed location description"
    )
    location_type: Optional[str] = Field(
        None,
        max_length=50,
        description="Type of location (mall, metro, etc.)"
    )
    latitude: Optional[float] = Field(
        None,
        ge=-90,
        le=90,
        description="Latitude coordinate"
    )
    longitude: Optional[float] = Field(
        None,
        ge=-180,
        le=180,
        description="Longitude coordinate"
    )
    
    # When
    date_time: datetime = Field(
        ...,
        description="When the item was lost/found"
    )
    
    # Contact
    contact_method: ContactMethod = Field(
        default=ContactMethod.IN_APP,
        description="Preferred contact method"
    )
    contact_phone: Optional[str] = Field(
        None,
        pattern=r"^\+?[0-9]{10,15}$",
        description="Contact phone number"
    )
    contact_email: Optional[str] = Field(
        None,
        max_length=255,
        description="Contact email address"
    )
    
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Clean and validate title."""
        v = " ".join(v.split())  # Normalize whitespace
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "type": "lost",
                "title": "iPhone 14 Pro Black",
                "description": "Lost my iPhone 14 Pro with a cracked screen",
                "category": "phone",
                "brand": "Apple",
                "color": "black",
                "location": "Dubai Mall",
                "location_detail": "Near Starbucks on ground floor",
                "location_type": "mall",
                "latitude": 25.1972,
                "longitude": 55.2744,
                "date_time": "2026-01-03T14:30:00Z",
                "contact_method": "in_app"
            }
        }
    )


class ItemUpdate(BaseModel):
    """Schema for updating an item."""
    
    title: Optional[str] = Field(
        None,
        min_length=3,
        max_length=255,
        description="Item title/name"
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Detailed description"
    )
    category: Optional[ItemCategory] = Field(
        None,
        description="Item category"
    )
    brand: Optional[str] = Field(
        None,
        max_length=100,
        description="Brand name"
    )
    color: Optional[str] = Field(
        None,
        max_length=50,
        description="Primary color"
    )
    status: Optional[ItemStatus] = Field(
        None,
        description="Item status"
    )
    contact_method: Optional[ContactMethod] = Field(
        None,
        description="Preferred contact method"
    )
    contact_phone: Optional[str] = Field(
        None,
        pattern=r"^\+?[0-9]{10,15}$",
        description="Contact phone number"
    )
    contact_email: Optional[str] = Field(
        None,
        max_length=255,
        description="Contact email address"
    )


class DetectedObject(BaseModel):
    """AI-detected object in image."""
    
    class_name: str = Field(..., alias="class", description="Object class name")
    confidence: float = Field(..., ge=0, le=1, description="Detection confidence")
    bbox: Optional[List[float]] = Field(None, description="Bounding box [x, y, w, h]")
    
    model_config = ConfigDict(populate_by_name=True)


class ItemResponse(BaseModel):
    """Schema for item response."""
    
    id: uuid.UUID = Field(..., description="Item unique identifier")
    user_id: uuid.UUID = Field(..., description="Owner's user ID")
    type: ItemType = Field(..., description="Item type")
    status: ItemStatus = Field(..., description="Item status")
    
    # Details
    title: str = Field(..., description="Item title")
    description: Optional[str] = Field(None, description="Item description")
    category: ItemCategory = Field(..., description="Item category")
    brand: Optional[str] = Field(None, description="Brand name")
    color: Optional[str] = Field(None, description="Primary color")
    
    # Images
    image_url: str = Field(..., description="Main image URL")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail URL")
    
    # Location
    location: str = Field(..., description="Location name")
    location_detail: Optional[str] = Field(None, description="Location details")
    location_type: Optional[str] = Field(None, description="Location type")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    
    # Time
    date_time: datetime = Field(..., description="When lost/found")
    created_at: datetime = Field(..., description="Report creation time")
    
    # Contact
    contact_method: ContactMethod = Field(..., description="Contact method")
    contact_phone: Optional[str] = Field(None, description="Contact phone")
    contact_email: Optional[str] = Field(None, description="Contact email")
    
    # Stats
    view_count: int = Field(default=0, description="View count")
    match_count: int = Field(default=0, description="Match count")
    
    # AI data (optional, included based on context)
    ai_category: Optional[str] = Field(None, description="AI-detected category")
    ai_processed: Optional[bool] = Field(None, description="Whether AI processing completed")
    detected_objects: Optional[List[DetectedObject]] = Field(
        None,
        description="AI-detected objects"
    )
    
    # Owner info (optional, included based on context)
    owner: Optional[UserBrief] = Field(None, description="Item owner")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440001",
                "type": "lost",
                "status": "open",
                "title": "iPhone 14 Pro Black",
                "description": "Lost my iPhone 14 Pro with a cracked screen",
                "category": "phone",
                "brand": "Apple",
                "color": "black",
                "image_url": "https://cdn.mafqood.ae/items/uuid.jpg",
                "thumbnail_url": "https://cdn.mafqood.ae/items/uuid_thumb.jpg",
                "location": "Dubai Mall",
                "location_detail": "Near Starbucks on ground floor",
                "location_type": "mall",
                "latitude": 25.1972,
                "longitude": 55.2744,
                "date_time": "2026-01-03T14:30:00Z",
                "created_at": "2026-01-03T15:00:00Z",
                "contact_method": "in_app",
                "view_count": 12,
                "match_count": 3
            }
        }
    )


class MatchedItemResponse(BaseModel):
    """Brief item info for match responses."""
    
    id: uuid.UUID
    type: ItemType
    title: str
    image_url: str
    thumbnail_url: Optional[str] = None
    location: str
    date_time: datetime
    category: ItemCategory
    owner: Optional[UserBrief] = None
    
    model_config = ConfigDict(from_attributes=True)


class MatchInItemResponse(BaseModel):
    """Match info included in item response."""
    
    id: uuid.UUID
    matched_item: MatchedItemResponse
    similarity: float
    confidence: str
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ItemWithMatchesResponse(BaseModel):
    """Item response with its matches."""
    
    item: ItemResponse
    matches: List[MatchInItemResponse] = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True)


class ItemListResponse(BaseModel):
    """Paginated list of items."""
    
    items: List[ItemResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class HistoryResponse(BaseModel):
    """User's item history response."""
    
    lost_items: List[ItemWithMatchesResponse] = Field(
        default_factory=list,
        description="User's lost items with matches"
    )
    found_items: List[ItemWithMatchesResponse] = Field(
        default_factory=list,
        description="User's found items with matches"
    )


class ItemSubmitResponse(BaseModel):
    """Response after submitting an item."""
    
    item: ItemResponse
    matches: List[MatchInItemResponse] = Field(default_factory=list)
    match_count: int = Field(default=0)
    ai_error: Optional[str] = Field(
        default=None,
        description="Error message if AI processing failed"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "item": {"id": "...", "type": "lost", "title": "iPhone 14 Pro"},
                "matches": [],
                "match_count": 0,
                "ai_error": None
            }
        }
    )
