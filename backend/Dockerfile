# Mafqood Backend
# Multi-stage build for optimized image size

# ============================================
# Stage 1: Builder
# ============================================
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# ============================================
# Stage 2: Runtime (API)
# ============================================
FROM python:3.11-slim as runtime

WORKDIR /app

# Create non-root user
RUN groupadd -r mafqood && useradd -r -g mafqood mafqood

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels and install
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy application code
COPY . .

# Download YOLO model
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')" || true

# Set ownership
RUN chown -R mafqood:mafqood /app

# Switch to non-root user
USER mafqood

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Default command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


# ============================================
# Stage 3: Celery Worker
# ============================================
FROM runtime as celery-worker

# Override command for Celery worker
CMD ["celery", "-A", "app.tasks.celery_app", "worker", "--loglevel=info", "-Q", "ai,notifications"]


# ============================================
# Stage 4: Celery Beat (Scheduler)
# ============================================
FROM runtime as celery-beat

# Override command for Celery beat
CMD ["celery", "-A", "app.tasks.celery_app", "beat", "--loglevel=info"]
