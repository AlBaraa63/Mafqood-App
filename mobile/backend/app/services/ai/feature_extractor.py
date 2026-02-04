"""
Feature Extractor Service
=========================

Extract feature vectors from images for similarity matching.
"""

from typing import Optional, List, Tuple
from pathlib import Path
import io

import numpy as np

from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger(__name__)


class FeatureExtractor:
    """
    Deep learning feature extraction for image similarity.
    
    Uses ResNet50 or similar CNN to extract feature vectors
    that can be compared for similarity matching.
    """
    
    # Feature vector dimension
    EMBEDDING_DIM = 512
    
    def __init__(self, model_name: str = "resnet50"):
        """
        Initialize feature extractor.
        
        Args:
            model_name: Model to use (resnet50, resnet18, efficientnet, etc.)
        """
        self.model_name = model_name
        self.model = None
        self.transform = None
        self.device = "cpu"
        
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the feature extraction model."""
        try:
            import torch
            import torchvision.models as models
            import torchvision.transforms as transforms
            
            # Set device
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            
            # Load model
            if self.model_name == "resnet50":
                # Load ResNet50 pretrained
                weights = models.ResNet50_Weights.IMAGENET1K_V2
                base_model = models.resnet50(weights=weights)
                
                # Remove the final classification layer
                # This gives us 2048-dim features, we'll reduce to 512
                self.model = torch.nn.Sequential(
                    *list(base_model.children())[:-1],  # Remove FC layer
                    torch.nn.Flatten(),
                    torch.nn.Linear(2048, self.EMBEDDING_DIM),  # Reduce dimensions
                )
                
                # Initialize the linear layer
                last_layer = self.model[-1]
                if isinstance(last_layer, torch.nn.Linear):
                    torch.nn.init.xavier_uniform_(last_layer.weight)
                
            elif self.model_name == "resnet18":
                weights = models.ResNet18_Weights.IMAGENET1K_V1
                base_model = models.resnet18(weights=weights)
                
                self.model = torch.nn.Sequential(
                    *list(base_model.children())[:-1],
                    torch.nn.Flatten(),
                )
            else:
                raise ValueError(f"Unsupported model: {self.model_name}")
            
            self.model = self.model.to(self.device)
            self.model.eval()
            
            # Define image transforms
            self.transform = transforms.Compose([
                transforms.ToPILImage(),
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ])
            
            logger.info(
                "Feature extractor loaded",
                model=self.model_name,
                device=self.device,
            )
            
        except ImportError:
            logger.warning("PyTorch not installed. Feature extraction disabled.")
            self.model = None
        except Exception as e:
            logger.error("Failed to load feature extractor", error=str(e))
            self.model = None
    
    def extract(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract feature vector from image.
        
        Args:
            image: Numpy array of image (RGB format, HxWxC)
            
        Returns:
            Feature vector as numpy array (512-dim), or None if extraction fails
        """
        if self.model is None or self.transform is None:
            return None
        
        try:
            import torch
            
            # Preprocess image
            img_tensor = self.transform(image)
            if isinstance(img_tensor, np.ndarray):
                img_tensor = torch.from_numpy(img_tensor)
            img_tensor = img_tensor.unsqueeze(0).to(self.device)
            
            # Extract features
            with torch.no_grad():
                features = self.model(img_tensor)
            
            # Convert to numpy and normalize
            embedding = features.cpu().numpy().flatten()
            
            # L2 normalize
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            
            return embedding.astype(np.float32)
            
        except Exception as e:
            logger.error("Feature extraction failed", error=str(e))
            return None
    
    def extract_batch(self, images: List[np.ndarray]) -> List[Optional[np.ndarray]]:
        """
        Extract features from multiple images.
        
        Args:
            images: List of numpy arrays
            
        Returns:
            List of feature vectors
        """
        if self.model is None or self.transform is None:
            return [None] * len(images)
        
        try:
            import torch
            
            # Preprocess all images
            tensors = []
            for img in images:
                tensor = self.transform(img)
                tensors.append(tensor)
            
            batch = torch.stack(tensors).to(self.device)
            
            # Extract features
            with torch.no_grad():
                features = self.model(batch)
            
            # Convert to numpy and normalize
            embeddings = features.cpu().numpy()
            
            results = []
            for embedding in embeddings:
                embedding = embedding.flatten()
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
                results.append(embedding.astype(np.float32))
            
            return results
            
        except Exception as e:
            logger.error("Batch feature extraction failed", error=str(e))
            return [None] * len(images)
    
    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1: First feature vector
            embedding2: Second feature vector
            
        Returns:
            Similarity score (0.0 to 1.0)
        """
        if embedding1 is None or embedding2 is None:
            return 0.0
        
        # Since embeddings are L2 normalized, dot product = cosine similarity
        similarity = np.dot(embedding1, embedding2)
        
        # Ensure in valid range
        return float(np.clip(similarity, 0.0, 1.0))
    
    def find_similar(
        self,
        query_embedding: np.ndarray,
        embeddings: List[np.ndarray],
        top_k: int = 10,
        min_similarity: float = 0.5,
    ) -> List[Tuple[int, float]]:
        """
        Find most similar embeddings to a query.
        
        Args:
            query_embedding: Query feature vector
            embeddings: List of candidate embeddings
            top_k: Maximum number of results
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of (index, similarity) tuples, sorted by similarity descending
        """
        if query_embedding is None or not embeddings:
            return []
        
        results = []
        for i, emb in enumerate(embeddings):
            if emb is not None:
                sim = self.similarity(query_embedding, emb)
                if sim >= min_similarity:
                    results.append((i, sim))
        
        # Sort by similarity descending
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results[:top_k]
