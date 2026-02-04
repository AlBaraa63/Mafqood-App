"""
Generate and link test images to items
"""
import asyncio
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import select

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.core.database import get_db_context
from app.models.item import Item


def create_test_image(title: str, color: str, filepath: Path) -> None:
    """Create a simple test image with text"""
    # Create a simple colored image
    img = Image.new('RGB', (400, 400), color=color)
    draw = ImageDraw.Draw(img)
    
    # Add text in the middle
    text = title
    # Use a basic font (no custom font, just default)
    bbox = draw.textbbox((0, 0), text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((400 - text_width) // 2, (400 - text_height) // 2)
    draw.text(position, text, fill='white')
    
    # Save the image
    img.save(str(filepath), 'JPEG')
    print(f"   ✓ Created: {filepath.name}")


async def update_image_urls():
    """Update database with image URLs"""
    
    # Create uploads directory if it doesn't exist
    uploads_dir = Path("uploads/items")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    print("📸 Creating test images...\n")
    
    # Create test images
    image_configs = [
        ("Black Leather Wallet", (40, 40, 40), "wallet_lost.jpg"),      # Dark gray/black
        ("Black Leather Wallet", (40, 40, 40), "wallet_found.jpg"),     # Dark gray/black
        ("Silver iPhone 14 Pro", (192, 192, 192), "iphone_placeholder.jpg"),  # Silver
        ("Blue Backpack", (0, 100, 200), "backpack_placeholder.jpg"),   # Blue
    ]
    
    for title, color, filename in image_configs:
        filepath = uploads_dir / filename
        if not filepath.exists():
            create_test_image(title, color, filepath)
        else:
            print(f"   - Already exists: {filename}")
    
    print("\n✅ Test images created!\n")
    
    # Update database image URLs
    print("🔗 Updating image URLs in database...\n")
    
    async with get_db_context() as db:
        result = await db.execute(select(Item))
        items = result.scalars().all()
        
        # Map items to images
        image_map = {
            "Black Leather Wallet": {
                "lost": "http://localhost:8001/uploads/items/wallet_lost.jpg",
                "found": "http://localhost:8001/uploads/items/wallet_found.jpg",
            },
            "Silver iPhone 14 Pro": "http://localhost:8001/uploads/items/iphone_placeholder.jpg",
            "Blue Backpack": "http://localhost:8001/uploads/items/backpack_placeholder.jpg",
        }
        
        for item in items:
            old_url = item.image_url
            
            if item.title == "Black Leather Wallet":
                item.image_url = image_map["Black Leather Wallet"][item.type.value]
            elif item.title == "Silver iPhone 14 Pro":
                item.image_url = image_map["Silver iPhone 14 Pro"]
            elif item.title == "Blue Backpack":
                item.image_url = image_map["Blue Backpack"]
            
            if old_url != item.image_url:
                print(f"   ✓ {item.type.value.upper()}: {item.title}")
        
        await db.commit()
        print("\n✅ Database updated with image URLs!")


if __name__ == "__main__":
    print("=" * 60)
    print("CREATE AND LINK TEST IMAGES")
    print("=" * 60)
    print()
    asyncio.run(update_image_urls())
    print("\n🎉 Done! Reload your app to see the images.")
