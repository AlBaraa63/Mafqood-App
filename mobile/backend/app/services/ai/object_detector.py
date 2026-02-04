"""
Object Detector Service
=======================

YOLO-based object detection for item classification.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import numpy as np

from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger(__name__)


@dataclass
class Detection:
    """Single object detection result."""
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    

@dataclass
class DetectionResult:
    """Complete detection result for an image."""
    detections: List[Detection]
    primary_class: Optional[str]
    primary_confidence: float
    processing_time_ms: float


class ObjectDetector:
    """
    YOLO-based object detection service.
    
    Uses YOLOv8 for detecting and classifying items in images.
    """
    
    # Mapping from YOLO classes to our item categories
    CLASS_MAPPING = {
        "cell phone": "phone",
        "laptop": "electronics",
        "keyboard": "electronics",
        "mouse": "electronics",
        "remote": "electronics",
        "tv": "electronics",
        "backpack": "bag",
        "handbag": "bag",
        "suitcase": "bag",
        "umbrella": "accessories",
        "tie": "clothing",
        "watch": "jewelry",
        "ring": "jewelry",
        "necklace": "jewelry",
        "book": "documents",
        "wallet": "wallet",
        "purse": "wallet",
        "key": "keys",
        "keys": "keys",
        "glasses": "accessories",
        "sunglasses": "accessories",
        "hat": "clothing",
        "shoe": "clothing",
        "boot": "clothing",
        "bottle": "other",
        "cup": "other",
        "scissors": "other",
        "teddy bear": "other",
        "passport": "id",
        "id card": "id",
        "credit card": "wallet",
    }
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize object detector.
        
        Args:
            model_path: Path to YOLO model weights. Uses settings default if not provided.
        """
        self.model_path = model_path or settings.yolo_model_path
        self.model = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load YOLO model."""
        try:
            # Try standard import first, fallback to submodule
            try:
                from ultralytics import YOLO  # type: ignore
            except ImportError:
                from ultralytics.yolo import YOLO  # type: ignore
            
            model_file = Path(self.model_path)
            if not model_file.exists():
                # Try to find model in common locations
                alt_paths = [
                    Path("./yolov8n.pt"),
                    Path("./models/yolov8n.pt"),
                    Path("../yolov8n.pt"),
                ]
                for alt_path in alt_paths:
                    if alt_path.exists():
                        model_file = alt_path
                        break
            
            if model_file.exists():
                self.model = YOLO(str(model_file))
                logger.info("YOLO model loaded", path=str(model_file))
            else:
                # Download default model
                self.model = YOLO("yolov8n.pt")
                logger.info("YOLO model downloaded (yolov8n.pt)")
                
        except ImportError:
            logger.warning("Ultralytics not installed. Object detection disabled.")
            self.model = None
        except Exception as e:
            logger.error("Failed to load YOLO model", error=str(e))
            self.model = None
    
    def detect(
        self,
        image: np.ndarray,
        confidence_threshold: float = 0.25,
    ) -> DetectionResult:
        """
        Detect objects in an image.
        
        Args:
            image: Numpy array of image (RGB format)
            confidence_threshold: Minimum confidence for detections
            
        Returns:
            DetectionResult with all detections
        """
        import time
        start_time = time.time()
        
        if self.model is None:
            return DetectionResult(
                detections=[],
                primary_class=None,
                primary_confidence=0.0,
                processing_time_ms=0.0,
            )
        
        # Run inference
        results = self.model(image, conf=confidence_threshold, verbose=False)
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                class_name = self.model.names[class_id]
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].tolist()
                
                detections.append(Detection(
                    class_name=class_name,
                    confidence=confidence,
                    bbox=bbox,
                ))
        
        # Sort by confidence
        detections.sort(key=lambda d: d.confidence, reverse=True)
        
        # Determine primary class
        primary_class = None
        primary_confidence = 0.0
        
        if detections:
            # Find the most relevant detection (highest confidence mapped class)
            for det in detections:
                mapped = self.CLASS_MAPPING.get(det.class_name.lower())
                if mapped:
                    primary_class = mapped
                    primary_confidence = det.confidence
                    break
            
            # If no mapped class, use highest confidence
            if primary_class is None:
                primary_class = detections[0].class_name
                primary_confidence = detections[0].confidence
        
        processing_time = (time.time() - start_time) * 1000
        
        logger.debug(
            "Object detection complete",
            num_detections=len(detections),
            primary_class=primary_class,
            processing_time_ms=processing_time,
        )
        
        return DetectionResult(
            detections=detections,
            primary_class=primary_class,
            primary_confidence=primary_confidence,
            processing_time_ms=processing_time,
        )
    
    def map_to_category(self, class_name: str) -> str:
        """
        Map YOLO class name to item category.
        
        Args:
            class_name: YOLO class name
            
        Returns:
            Item category string
        """
        return self.CLASS_MAPPING.get(class_name.lower(), "other")
    
    def get_detections_dict(self, result: DetectionResult) -> List[Dict[str, Any]]:
        """
        Convert DetectionResult to dictionary format for storage.
        
        Args:
            result: DetectionResult from detect()
            
        Returns:
            List of detection dictionaries
        """
        return [
            {
                "class": det.class_name,
                "confidence": round(det.confidence, 4),
                "bbox": [round(x, 2) for x in det.bbox],
                "category": self.map_to_category(det.class_name),
            }
            for det in result.detections
        ]
