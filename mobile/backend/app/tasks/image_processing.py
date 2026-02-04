"""
Image Processing Tasks
======================

Celery tasks for image processing pipeline.
"""

import asyncio
from typing import Optional

from celery import shared_task  # type: ignore

from app.core.logging import get_logger
from app.core.database import get_db_context
from app.services.storage import get_storage_service
from app.services.ai import ImageProcessor, ObjectDetector, FeatureExtractor


logger = get_logger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_kwargs={"max_retries": 3},
    name="app.tasks.image_processing.process_item_image",
)
def process_item_image(self, item_id: str, image_key: str) -> dict:
    """
    Process an uploaded item image.
    
    Pipeline:
    1. Download image from storage
    2. Run object detection
    3. Extract feature embeddings
    4. Update item with AI results
    
    Args:
        item_id: Item UUID string
        image_key: Storage key for the image
        
    Returns:
        Processing result dictionary
    """
    return asyncio.get_event_loop().run_until_complete(
        _process_item_image_async(item_id, image_key)
    )


async def _process_item_image_async(item_id: str, image_key: str) -> dict:
    """Async implementation of process_item_image."""
    from sqlalchemy import select
    from app.models import Item
    import uuid
    
    logger.info("Processing item image", item_id=item_id, image_key=image_key)
    
    # Initialize services
    storage = get_storage_service()
    image_processor = ImageProcessor()
    object_detector = ObjectDetector()
    feature_extractor = FeatureExtractor()
    
    # Download image
    image_data = await storage.get_image(image_key)
    if not image_data:
        logger.error("Image not found", image_key=image_key)
        return {"success": False, "error": "Image not found"}
    
    # Process image
    image_np = image_processor.image_to_numpy(image_data)
    
    # Object detection
    detection_result = object_detector.detect(image_np)
    detected_objects = object_detector.get_detections_dict(detection_result)
    
    # Feature extraction
    embedding = feature_extractor.extract(image_np)
    
    # Update database
    async with get_db_context() as db:
        result = await db.execute(
            select(Item).where(Item.id == uuid.UUID(item_id))
        )
        item = result.scalar_one_or_none()
        
        if not item:
            logger.error("Item not found", item_id=item_id)
            return {"success": False, "error": "Item not found"}
        
        item.detected_objects = {"objects": detected_objects} if detected_objects else None  # type: ignore
        item.ai_category = detection_result.primary_class
        item.ai_processed = True
        
        if embedding is not None:
            item.embedding = embedding.tolist()
        
        await db.commit()
    
    logger.info(
        "Item image processed",
        item_id=item_id,
        detections=len(detected_objects),
        ai_category=detection_result.primary_class,
    )
    
    # Trigger matching task
    from app.tasks.matching import find_matches_for_item
    find_matches_for_item.delay(item_id)
    
    return {
        "success": True,
        "item_id": item_id,
        "detections": len(detected_objects),
        "ai_category": detection_result.primary_class,
    }


@shared_task(
    bind=True,
    name="app.tasks.image_processing.process_uploaded_image",
)
def process_uploaded_image(self, image_data_b64: str) -> dict:
    """
    Process a base64 encoded image (for direct upload).
    
    Args:
        image_data_b64: Base64 encoded image data
        
    Returns:
        Processed image information
    """
    import base64
    
    try:
        image_data = base64.b64decode(image_data_b64)
    except Exception as e:
        return {"success": False, "error": f"Invalid base64 data: {e}"}
    
    image_processor = ImageProcessor()
    
    # Validate
    is_valid, error = image_processor.validate_image(image_data)
    if not is_valid:
        return {"success": False, "error": error}
    
    # Process
    processed = image_processor.process_image(image_data)
    
    # Upload to storage
    storage = get_storage_service()
    result = asyncio.get_event_loop().run_until_complete(
        storage.upload_image(
            file_data=processed.original,
            thumbnail_small=processed.thumbnail_small,
            thumbnail_large=processed.thumbnail_large,
        )
    )
    
    return {
        "success": True,
        "key": result.key,
        "url": result.url,
        "thumbnail_small": result.thumbnail_small_url,
        "thumbnail_large": result.thumbnail_large_url,
        "size": result.size,
        "dimensions": f"{processed.width}x{processed.height}",
    }


@shared_task(
    bind=True,
    name="app.tasks.image_processing.batch_reprocess",
)
def batch_reprocess_images(self, item_ids: list[str]) -> dict:
    """
    Reprocess multiple items (for model updates).
    
    Args:
        item_ids: List of item UUID strings
        
    Returns:
        Batch processing result
    """
    results = {
        "total": len(item_ids),
        "success": 0,
        "failed": 0,
        "errors": [],
    }
    
    for item_id in item_ids:
        try:
            # Get image key and reprocess
            # This is a simplified version - real implementation would
            # fetch the image key from the database
            logger.info("Reprocessing item", item_id=item_id)
            results["success"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"item_id": item_id, "error": str(e)})
    
    return results
