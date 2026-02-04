"""
AI model for computing image embeddings and similarity matching.

Uses a pretrained CNN (ResNet18) from torchvision to extract feature vectors
from images, then computes cosine similarity for matching.
"""

import asyncio
import math
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import List, Tuple

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from app.config import MODEL_NAME, EMBEDDING_DIM

# Thread pool for CPU-intensive operations
_executor = ThreadPoolExecutor(max_workers=2)


# ===== Model Loading =====

class EmbeddingModel:
    """
    Wrapper for the pretrained CNN model used to extract embeddings.
    """
    
    def __init__(self):
        """Initialize and load the pretrained model."""
        print(f"🔄 Loading {MODEL_NAME} model...")
        
        # Load pretrained ResNet18
        if MODEL_NAME == "resnet18":
            base_model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
            # Remove the final classification layer
            self.model = nn.Sequential(*list(base_model.children())[:-1])
        elif MODEL_NAME == "mobilenet_v2":
            base_model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
            # Remove classifier
            self.model = base_model.features
        else:
            raise ValueError(f"Unsupported model: {MODEL_NAME}")
        
        # Set to evaluation mode
        self.model.eval()
        
        # Define preprocessing transforms (ImageNet normalization)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        print(f"✅ {MODEL_NAME} model loaded successfully")
    
    @torch.no_grad()
    def get_embedding(self, image: Image.Image) -> torch.Tensor:
        """
        Extract embedding from a PIL Image.
        
        Args:
            image: PIL Image object
            
        Returns:
            1D tensor representing the image embedding
        """
        # Preprocess image
        img_tensor = self.transform(image).unsqueeze(0)  # Add batch dimension
        
        # Get features
        features = self.model(img_tensor)
        
        # Flatten to 1D vector
        embedding = features.flatten()
        
        return embedding


# Global model instance (loaded once on import)
_model: EmbeddingModel | None = None


def get_model() -> EmbeddingModel:
    """
    Get or initialize the global model instance.
    
    Returns:
        The singleton EmbeddingModel instance
    """
    global _model
    if _model is None:
        _model = EmbeddingModel()
    return _model


# ===== Embedding Functions =====

def get_image_embedding(image_path: str | Path) -> List[float]:
    """
    Load an image from disk and extract its embedding (synchronous).
    
    Args:
        image_path: Path to the image file
        
    Returns:
        List of float values representing the image embedding
        
    Raises:
        FileNotFoundError: If the image file doesn't exist
        ValueError: If the image cannot be loaded
    """
    image_path = Path(image_path)
    
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    try:
        # Load image
        image = Image.open(image_path).convert("RGB")
        
        # Get model and extract embedding
        model = get_model()
        embedding_tensor = model.get_embedding(image)
        
        # Convert to list of floats
        embedding_list = embedding_tensor.cpu().numpy().tolist()
        
        return embedding_list
        
    except Exception as e:
        raise ValueError(f"Failed to process image {image_path}: {str(e)}")


async def get_image_embedding_async(image_path: str | Path) -> List[float]:
    """
    Load an image from disk and extract its embedding (asynchronous).
    
    This function runs the CPU-intensive embedding computation in a thread pool
    to avoid blocking the event loop.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        List of float values representing the image embedding
        
    Raises:
        FileNotFoundError: If the image file doesn't exist
        ValueError: If the image cannot be loaded
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, get_image_embedding, image_path)


# ===== Similarity Functions =====

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Compute cosine similarity between two vectors.
    
    Args:
        vec_a: First vector
        vec_b: Second vector
        
    Returns:
        Cosine similarity score (0.0 to 1.0, where 1.0 is identical)
        
    Raises:
        ValueError: If vectors have different lengths
    """
    if len(vec_a) != len(vec_b):
        raise ValueError(f"Vector length mismatch: {len(vec_a)} != {len(vec_b)}")
    
    # Compute dot product
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    
    # Compute magnitudes
    magnitude_a = math.sqrt(sum(a * a for a in vec_a))
    magnitude_b = math.sqrt(sum(b * b for b in vec_b))
    
    # Avoid division by zero
    if magnitude_a == 0.0 or magnitude_b == 0.0:
        return 0.0
    
    # Compute cosine similarity
    similarity = dot_product / (magnitude_a * magnitude_b)
    
    # Clamp to [0, 1] range (in case of numerical errors)
    similarity = max(0.0, min(1.0, similarity))
    
    return similarity


def find_top_matches(
    query_embedding: List[float],
    candidates: List[Tuple[int, List[float]]],
    top_k: int = 5
) -> List[Tuple[int, float]]:
    """
    Find the top K most similar candidates to the query embedding.
    
    Args:
        query_embedding: The embedding to match against
        candidates: List of (item_id, embedding) tuples
        top_k: Number of top matches to return
        
    Returns:
        List of (item_id, similarity_score) tuples, sorted by similarity (descending)
    """
    if not candidates:
        return []
    
    # Compute similarity for each candidate
    similarities = []
    for item_id, candidate_embedding in candidates:
        try:
            sim = cosine_similarity(query_embedding, candidate_embedding)
            similarities.append((item_id, sim))
        except ValueError as e:
            print(f"⚠️  Skipping item {item_id}: {e}")
            continue
    
    # Sort by similarity (descending) and take top K
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    return similarities[:top_k]


# ===== Future Enhancement Hooks =====

def apply_privacy_blur(image_path: str | Path) -> None:
    """
    TODO: Apply face and ID blurring to an image for privacy protection.
    
    This function should:
    1. Detect faces using a face detection model (e.g., OpenCV Haar Cascades or MTCNN)
    2. Detect text regions that might contain IDs or sensitive info
    3. Apply Gaussian blur to those regions
    4. Save the blurred image back to the same path
    
    Args:
        image_path: Path to the image to blur
    """
    # Placeholder for future implementation
    # from cv2 import GaussianBlur, CascadeClassifier, etc.
    pass
