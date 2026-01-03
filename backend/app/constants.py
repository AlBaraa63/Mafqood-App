"""
Application constants and configuration values.
Extracted from config.py for better organization.
"""

import os
from typing import Set

# ===== Image Processing Constants =====
ALLOWED_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB in bytes

# ===== AI Model Constants =====
MODEL_NAME: str = os.getenv("MODEL_NAME", "resnet18")  # or "mobilenet_v2"
EMBEDDING_DIM: int = int(os.getenv("EMBEDDING_DIM", "512"))  # ResNet18 feature dimension
TOP_K_MATCHES: int = int(os.getenv("TOP_K_MATCHES", "5"))  # Number of matches to return

# YOLO model configuration
YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")

# OCR configuration
OCR_LANGUAGES: list = ["en", "ar"]  # English and Arabic
OCR_GPU_ENABLED: bool = os.getenv("OCR_GPU_ENABLED", "false").lower() == "true"

# ===== Authentication Constants =====
# Secret key for JWT encoding/decoding (MUST be set in production)
SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_THIS_IN_PRODUCTION_PLEASE_USE_SECURE_RANDOM_KEY")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))  # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))  # 7 days

# Password hashing
PWD_CONTEXT_SCHEMES: list = ["bcrypt"]
PWD_CONTEXT_DEPRECATED: str = "auto"

# ===== Contact Information =====
SUPPORT_EMAIL: str = os.getenv("SUPPORT_EMAIL", "support@mafqood.ae")
SUPPORT_PHONE: str = os.getenv("SUPPORT_PHONE", "+971 4 123 4567")

# ===== Feature Flags =====
ENABLE_PRIVACY_BLUR: bool = os.getenv("ENABLE_PRIVACY_BLUR", "false").lower() == "true"
ENABLE_TEST_ENDPOINTS: bool = os.getenv("ENABLE_TEST_ENDPOINTS", "true").lower() == "true"
