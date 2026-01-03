"""Quick check of AI processing"""
import requests

API_URL = "http://localhost:8001"

# Login first
login = requests.post(f"{API_URL}/auth/login", json={
    "email": "wallet@test.com",
    "password": "WalletTest123!"
})

if login.status_code != 200:
    print("Login failed")
    exit(1)

token = login.json()['token']
print(f"✅ Logged in")

# Create lost item
with open("assets/wallet1.jpg", "rb") as f:
    response = requests.post(
        f"{API_URL}/api/v1/lost",
        data={
            'title': 'Test Wallet',
            'category': 'wallet',
            'color': 'black',
            'location': 'Dubai',
            'latitude': '25.2',
            'longitude': '55.3',
            'date_time': '2026-01-03T10:00:00',
            'contact_method': 'in_app',
        },
        files={'image': ('wallet.jpg', f, 'image/jpeg')},
        headers={'Authorization': f'Bearer {token}'}
    )

print(f"\nStatus: {response.status_code}")
if response.status_code == 201:
    data = response.json()
    print(f"AI Processed: {data['item'].get('ai_processed')}")
    print(f"AI Category: {data['item'].get('ai_category')}")
    print(f"Has Embedding: {data['item'].get('embedding') is not None}")
    print(f"AI Error: {data.get('ai_error')}")
    print(f"Match Count: {data.get('match_count', 0)}")
else:
    print(response.text)
