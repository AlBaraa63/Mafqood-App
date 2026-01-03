"""
Storage Service
===============

File storage service with S3/local filesystem support.
"""

import uuid
import os
from pathlib import Path
from typing import Optional, BinaryIO, Tuple
from dataclasses import dataclass
from enum import Enum

from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger(__name__)


class StorageBackend(str, Enum):
    """Storage backend types."""
    LOCAL = "local"
    S3 = "s3"


@dataclass
class UploadResult:
    """Result of file upload."""
    key: str
    url: str
    thumbnail_small_url: str
    thumbnail_large_url: str
    size: int
    content_type: str


class StorageService:
    """
    File storage service.
    
    Supports:
    - Local filesystem (development)
    - AWS S3 (production)
    """
    
    def __init__(self):
        self.backend = self._detect_backend()
        self.s3_client = None
        
        if self.backend == StorageBackend.S3:
            self._init_s3()
        else:
            self._init_local()
        
        logger.info("StorageService initialized", backend=self.backend.value)
    
    def _detect_backend(self) -> StorageBackend:
        """Detect which storage backend to use."""
        if settings.s3_bucket_name and settings.aws_access_key_id:
            return StorageBackend.S3
        return StorageBackend.LOCAL
    
    def _init_s3(self) -> None:
        """Initialize S3 client."""
        try:
            import boto3  # type: ignore
            
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region,
            )
            logger.info("S3 client initialized", bucket=settings.s3_bucket_name)
            
        except ImportError:
            logger.warning("boto3 not installed, falling back to local storage")
            self.backend = StorageBackend.LOCAL
            self._init_local()
    
    def _init_local(self) -> None:
        """Initialize local storage directory."""
        self.local_path = Path("./uploads")
        self.local_path.mkdir(parents=True, exist_ok=True)
        (self.local_path / "images").mkdir(exist_ok=True)
        (self.local_path / "thumbnails").mkdir(exist_ok=True)
        
        logger.info("Local storage initialized", path=str(self.local_path))
    
    async def upload_image(
        self,
        file_data: bytes,
        thumbnail_small: bytes,
        thumbnail_large: bytes,
        file_extension: str = "jpg",
        folder: str = "items",
    ) -> UploadResult:
        """
        Upload an image with thumbnails.
        
        Args:
            file_data: Original image bytes
            thumbnail_small: Small thumbnail bytes
            thumbnail_large: Large thumbnail bytes
            file_extension: File extension
            folder: Folder/prefix for organizing files
            
        Returns:
            UploadResult with all URLs
        """
        # Generate unique key
        file_id = str(uuid.uuid4())
        
        key = f"{folder}/{file_id}.{file_extension}"
        thumb_small_key = f"{folder}/thumbs/{file_id}_sm.{file_extension}"
        thumb_large_key = f"{folder}/thumbs/{file_id}_lg.{file_extension}"
        
        content_type = f"image/{file_extension}"
        
        if self.backend == StorageBackend.S3:
            await self._upload_to_s3(key, file_data, content_type)
            await self._upload_to_s3(thumb_small_key, thumbnail_small, content_type)
            await self._upload_to_s3(thumb_large_key, thumbnail_large, content_type)
            
            url = self._get_s3_url(key)
            thumb_small_url = self._get_s3_url(thumb_small_key)
            thumb_large_url = self._get_s3_url(thumb_large_key)
        else:
            self._upload_local(key, file_data)
            self._upload_local(thumb_small_key, thumbnail_small)
            self._upload_local(thumb_large_key, thumbnail_large)
            
            url = self._get_local_url(key)
            thumb_small_url = self._get_local_url(thumb_small_key)
            thumb_large_url = self._get_local_url(thumb_large_key)
        
        return UploadResult(
            key=key,
            url=url,
            thumbnail_small_url=thumb_small_url,
            thumbnail_large_url=thumb_large_url,
            size=len(file_data),
            content_type=content_type,
        )
    
    async def _upload_to_s3(
        self,
        key: str,
        data: bytes,
        content_type: str,
    ) -> None:
        """Upload file to S3."""
        import asyncio
        from functools import partial
        
        if self.s3_client is None:
            raise RuntimeError("S3 client not initialized")
        
        loop = asyncio.get_event_loop()
        
        await loop.run_in_executor(
            None,
            partial(
                self.s3_client.put_object,
                Bucket=settings.s3_bucket_name,
                Key=key,
                Body=data,
                ContentType=content_type,
            ),
        )
    
    def _upload_local(self, key: str, data: bytes) -> None:
        """Upload file to local filesystem."""
        file_path = self.local_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(data)
    
    def _get_s3_url(self, key: str) -> str:
        """Get S3 URL for a key."""
        if settings.cdn_base_url:
            return f"{settings.cdn_base_url}/{key}"
        return f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{key}"
    
    def _get_local_url(self, key: str) -> str:
        """Get local URL for a key."""
        return f"/uploads/{key}"
    
    async def delete_image(self, key: str) -> bool:
        """
        Delete an image and its thumbnails.
        
        Args:
            key: Image key
            
        Returns:
            True if successful
        """
        try:
            # Derive thumbnail keys
            base = key.rsplit(".", 1)[0]
            ext = key.rsplit(".", 1)[1] if "." in key else "jpg"
            
            keys_to_delete = [
                key,
                f"{base.rsplit('/', 1)[0]}/thumbs/{base.rsplit('/', 1)[1]}_sm.{ext}",
                f"{base.rsplit('/', 1)[0]}/thumbs/{base.rsplit('/', 1)[1]}_lg.{ext}",
            ]
            
            if self.backend == StorageBackend.S3:
                if self.s3_client is None:
                    return False
                for k in keys_to_delete:
                    try:
                        self.s3_client.delete_object(
                            Bucket=settings.s3_bucket_name,
                            Key=k,
                        )
                    except Exception:
                        pass
            else:
                for k in keys_to_delete:
                    file_path = self.local_path / k
                    if file_path.exists():
                        file_path.unlink()
            
            return True
            
        except Exception as e:
            logger.error("Failed to delete image", key=key, error=str(e))
            return False
    
    async def get_image(self, key: str) -> Optional[bytes]:
        """
        Get image data by key.
        
        Args:
            key: Image key
            
        Returns:
            Image bytes or None
        """
        try:
            if self.backend == StorageBackend.S3:
                if self.s3_client is None:
                    return None
                response = self.s3_client.get_object(
                    Bucket=settings.s3_bucket_name,
                    Key=key,
                )
                return response["Body"].read()
            else:
                file_path = self.local_path / key
                if file_path.exists():
                    return file_path.read_bytes()
                return None
                
        except Exception as e:
            logger.error("Failed to get image", key=key, error=str(e))
            return None
    
    def get_presigned_upload_url(
        self,
        key: str,
        content_type: str = "image/jpeg",
        expires_in: int = 3600,
    ) -> Optional[str]:
        """
        Generate presigned URL for direct upload.
        
        Args:
            key: Target key
            content_type: File content type
            expires_in: URL expiration in seconds
            
        Returns:
            Presigned URL or None
        """
        if self.backend != StorageBackend.S3 or self.s3_client is None:
            return None
        
        try:
            url = self.s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": settings.s3_bucket_name,
                    "Key": key,
                    "ContentType": content_type,
                },
                ExpiresIn=expires_in,
            )
            return url
            
        except Exception as e:
            logger.error("Failed to generate presigned URL", error=str(e))
            return None


# Singleton instance
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """Get or create storage service instance."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
