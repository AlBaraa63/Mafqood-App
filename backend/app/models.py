"""
SQLAlchemy ORM models for Dubai AI Lost & Found.
"""

import json
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ItemType(str, enum.Enum):
    """Enum for item type."""
    LOST = "lost"
    FOUND = "found"


class User(Base):
    """
    Represents a user in the system.
    
    Attributes:
        id: Primary key
        email: User's email address (unique)
        hashed_password: Bcrypt hashed password
        full_name: User's full name
        phone: User's phone number (optional)
        is_active: Whether the user account is active
        is_verified: Whether the user's email is verified
        created_at: Timestamp of when the user registered
        updated_at: Timestamp of last profile update
        items: Relationship to user's reported items
    """
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to items
    items = relationship("Item", back_populates="user", lazy="dynamic")
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, full_name={self.full_name})>"


class Item(Base):
    """
    Represents a lost or found item in the database.
    
    Attributes:
        id: Primary key
        type: Either 'lost' or 'found'
        title: Short description of the item
        description: Optional detailed description
        location_type: Category of location (Mall, Taxi, Metro, etc.)
        location_detail: Specific place details (e.g., "Dubai Mall, Level 2")
        time_frame: When the item was lost/found (today, yesterday, etc.)
        image_path: Relative path to the stored image file
        embedding_json: JSON string of the image embedding vector
        user_id: Foreign key to the user who reported the item (optional)
        created_at: Timestamp of when the record was created
    """
    
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False, index=True)  # "lost" or "found"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location_type = Column(String, nullable=False)
    location_detail = Column(String, nullable=True)
    time_frame = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    embedding_json = Column(Text, nullable=False)  # Stored as JSON string
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship to user
    user = relationship("User", back_populates="items")
    
    def get_embedding(self) -> List[float]:
        """
        Deserialize the embedding from JSON string to list of floats.
        
        Returns:
            List of float values representing the image embedding.
        """
        return json.loads(self.embedding_json)
    
    def set_embedding(self, embedding: List[float]) -> None:
        """
        Serialize the embedding list to JSON string for storage.
        
        Args:
            embedding: List of float values representing the image embedding.
        """
        self.embedding_json = json.dumps(embedding)
    
    def __repr__(self) -> str:
        return f"<Item(id={self.id}, type={self.type}, title={self.title})>"
