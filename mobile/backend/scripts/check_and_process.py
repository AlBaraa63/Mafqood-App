"""
Check item processing status and trigger AI matching
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import select
from app.core.database import get_db_context
from app.models.item import Item
from app.services.ai.matching_service import MatchingService


async def check_and_process():
    """Check items and trigger AI matching if needed"""
    async with get_db_context() as db:
        print("🔍 Checking item processing status...\n")
        
        # Get all items
        result = await db.execute(select(Item))
        items = result.scalars().all()
        
        print(f"📊 Total items: {len(items)}")
        
        processed = [i for i in items if i.ai_processed]
        unprocessed = [i for i in items if not i.ai_processed]
        
        print(f"✓ AI Processed: {len(processed)}")
        print(f"✗ Awaiting AI: {len(unprocessed)}\n")
        
        if unprocessed:
            print("🚀 Triggering AI matching for unprocessed items...\n")
            
            for item in unprocessed:
                try:
                    print(f"   Processing: {item.type} - {item.title} (ID: {item.id})")
                    
                    # Process item (this will generate embeddings and find matches)
                    await MatchingService.process_item(item, db)
                    
                    print(f"   ✓ Processed successfully")
                    
                except Exception as e:
                    print(f"   ✗ Error: {str(e)[:100]}")
            
            # Commit all changes
            await db.commit()
            print("\n✅ AI processing complete!")
            
            # Show matches created
            result = await db.execute(select(Item))
            all_items = result.scalars().all()
            
            total_matches = sum(item.match_count for item in all_items)
            print(f"\n📈 Matches created: {total_matches}")
            
        else:
            print("✓ All items already processed!")


if __name__ == "__main__":
    print("=" * 60)
    print("CHECK AND PROCESS ITEMS")
    print("=" * 60)
    print()
    asyncio.run(check_and_process())
    print("\n🎉 Done! Reload your app to see matches.")
