"""
Seed Demo Data for Mafqood Web Portfolio Showcase

This script populates the database with realistic demo items for portfolio showcase.
Run this after clearing the database to have consistent demo data.

Usage:
    cd backend
    python seed_demo_data.py
"""

import os
import sys
import json
import shutil
import urllib.request
from pathlib import Path
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, init_db
from app.models import Item
from app.embeddings import get_image_embedding
from app.config import MEDIA_ROOT


# ===== Demo Data =====

DEMO_ITEMS = [
    # LOST ITEMS
    {
        "type": "lost",
        "title": "Black Leather Wallet",
        "description": "Premium black leather wallet with silver accents. Contains important cards.",
        "location_type": "Mall",
        "location_detail": "Dubai Mall, Fashion Avenue",
        "time_frame": "Yesterday",
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop&q=80",
    },
    {
        "type": "lost",
        "title": "iPhone 15 Pro - Blue",
        "description": "iPhone 15 Pro with blue titanium case. Has a cracked screen protector.",
        "location_type": "Metro",
        "location_detail": "Red Line, Burj Khalifa Station",
        "time_frame": "Today",
        "image_url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop&q=80",
    },
    {
        "type": "lost",
        "title": "Silver Car Keys with Remote",
        "description": "BMW car key with leather keychain. Has a small charm attached.",
        "location_type": "Taxi",
        "location_detail": "Near Dubai International Airport",
        "time_frame": "Last 3 days",
        "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=300&fit=crop&q=80",
    },
    
    # FOUND ITEMS
    {
        "type": "found",
        "title": "Brown Leather Wallet",
        "description": "Found a brown leather wallet near the fountain. Looks well-used.",
        "location_type": "Mall",
        "location_detail": "Dubai Mall, Ground Floor Fountain",
        "time_frame": "Today",
        "image_url": "https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=300&fit=crop&q=80",
    },
    {
        "type": "found",
        "title": "White AirPods Pro Case",
        "description": "Found AirPods Pro charging case. Left on a seat in the metro.",
        "location_type": "Metro",
        "location_detail": "Green Line, Healthcare City Station",
        "time_frame": "Yesterday",
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=300&fit=crop&q=80",
    },
    {
        "type": "found",
        "title": "Designer Sunglasses",
        "description": "Ray-Ban sunglasses in black case. Found on a bench outside the mall.",
        "location_type": "Street / Public Area",
        "location_detail": "Outside Mall of the Emirates",
        "time_frame": "Last 3 days",
        "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop&q=80",
    },
    {
        "type": "found",
        "title": "Blue Backpack",
        "description": "Blue Nike backpack with laptop inside. Left at security checkpoint.",
        "location_type": "Airport",
        "location_detail": "Dubai International, Terminal 3",
        "time_frame": "Yesterday",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&q=80",
    },
]


def download_image(url: str, save_path: Path) -> bool:
    """Download an image from URL to local path."""
    try:
        # Create request with a browser-like User-Agent
        request = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        with urllib.request.urlopen(request, timeout=10) as response:
            with open(save_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"⚠️  Failed to download image: {e}")
        return False


def seed_database():
    """Seed the database with demo items."""
    print("🌱 Seeding Mafqood database with demo data...\n")
    
    # Initialize database
    init_db()
    
    # Create media directories
    lost_dir = MEDIA_ROOT / "lost"
    found_dir = MEDIA_ROOT / "found"
    lost_dir.mkdir(parents=True, exist_ok=True)
    found_dir.mkdir(parents=True, exist_ok=True)
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Clear existing data
        count = db.query(Item).delete()
        db.commit()
        print(f"🗑️  Cleared {count} existing items\n")
        
        created_count = 0
        
        for i, item_data in enumerate(DEMO_ITEMS, 1):
            print(f"[{i}/{len(DEMO_ITEMS)}] Processing: {item_data['title']}")
            
            # Download image
            item_type = item_data["type"]
            filename = f"demo_{i}_{item_type}.jpg"
            image_dir = lost_dir if item_type == "lost" else found_dir
            image_path = image_dir / filename
            
            if not download_image(item_data["image_url"], image_path):
                print(f"   ❌ Skipping - image download failed")
                continue
            
            print(f"   ✅ Image downloaded")
            
            # Generate embedding
            try:
                embedding = get_image_embedding(image_path)
                print(f"   ✅ Embedding generated ({len(embedding)} dimensions)")
            except Exception as e:
                print(f"   ❌ Skipping - embedding failed: {e}")
                continue
            
            # Create database item
            db_item = Item(
                type=item_type,
                title=item_data["title"],
                description=item_data["description"],
                location_type=item_data["location_type"],
                location_detail=item_data["location_detail"],
                time_frame=item_data["time_frame"],
                image_path=str(image_path),
                embedding_json=json.dumps(embedding),
                created_at=datetime.utcnow() - timedelta(hours=i * 2),  # Stagger timestamps
            )
            
            db.add(db_item)
            db.commit()
            created_count += 1
            print(f"   ✅ Saved to database")
        
        print(f"\n🎉 Demo data seeded successfully!")
        print(f"   Created: {created_count} items")
        print(f"   Lost: {sum(1 for d in DEMO_ITEMS[:created_count] if d['type'] == 'lost')}")
        print(f"   Found: {sum(1 for d in DEMO_ITEMS[:created_count] if d['type'] == 'found')}")
        
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
