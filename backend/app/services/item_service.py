"""
Item service for business logic related to lost and found items.
"""

from pathlib import Path
from typing import List, Optional
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.services.ai_service import AIService
from app.services.matching_service import MatchingService
from app.config import LOST_DIR, FOUND_DIR


class ItemService:
    """Service for managing lost and found items."""
    
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIService()
        self.matching_service = MatchingService(db)
    
    async def create_item(
        self,
        item_type: str,
        image_data: bytes,
        title: str,
        description: Optional[str],
        location_type: str,
        location_detail: Optional[str],
        time_frame: str,
        user_id: Optional[int] = None,
    ) -> tuple[models.Item, List[schemas.MatchResult]]:
        """
        Create a new lost or found item with AI processing.
        
        Args:
            item_type: Either "lost" or "found"
            image_data: Raw image bytes
            title: Item title/name
            description: Optional item description
            location_type: Type of location (Mall, Taxi, Metro, etc.)
            location_detail: Specific location details
            time_frame: When the item was lost/found
            user_id: Optional user ID who reported the item
            
        Returns:
            Tuple of (created item, list of matches)
        """
        # Process image with AI (saves image and runs analysis)
        processed_data = self.ai_service.process_and_save_image(image_data, item_type)
        image_path = processed_data["image_path"]
        analysis_results = processed_data["analysis"]
        
        # Enhance title and description with AI results
        title = self.ai_service.enhance_title(
            title,
            analysis_results.get("detected_object"),
            item_type,
        )
        description = self.ai_service.enhance_description(
            description,
            analysis_results.get("extracted_text"),
        )
        
        # Generate embedding for matching
        base_dir = LOST_DIR if item_type == "lost" else FOUND_DIR
        full_path = Path(base_dir.parent / image_path)
        embedding = await self.ai_service.get_embedding(full_path)
        
        # Create item data
        item_data = schemas.ItemCreate(
            title=title,
            description=description,
            location_type=location_type,
            location_detail=location_detail,
            time_frame=time_frame,
        )
        
        # Save to database
        db_item = crud.create_item(
            self.db,
            item_type=item_type,
            data=item_data,
            image_path=str(image_path),
            embedding=embedding,
            user_id=user_id,
        )
        
        # Find matches (opposite type)
        target_type = "found" if item_type == "lost" else "lost"
        matches = self.matching_service.compute_matches(embedding, target_type)
        
        return db_item, matches
    
    def get_items_by_type(
        self,
        item_type: str,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
    ) -> List[models.Item]:
        """
        Get items filtered by type and optionally by user.
        
        Args:
            item_type: Either "lost" or "found"
            skip: Number of items to skip (pagination)
            limit: Maximum number of items to return
            user_id: Optional user ID to filter by
            
        Returns:
            List of items
        """
        return crud.get_items_by_type(
            self.db,
            item_type=item_type,
            skip=skip,
            limit=limit,
            user_id=user_id,
        )
    
    def get_item_by_id(self, item_id: int) -> Optional[models.Item]:
        """Get a single item by ID."""
        return crud.get_item_by_id(self.db, item_id)
    
    def get_user_history(
        self,
        user_id: Optional[int] = None,
    ) -> tuple[List[schemas.ItemWithMatches], List[schemas.ItemWithMatches]]:
        """
        Get user's items with their matches.
        
        Args:
            user_id: Optional user ID to filter by
            
        Returns:
            Tuple of (lost_items_with_matches, found_items_with_matches)
        """
        # Get lost items
        lost_items = self.get_items_by_type("lost", limit=1000, user_id=user_id)
        lost_with_matches = []
        
        for item in lost_items:
            matches = self.matching_service.get_matches_for_item(item.id)  # type: ignore
            item_response = crud.item_to_response(item)
            lost_with_matches.append(
                schemas.ItemWithMatches(item=item_response, matches=matches)
            )
        
        # Get found items
        found_items = self.get_items_by_type("found", limit=1000, user_id=user_id)
        found_with_matches = []
        
        for item in found_items:
            matches = self.matching_service.get_matches_for_item(item.id)  # type: ignore
            item_response = crud.item_to_response(item)
            found_with_matches.append(
                schemas.ItemWithMatches(item=item_response, matches=matches)
            )
        
        return lost_with_matches, found_with_matches
    
    def delete_item(self, item_id: int, user_id: Optional[int] = None) -> bool:
        """
        Delete an item.
        
        Args:
            item_id: ID of item to delete
            user_id: Optional user ID for authorization check
            
        Returns:
            True if deleted, False if not found
        """
        # TODO: Add authorization check when user_id is provided
        return crud.delete_item(self.db, item_id)
