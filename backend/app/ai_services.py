import io
import os
import uuid
from typing import Dict, Any, Optional

from PIL import Image
import easyocr
from ultralytics import YOLO  # type: ignore
from . import config

# --- AI Model Initialization ---

# 1. Object Detection Model (YOLOv8 for stability and performance)
# We will use a pre-trained general model for the prototype
try:
    YOLO_MODEL = YOLO('yolov8n.pt')  # Nano model for fast inference
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    YOLO_MODEL = None

# 2. OCR Model (EasyOCR for multilingual support, including Arabic)
# Initialize with English and Arabic languages
try:
    OCR_READER = easyocr.Reader(['en', 'ar'], gpu=False)
except Exception as e:
    print(f"Error loading EasyOCR reader: {e}")
    OCR_READER = None

# --- Core AI Functions ---

def analyze_image_for_report(image_data: bytes) -> Dict[str, Any]:
    """
    Performs object detection and OCR on an image to pre-fill a lost/found report.
    
    Args:
        image_data: The raw bytes of the image file.
        
    Returns:
        A dictionary containing extracted data (e.g., detected_object, extracted_text).
    """
    results = {
        "detected_object": None,
        "extracted_text": None,
        "confidence": 0.0,
    }
    
    if not YOLO_MODEL or not OCR_READER:
        print("AI models not initialized. Skipping analysis.")
        return results

    try:
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # 1. Object Detection
        yolo_results = YOLO_MODEL(image, verbose=False)
        
        if yolo_results and yolo_results[0].boxes:
            # Get the box with the highest confidence
            best_box = yolo_results[0].boxes[0]
            
            # Extract object name and confidence
            class_id = int(best_box.cls.cpu().numpy()[0])
            object_name = YOLO_MODEL.names[class_id]
            confidence = float(best_box.conf.cpu().numpy()[0])
            
            results["detected_object"] = object_name
            results["confidence"] = confidence
            
            # 2. OCR on the detected object (optional: crop for better accuracy)
            # For simplicity in this prototype, we will run OCR on the whole image
            # A more advanced version would crop the image based on the bounding box
            
            ocr_results = OCR_READER.readtext(image_data, detail=0, paragraph=True)
            
            if ocr_results:
                # Join all detected text into a single string
                results["extracted_text"] = " ".join(str(text) for text in ocr_results)
                
        return results
        
    except Exception as e:
        print(f"AI analysis failed: {e}")
        return results

def apply_privacy_blur(image_data: bytes) -> bytes:
    """
    Placeholder for a function that detects faces/IDs and applies a blur filter.
    
    Args:
        image_data: The raw bytes of the image file.
        
    Returns:
        The image bytes with sensitive areas blurred.
    """
    # In a real-world scenario, this would use a dedicated model (e.g., OpenCV with
    # Haar Cascades or a lightweight CNN) to detect and blur faces/IDs.
    # For the prototype, we return the original image.
    print("Privacy blur function called (returning original image for prototype).")
    return image_data

# --- Integration into FastAPI ---

# This function will be called from the router
def process_image_for_report(image_data: bytes, item_type: str) -> Dict[str, Any]:
    """
    Full pipeline for image processing: privacy blur, AI analysis, and saving.
    """
    
    # 1. Apply Privacy Blur (Placeholder)
    processed_image_data = apply_privacy_blur(image_data)
    
    # 2. AI Analysis (Object Detection & OCR)
    analysis_results = analyze_image_for_report(processed_image_data)
    
    # 3. Save Image
    # We need to save the image to disk and return the path
    
    # Re-open the processed image to save it
    image = Image.open(io.BytesIO(processed_image_data))
    
    # Generate unique filename
    file_extension = image.format.lower() if image.format else 'jpeg'
    filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Determine save path
    save_dir = os.path.join(str(config.MEDIA_ROOT), item_type)
    os.makedirs(save_dir, exist_ok=True)
    image_path = os.path.join(save_dir, filename)
    
    # Save the image
    image.save(image_path)
    
    # Return the relative path and analysis results
    return {
        "image_path": f"{item_type}/{filename}",
        "analysis": analysis_results
    }
