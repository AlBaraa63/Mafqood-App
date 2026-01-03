"""Calculate actual similarity between the two wallet items"""
import sqlite3
import json
import numpy as np

db_path = "backend/mafqood.db"

with sqlite3.connect(db_path) as conn:
    cursor = conn.cursor()
    
    # Get last 2 items
    cursor.execute("""
        SELECT id, title, embedding
        FROM items 
        ORDER BY created_at DESC 
        LIMIT 2
    """)
    
    items = cursor.fetchall()
    
    if len(items) < 2:
        print("Need at least 2 items")
        exit(1)
    
    # Parse embeddings
    emb1 = np.array(json.loads(items[0][2]))
    emb2 = np.array(json.loads(items[1][2]))
    
    # Calculate cosine similarity (dot product since already normalized)
    visual_similarity = float(np.dot(emb1, emb2))
    
    print("\n" + "="*70)
    print("VISUAL SIMILARITY CALCULATION")
    print("="*70)
    print(f"\nItem 1: {items[0][1]}")
    print(f"  ID: {items[0][0]}")
    print(f"  Embedding shape: {emb1.shape}")
    print(f"  Embedding norm: {np.linalg.norm(emb1):.4f}")
    
    print(f"\nItem 2: {items[1][1]}")
    print(f"  ID: {items[1][0]}")
    print(f"  Embedding shape: {emb2.shape}")
    print(f"  Embedding norm: {np.linalg.norm(emb2):.4f}")
    
    print(f"\n" + "="*70)
    print(f"Visual Similarity (Cosine): {visual_similarity:.4f}")
    print("="*70)
    
    # Check thresholds
    MIN_VISUAL_SIMILARITY = 0.10
    MIN_FINAL_SCORE = 0.25
    VISUAL_WEIGHT = 0.65
    
    print(f"\nThresholds:")
    print(f"  MIN_VISUAL_SIMILARITY: {MIN_VISUAL_SIMILARITY} {'✅ PASS' if visual_similarity >= MIN_VISUAL_SIMILARITY else '❌ FAIL'}")
    print(f"  Visual contribution to final score: {visual_similarity * VISUAL_WEIGHT:.4f}")
    print(f"  MIN_FINAL_SCORE needed: {MIN_FINAL_SCORE}")
    print(f"\nConclusion:")
    if visual_similarity < MIN_VISUAL_SIMILARITY:
        print(f"  ❌ Visual similarity {visual_similarity:.4f} is below minimum threshold {MIN_VISUAL_SIMILARITY}")
        print(f"  This match would be rejected before scoring")
    elif visual_similarity * VISUAL_WEIGHT >= MIN_FINAL_SCORE:
        print(f"  ✅ Visual similarity alone ({visual_similarity * VISUAL_WEIGHT:.4f}) exceeds minimum score!")
        print(f"  Match should be created")
    else:
        print(f"  ⚠️ Visual similarity passes initial check but needs metadata boost")
        print(f"  Current: {visual_similarity * VISUAL_WEIGHT:.4f}, Needed: {MIN_FINAL_SCORE}")
        print(f"  Gap to close with metadata: {MIN_FINAL_SCORE - (visual_similarity * VISUAL_WEIGHT):.4f}")
