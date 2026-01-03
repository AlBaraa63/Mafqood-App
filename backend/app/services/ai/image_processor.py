"""
Image Processor Service
=======================

Handles image preprocessing, resizing, and thumbnail generation.
"""

import io
import hashlib
from pathlib import Path
from typing import Optional, Tuple, BinaryIO
from dataclasses import dataclass

from PIL import Image, ImageOps
import numpy as np

from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger(__name__)


@dataclass
class ProcessedImage:
    """Container for processed image data."""
    original: bytes
    thumbnail_small: bytes
    thumbnail_large: bytes
    width: int
    height: int
    format: str
    perceptual_hash: str
    file_size: int


class ImageProcessor:
    """
    Image processing service.
    
    Handles:
    - Format validation
    - Resizing and compression
    - Thumbnail generation
    - Perceptual hashing for duplicate detection
    """
    
    # Supported formats
    ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "JPG"}
    
    # Size limits
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    MAX_DIMENSION = 1920
    THUMBNAIL_SMALL = (200, 200)
    THUMBNAIL_LARGE = (400, 400)
    
    # Quality settings
    JPEG_QUALITY = 85
    WEBP_QUALITY = 85
    
    def __init__(self):
        logger.info("ImageProcessor initialized")
    
    def validate_image(self, file_data: bytes) -> Tuple[bool, str]:
        """
        Validate image file.
        
        Args:
            file_data: Raw image bytes
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size
        if len(file_data) > self.MAX_FILE_SIZE:
            return False, f"File size exceeds {self.MAX_FILE_SIZE // (1024*1024)}MB limit"
        
        # Try to open and validate format
        try:
            with Image.open(io.BytesIO(file_data)) as img:
                if img.format not in self.ALLOWED_FORMATS:
                    return False, f"Unsupported format: {img.format}. Allowed: {', '.join(self.ALLOWED_FORMATS)}"
                
                # Check for corrupted images
                img.verify()
                
        except Exception as e:
            return False, f"Invalid or corrupted image: {str(e)}"
        
        return True, ""
    
    def process_image(self, file_data: bytes) -> ProcessedImage:
        """
        Process an uploaded image.
        
        Args:
            file_data: Raw image bytes
            
        Returns:
            ProcessedImage with all processed versions
        """
        img = Image.open(io.BytesIO(file_data))
        
        # Convert to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Fix orientation based on EXIF
        img = ImageOps.exif_transpose(img) or img
        
        # Store original dimensions
        orig_width, orig_height = img.size
        
        # Resize if too large
        img_resized = self._resize_image(img, self.MAX_DIMENSION)
        
        # Generate thumbnails
        thumb_small = self._create_thumbnail(img_resized, self.THUMBNAIL_SMALL)
        thumb_large = self._create_thumbnail(img_resized, self.THUMBNAIL_LARGE)
        
        # Calculate perceptual hash
        phash = self._calculate_perceptual_hash(img_resized)
        
        # Convert to bytes
        original_bytes = self._image_to_bytes(img_resized, "JPEG")
        thumb_small_bytes = self._image_to_bytes(thumb_small, "JPEG")
        thumb_large_bytes = self._image_to_bytes(thumb_large, "JPEG")
        
        return ProcessedImage(
            original=original_bytes,
            thumbnail_small=thumb_small_bytes,
            thumbnail_large=thumb_large_bytes,
            width=img_resized.width,
            height=img_resized.height,
            format="JPEG",
            perceptual_hash=phash,
            file_size=len(original_bytes),
        )
    
    def _resize_image(self, img: Image.Image, max_dimension: int) -> Image.Image:
        """Resize image to fit within max dimension while maintaining aspect ratio."""
        if max(img.size) <= max_dimension:
            return img.copy()
        
        ratio = max_dimension / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        
        return img.resize(new_size, Image.Resampling.LANCZOS)
    
    def _create_thumbnail(self, img: Image.Image, size: Tuple[int, int]) -> Image.Image:
        """Create a thumbnail with specified dimensions."""
        thumb = img.copy()
        thumb.thumbnail(size, Image.Resampling.LANCZOS)
        return thumb
    
    def _image_to_bytes(self, img: Image.Image, format: str = "JPEG") -> bytes:
        """Convert PIL Image to bytes."""
        buffer = io.BytesIO()
        
        if format.upper() in ("JPEG", "JPG"):
            img.save(buffer, format="JPEG", quality=self.JPEG_QUALITY, optimize=True)
        elif format.upper() == "WEBP":
            img.save(buffer, format="WEBP", quality=self.WEBP_QUALITY)
        else:
            img.save(buffer, format=format)
        
        return buffer.getvalue()
    
    def _calculate_perceptual_hash(self, img: Image.Image, hash_size: int = 8) -> str:
        """
        Calculate perceptual hash (pHash) for duplicate detection.
        
        Uses difference hash algorithm for fast comparison.
        """
        # Convert to grayscale and resize to hash_size + 1 x hash_size
        img_gray = img.convert("L")
        img_small = img_gray.resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        pixels = np.array(img_small)
        
        # Calculate difference hash
        diff = pixels[:, 1:] > pixels[:, :-1]
        
        # Convert to hex string
        hash_value = sum(
            2 ** i for i, v in enumerate(diff.flatten()) if v
        )
        
        return format(hash_value, f"0{hash_size * hash_size // 4}x")
    
    def compare_hashes(self, hash1: str, hash2: str) -> float:
        """
        Compare two perceptual hashes.
        
        Args:
            hash1: First perceptual hash
            hash2: Second perceptual hash
            
        Returns:
            Similarity score (0.0 to 1.0)
        """
        if len(hash1) != len(hash2):
            return 0.0
        
        # Convert to binary and count differences
        try:
            val1 = int(hash1, 16)
            val2 = int(hash2, 16)
        except ValueError:
            return 0.0
        
        # XOR and count bits
        diff = bin(val1 ^ val2).count("1")
        max_bits = len(hash1) * 4
        
        return 1.0 - (diff / max_bits)
    
    def image_to_numpy(self, file_data: bytes) -> np.ndarray:
        """
        Convert image bytes to numpy array for AI processing.
        
        Args:
            file_data: Raw image bytes
            
        Returns:
            Numpy array in RGB format
        """
        with Image.open(io.BytesIO(file_data)) as img:
            if img.mode != "RGB":
                img = img.convert("RGB")
            
            return np.array(img)
