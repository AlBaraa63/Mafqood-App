"""Check database for items and their embeddings"""
import sqlite3
import json

db_path = "backend/mafqood.db"

with sqlite3.connect(db_path) as conn:
    cursor = conn.cursor()
    
    # Get last 2 items
    cursor.execute("""
        SELECT id, title, category, ai_category, embedding, 
               location, latitude, longitude, date_time,
               created_at
        FROM items 
        ORDER BY created_at DESC 
        LIMIT 2
    """)
    
    items = cursor.fetchall()
    
    print("\n" + "="*70)
    print("LAST 2 ITEMS IN DATABASE")
    print("="*70)
    
    for i, item in enumerate(items, 1):
        print(f"\nItem #{i}:")
        print(f"  ID: {item[0]}")
        print(f"  Title: {item[1]}")
        print(f"  Category: {item[2]}")
        print(f"  AI Category: {item[3]}")
        print(f"  Has Embedding: {item[4] is not None}")
        if item[4]:
            emb = json.loads(item[4])
            print(f"  Embedding length: {len(emb)}")
            print(f"  Embedding sample: [{', '.join(f'{x:.3f}' for x in emb[:5])}...]")
        print(f"  Location: {item[5]}")
        print(f"  Lat/Lon: {item[6]}, {item[7]}")
        print(f"  DateTime: {item[8]}")
        print(f"  Created: {item[9]}")
    
    # Check matches
    cursor.execute("""
        SELECT id, user_item_id, matched_item_id, similarity_score, 
               confidence, status
        FROM matches 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    
    matches = cursor.fetchall()
    
    print("\n" + "="*70)
    print(f"RECENT MATCHES: {len(matches)}")
    print("="*70)
    
    for match in matches:
        print(f"\nMatch ID: {match[0]}")
        print(f"  User Item: {match[1]}")
        print(f"  Matched Item: {match[2]}")
        print(f"  Similarity: {match[3]:.2%}")
        print(f"  Confidence: {match[4]}")
        print(f"  Status: {match[5]}")
