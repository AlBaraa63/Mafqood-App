"""
AI service for image processing, object detection, and OCR.
Wraps all AI/ML functionality into a clean interface.
"""

from pathlib import Path
from typing import Dict, List, Optional, Any

from app.ai_services import process_image_for_report, analyze_image_for_report
from app.embeddings import get_image_embedding_async


class AIService:
    """Service for AI-powered image analysis and processing."""
    
    def process_and_save_image(
        self,
        image_data: bytes,
        item_type: str,
    ) -> Dict[str, Any]:
        """
        Process an image for a report: save, analyze, and return results.
        
        Args:
            image_data: Raw image bytes
            item_type: Either "lost" or "found"
            
        Returns:
            Dictionary containing:
                - image_path: Relative path to saved image
                - analysis: Dict with detected_object, extracted_text, etc.
        """
        return process_image_for_report(image_data, item_type)
    
    async def get_embedding(self, image_path: Path) -> List[float]:
        """
        Generate embedding vector for an image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            512-dimensional embedding vector
        """
        return await get_image_embedding_async(image_path)
    
    def enhance_title(
        self,
        title: str,
        detected_object: Optional[str],
        item_type: str,
    ) -> str:
        """
        Enhance title with AI-detected object information.
        
        Args:
            title: Original title from user
            detected_object: AI-detected object class (e.g., "wallet", "phone")
            item_type: Either "lost" or "found"
            
        Returns:
            Enhanced title
        """
        if not detected_object:
            return title
        
        default_title = f'{item_type} item'
        
        if not title or title.lower() == default_title:
            # Replace default title with detected object
            return f"{item_type.capitalize()} {detected_object.capitalize()}"
        elif detected_object.lower() not in title.lower():
            # Append detected object if not already in title
            return f"{title} ({detected_object.capitalize()})"
        
        return title
    
    def enhance_description(
        self,
        description: Optional[str],
        extracted_text: Optional[str],
    ) -> Optional[str]:
        """
        Enhance description with AI-extracted OCR text.
        
        Args:
            description: Original description from user
            extracted_text: AI-extracted text from image (OCR)
            
        Returns:
            Enhanced description with OCR annotation
        """
        if not extracted_text:
            return description
        
        ocr_annotation = f"[AI OCR: {extracted_text}]"
        
        if description:
            return f"{description} {ocr_annotation}".strip()
        
        return ocr_annotation
