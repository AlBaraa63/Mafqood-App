"""
CRUD (Create, Read, Update, Delete) operations for database models.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_password_hash


def create_item(
    db: Session,
    *,
    item_type: str,
    data: schemas.ItemBase,
    image_path: str,
    embedding: List[float],
    user_id: Optional[int] = None,
) -> models.Item:
    """
    Create a new item in the database.
    
    Args:
        db: Database session
        item_type: Either "lost" or "found"
        data: Item data from request
        image_path: Relative path to the stored image
        embedding: Image embedding vector
        user_id: Optional ID of the user who reported the item
        
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
        user_id=user_id,
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


def get_items_by_type(
    db: Session,
    item_type: str,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
) -> List[models.Item]:
    """
    Retrieve all items of a specific type.
    
    Args:
        db: Database session
        item_type: Either "lost" or "found"
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        user_id: Optional user ID to filter by
        
    Returns:
        List of Item model instances
    """
    query = db.query(models.Item).filter(models.Item.type == item_type)
    
    if user_id is not None:
        query = query.filter(models.Item.user_id == user_id)
    
    return (
        query
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


# ===== User CRUD Operations =====

def create_user(db: Session, user_data: schemas.UserCreate) -> models.User:
    """
    Create a new user in the database.
    
    Args:
        db: Database session
        user_data: User registration data
        
    Returns:
        Created User model instance
    """
    hashed_password = get_password_hash(user_data.password)
    
    db_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """
    Retrieve a user by email address.
    
    Args:
        db: Database session
        email: User's email address
        
    Returns:
        User model instance or None if not found
    """
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """
    Retrieve a user by ID.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        User model instance or None if not found
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(db: Session, user: models.User, user_data: schemas.UserUpdate) -> models.User:
    """
    Update a user's profile.
    
    Args:
        db: Database session
        user: User model instance to update
        user_data: New user data
        
    Returns:
        Updated User model instance
    """
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    
    if user_data.phone is not None:
        user.phone = user_data.phone
    
    if user_data.password is not None:
        user.hashed_password = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(user)
    
    return user


def user_to_response(user: models.User) -> schemas.UserResponse:
    """
    Convert a database User model to a response schema.
    
    Args:
        user: User model instance
        
    Returns:
        UserResponse schema instance
    """
    return schemas.UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )
