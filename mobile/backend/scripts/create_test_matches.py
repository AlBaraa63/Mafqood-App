"""
Trigger AI matching for test items - create matches without image processing
"""
import asyncio
import sys
import uuid
from pathlib import Path
from datetime import datetime

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import select, and_
from app.core.database import get_db_context
from app.models.item import Item, ItemType
from app.models.match import Match, MatchConfidence, MatchStatus
from app.services.ai.similarity_matcher import SimilarityMatcher


async def create_matches_for_test_items():
    """Create matches between test items based on category and similarity"""
    async with get_db_context() as db:
        print("🔍 Finding items to match...\n")
        
        # Get all LOST and FOUND items
        result = await db.execute(select(Item))
        items = result.scalars().all()
        
        lost_items = [i for i in items if i.type.value == "lost"]
        found_items = [i for i in items if i.type.value == "found"]
        
        print(f"Found {len(lost_items)} LOST items and {len(found_items)} FOUND items\n")
        
        # Initialize similarity matcher
        matcher = SimilarityMatcher()
        
        matches_created = 0
        
        # For each lost item, find matching found items
        for lost_item in lost_items:
            print(f"🔗 Matching: {lost_item.title}")
            
            for found_item in found_items:
                # Calculate similarity based on category
                category_match = (lost_item.category == found_item.category)
                color_match = (lost_item.color.lower() == found_item.color.lower())
                
                # Simple scoring: if category and color match, it's a good match
                if category_match and color_match:
                    similarity = 0.95
                    confidence = "HIGH"
                elif category_match:
                    similarity = 0.75
                    confidence = "MEDIUM"
                else:
                    similarity = 0.45
                    confidence = "LOW"
                
                # Only create match if similarity is good enough
                if similarity >= 0.45:
                    match = Match(
                        id=str(uuid.uuid4()),
                        user_item_id=lost_item.id,
                        matched_item_id=found_item.id,
                        similarity_score=similarity,
                        confidence=confidence,
                        status=MatchStatus.PENDING,
                        matching_features={
                            "category": category_match,
                            "color": color_match,
                            "location": lost_item.location == found_item.location,
                        }
                    )
                    db.add(match)
                    matches_created += 1
                    
                    print(f"   ✓ Matched with: {found_item.title} ({confidence} - {similarity*100:.0f}%)")
            
            print()
        
        # Mark items as processed
        for item in items:
            item.ai_processed = True
            item.ai_processed_at = datetime.now()
        
        await db.commit()
        
        print(f"✅ Created {matches_created} matches!")
        print(f"✅ Marked all items as AI processed")


if __name__ == "__main__":
    print("=" * 60)
    print("CREATE TEST MATCHES")
    print("=" * 60)
    print()
    asyncio.run(create_matches_for_test_items())
    print("\n🎉 Done! Reload your app to see the matches.")
