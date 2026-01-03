"""
Process Pending Matches
========================

Reprocesses all items that are awaiting AI matching.
Useful for:
- Items created before AI was available
- Items that failed processing
- Manual reprocessing after AI model updates
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from app.core.database import get_db_context
from app.models import Item
from app.services.ai.matching_service import MatchingService
from app.core.logging import get_logger

logger = get_logger(__name__)


async def process_pending_items():
    """Process all items that haven't been AI processed yet."""
    
    matching_service = MatchingService()
    
    async with get_db_context() as db:
        # Get all items not yet processed
        result = await db.execute(
            select(Item).where(Item.ai_processed == False)
        )
        pending_items = result.scalars().all()
        
        if not pending_items:
            logger.info("No pending items to process")
            print("✅ No pending items found. All items are processed!")
            return
        
        logger.info(f"Found {len(pending_items)} items awaiting processing")
        print(f"\n🔄 Found {len(pending_items)} items awaiting AI processing...\n")
        
        success_count = 0
        error_count = 0
        
        for item in pending_items:
            try:
                print(f"Processing: {item.title[:50]}... (ID: {item.id})")
                
                # Read image file
                image_path = Path(f"./uploads/items/{item.id}.jpg")
                if not image_path.exists():
                    logger.error(f"Image file not found for item {item.id}")
                    print(f"  ❌ Image file not found: {image_path}")
                    error_count += 1
                    continue
                
                image_data = image_path.read_bytes()
                
                # Process item
                result = await matching_service.process_item(
                    item_id=item.id,
                    image_data=image_data,
                    db=db,
                )
                
                await db.commit()
                
                print(f"  ✅ Processed! Found {result.matches_found} potential matches")
                print(f"     AI Category: {result.ai_category}")
                print(f"     Processing time: {result.processing_time:.2f}s\n")
                
                success_count += 1
                
            except Exception as e:
                logger.error(f"Failed to process item {item.id}: {e}")
                print(f"  ❌ Error: {str(e)}\n")
                error_count += 1
                await db.rollback()
        
        print("\n" + "="*60)
        print(f"📊 Processing Complete!")
        print(f"   ✅ Successfully processed: {success_count} items")
        print(f"   ❌ Failed: {error_count} items")
        print("="*60 + "\n")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤖 Mafqood AI - Process Pending Matches")
    print("="*60 + "\n")
    
    try:
        asyncio.run(process_pending_items())
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
