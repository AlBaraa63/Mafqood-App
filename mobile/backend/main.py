"""
Mafqood Backend - Main Application
==================================

FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import MafqoodException
from app.api import (
    auth_router,
    items_router,
    matches_router,
    notifications_router,
    health_router,
)


# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(
        "Starting Mafqood API",
        environment=settings.app_env,
        version=settings.api_version,
    )
    
    # Initialize database
    if settings.is_development:
        await init_db()
        logger.info("Database tables created (development mode)")
    
    # Check AI services health
    try:
        from app.services.ai import ObjectDetector, FeatureExtractor
        
        detector = ObjectDetector()
        extractor = FeatureExtractor()
        
        ai_enabled = detector.model is not None and extractor.model is not None
        
        if ai_enabled:
            logger.info(
                "✅ AI services initialized successfully",
                yolo_model=settings.yolo_model_path,
                embedding_model=settings.embedding_model,
            )
        else:
            if detector.model is None:
                logger.warning("⚠️ Object detection disabled - YOLO model failed to load")
            if extractor.model is None:
                logger.warning("⚠️ Feature extraction disabled - Embedding model failed to load")
            logger.warning("AI matching will not be available - items will be created but not matched")
    except ImportError as e:
        logger.error(
            "❌ AI dependencies missing - matching disabled",
            error=str(e),
        )
    except Exception as e:
        logger.error(
            "❌ AI services initialization failed",
            error=str(e),
            error_type=type(e).__name__,
        )
    
    yield
    
    # Shutdown
    logger.info("Shutting down Mafqood API")
    await close_db()


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Lost & Found Platform API",
    version=settings.api_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan,
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(MafqoodException)
async def mafqood_exception_handler(
    request: Request,
    exc: MafqoodException,
) -> JSONResponse:
    """Handle custom Mafqood exceptions."""
    logger.warning(
        "Application error",
        error=exc.message,
        status_code=exc.status_code,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": list(error["loc"]),
            "msg": error["msg"],
            "type": error["type"],
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation error",
            "details": errors,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """Handle unexpected exceptions."""
    logger.exception(
        "Unhandled exception",
        error=str(exc),
        path=request.url.path,
    )
    
    if settings.debug:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": str(exc),
                "type": type(exc).__name__,
            },
        )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An unexpected error occurred",
        },
    )


# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(items_router)
app.include_router(matches_router)
app.include_router(notifications_router)

# Serve static files (uploaded images) - MUST be after routers
from fastapi.staticfiles import StaticFiles
from pathlib import Path

uploads_path = Path("./uploads")
uploads_path.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Admin/Dev endpoints (only in development)
if settings.is_development:
    from fastapi import Depends
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.core.database import get_db, Base, engine
    
    @app.delete("/api/reset", tags=["Admin"])
    async def reset_database(db: AsyncSession = Depends(get_db)):
        """Reset database (development only)."""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        
        logger.warning("Database reset")
        return {"message": "Database reset successfully"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
