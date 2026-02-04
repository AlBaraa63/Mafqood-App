"""
CRUD (Create, Read, Update, Delete) operations for database models.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app import models, schemas


def create_item(
    db: Session,
    *,
    item_type: str,
    data: schemas.ItemBase,
    image_path: str,
    embedding: List[float]
) -> models.Item:
    """
    Create a new item in the database.
    
    Args:
        db: Database session
        item_type: Either "lost" or "found"
        data: Item data from request
        image_path: Relative path to the stored image
        embedding: Image embedding vector
        
    Returns:
        Created Item model instance
    """
    db_item = models.Item(
        type=item_type,
        title=data.title,
        description=data.description,
        location_type=data.location_type,
        location_detail=data.location_detail,
        time_frame=data.time_frame,
        image_path=image_path,
    )
    
    # Set embedding using the helper method
    db_item.set_embedding(embedding)
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item


def get_item_by_id(db: Session, item_id: int) -> Optional[models.Item]:
    """
    Retrieve a single item by ID.
    
    Args:
        db: Database session
        item_id: ID of the item to retrieve
        
    Returns:
        Item model instance or None if not found
    """
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_items_by_type(db: Session, item_type: str, skip: int = 0, limit: int = 100) -> List[models.Item]:
    """
    Retrieve all items of a specific type.
    
    Args:
        db: Database session
        item_type: Either "lost" or "found"
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Item model instances
    """
    return (
        db.query(models.Item)
        .filter(models.Item.type == item_type)
        .order_by(models.Item.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_items(db: Session, skip: int = 0, limit: int = 1000) -> List[models.Item]:
    """
    Retrieve all items from the database.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of all Item model instances
    """
    return (
        db.query(models.Item)
        .order_by(models.Item.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_items_with_embeddings(db: Session, item_type: str) -> List[tuple[int, List[float]]]:
    """
    Retrieve all items of a specific type with their embeddings.
    Useful for similarity matching.
    
    Args:
        db: Database session
        item_type: Either "lost" or "found"
        
    Returns:
        List of (item_id, embedding) tuples
    """
    items = get_items_by_type(db, item_type, limit=10000)
    return [(item.id, item.get_embedding()) for item in items]


def item_to_response(item: models.Item, base_url: str = "") -> schemas.ItemInDBBase:
    """
    Convert a database Item model to a response schema.
    
    Args:
        item: Item model instance
        base_url: Base URL for constructing image URLs (optional)
        
    Returns:
        ItemInDBBase schema instance
    """
    # Construct image URL
    # image_path is stored as "lost/filename.jpg" or "found\filename.jpg"
    # We need to extract just the filename and construct: /media/lost/filename.jpg
    from pathlib import Path
    filename = Path(item.image_path).name
    image_url = f"/media/{item.type}/{filename}"
    
    return schemas.ItemInDBBase(
        id=item.id,
        type=item.type,
        title=item.title,
        description=item.description,
        location_type=item.location_type,
        location_detail=item.location_detail,
        time_frame=item.time_frame,
        image_url=image_url,
        created_at=item.created_at,
    )


def delete_item(db: Session, item_id: int) -> bool:
    """
    Delete an item from the database.
    
    Args:
        db: Database session
        item_id: ID of the item to delete
        
    Returns:
        True if item was deleted, False if not found
    """
    item = get_item_by_id(db, item_id)
    if item is None:
        return False
    
    db.delete(item)
    db.commit()
    return True
