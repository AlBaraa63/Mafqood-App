"""
Reset database - Remove all data and add minimal test data
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import select, delete
from app.core.database import get_db_context
from app.models.item import Item
from app.models.match import Match
from app.models.notification import Notification
from app.models.user import User
from app.models.audit import AuditLog


async def reset_database():
    """Delete all data from database"""
    async with get_db_context() as db:
        print("🗑️  Deleting all data...")
        
        # Delete in correct order (respect foreign keys)
        result = await db.execute(delete(Notification))
        deleted_notifications = result.rowcount
        print(f"   Deleted {deleted_notifications} notifications")
        
        result = await db.execute(delete(Match))
        deleted_matches = result.rowcount
        print(f"   Deleted {deleted_matches} matches")
        
        result = await db.execute(delete(Item))
        deleted_items = result.rowcount
        print(f"   Deleted {deleted_items} items")
        
        result = await db.execute(delete(AuditLog))
        deleted_audit = result.rowcount
        print(f"   Deleted {deleted_audit} audit logs")
        
        # Note: Not deleting users to keep test accounts
        result = await db.execute(select(User))
        user_count = len(result.scalars().all())
        print(f"   Kept {user_count} users (test accounts preserved)")
        
        await db.commit()
        print("✅ Database cleaned successfully!")
        
        # Show final state
        result = await db.execute(select(User))
        users = len(result.scalars().all())
        result = await db.execute(select(Item))
        items = len(result.scalars().all())
        result = await db.execute(select(Match))
        matches = len(result.scalars().all())
        result = await db.execute(select(Notification))
        notifications = len(result.scalars().all())
        
        print("\n📊 Database State:")
        print(f"   Users: {users}")
        print(f"   Items: {items}")
        print(f"   Matches: {matches}")
        print(f"   Notifications: {notifications}")


if __name__ == "__main__":
    print("=" * 50)
    print("DATABASE RESET SCRIPT")
    print("=" * 50)
    print("\nThis will delete ALL items, matches, and notifications.")
    print("Test user accounts will be preserved.")
    
    confirm = input("\nType 'YES' to confirm: ")
    if confirm == "YES":
        asyncio.run(reset_database())
        print("\n✅ Reset complete! You can now test with clean data.")
    else:
        print("❌ Cancelled")
