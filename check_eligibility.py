"""Check if items meet matching criteria"""
import sqlite3
import json

db_path = "backend/mafqood.db"

with sqlite3.connect(db_path) as conn:
    cursor = conn.cursor()
    
    # Get last 2 items with full details
    cursor.execute("""
        SELECT id, title, type, status, user_id, ai_processed, 
               embedding IS NOT NULL as has_embedding,
               created_at
        FROM items 
        ORDER BY created_at DESC 
        LIMIT 2
    """)
    
    items = cursor.fetchall()
    
    print("\n" + "="*70)
    print("ITEM MATCHING ELIGIBILITY CHECK")
    print("="*70)
    
    for i, item in enumerate(items, 1):
        print(f"\nItem #{i}: {item[1]}")
        print(f"  ID: {item[0]}")
        print(f"  Type: {item[2]}")
        print(f"  Status: {item[3]}")
        print(f"  User ID: {item[4]}")
        print(f"  AI Processed: {item[5]}")
        print(f"  Has Embedding: {bool(item[6])}")
        print(f"  Created: {item[7]}")
    
    print("\n" + "="*70)
    print("MATCHING REQUIREMENTS CHECK")
    print("="*70)
    
    if len(items) >= 2:
        item1, item2 = items[0], items[1]
        
        print(f"\nFor Item 1 to find Item 2:")
        print(f"  ✅ Type check: {item1[2]} looking for opposite type")
        print(f"     Item 2 is: {item2[2]} {'✅ OPPOSITE' if item1[2] != item2[2] else '❌ SAME TYPE!'}")
        print(f"  ✅ Status check: Item 2 status = {item2[3]} {'✅ OPEN' if item2[3] == 'OPEN' else '❌ NOT OPEN!'}")
        print(f"  ✅ User check: Item 2 user = {item2[4]}")
        print(f"     Same user? {item1[4] == item2[4]} {'❌ SAME USER!' if item1[4] == item2[4] else '✅ DIFFERENT'}")
        print(f"  ✅ AI processed: Item 2 = {item2[5]} {'✅ TRUE' if item2[5] else '❌ FALSE!'}")
        print(f"  ✅ Has embedding: Item 2 = {item2[6]} {'✅ TRUE' if item2[6] else '❌ FALSE!'}")
        
        all_conditions = [
            item1[2] != item2[2],  # opposite type
            item2[3] == 'OPEN',  # status open
            item1[4] != item2[4],  # different user
            item2[5] == 1,  # ai_processed
            item2[6] == 1,  # has_embedding
        ]
        
        print(f"\n" + "="*70)
        if all(all_conditions):
            print("✅ ALL CONDITIONS MET - Items should match!")
        else:
            print("❌ SOME CONDITIONS FAILED - Items won't match")
            if item1[2] == item2[2]:
                print("   ❌ Both items are same type (both LOST or both FOUND)")
            if item2[3] != 'OPEN':
                print(f"   ❌ Item 2 status is '{item2[3]}' not 'OPEN'")
            if item1[4] == item2[4]:
                print("   ❌ Both items belong to same user")
            if not item2[5]:
                print("   ❌ Item 2 not AI processed")
            if not item2[6]:
                print("   ❌ Item 2 has no embedding")
        print("="*70)
