"""
Quick Demo - Test AI Matching
==============================

Run this to see AI matching in action with real images.
Requires backend server running.
"""

import requests
import json
from pathlib import Path
from PIL import Image
import io

API_URL = "http://localhost:8001"

def create_test_image(color='black', object_type='wallet'):
    """Create a simple test image."""
    img = Image.new('RGB', (400, 300), color=color)
    
    # Add some text to make it unique
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    try:
        draw.text((150, 140), f"{object_type.upper()}", fill='white')
    except:
        pass
    
    # Save to bytes
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer.getvalue()

def test_lost_found_matching():
    """Test creating a lost and found item and see if they match."""
    
    print("=" * 70)
    print("TESTING AI MATCHING - LOST & FOUND WALLET")
    print("=" * 70)
    
    # First, register a test user or login
    print("\n1. Logging in...")
    
    login_data = {
        "email": "test@example.com",
        "password": "password123",
    }
    
    try:
        response = requests.post(f"{API_URL}/api/v1/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()['token']
            print("   ✓ User logged in")
        else:
            print(f"   ✗ Login failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            print("\n   Trying to register new user...")
            
            register_data = {
                "full_name": "AI Test User",
                "email": "aitest@mafqood.ae",
                "phone": "+971509999999",
                "password": "Test123!",
            }
            
            response = requests.post(f"{API_URL}/api/v1/auth/register", json=register_data)
            if response.status_code == 201:
                token = response.json()['token']
                print("   ✓ User created")
            else:
                print(f"   ✗ Register failed: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return
    except Exception as e:
        print(f"   ✗ Auth failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create LOST item
    print("\n2. Creating LOST wallet...")
    
    lost_data = {
        'title': 'Black Leather Wallet',
        'description': 'Lost my black wallet with ID cards',
        'category': 'wallet',
        'color': 'black',
        'brand': 'Nike',
        'location': 'Dubai Mall',
        'location_detail': 'Near fountain',
        'latitude': '25.198',
        'longitude': '55.276',
        'date_time': '2026-01-03T10:00:00',
        'contact_method': 'in_app',
    }
    
    lost_image = create_test_image('black', 'wallet')
    files = {'image': ('wallet.jpg', lost_image, 'image/jpeg')}
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/lost",
            data=lost_data,
            files=files,
            headers=headers,
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"   ✓ Lost item created: {result['item']['id']}")
            print(f"   • AI processed: {result['item'].get('ai_processed', False)}")
            print(f"   • AI category: {result['item'].get('ai_category', 'N/A')}")
            print(f"   • Matches found: {result.get('match_count', 0)}")
            if result.get('ai_error'):
                print(f"   ⚠ AI Error: {result['ai_error']}")
        else:
            print(f"   ✗ Failed: {response.status_code}")
            print(f"   {response.text}")
            return
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return
    
    # Create FOUND item (should match!)
    print("\n3. Creating FOUND wallet (similar to lost)...")
    
    found_data = {
        'title': 'Found Black Wallet',
        'description': 'Found a black wallet near fountain',
        'category': 'wallet',
        'color': 'black',
        'brand': 'Nike',
        'location': 'Dubai Mall',
        'location_detail': 'Fountain area',
        'latitude': '25.199',  # Very close
        'longitude': '55.277',
        'date_time': '2026-01-03T11:00:00',  # 1 hour later
        'contact_method': 'in_app',
    }
    
    found_image = create_test_image('black', 'wallet')
    files = {'image': ('wallet_found.jpg', found_image, 'image/jpeg')}
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/found",
            data=found_data,
            files=files,
            headers=headers,
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"   ✓ Found item created: {result['item']['id']}")
            print(f"   • AI processed: {result['item'].get('ai_processed', False)}")
            print(f"   • AI category: {result['item'].get('ai_category', 'N/A')}")
            print(f"   • Matches found: {result.get('match_count', 0)}")
            
            if result.get('ai_error'):
                print(f"   ⚠ AI Error: {result['ai_error']}")
            
            if result.get('matches'):
                print(f"\n   🎉 MATCHES DETECTED!")
                for match in result['matches']:
                    print(f"      • Match ID: {match['id']}")
                    print(f"      • Similarity: {match['similarity']:.2%}")
                    print(f"      • Confidence: {match['confidence']}")
                    print(f"      • Item: {match['matched_item']['title']}")
        else:
            print(f"   ✗ Failed: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)
    print("\nIf you see matches above, the AI is working correctly!")
    print("Check the backend logs for detailed AI processing information.")

if __name__ == "__main__":
    print("\n⚠️  Make sure the backend server is running on localhost:8001")
    print("    Run: cd backend && python main.py\n")
    
    input("Press Enter to start test...")
    test_lost_found_matching()
