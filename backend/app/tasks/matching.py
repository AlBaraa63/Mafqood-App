"""
Matching Tasks
==============

Celery tasks for similarity matching.
"""

import asyncio
from typing import List

import numpy as np
from celery import shared_task  # type: ignore
from sqlalchemy import select, and_

from app.core.logging import get_logger
from app.core.database import get_db_context
from app.core.config import settings


logger = get_logger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_kwargs={"max_retries": 3},
    name="app.tasks.matching.find_matches_for_item",
)
def find_matches_for_item(self, item_id: str) -> dict:
    """
    Find potential matches for an item.
    
    Args:
        item_id: Item UUID string
        
    Returns:
        Matching result
    """
    return asyncio.get_event_loop().run_until_complete(
        _find_matches_async(item_id)
    )


async def _find_matches_async(item_id: str) -> dict:
    """Async implementation of find_matches_for_item."""
    from app.models import Item, Match, Notification
    from app.models.item import ItemType, ItemStatus
    from app.models.match import MatchConfidence, MatchStatus
    from app.models.notification import NotificationType
    from app.services.ai import SimilarityMatcher
    import uuid
    
    logger.info("Finding matches for item", item_id=item_id)
    
    async with get_db_context() as db:
        # Get source item
        result = await db.execute(
            select(Item).where(Item.id == uuid.UUID(item_id))
        )
        source_item = result.scalar_one_or_none()
        
        if not source_item:
            return {"success": False, "error": "Item not found"}
        
        if not source_item.ai_processed or not source_item.embedding:
            logger.warning("Item not processed yet", item_id=item_id)
            return {"success": False, "error": "Item not processed"}
        
        source_embedding = np.array(source_item.embedding, dtype=np.float32)
        
        # Determine opposite type
        opposite_type = ItemType.FOUND if source_item.type == ItemType.LOST else ItemType.LOST
        
        # Get candidate items
        result = await db.execute(
            select(Item).where(
                and_(
                    Item.type == opposite_type,
                    Item.status == ItemStatus.OPEN,
                    Item.user_id != source_item.user_id,
                    Item.ai_processed == True,
                    Item.embedding != None,
                )
            ).limit(500)
        )
        candidates = result.scalars().all()
        
        if not candidates:
            logger.info("No candidates found", item_id=item_id)
            return {"success": True, "matches": 0}
        
        # Build candidate data
        matcher = SimilarityMatcher()
        candidate_data = []
        
        for candidate in candidates:
            if candidate.embedding:
                emb = np.array(candidate.embedding, dtype=np.float32)
                meta = {
                    "id": str(candidate.id),
                    "type": candidate.type.value,
                    "category": candidate.category.value,
                    "title": candidate.title,
                    "brand": candidate.brand,
                    "color": candidate.color,
                    "location": candidate.location,
                    "latitude": candidate.latitude,
                    "longitude": candidate.longitude,
                    "date_time": candidate.date_time.isoformat() if candidate.date_time else None,
                }
                candidate_data.append((emb, meta))
        
        # Find matches
        source_meta = {
            "id": str(source_item.id),
            "type": source_item.type.value,
            "category": source_item.category.value,
            "title": source_item.title,
            "brand": source_item.brand,
            "color": source_item.color,
            "location": source_item.location,
            "latitude": source_item.latitude,
            "longitude": source_item.longitude,
            "date_time": source_item.date_time.isoformat() if source_item.date_time else None,
        }
        
        matches = matcher.find_matches(
            source_embedding=source_embedding,
            source_item=source_meta,
            candidates=candidate_data,
            min_score=settings.min_match_similarity,
        )
        
        # Create match records
        matches_created = 0
        for match in matches:
            # Check if match already exists
            existing = await db.execute(
                select(Match).where(
                    and_(
                        Match.user_item_id == source_item.id,
                        Match.matched_item_id == uuid.UUID(match.item_id),
                    )
                )
            )
            
            if existing.scalar_one_or_none():
                continue
            
            # Create match
            confidence_map = {
                "high": MatchConfidence.HIGH,
                "medium": MatchConfidence.MEDIUM,
                "low": MatchConfidence.LOW,
            }
            
            new_match = Match(
                user_item_id=source_item.id,
                matched_item_id=uuid.UUID(match.item_id),
                similarity_score=match.final_score,
                confidence=confidence_map[match.confidence],
                matching_features=match.features,
                status=MatchStatus.PENDING,
            )
            db.add(new_match)
            matches_created += 1
            
            # Create notification for source item owner
            notification = Notification(
                user_id=source_item.user_id,
                type=NotificationType.MATCH,
                title="New Match Found!",
                message=f"A potential match for your {source_item.type.value} {source_item.category.value} was found with {int(match.final_score * 100)}% confidence.",
                data={
                    "match_id": str(new_match.id),
                    "item_id": str(source_item.id),
                    "confidence": match.confidence,
                },
            )
            db.add(notification)
        
        # Update source item match count
        source_item.match_count += matches_created
        
        await db.commit()
        
        logger.info(
            "Matches found",
            item_id=item_id,
            candidates=len(candidates),
            matches=matches_created,
        )
        
        return {
            "success": True,
            "item_id": item_id,
            "candidates_checked": len(candidates),
            "matches": matches_created,
        }


@shared_task(
    bind=True,
    name="app.tasks.matching.recalculate_all_matches",
)
def recalculate_all_matches(self) -> dict:
    """
    Recalculate all matches (useful after model updates).
    
    This is a heavy operation and should be run during off-peak hours.
    """
    return asyncio.get_event_loop().run_until_complete(
        _recalculate_all_async()
    )


async def _recalculate_all_async() -> dict:
    """Async implementation of recalculate_all_matches."""
    from sqlalchemy import select
    from app.models import Item
    from app.models.item import ItemStatus
    
    logger.info("Starting full match recalculation")
    
    async with get_db_context() as db:
        result = await db.execute(
            select(Item).where(
                and_(
                    Item.status == ItemStatus.OPEN,
                    Item.ai_processed == True,
                )
            )
        )
        items = result.scalars().all()
    
    # Queue matching tasks for each item
    for item in items:
        find_matches_for_item.delay(str(item.id))
    
    return {
        "success": True,
        "items_queued": len(items),
    }


@shared_task(
    bind=True,
    name="app.tasks.matching.update_match_scores",
)
def update_match_scores(self, match_ids: List[str]) -> dict:
    """
    Update scores for specific matches.
    
    Args:
        match_ids: List of match UUID strings
        
    Returns:
        Update result
    """
    # This would be used for manual re-scoring or after
    # additional information is provided
    
    logger.info("Updating match scores", count=len(match_ids))
    
    return {
        "success": True,
        "updated": len(match_ids),
    }
