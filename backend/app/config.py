"""
Configuration settings for Dubai AI Lost & Found backend.
"""

import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", str(BASE_DIR / "media")))
LOST_DIR = MEDIA_ROOT / "lost"
FOUND_DIR = MEDIA_ROOT / "found"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'dubai_lostfound.db'}")

# API Settings
API_V1_PREFIX = "/api"
PROJECT_NAME = "Dubai AI Lost & Found API"
VERSION = "0.1.0"
DESCRIPTION = "Privacy-first, AI-powered lost & found platform for Dubai"

# CORS Settings
# Allow Railway deployment URL to be added via environment variable
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:8081",  # Expo web
    "http://127.0.0.1:8081",
    "http://localhost:8082",  # Expo web alt port
    "http://127.0.0.1:8082",
    "http://localhost:19006", # Expo web legacy
]

# Add additional origins from environment variable
if ALLOWED_ORIGINS_ENV:
    additional_origins = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]
    ALLOWED_ORIGINS.extend(additional_origins)

# Image Settings
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

# AI Model Settings
MODEL_NAME = "resnet18"  # or "mobilenet_v2"
EMBEDDING_DIM = 512  # ResNet18 feature dimension
TOP_K_MATCHES = 5  # Number of matches to return

# Ensure media directories exist
LOST_DIR.mkdir(parents=True, exist_ok=True)
FOUND_DIR.mkdir(parents=True, exist_ok=True)
