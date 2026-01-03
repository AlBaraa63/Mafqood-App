"""
Application Configuration
=========================

Centralized configuration management using Pydantic Settings.
Loads from environment variables with type validation and defaults.
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Use `settings = get_settings()` to access configuration.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # ===== Application =====
    app_name: str = "Mafqood"
    app_env: str = "development"
    debug: bool = True
    api_version: str = "v1"
    secret_key: str = "change-me-in-production"
    
    # ===== Server =====
    host: str = "0.0.0.0"
    port: int = 8001
    
    # ===== Database =====
    database_url: str = "postgresql+asyncpg://mafqood:mafqood_password@localhost:5432/mafqood"
    database_pool_size: int = 20
    database_max_overflow: int = 10
    
    # ===== Redis =====
    redis_url: str = "redis://localhost:6379/0"
    redis_password: Optional[str] = None
    
    # ===== JWT Authentication =====
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30
    
    # ===== AWS S3 / MinIO =====
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "me-south-1"
    s3_bucket_name: str = "mafqood-app"
    s3_endpoint_url: Optional[str] = None  # For MinIO
    
    # ===== CDN =====
    cdn_base_url: Optional[str] = None
    
    # ===== AI/ML =====
    yolo_model_path: str = "./models/yolov8n.pt"
    embedding_model: str = "resnet50"
    min_match_similarity: float = 0.5
    
    # ===== Celery =====
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    
    # ===== Firebase =====
    firebase_credentials_path: Optional[str] = None
    
    # ===== Rate Limiting =====
    rate_limit_per_minute: int = 100
    
    # ===== CORS =====
    cors_origins: str = "http://localhost:8081,http://localhost:19006"
    
    # ===== Logging =====
    log_level: str = "INFO"
    log_format: str = "json"
    
    # ===== Email =====
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from: str = "noreply@mafqood.ae"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.app_env.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.app_env.lower() == "development"
    
    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL for Alembic migrations."""
        return self.database_url.replace("+asyncpg", "")
    
    def get_storage_url(self, path: str) -> str:
        """
        Get full URL for stored file.
        Uses CDN if configured, otherwise S3 direct URL.
        """
        if self.cdn_base_url:
            return f"{self.cdn_base_url.rstrip('/')}/{path.lstrip('/')}"
        
        if self.s3_endpoint_url:
            return f"{self.s3_endpoint_url}/{self.s3_bucket_name}/{path}"
        
        return f"https://{self.s3_bucket_name}.s3.{self.aws_region}.amazonaws.com/{path}"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Returns:
        Settings: Application settings singleton
    """
    return Settings()


# Global settings instance
settings = get_settings()
