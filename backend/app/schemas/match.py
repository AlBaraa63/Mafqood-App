"""
Match Schemas
=============

Pydantic schemas for match endpoints.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid

from pydantic import BaseModel, Field, ConfigDict

from .item import MatchedItemResponse


class MatchConfidence(str, Enum):
    """Confidence level of the match."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class MatchStatus(str, Enum):
    """Status of the match."""
    PENDING = "pending"
    CONTACTED = "contacted"
    CLAIMED = "claimed"
    REJECTED = "rejected"
    EXPIRED = "expired"


class MatchingFeatures(BaseModel):
    """Detailed matching features breakdown."""
    
    visual_similarity: float = Field(..., description="Visual similarity score (0-1)")
    category_match: bool = Field(..., description="Whether categories match")
    color_match: Optional[bool] = Field(None, description="Whether colors match")
    brand_match: Optional[bool] = Field(None, description="Whether brands match")
    location_nearby: bool = Field(..., description="Whether locations are nearby")
    location_distance_km: Optional[float] = Field(None, description="Distance in km")
    time_proximity_hours: Optional[float] = Field(None, description="Time difference in hours")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "visual_similarity": 0.87,
                "category_match": True,
                "color_match": True,
                "brand_match": True,
                "location_nearby": True,
                "location_distance_km": 0.5,
                "time_proximity_hours": 2.0
            }
        }
    )


class MatchResponse(BaseModel):
    """Schema for match response."""
    
    id: uuid.UUID = Field(..., description="Match unique identifier")
    user_item_id: uuid.UUID = Field(..., description="User's item ID")
    matched_item_id: uuid.UUID = Field(..., description="Matched item ID")
    
    # The matched item details
    user_item: Optional[MatchedItemResponse] = Field(
        None,
        description="User's item details"
    )
    matched_item: MatchedItemResponse = Field(
        ...,
        description="Matched item details"
    )
    
    # Match quality
    similarity: float = Field(
        ...,
        ge=0,
        le=1,
        description="Overall similarity score (0-1)"
    )
    similarity_percent: int = Field(
        ...,
        ge=0,
        le=100,
        description="Similarity as percentage"
    )
    confidence: MatchConfidence = Field(..., description="Confidence level")
    
    # Feature breakdown
    matching_features: Optional[MatchingFeatures] = Field(
        None,
        description="Detailed matching features"
    )
    
    # User interaction
    viewed: bool = Field(default=False, description="Whether user viewed this match")
    viewed_at: Optional[datetime] = Field(None, description="When user viewed")
    
    # Confirmation status
    confirmed: Optional[bool] = Field(
        None,
        description="User's confirmation (null=pending, true=confirmed, false=rejected)"
    )
    other_party_confirmed: Optional[bool] = Field(
        None,
        description="Other party's confirmation"
    )
    
    # Status
    status: MatchStatus = Field(..., description="Match status")
    
    # Timestamps
    created_at: datetime = Field(..., description="Match creation time")
    updated_at: datetime = Field(..., description="Last update time")
    
    # Contact info (only shown if both confirmed)
    contact_info: Optional[dict] = Field(
        None,
        description="Contact info (only if both parties confirmed)"
    )
    
    @classmethod
    def from_match(
        cls,
        match: Any,
        viewer_is_user_item_owner: bool = True,
    ) -> "MatchResponse":
        """
        Create MatchResponse from Match model.
        
        Args:
            match: Match model instance
            viewer_is_user_item_owner: Whether the viewer owns the user_item
        """
        # Determine which confirmation status to show
        if viewer_is_user_item_owner:
            confirmed = match.user_item_owner_confirmed
            other_confirmed = match.matched_item_owner_confirmed
            viewed = match.user_item_owner_viewed
            viewed_at = match.user_item_owner_viewed_at
        else:
            confirmed = match.matched_item_owner_confirmed
            other_confirmed = match.user_item_owner_confirmed
            viewed = match.matched_item_owner_viewed
            viewed_at = match.matched_item_owner_viewed_at
        
        # Only show contact info if both confirmed
        contact_info = None
        if match.is_confirmed_by_both:
            contact_item = match.matched_item if viewer_is_user_item_owner else match.user_item
            contact_info = {
                "method": contact_item.contact_method.value,
                "phone": contact_item.contact_phone,
                "email": contact_item.contact_email,
            }
        
        return cls(
            id=match.id,
            user_item_id=match.user_item_id,
            matched_item_id=match.matched_item_id,
            user_item=MatchedItemResponse.model_validate(match.user_item),
            matched_item=MatchedItemResponse.model_validate(match.matched_item),
            similarity=match.similarity_score,
            similarity_percent=int(match.similarity_score * 100),
            confidence=MatchConfidence(match.confidence.value),
            matching_features=MatchingFeatures.model_validate(match.matching_features) if match.matching_features else None,
            viewed=viewed,
            viewed_at=viewed_at,
            confirmed=confirmed,
            other_party_confirmed=other_confirmed,
            status=MatchStatus(match.status.value),
            created_at=match.created_at,
            updated_at=match.updated_at,
            contact_info=contact_info,
        )
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_item_id": "550e8400-e29b-41d4-a716-446655440001",
                "matched_item_id": "550e8400-e29b-41d4-a716-446655440002",
                "matched_item": {
                    "id": "550e8400-e29b-41d4-a716-446655440002",
                    "type": "found",
                    "title": "Black iPhone found",
                    "image_url": "https://cdn.mafqood.ae/items/uuid.jpg",
                    "location": "Dubai Mall",
                    "date_time": "2026-01-03T15:00:00Z",
                    "category": "phone"
                },
                "similarity": 0.87,
                "similarity_percent": 87,
                "confidence": "high",
                "matching_features": {
                    "visual_similarity": 0.87,
                    "category_match": True,
                    "color_match": True,
                    "location_nearby": True
                },
                "viewed": True,
                "confirmed": None,
                "other_party_confirmed": None,
                "status": "pending",
                "created_at": "2026-01-03T15:01:00Z",
                "updated_at": "2026-01-03T15:01:00Z"
            }
        }
    )


class MatchConfirmRequest(BaseModel):
    """Schema for confirming or rejecting a match."""
    
    confirmed: bool = Field(
        ...,
        description="True to confirm match, False to reject"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional notes about the match"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "confirmed": True,
                "notes": "This looks like my phone!"
            }
        }
    )


class MatchListResponse(BaseModel):
    """Paginated list of matches."""
    
    matches: List[MatchResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
    
    # Summary stats
    pending_count: int = Field(default=0, description="Matches pending review")
    confirmed_count: int = Field(default=0, description="Confirmed matches")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "matches": [],
                "total": 5,
                "page": 1,
                "page_size": 20,
                "has_more": False,
                "pending_count": 3,
                "confirmed_count": 2
            }
        }
    )
