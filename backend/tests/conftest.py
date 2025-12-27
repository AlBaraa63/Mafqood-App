"""
Pytest configuration and fixtures for backend tests.
"""

import os
import tempfile
import shutil
from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.database import Base, get_db
from app.config import MEDIA_ROOT, LOST_DIR, FOUND_DIR


# ===== Database Fixtures =====

@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    """
    Create a temporary SQLite database for testing.
    Each test gets a fresh database.
    """
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    database_url = f"sqlite:///{db_path}"
    
    # Create engine and tables
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        engine.dispose()  # Properly close all connections
        os.close(db_fd)
        import time
        time.sleep(0.1)  # Give Windows time to release file handle
        try:
            os.unlink(db_path)
        except PermissionError:
            # On Windows, if file is still locked, ignore (temp files cleanup anyway)
            pass


@pytest.fixture(scope="function")
def client(test_db: Session) -> TestClient:
    """
    Create a test client with dependency overrides.
    """
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


# ===== File System Fixtures =====

@pytest.fixture(scope="function")
def temp_media_dir() -> Generator[Path, None, None]:
    """
    Create a temporary media directory for uploaded test files.
    """
    temp_dir = Path(tempfile.mkdtemp())
    
    # Create lost and found subdirectories
    (temp_dir / "lost").mkdir(exist_ok=True)
    (temp_dir / "found").mkdir(exist_ok=True)
    
    # Temporarily override the media directories
    original_media_root = MEDIA_ROOT
    original_lost_dir = LOST_DIR
    original_found_dir = FOUND_DIR
    
    import app.config as config
    config.MEDIA_ROOT = temp_dir
    config.LOST_DIR = temp_dir / "lost"
    config.FOUND_DIR = temp_dir / "found"
    
    # Also update in routers.items
    import app.routers.items as items_module
    items_module.LOST_DIR = temp_dir / "lost"
    items_module.FOUND_DIR = temp_dir / "found"
    
    try:
        yield temp_dir
    finally:
        # Restore original paths
        config.MEDIA_ROOT = original_media_root
        config.LOST_DIR = original_lost_dir
        config.FOUND_DIR = original_found_dir
        items_module.LOST_DIR = original_lost_dir
        items_module.FOUND_DIR = original_found_dir
        
        # Clean up temp directory
        shutil.rmtree(temp_dir, ignore_errors=True)


# ===== Test Data Fixtures =====

@pytest.fixture
def sample_image_bytes() -> bytes:
    """
    Create a simple test image (1x1 red pixel PNG).
    """
    from PIL import Image
    import io
    
    # Create a 1x1 red pixel image
    img = Image.new('RGB', (100, 100), color='red')
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes.read()


@pytest.fixture
def sample_image_file(sample_image_bytes: bytes):
    """
    Create a test image file tuple for multipart upload.
    """
    return ("test_image.png", sample_image_bytes, "image/png")
