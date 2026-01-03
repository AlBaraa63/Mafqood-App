"""
Similarity Matcher Service
==========================

Advanced matching algorithm combining visual and metadata similarity.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import math

import numpy as np

from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger(__name__)


@dataclass
class MatchCandidate:
    """A potential match candidate with scores."""
    item_id: str
    visual_similarity: float
    category_match: bool
    color_match: bool
    brand_match: bool
    location_distance_km: Optional[float]
    time_difference_hours: Optional[float]
    final_score: float
    confidence: str  # 'high', 'medium', 'low'
    features: Dict[str, Any]


class SimilarityMatcher:
    """
    Advanced similarity matching service.
    
    Combines multiple signals:
    - Visual similarity (CNN features)
    - Category matching
    - Color matching
    - Brand matching
    - Location proximity
    - Time proximity
    """
    
    # Scoring weights (Production-tuned for real-world matching)
    WEIGHTS = {
        "visual": 0.65,  # Visual similarity is most important - same item looks similar
        "category": 0.15,  # Category helps but AI can misclassify
        "color": 0.08,    # Color useful but lighting varies
        "brand": 0.02,    # Brand least important - often unknown
        "location": 0.07, # Location matters but people travel
        "time": 0.03,     # Time matters but items found weeks later
    }
    
    # Thresholds (Production-optimized to catch real matches)
    MIN_VISUAL_SIMILARITY = 0.10  # Very permissive - let weighted score decide
    MIN_FINAL_SCORE = 0.25  # Lower threshold catches more genuine matches
    MAX_LOCATION_DISTANCE_KM = 100  # Increased - people travel across cities
    MAX_TIME_DIFFERENCE_DAYS = 60  # Increased - items found weeks/months later
    
    # Confidence thresholds (Realistic for production)
    HIGH_CONFIDENCE = 0.70  # Lowered - was too strict
    MEDIUM_CONFIDENCE = 0.45
    
    def __init__(self):
        logger.info("SimilarityMatcher initialized", weights=self.WEIGHTS)
    
    def calculate_match_score(
        self,
        visual_similarity: float,
        source_item: Dict[str, Any],
        target_item: Dict[str, Any],
    ) -> MatchCandidate:
        """
        Calculate comprehensive match score between two items.
        
        Args:
            visual_similarity: Pre-computed visual similarity (0-1)
            source_item: Source item metadata
            target_item: Target item metadata
            
        Returns:
            MatchCandidate with all scores
        """
        scores = {}
        features = {}
        
        # Visual similarity
        scores["visual"] = visual_similarity
        features["visual_similarity"] = round(visual_similarity, 3)
        
        # Category match
        category_match = (
            source_item.get("category", "").lower() == 
            target_item.get("category", "").lower()
        )
        scores["category"] = 1.0 if category_match else 0.5
        features["category_match"] = category_match
        
        # Color match
        source_color = (source_item.get("color") or "").lower()
        target_color = (target_item.get("color") or "").lower()
        color_match = source_color == target_color if source_color and target_color else None
        
        if color_match is None:
            scores["color"] = 0.7  # Unknown, neutral score
        else:
            scores["color"] = 1.0 if color_match else 0.3
        features["color_match"] = color_match
        
        # Brand match
        source_brand = (source_item.get("brand") or "").lower()
        target_brand = (target_item.get("brand") or "").lower()
        brand_match = source_brand == target_brand if source_brand and target_brand else None
        
        if brand_match is None:
            scores["brand"] = 0.7
        else:
            scores["brand"] = 1.0 if brand_match else 0.3
        features["brand_match"] = brand_match
        
        # Location proximity
        location_distance = self._calculate_distance(
            source_item.get("latitude"),
            source_item.get("longitude"),
            target_item.get("latitude"),
            target_item.get("longitude"),
        )
        
        if location_distance is not None:
            # Score decreases with distance
            if location_distance <= 1:  # Within 1km
                scores["location"] = 1.0
            elif location_distance <= self.MAX_LOCATION_DISTANCE_KM:
                scores["location"] = max(0.3, 1.0 - (location_distance / self.MAX_LOCATION_DISTANCE_KM))
            else:
                scores["location"] = 0.1
            features["location_distance_km"] = round(location_distance, 2)
        else:
            # Check if location names match
            source_loc = (source_item.get("location") or "").lower()
            target_loc = (target_item.get("location") or "").lower()
            
            if source_loc and target_loc:
                if source_loc == target_loc:
                    scores["location"] = 1.0
                elif source_loc in target_loc or target_loc in source_loc:
                    scores["location"] = 0.8
                else:
                    scores["location"] = 0.5
            else:
                scores["location"] = 0.5
            features["location_distance_km"] = None
        
        features["location_nearby"] = scores["location"] >= 0.7
        
        # Time proximity
        time_diff = self._calculate_time_difference(
            source_item.get("date_time"),
            target_item.get("date_time"),
        )
        
        if time_diff is not None:
            if time_diff <= 24:  # Within 24 hours
                scores["time"] = 1.0
            elif time_diff <= self.MAX_TIME_DIFFERENCE_DAYS * 24:
                scores["time"] = max(0.3, 1.0 - (time_diff / (self.MAX_TIME_DIFFERENCE_DAYS * 24)))
            else:
                scores["time"] = 0.1
            features["time_proximity_hours"] = round(time_diff, 1)
        else:
            scores["time"] = 0.5
            features["time_proximity_hours"] = None
        
        # Calculate weighted final score
        final_score = sum(
            scores[key] * self.WEIGHTS[key]
            for key in self.WEIGHTS
        )
        
        # Determine confidence
        if final_score >= self.HIGH_CONFIDENCE:
            confidence = "high"
        elif final_score >= self.MEDIUM_CONFIDENCE:
            confidence = "medium"
        else:
            confidence = "low"
        
        return MatchCandidate(
            item_id=target_item.get("id", ""),
            visual_similarity=visual_similarity,
            category_match=category_match,
            color_match=color_match if color_match is not None else False,
            brand_match=brand_match if brand_match is not None else False,
            location_distance_km=features.get("location_distance_km"),
            time_difference_hours=features.get("time_proximity_hours"),
            final_score=round(final_score, 3),
            confidence=confidence,
            features=features,
        )
    
    def find_matches(
        self,
        source_embedding: np.ndarray,
        source_item: Dict[str, Any],
        candidates: List[Tuple[np.ndarray, Dict[str, Any]]],
        min_score: Optional[float] = None,
        max_results: int = 20,
    ) -> List[MatchCandidate]:
        """
        Find best matches from a list of candidates.
        
        Args:
            source_embedding: Source item's feature vector
            source_item: Source item metadata
            candidates: List of (embedding, metadata) tuples
            min_score: Minimum score threshold
            max_results: Maximum number of results
            
        Returns:
            List of MatchCandidate sorted by score
        """
        min_score = min_score or self.MIN_FINAL_SCORE
        
        matches = []
        
        for candidate_embedding, candidate_item in candidates:
            # Calculate visual similarity
            if source_embedding is not None and candidate_embedding is not None:
                visual_sim = float(np.dot(source_embedding, candidate_embedding))
                visual_sim = max(0.0, min(1.0, visual_sim))
            else:
                visual_sim = 0.0
            
            # Skip if visual similarity is too low
            if visual_sim < self.MIN_VISUAL_SIMILARITY:
                continue
            
            # Calculate full match score
            match = self.calculate_match_score(
                visual_similarity=visual_sim,
                source_item=source_item,
                target_item=candidate_item,
            )
            
            if match.final_score >= min_score:
                matches.append(match)
        
        # Sort by score descending
        matches.sort(key=lambda m: m.final_score, reverse=True)
        
        logger.debug(
            "Match search complete",
            num_candidates=len(candidates),
            num_matches=len(matches),
        )
        
        return matches[:max_results]
    
    def _calculate_distance(
        self,
        lat1: Optional[float],
        lon1: Optional[float],
        lat2: Optional[float],
        lon2: Optional[float],
    ) -> Optional[float]:
        """
        Calculate Haversine distance between two coordinates.
        
        Returns distance in kilometers, or None if coordinates are missing.
        """
        if None in (lat1, lon1, lat2, lon2):
            return None
        
        # Type guard - at this point all values are not None
        assert lat1 is not None and lon1 is not None
        assert lat2 is not None and lon2 is not None
        
        # Earth's radius in km
        R = 6371
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (
            math.sin(delta_lat / 2) ** 2 +
            math.cos(lat1_rad) * math.cos(lat2_rad) *
            math.sin(delta_lon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _calculate_time_difference(
        self,
        time1: Any,
        time2: Any,
    ) -> Optional[float]:
        """
        Calculate time difference in hours.
        
        Args:
            time1: First timestamp (datetime or ISO string)
            time2: Second timestamp
            
        Returns:
            Absolute time difference in hours, or None
        """
        try:
            if isinstance(time1, str):
                time1 = datetime.fromisoformat(time1.replace("Z", "+00:00"))
            if isinstance(time2, str):
                time2 = datetime.fromisoformat(time2.replace("Z", "+00:00"))
            
            if time1 is None or time2 is None:
                return None
            
            diff = abs((time1 - time2).total_seconds())
            return diff / 3600  # Convert to hours
            
        except Exception:
            return None
