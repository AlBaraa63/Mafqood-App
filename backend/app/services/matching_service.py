"""
Matching service for computing similarity between items.
Handles all embedding comparison and match ranking logic.
"""

from typing import List, Tuple
from sqlalchemy.orm import Session

from app import crud, schemas
from app.embeddings import find_top_matches
from app.constants import TOP_K_MATCHES


class MatchingService:
    """Service for computing similarity matches between items."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def compute_matches(
        self,
        query_embedding: List[float],
        target_type: str,
        top_k: int = TOP_K_MATCHES,
    ) -> List[schemas.MatchResult]:
        """
        Find similar items by comparing embeddings.
        
        Args:
            query_embedding: Embedding of the query item
            target_type: Type of items to match against ("lost" or "found")
            top_k: Number of top matches to return
            
        Returns:
            List of match results with similarity scores
        """
        # Get all candidates with embeddings
        candidates = crud.get_items_with_embeddings(self.db, target_type)
        
        if not candidates:
            return []
        
        # Find top matches using cosine similarity
        matches = find_top_matches(query_embedding, candidates, top_k=top_k)
        
        # Convert to response format
        match_results = []
        for item_id, similarity in matches:
            item = crud.get_item_by_id(self.db, item_id)
            if item:
                item_response = crud.item_to_response(item)
                match_results.append(
                    schemas.MatchResult(item=item_response, similarity=similarity)
                )
        
        return match_results
    
    def get_matches_for_item(
        self,
        item_id: int,
        top_k: int = TOP_K_MATCHES,
    ) -> List[schemas.MatchResult]:
        """
        Get matches for an existing item.
        
        Args:
            item_id: ID of the item to find matches for
            top_k: Number of top matches to return
            
        Returns:
            List of match results with similarity scores
        """
        item = crud.get_item_by_id(self.db, item_id)
        if not item:
            return []
        
        # Determine target type (opposite of item's type)
        target_type = "found" if item.type == "lost" else "lost"  # type: ignore
        
        # Get embedding and compute matches
        embedding = item.get_embedding()
        return self.compute_matches(embedding, target_type, top_k)
