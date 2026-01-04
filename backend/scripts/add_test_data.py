"""
Add test data to user accounts
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
import uuid

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import select
from app.core.database import get_db_context
from app.models.item import Item
from app.models.user import User


async def add_test_data():
    """Add test items to user accounts"""
    async with get_db_context() as db:
        print("📦 Adding test data to user accounts...\n")
        
        # Get test users
        result = await db.execute(select(User).where(User.email.in_(["lost@test.com", "found@test.com"])))
        users = {user.email: user for user in result.scalars().all()}
        
        if not users:
            print("❌ Test accounts not found!")
            return
        
        # Test data for each account
        test_items = {
            "lost@test.com": [
                {
                    "type": "lost",
                    "title": "Black Leather Wallet",
                    "description": "Lost a black leather wallet with ID and credit cards inside. Very important.",
                    "category": "wallet",
                    "brand": "Unknown",
                    "color": "Black",
                    "location": "Downtown Area",
                    "location_detail": "Near Main Street",
                    "location_type": "Street",
                    "latitude": 25.2048,
                    "longitude": 55.2708,
                    "date_time": (datetime.now() - timedelta(days=2)),
                    "contact_method": "Phone",
                    "contact_phone": "+971501234567",
                    "image_url": "http://localhost:8001/uploads/items/wallet_lost.jpg",
                },
                {
                    "type": "lost",
                    "title": "Silver iPhone 14 Pro",
                    "description": "Lost my silver iPhone 14 Pro with a blue case. Had important photos.",
                    "category": "phone",
                    "brand": "Apple",
                    "color": "Silver",
                    "location": "Shopping Mall",
                    "location_detail": "Near Electronics Store",
                    "location_type": "Indoor",
                    "latitude": 25.1925,
                    "longitude": 55.2708,
                    "date_time": (datetime.now() - timedelta(days=1)),
                    "contact_method": "Email",
                    "contact_email": "lost@test.com",
                    "image_url": "http://localhost:8001/uploads/items/iphone_placeholder.jpg",
                },
                {
                    "type": "lost",
                    "title": "Blue Backpack",
                    "description": "Blue backpack with laptop and documents. Lost at bus station.",
                    "category": "bag",
                    "brand": "Unknown",
                    "color": "Blue",
                    "location": "Bus Station",
                    "location_detail": "Terminal 3",
                    "location_type": "Indoor",
                    "latitude": 25.2400,
                    "longitude": 55.3700,
                    "date_time": (datetime.now() - timedelta(hours=12)),
                    "contact_method": "Phone",
                    "contact_phone": "+971501234567",
                    "image_url": "http://localhost:8001/uploads/items/backpack_placeholder.jpg",
                },
            ],
            "found@test.com": [
                {
                    "type": "found",
                    "title": "Black Leather Wallet",
                    "description": "Found a black leather wallet near the main street. Contains ID and cards.",
                    "category": "wallet",
                    "brand": "Unknown",
                    "color": "Black",
                    "location": "Downtown Area",
                    "location_detail": "Main Street Area",
                    "location_type": "Street",
                    "latitude": 25.2050,
                    "longitude": 55.2710,
                    "date_time": datetime.now(),
                    "contact_method": "Phone",
                    "contact_phone": "+971509876543",
                    "image_url": "http://localhost:8001/uploads/items/wallet_found.jpg",
                },
                {
                    "type": "found",
                    "title": "Silver iPhone 14 Pro",
                    "description": "Found a silver iPhone 14 Pro with a blue case at the shopping mall.",
                    "category": "phone",
                    "brand": "Apple",
                    "color": "Silver",
                    "location": "Shopping Mall",
                    "location_detail": "Electronics Store Area",
                    "location_type": "Indoor",
                    "latitude": 25.1927,
                    "longitude": 55.2710,
                    "date_time": datetime.now(),
                    "contact_method": "Email",
                    "contact_email": "found@test.com",
                    "image_url": "http://localhost:8001/uploads/items/iphone_placeholder.jpg",
                },
                {
                    "type": "found",
                    "title": "Blue Backpack",
                    "description": "Found a blue backpack with laptop and documents at the bus station.",
                    "category": "bag",
                    "brand": "Unknown",
                    "color": "Blue",
                    "location": "Bus Station",
                    "location_detail": "Terminal Area",
                    "location_type": "Indoor",
                    "latitude": 25.2402,
                    "longitude": 55.3702,
                    "date_time": datetime.now(),
                    "contact_method": "Phone",
                    "contact_phone": "+971509876543",
                    "image_url": "http://localhost:8001/uploads/items/backpack_placeholder.jpg",
                },
            ],
        }
        
        # Add items
        total_items = 0
        for email, items in test_items.items():
            user = users.get(email)
            if not user:
                print(f"⚠️  User {email} not found, skipping...")
                continue
            
            print(f"👤 Adding items to {email}:")
            for item_data in items:
                item = Item(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    type=item_data["type"].upper(),  # Convert to enum
                    title=item_data["title"],
                    description=item_data["description"],
                    category=item_data["category"].upper(),  # Convert to enum
                    brand=item_data["brand"],
                    color=item_data["color"],
                    location=item_data["location"],
                    location_detail=item_data["location_detail"],
                    location_type=item_data["location_type"],
                    latitude=item_data["latitude"],
                    longitude=item_data["longitude"],
                    date_time=item_data["date_time"],
                    contact_method=item_data["contact_method"].upper(),  # Convert to enum
                    contact_phone=item_data.get("contact_phone"),
                    contact_email=item_data.get("contact_email"),
                    status="OPEN",
                    image_url=item_data.get("image_url"),
                    thumbnail_url=None,
                    ai_processed=False,  # Will be processed by backend
                    view_count=0,
                    match_count=0,
                    reported_count=0,
                )
                db.add(item)
                print(f"   ✓ {item_data['type']}: {item_data['title']}")
                total_items += 1
            
            print()
        
        await db.commit()
        print(f"✅ Added {total_items} test items!")
        
        print("\n📊 Test data added successfully!")
        print("   • 3 LOST items in lost@test.com account")
        print("   • 3 FOUND items in found@test.com account")
        print("\n🔄 Items are ready for AI matching...")


if __name__ == "__main__":
    print("=" * 60)
    print("ADD TEST DATA SCRIPT")
    print("=" * 60)
    print("\nThis will add test LOST and FOUND items to your accounts.")
    print("\nAccounts that will receive data:")
    print("  • lost@test.com - 3 LOST items")
    print("  • found@test.com - 3 FOUND items")
    print("\nThe AI matching system will automatically find matches.")
    
    confirm = input("\nType 'YES' to confirm: ")
    if confirm == "YES":
        asyncio.run(add_test_data())
        print("\n🎉 Ready to test! Reload your app and check the Matches tab.")
    else:
        print("❌ Cancelled")
