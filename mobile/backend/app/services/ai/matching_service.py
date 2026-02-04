"""
Matching Service
================

High-level service coordinating the full matching pipeline.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import uuid

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.config import settings
from app.models import Item, Match
from app.models.item import ItemType, ItemStatus
from app.models.match import MatchConfidence, MatchStatus

from .image_processor import ImageProcessor
from .object_detector import ObjectDetector
from .feature_extractor import FeatureExtractor
from .similarity_matcher import SimilarityMatcher, MatchCandidate


logger = get_logger(__name__)


@dataclass
class ProcessingResult:
    """Result of processing an item image."""
    item_id: str
    detected_objects: List[Dict[str, Any]]
    ai_category: Optional[str]
    embedding: Optional[List[float]]
    matches_found: int
    processing_time_ms: float


class MatchingService:
    """
    High-level matching service.
    
    Coordinates:
    1. Image processing
    2. Object detection
    3. Feature extraction
    4. Similarity matching
    5. Match creation
    """
    
    def __init__(self):
        self.image_processor = ImageProcessor()
        self.object_detector = ObjectDetector()
        self.feature_extractor = FeatureExtractor()
        self.similarity_matcher = SimilarityMatcher()
        
        logger.info("MatchingService initialized")
    
    async def process_item(
        self,
        item_id: uuid.UUID,
        image_data: bytes,
        db: AsyncSession,
    ) -> ProcessingResult:
        """
        Process an item image and find matches.
        
        Full pipeline:
        1. Process image
        2. Detect objects
        3. Extract features
        4. Find similar items
        5. Create match records
        
        Args:
            item_id: Item UUID
            image_data: Raw image bytes
            db: Database session
            
        Returns:
            ProcessingResult with all results
        """
        import time
        start_time = time.time()
        
        # Get the item
        result = await db.execute(
            select(Item).where(Item.id == item_id)
        )
        item = result.scalar_one_or_none()
        
        if not item:
            logger.error("Item not found for processing", item_id=str(item_id))
            raise ValueError(f"Item {item_id} not found")
        
        # 1. Process image
        image_np = self.image_processor.image_to_numpy(image_data)
        
        # 2. Detect objects
        detection_result = self.object_detector.detect(image_np)
        detected_objects = self.object_detector.get_detections_dict(detection_result)
        
        # 3. Extract features
        embedding = self.feature_extractor.extract(image_np)
        
        # 4. Update item with AI data
        # Store as list directly (not wrapped in dict)
        item.detected_objects = detected_objects if detected_objects else None  # type: ignore
        item.ai_category = detection_result.primary_class
        item.ai_processed = True
        
        if embedding is not None:
            item.embedding = embedding.tolist()
        
        await db.flush()
        
        # 5. Find similar items
        matches_created = 0
        
        if embedding is not None:
            # Get opposite type items
            opposite_type = ItemType.FOUND if item.type == ItemType.LOST else ItemType.LOST
            
            candidates = await self._get_candidate_items(
                db=db,
                item_type=opposite_type,
                exclude_user_id=item.user_id,
            )
            
            if candidates:
                # Find matches
                matches = self.similarity_matcher.find_matches(
                    source_embedding=embedding,
                    source_item=self._item_to_dict(item),
                    candidates=candidates,
                    min_score=settings.min_match_similarity,
                )
                
                # Create match records
                for match_candidate in matches:
                    await self._create_match(
                        db=db,
                        user_item=item,
                        matched_item_id=uuid.UUID(match_candidate.item_id),
                        candidate=match_candidate,
                    )
                    matches_created += 1
        
        await db.commit()
        
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(
            "Item processed",
            item_id=str(item_id),
            detections=len(detected_objects),
            matches=matches_created,
            time_ms=processing_time,
        )
        
        return ProcessingResult(
            item_id=str(item_id),
            detected_objects=detected_objects,
            ai_category=detection_result.primary_class,
            embedding=embedding.tolist() if embedding is not None else None,
            matches_found=matches_created,
            processing_time_ms=processing_time,
        )
    
    async def _get_candidate_items(
        self,
        db: AsyncSession,
        item_type: ItemType,
        exclude_user_id: uuid.UUID,
        limit: int = 500,
    ) -> List[tuple]:
        """
        Get candidate items for matching.
        
        Returns list of (embedding, metadata) tuples.
        """
        import numpy as np
        
        result = await db.execute(
            select(Item).where(
                and_(
                    Item.type == item_type,
                    Item.status == ItemStatus.OPEN,
                    Item.user_id != exclude_user_id,
                    Item.ai_processed == True,
                    Item.embedding != None,
                )
            ).limit(limit)
        )
        
        items = result.scalars().all()
        
        candidates = []
        for item in items:
            if item.embedding:
                embedding = np.array(item.embedding, dtype=np.float32)
                metadata = self._item_to_dict(item)
                candidates.append((embedding, metadata))
        
        return candidates
    
    def _item_to_dict(self, item: Item) -> Dict[str, Any]:
        """Convert Item model to dictionary for matching."""
        return {
            "id": str(item.id),
            "type": item.type.value,
            "category": item.category.value,
            "title": item.title,
            "brand": item.brand,
            "color": item.color,
            "location": item.location,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "date_time": item.date_time.isoformat() if item.date_time else None,
        }
    
    async def _create_match(
        self,
        db: AsyncSession,
        user_item: Item,
        matched_item_id: uuid.UUID,
        candidate: MatchCandidate,
    ) -> Match:
        """Create a match record."""
        
        # Determine confidence enum
        confidence_map = {
            "high": MatchConfidence.HIGH,
            "medium": MatchConfidence.MEDIUM,
            "low": MatchConfidence.LOW,
        }
        
        match = Match(
            user_item_id=user_item.id,
            matched_item_id=matched_item_id,
            similarity_score=candidate.final_score,
            confidence=confidence_map[candidate.confidence],
            matching_features=candidate.features,
            status=MatchStatus.PENDING,
        )
        
        db.add(match)
        
        # Update item match count
        user_item.match_count += 1
        
        return match
    
    async def reprocess_all_items(
        self,
        db: AsyncSession,
        batch_size: int = 50,
    ) -> int:
        """
        Reprocess all items (useful for model updates).
        
        Returns number of items processed.
        """
        # This would be run as a background task
        # Implementation depends on storage strategy for images
        
        logger.info("Reprocessing all items")
        
        # TODO: Implement batch reprocessing
        
        return 0
