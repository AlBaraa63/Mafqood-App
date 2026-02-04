"""
Dubai AI Lost & Found - FastAPI Main Application
"""

from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import (
    PROJECT_NAME,
    VERSION,
    DESCRIPTION,
    ALLOWED_ORIGINS,
    MEDIA_ROOT,
)
from app.database import init_db
from app.routers import items
from app import schemas


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Dubai AI Lost & Found API...")
    init_db()
    print("✅ Application ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description=DESCRIPTION,
    lifespan=lifespan,
)


# ===== CORS Middleware =====

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Static Files =====

# Mount media directory for serving images
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")


# ===== Routers =====

app.include_router(items.router)


# ===== Root Endpoints =====

@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": PROJECT_NAME,
        "version": VERSION,
        "description": DESCRIPTION,
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "api": "/api",
        },
    }


@app.get("/health", response_model=schemas.HealthResponse, tags=["health"])
async def health_check() -> schemas.HealthResponse:
    """
    Health check endpoint.
    """
    return schemas.HealthResponse(
        status="ok",
        version=VERSION,
        timestamp=datetime.utcnow(),
    )


@app.delete("/api/reset", tags=["admin"])
async def reset_database():
    """
    Clear all items from the database. Use for testing/demos.
    """
    from app.database import SessionLocal
    from app.models import Item
    
    db = SessionLocal()
    try:
        count = db.query(Item).delete()
        db.commit()
        return {"message": f"Database cleared successfully. Deleted {count} items."}
    finally:
        db.close()


# ===== Main Entry Point =====

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
