"""
Dubai AI Lost & Found - FastAPI Main Application

Production-ready backend with:
- API versioning (/api/v1/)
- Service layer architecture
- Proper error handling
- User-item relationships
"""

from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import (
    PROJECT_NAME,
    VERSION,
    DESCRIPTION,
    ALLOWED_ORIGINS,
    MEDIA_ROOT,
)
from app.database import init_db
from app.routers import items, auth, notifications
from app import ai_services  # Import to ensure models are loaded
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


# ===== Global Exception Handler =====

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for consistent error responses.
    """
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "detail": "An unexpected error occurred. Please try again later.",
        },
    )


# ===== CORS Middleware =====

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development/demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Static Files =====

# Mount media directory for serving images
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")


# ===== API v1 Routers =====

# Auth routes (no version prefix for compatibility)
app.include_router(auth.router)

# API v1 routes
app.include_router(items.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")

# Legacy routes (for backward compatibility with frontend)
app.include_router(items.router, prefix="/api", include_in_schema=False)
app.include_router(notifications.router, prefix="/api", include_in_schema=False)


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
            "api_v1": "/api/v1",
            "api_legacy": "/api",
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
    Clear all items from the database. Use for testing/demos only.
    """
    from app.database import SessionLocal, get_db
    from app.models import Item
    
    db = SessionLocal()
    try:
        count = db.query(Item).delete()
        db.commit()
        return {
            "success": True,
            "message": f"Database cleared successfully. Deleted {count} items.",
        }
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
