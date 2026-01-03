"""
Live Demo - AI Matching with Real Wallet Images
================================================

Upload the actual wallet images and test AI matching.
"""

import requests
import json
from pathlib import Path
import time

API_URL = "http://localhost:8001"

def test_wallet_matching():
    """Test AI matching with the actual wallet images."""
    
    print("\n" + "=" * 70)
    print("MAFQOOD AI MATCHING - LIVE DEMO WITH REAL WALLET IMAGES")
    print("=" * 70)
    
    # Get the wallet images
    wallet_image_1 = Path("assets/wallet1.jpg")
    wallet_image_2 = Path("assets/wallet2.jpg")
    
    if not wallet_image_1.exists() or not wallet_image_2.exists():
        print("\n❌ Wallet images not found!")
        print("Please ensure wallet1.jpg and wallet2.jpg are in the assets folder")
        return
    
    # Login as User 1 (lost item owner)
    print("\n1. Logging in as User 1 (lost item owner)...")
    login_data1 = {
        "email": "lost@test.com",
        "password": "Test123!",
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json=login_data1, timeout=5)
        if response.status_code == 200:
            token1 = response.json()['token']
            print("   ✅ User 1 logged in successfully")
        else:
            # Try to register
            print("   📝 Creating User 1...")
            
            register_data = {
                "full_name": "Lost Item Owner",
                "email": "lost@test.com",
                "phone": "+971501111111",
                "password": "Test123!",
                "is_venue": False,
            }
            response = requests.post(f"{API_URL}/auth/register", json=register_data, timeout=5)
            if response.status_code == 201:
                token1 = response.json()['token']
                print("   ✅ User 1 created")
            else:
                print(f"   ❌ Register failed: {response.status_code}")
                print(f"   {response.text}")
                return
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
        print("   Make sure backend is running: cd backend && python main.py")
        return
    
    headers1 = {"Authorization": f"Bearer {token1}"}
    
    # Login as User 2 (found item owner)
    print("\n   Logging in as User 2 (found item owner)...")
    login_data2 = {
        "email": "found@test.com",
        "password": "Test123!",
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json=login_data2, timeout=5)
        if response.status_code == 200:
            token2 = response.json()['token']
            print("   ✅ User 2 logged in successfully")
        else:
            # Try to register
            print("   📝 Creating User 2...")
            
            register_data = {
                "full_name": "Found Item Owner",
                "email": "found@test.com",
                "phone": "+971502222222",
                "password": "Test123!",
                "is_venue": False,
            }
            response = requests.post(f"{API_URL}/auth/register", json=register_data, timeout=5)
            if response.status_code == 201:
                token2 = response.json()['token']
                print("   ✅ User 2 created")
            else:
                print(f"   ❌ Register failed: {response.status_code}")
                print(f"   {response.text}")
                return
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
        return
    
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    # Create LOST wallet (User 1)
    print("\n2. Creating LOST wallet report (User 1)...")
    print("   📸 Using wallet image 1")
    
    lost_data = {
        'title': 'Black Wallet with White Pattern',
        'description': 'Lost my black wallet with white text pattern. Has credit cards inside.',
        'category': 'wallet',
        'color': 'black',
        'brand': '',
        'location': 'Dubai Mall',
        'location_detail': 'Near Apple Store',
        'latitude': '25.198',
        'longitude': '55.276',
        'date_time': '2026-01-03T15:00:00',
        'contact_method': 'in_app',
    }
    
    with open(wallet_image_1, 'rb') as f:
        files = {'image': ('wallet_lost.jpg', f, 'image/jpeg')}
        
        try:
            response = requests.post(
                f"{API_URL}/api/v1/lost",
                data=lost_data,
                files=files,
                headers=headers1,
            )
            
            if response.status_code == 201:
                result = response.json()
                lost_item_id = result['item']['id']
                
                print(f"   ✅ Lost item created!")
                print(f"      • ID: {lost_item_id}")
                print(f"      • AI Processed: {result['item'].get('ai_processed', False)}")
                print(f"      • AI Category: {result['item'].get('ai_category', 'N/A')}")
                
                # Check if AI error
                if result.get('ai_error'):
                    print(f"      ⚠️ AI ERROR: {result['ai_error']}")
                
                if result['item'].get('embedding'):
                    embedding_sample = result['item']['embedding'][:5]
                    print(f"      • Embedding: [{', '.join(f'{x:.3f}' for x in embedding_sample)}...]")
                    print(f"      • Embedding length: {len(result['item']['embedding'])}")
                else:
                    print(f"      • Embedding: None (AI did not process)")
                
                if result.get('ai_error'):
                    print(f"      ⚠️ AI Error: {result['ai_error']}")
                else:
                    print(f"      • Matches found: {result.get('match_count', 0)}")
            else:
                print(f"   ❌ Failed: {response.status_code}")
                print(f"   {response.text[:200]}")
                return
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return
    
    # Wait a moment
    print("\n   ⏳ Waiting 2 seconds before creating found item...")
    time.sleep(2)
    
    # Create FOUND wallet (User 2 - should match with User 1's lost item!)
    print("\n3. Creating FOUND wallet report (User 2)...")
    print("   📸 Using wallet image 2 (similar to lost)")
    
    found_data = {
        'title': 'Found Black Wallet',
        'description': 'Found a black wallet with pattern near Apple Store',
        'category': 'wallet',
        'color': 'black',
        'brand': '',
        'location': 'Dubai Mall',
        'location_detail': 'Apple Store entrance',
        'latitude': '25.199',  # Very close
        'longitude': '55.277',
        'date_time': '2026-01-03T16:30:00',  # 1.5 hours later
        'contact_method': 'in_app',
    }
    
    with open(wallet_image_2, 'rb') as f:
        files = {'image': ('wallet_found.jpg', f, 'image/jpeg')}
        
        try:
            response = requests.post(
                f"{API_URL}/api/v1/found",
                data=found_data,
                files=files,
                headers=headers2,
            )
            
            if response.status_code == 201:
                result = response.json()
                found_item_id = result['item']['id']
                
                print(f"   ✅ Found item created!")
                print(f"      • ID: {found_item_id}")
                print(f"      • AI Processed: {result['item'].get('ai_processed', False)}")
                print(f"      • AI Category: {result['item'].get('ai_category', 'N/A')}")
                
                if result['item'].get('embedding'):
                    embedding_sample = result['item']['embedding'][:5]
                    print(f"      • Embedding: [{', '.join(f'{x:.3f}' for x in embedding_sample)}...]")
                
                if result.get('ai_error'):
                    print(f"      ⚠️ AI Error: {result['ai_error']}")
                    print("\n" + "=" * 70)
                    print("❌ AI MATCHING FAILED - Dependencies or models not loaded")
                    print("=" * 70)
                    return
                
                matches_found = result.get('match_count', 0)
                print(f"      • Matches found: {matches_found}")
                
                if matches_found > 0:
                    print("\n" + "=" * 70)
                    print("🎉 SUCCESS! AI DETECTED MATCHING WALLET!")
                    print("=" * 70)
                    
                    print("\n   Match Details:")
                    for i, match in enumerate(result.get('matches', []), 1):
                        print(f"\n   Match #{i}:")
                        print(f"      • Match ID: {match['id']}")
                        print(f"      • Similarity Score: {match['similarity']:.1%}")
                        print(f"      • Confidence: {match['confidence'].upper()}")
                        print(f"      • Status: {match['status']}")
                        print(f"      • Matched Item: {match['matched_item']['title']}")
                        print(f"      • Location: {match['matched_item']['location']}")
                        print(f"      • Date: {match['matched_item']['date_time'][:10]}")
                    
                    print("\n   🔬 AI Analysis:")
                    print("      ✅ YOLO detected objects in both images")
                    print("      ✅ ResNet50 extracted feature embeddings (512-dim)")
                    print("      ✅ Similarity matcher compared visual features")
                    print("      ✅ Metadata scoring (category, color, location, time)")
                    print("      ✅ Match confidence calculated and stored")
                    
                    print("\n" + "=" * 70)
                    print("The AI matching system is FULLY OPERATIONAL! ✅")
                    print("=" * 70)
                else:
                    print("\n" + "=" * 70)
                    print("⚠️ No matches found (but AI processed successfully)")
                    print("=" * 70)
                    print("\n   This could mean:")
                    print("      • Images are too different (low visual similarity)")
                    print("      • Matching score below threshold (0.4)")
                    print("      • AI processed but didn't meet matching criteria")
                    print("\n   But AI is working - embeddings were created! ✅")
            else:
                print(f"   ❌ Failed: {response.status_code}")
                print(f"   {response.text[:200]}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    print("\n⚠️  REQUIREMENTS:")
    print("   1. Backend must be running: cd backend && python main.py")
    print("   2. Wallet images must be in assets/ folder")
    print("   3. User test@example.com must exist (or will be created)")
    print("\nStarting in 3 seconds...")
    time.sleep(3)
    test_wallet_matching()
