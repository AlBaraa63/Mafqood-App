# Mafqood Backend

AI-Powered Lost & Found Platform Backend

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)

### Development Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start with Docker Compose**
   ```bash
   # Start core services (DB, Redis, API)
   docker-compose up -d

   # With monitoring tools
   docker-compose --profile monitoring up -d

   # With dev tools (pgAdmin)
   docker-compose --profile dev-tools up -d
   ```

4. **Access the API**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

### Local Development (without Docker)

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   .\venv\Scripts\activate   # Windows
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker
   docker-compose up -d db redis
   ```

4. **Run migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start the API**
   ```bash
   uvicorn main:app --reload
   ```

6. **Start Celery worker** (separate terminal)
   ```bash
   celery -A app.tasks.celery_app worker --loglevel=info
   ```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry
├── requirements.txt        # Python dependencies
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Service orchestration
├── .env.example           # Environment template
├── alembic.ini           # Migrations config
├── app/
│   ├── api/              # API routes
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── items.py      # Lost/Found item endpoints
│   │   ├── matches.py    # Match endpoints
│   │   └── notifications.py
│   ├── core/             # Core utilities
│   │   ├── config.py     # Settings management
│   │   ├── database.py   # DB connection
│   │   ├── security.py   # JWT, hashing
│   │   └── exceptions.py
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   ├── item.py
│   │   ├── match.py
│   │   └── notification.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   ├── item.py
│   │   └── match.py
│   ├── services/         # Business logic
│   │   ├── storage.py    # S3/local storage
│   │   └── ai/           # AI/CV pipeline
│   │       ├── image_processor.py
│   │       ├── object_detector.py
│   │       ├── feature_extractor.py
│   │       └── similarity_matcher.py
│   └── tasks/            # Celery tasks
│       ├── image_processing.py
│       ├── matching.py
│       └── notifications.py
├── nginx/                # Nginx config
├── scripts/              # Utility scripts
└── tests/                # Test suite
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - Logout
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile

### Items
- `POST /api/v1/lost` - Report lost item
- `POST /api/v1/found` - Report found item
- `GET /api/v1/history` - Get user's items
- `GET /api/v1/items/{id}` - Get item details
- `GET /api/v1/items/{id}/matches` - Get item matches
- `PUT /api/v1/items/{id}` - Update item
- `DELETE /api/v1/items/{id}` - Delete item

### Matches
- `GET /api/v1/matches` - List user's matches
- `GET /api/v1/matches/{id}` - Get match details
- `POST /api/v1/matches/{id}/confirm` - Confirm match

### Notifications
- `GET /api/v1/notifications` - List notifications
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

## AI/CV Pipeline

The matching system uses:
1. **YOLOv8** - Object detection and classification
2. **ResNet50** - Feature extraction (512-dim embeddings)
3. **Multi-signal matching** - Combines visual, category, color, location, and time

### Matching Score Weights
- Visual Similarity: 50%
- Category Match: 15%
- Location Proximity: 15%
- Color Match: 10%
- Time Proximity: 5%
- Brand Match: 5%

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET_KEY` - JWT signing key
- `S3_BUCKET_NAME` - AWS S3 bucket (optional)

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_auth.py -v
```

## Deployment

### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `DEBUG=false`
- [ ] Generate strong `JWT_SECRET_KEY`
- [ ] Configure S3 for storage
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backup strategy

### Docker Production

```bash
docker-compose --profile production up -d
```

## License

Private - All rights reserved
