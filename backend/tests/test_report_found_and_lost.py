"""
Tests for reporting found and lost items with AI matching.
"""

from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_report_found_item(
    client: TestClient,
    test_db: Session,
    temp_media_dir: Path,
    sample_image_file: tuple
):
    """
    Test POST /api/found creates a found item and returns valid response.
    """
    filename, file_content, content_type = sample_image_file
    
    response = client.post(
        "/api/found",
        files={"file": (filename, file_content, content_type)},
        data={
            "title": "Test Found Wallet",
            "description": "Black leather wallet",
            "location_type": "Mall",
            "location_detail": "Dubai Mall, Level 2",
            "time_frame": "Today",
        }
    )
    
    # Debug: Print error if not 201
    if response.status_code != 201:
        print(f"\n❌ Error {response.status_code}: {response.text}")
    
    assert response.status_code == 201
    
    data = response.json()
    
    # Check item structure
    assert "item" in data
    item = data["item"]
    assert item["id"] is not None
    assert item["type"] == "found"
    assert item["title"] == "Test Found Wallet"
    assert item["description"] == "Black leather wallet"
    assert item["location_type"] == "Mall"
    assert item["location_detail"] == "Dubai Mall, Level 2"
    assert item["time_frame"] == "Today"
    assert "image_url" in item
    assert "created_at" in item
    
    # Check matches array exists (empty since no lost items yet)
    assert "matches" in data
    assert isinstance(data["matches"], list)
    assert len(data["matches"]) == 0


def test_report_lost_item(
    client: TestClient,
    test_db: Session,
    temp_media_dir: Path,
    sample_image_file: tuple
):
    """
    Test POST /api/lost creates a lost item and returns valid response.
    """
    filename, file_content, content_type = sample_image_file
    
    response = client.post(
        "/api/lost",
        files={"file": (filename, file_content, content_type)},
        data={
            "title": "Test Lost Phone",
            "description": "iPhone 13 Pro",
            "location_type": "Taxi",
            "location_detail": None,
            "time_frame": "Yesterday",
        }
    )
    
    if response.status_code != 201:
        print(f"\n❌ Error response: {response.text}")
    assert response.status_code == 201
    
    data = response.json()
    
    # Check item structure
    assert "item" in data
    item = data["item"]
    assert item["id"] is not None
    assert item["type"] == "lost"
    assert item["title"] == "Test Lost Phone"
    assert item["description"] == "iPhone 13 Pro"
    assert item["location_type"] == "Taxi"
    assert item["time_frame"] == "Yesterday"
    assert "image_url" in item
    assert "created_at" in item
    
    # Check matches array exists
    assert "matches" in data
    assert isinstance(data["matches"], list)


def test_report_found_and_lost_with_matching(
    client: TestClient,
    test_db: Session,
    temp_media_dir: Path,
    sample_image_file: tuple
):
    """
    Test that reporting a lost item after a found item returns matches.
    """
    filename, file_content, content_type = sample_image_file
    
    # Step 1: Report a found item
    response_found = client.post(
        "/api/found",
        files={"file": (filename, file_content, content_type)},
        data={
            "title": "Found Keys",
            "description": "Car keys with BMW logo",
            "location_type": "Metro",
            "location_detail": "Burj Khalifa station",
            "time_frame": "Today",
        }
    )
    
    if response_found.status_code != 201:
        print(f"\n❌ Found item error: {response_found.text}")
    assert response_found.status_code == 201
    found_data = response_found.json()
    assert found_data["item"]["type"] == "found"
    
    # Step 2: Report a lost item with similar image
    # (In reality, this would be a different but similar image.
    # For this test, we use the same image to guarantee a match.)
    response_lost = client.post(
        "/api/lost",
        files={"file": (filename, file_content, content_type)},
        data={
            "title": "Lost Keys",
            "description": "My car keys",
            "location_type": "Metro",
            "location_detail": "Near Burj Khalifa",
            "time_frame": "Today",
        }
    )
    
    if response_lost.status_code != 201:
        print(f"\n❌ Lost item error: {response_lost.text}")
    assert response_lost.status_code == 201
    lost_data = response_lost.json()
    
    # Check that matches are returned
    assert "matches" in lost_data
    matches = lost_data["matches"]
    
    # Since we used the same image, there should be a match with the found item
    assert len(matches) > 0
    
    # Verify match structure
    first_match = matches[0]
    assert "item" in first_match
    assert "similarity" in first_match
    
    # The matched item should be the found item
    matched_item = first_match["item"]
    assert matched_item["type"] == "found"
    assert matched_item["title"] == "Found Keys"
    
    # Similarity should be high (close to 1.0 since it's the same image)
    assert first_match["similarity"] > 0.8


def test_history_endpoint(
    client: TestClient,
    test_db: Session,
    temp_media_dir: Path,
    sample_image_file: tuple
):
    """
    Test GET /api/history returns all items with their matches.
    """
    filename, file_content, content_type = sample_image_file
    
    # Report a found item
    client.post(
        "/api/found",
        files={"file": (filename, file_content, content_type)},
        data={
            "title": "Found Headphones",
            "description": "Sony WH-1000XM4",
            "location_type": "Airport",
            "location_detail": "Terminal 3",
            "time_frame": "Yesterday",
        }
    )
    
    # Report a lost item
    client.post(
        "/api/lost",
        files={"file": (filename, file_content, content_type)},
        data={
            "title": "Lost Headphones",
            "description": "Wireless headphones",
            "location_type": "Airport",
            "location_detail": "Terminal 3",
            "time_frame": "Yesterday",
        }
    )
    
    # Get history
    response = client.get("/api/history")
    
    assert response.status_code == 200
    
    data = response.json()
    
    # Check structure
    assert "lost_items" in data
    assert "found_items" in data
    
    lost_items = data["lost_items"]
    found_items = data["found_items"]
    
    # Should have at least 1 of each
    assert len(lost_items) >= 1
    assert len(found_items) >= 1
    
    # Verify structure of first lost item
    first_lost = lost_items[0]
    assert "item" in first_lost
    assert "matches" in first_lost
    assert isinstance(first_lost["matches"], list)
    
    # Verify the item structure
    assert first_lost["item"]["type"] == "lost"
    assert "title" in first_lost["item"]
    assert "image_url" in first_lost["item"]
    
    # Verify structure of first found item
    first_found = found_items[0]
    assert "item" in first_found
    assert "matches" in first_found
    assert isinstance(first_found["matches"], list)
    
    assert first_found["item"]["type"] == "found"


def test_invalid_file_type(
    client: TestClient,
    test_db: Session,
    temp_media_dir: Path
):
    """
    Test that uploading a non-image file returns 400 error.
    """
    response = client.post(
        "/api/lost",
        files={"file": ("test.txt", b"Not an image", "text/plain")},
        data={
            "title": "Test Item",
            "location_type": "Mall",
            "time_frame": "Today",
        }
    )
    
    assert response.status_code == 400


def test_missing_required_fields(
    client: TestClient,
    test_db: Session,
    temp_media_dir: Path,
    sample_image_file: tuple
):
    """
    Test that missing required fields returns 422 error.
    """
    filename, file_content, content_type = sample_image_file
    
    # Missing title
    response = client.post(
        "/api/lost",
        files={"file": (filename, file_content, content_type)},
        data={
            "location_type": "Mall",
            "time_frame": "Today",
        }
    )
    
    assert response.status_code == 422
