# Mafqood Backend Architecture Plan
## AI-Powered Lost & Found Platform

---

## 📋 Executive Summary

Mafqood is a lost and found application that uses AI/Computer Vision to automatically match lost items with found items. The backend will handle user authentication, item management, AI-powered image matching, real-time notifications, and provide a robust RESTful API for the React Native mobile app.

**Key Features:**
- AI/CV-powered image matching using YOLO and feature extraction
- Real-time match notifications
- Secure authentication and authorization
- Scalable cloud storage for images
- Geolocation-based filtering
- Multi-language support (English/Arabic)

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Mobile Client  │
│  (React Native) │
└────────┬────────┘
         │ HTTPS/WSS
         ▼
┌─────────────────┐
│   Load Balancer │
│   (Nginx/ALB)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      API Gateway/Backend        │
│      (FastAPI/Node.js)          │
├─────────────────────────────────┤
│  - REST API Endpoints           │
│  - WebSocket Server             │
│  - Authentication               │
│  - Request Validation           │
│  - Rate Limiting                │
└──┬──────┬───────┬──────────┬───┘
   │      │       │          │
   ▼      ▼       ▼          ▼
┌─────┐ ┌────┐ ┌─────┐  ┌────────┐
│ DB  │ │Cache│ │Queue│  │ Storage│
│     │ │Redis│ │     │  │ S3/CDN │
└─────┘ └────┘ └─────┘  └────────┘
   │                         │
   └──────────┬──────────────┘
              ▼
      ┌──────────────┐
      │  AI/CV       │
      │  Pipeline    │
      │  (Workers)   │
      └──────────────┘
```

---

## 🛠️ Technology Stack

### Backend Framework
**Primary Choice: FastAPI (Python)**

**Rationale:**
- Native integration with AI/ML libraries (PyTorch, TensorFlow, OpenCV)
- High performance (comparable to Node.js)
- Automatic API documentation (Swagger/OpenAPI)
- Type safety with Pydantic
- Async support for concurrent requests
- You already have YOLOv8 model (yolov8n.pt)

**Alternative: Node.js + TypeScript** (if team prefers JavaScript ecosystem)

### Database
**Primary: PostgreSQL** (Relational + JSON support)
- ACID compliance for transactions
- PostGIS extension for geolocation queries
- JSON/JSONB for flexible metadata
- Full-text search capabilities
- Proven scalability

**Cache: Redis**
- Session storage
- Real-time match results caching
- Rate limiting
- Pub/Sub for notifications

**Search: Elasticsearch** (Optional, for advanced search)
- Full-text search across items
- Fuzzy matching
- Multi-language support

### AI/CV Stack
- **YOLOv8**: Object detection and classification
- **PyTorch**: Deep learning framework
- **OpenCV**: Image preprocessing
- **CLIP** or **ResNet**: Feature extraction for similarity
- **FAISS**: Vector similarity search
- **Celery**: Async task queue for image processing

### Storage
- **Primary: AWS S3** / Azure Blob Storage / MinIO (self-hosted)
- **CDN: CloudFront** / Cloudflare
- Image compression: Pillow/Sharp
- Thumbnail generation

### Authentication
- **JWT (JSON Web Tokens)** with refresh tokens
- **OAuth 2.0** for social login (future)
- **bcrypt** for password hashing

### Real-time
- **WebSocket** (Socket.IO or native WebSocket)
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production) / Docker Swarm
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
- **APM**: New Relic / Datadog / Sentry

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(512),
    is_venue BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(5) DEFAULT 'en', -- en, ar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

### Items Table
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed', 'claimed')),
    
    -- Item Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- phone, wallet, bag, id, jewelry, electronics, keys, documents, other
    brand VARCHAR(100),
    color VARCHAR(50),
    
    -- Image Data
    image_url VARCHAR(512) NOT NULL,
    thumbnail_url VARCHAR(512),
    image_hash VARCHAR(64), -- perceptual hash for duplicate detection
    
    -- Location & Time
    location VARCHAR(255) NOT NULL, -- e.g., "Dubai Mall"
    location_detail TEXT, -- e.g., "Near the fountain, 2nd floor"
    location_type VARCHAR(50), -- mall, metro, airport, park, restaurant, hotel, other
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL, -- when item was lost/found
    
    -- Contact Information
    contact_method VARCHAR(20) NOT NULL CHECK (contact_method IN ('phone', 'email', 'in_app')),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- AI/CV Data
    embedding VECTOR(512), -- Feature vector for similarity search (pgvector extension)
    detected_objects JSONB, -- YOLO detection results: [{class: 'phone', confidence: 0.95, bbox: [x,y,w,h]}]
    
    -- Metadata
    view_count INTEGER DEFAULT 0,
    match_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0, -- for moderation
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_contact CHECK (
        (contact_method = 'phone' AND contact_phone IS NOT NULL) OR
        (contact_method = 'email' AND contact_email IS NOT NULL) OR
        (contact_method = 'in_app')
    )
);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_date_time ON items(date_time DESC);
CREATE INDEX idx_items_location ON items(location);
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Geospatial index for location-based queries
CREATE INDEX idx_items_location_geo ON items USING GIST (
    ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Vector similarity index (requires pgvector extension)
CREATE INDEX idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Matches Table
```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    matched_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    similarity_score FLOAT NOT NULL, -- 0.0 to 1.0
    confidence VARCHAR(10) CHECK (confidence IN ('high', 'medium', 'low')),
    
    -- Match details
    matching_features JSONB, -- {visual_similarity: 0.85, category_match: true, color_match: true}
    
    -- User interaction
    user_item_owner_viewed BOOLEAN DEFAULT FALSE,
    matched_item_owner_viewed BOOLEAN DEFAULT FALSE,
    user_item_owner_confirmed BOOLEAN DEFAULT NULL, -- NULL = not reviewed, TRUE = confirmed, FALSE = rejected
    matched_item_owner_confirmed BOOLEAN DEFAULT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'claimed', 'rejected', 'expired')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_item_id, matched_item_id)
);

CREATE INDEX idx_matches_user_item_id ON matches(user_item_id);
CREATE INDEX idx_matches_matched_item_id ON matches(matched_item_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('match', 'message', 'update', 'system', 'claim')),
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Push notification
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Device information
    device_info JSONB, -- {device_type: 'ios', device_name: 'iPhone 13', app_version: '1.0.0'}
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### Audit Log Table (Optional but recommended)
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- login, logout, create_item, update_item, delete_item, etc.
    entity_type VARCHAR(50), -- user, item, match, etc.
    entity_id UUID,
    
    ip_address INET,
    user_agent TEXT,
    request_data JSONB,
    response_status INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### PostgreSQL Extensions Required
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "earthdistance";  -- Geolocation calculations
CREATE EXTENSION IF NOT EXISTS "cube";           -- Required for earthdistance
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector for embeddings
```

---

## 🔌 API Endpoints

### Base URL
```
Development: http://localhost:8001
Production: https://api.mafqood.ae
```

### Authentication Endpoints

#### POST /auth/register
Register a new user
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "Ahmad Ali",
  "phone": "+971501234567",
  "is_venue": false
}

Response (201):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Ahmad Ali",
    "phone": "+971501234567",
    "avatar_url": null,
    "is_venue": false,
    "created_at": "2026-01-03T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/login
Authenticate user
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/refresh
Refresh access token
```json
Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/logout
Logout and revoke refresh token
```json
Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "message": "Logged out successfully"
}
```

#### POST /auth/forgot-password
Request password reset
```json
Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Password reset email sent"
}
```

### User Endpoints

#### GET /auth/users/me
Get current user profile (requires auth)
```json
Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Ahmad Ali",
  "phone": "+971501234567",
  "avatar_url": "https://cdn.mafqood.ae/avatars/uuid.jpg",
  "is_venue": false,
  "created_at": "2026-01-03T10:00:00Z"
}
```

#### PUT /auth/users/me
Update user profile (requires auth)
```json
Request:
{
  "full_name": "Ahmad Ali Updated",
  "phone": "+971509999999",
  "preferred_language": "ar"
}

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Ahmad Ali Updated",
  "phone": "+971509999999",
  "avatar_url": "https://cdn.mafqood.ae/avatars/uuid.jpg",
  "is_venue": false,
  "created_at": "2026-01-03T10:00:00Z"
}
```

### Item Endpoints

#### POST /api/v1/lost
Submit a lost item (requires auth)
```json
Request (multipart/form-data):
{
  "image": <File>,
  "title": "iPhone 14 Pro",
  "description": "Black iPhone with cracked screen",
  "category": "phone",
  "brand": "Apple",
  "color": "black",
  "location": "Dubai Mall",
  "location_detail": "Near Starbucks on ground floor",
  "location_type": "mall",
  "latitude": 25.1972,
  "longitude": 55.2744,
  "date_time": "2026-01-03T14:30:00Z",
  "contact_method": "in_app"
}

Response (201):
{
  "item": {
    "id": "uuid",
    "type": "lost",
    "status": "open",
    "title": "iPhone 14 Pro",
    "description": "Black iPhone with cracked screen",
    "category": "phone",
    "brand": "Apple",
    "color": "black",
    "image_url": "https://cdn.mafqood.ae/items/uuid.jpg",
    "thumbnail_url": "https://cdn.mafqood.ae/items/uuid_thumb.jpg",
    "location": "Dubai Mall",
    "location_detail": "Near Starbucks on ground floor",
    "date_time": "2026-01-03T14:30:00Z",
    "contact_method": "in_app",
    "created_at": "2026-01-03T15:00:00Z"
  },
  "matches": [
    {
      "id": "match-uuid",
      "matched_item": { ... },
      "similarity": 0.87,
      "confidence": "high"
    }
  ],
  "match_count": 3
}
```

#### POST /api/v1/found
Submit a found item (requires auth)
```json
Request (multipart/form-data):
{
  "image": <File>,
  "title": "Black iPhone found",
  "description": "Found at Dubai Mall",
  "category": "phone",
  "brand": "Apple",
  "color": "black",
  "location": "Dubai Mall",
  "location_detail": "Near fountain entrance",
  "location_type": "mall",
  "latitude": 25.1972,
  "longitude": 55.2744,
  "date_time": "2026-01-03T15:00:00Z",
  "contact_method": "phone",
  "contact_phone": "+971501234567"
}

Response (201):
{
  "item": { ... },
  "matches": [ ... ],
  "match_count": 2
}
```

#### GET /api/v1/history
Get user's lost and found items with matches (requires auth)
```json
Query Parameters:
- page: integer (default: 1)
- page_size: integer (default: 20)
- status: string (optional: 'open', 'matched', 'closed')

Response (200):
{
  "lost_items": [
    {
      "item": { ... },
      "matches": [ ... ]
    }
  ],
  "found_items": [
    {
      "item": { ... },
      "matches": [ ... ]
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 45,
    "has_more": true
  }
}
```

#### GET /api/v1/items/{item_id}
Get item details (requires auth)
```json
Response (200):
{
  "id": "uuid",
  "type": "lost",
  "status": "open",
  "title": "iPhone 14 Pro",
  "description": "Black iPhone with cracked screen",
  "category": "phone",
  "brand": "Apple",
  "color": "black",
  "image_url": "https://cdn.mafqood.ae/items/uuid.jpg",
  "thumbnail_url": "https://cdn.mafqood.ae/items/uuid_thumb.jpg",
  "location": "Dubai Mall",
  "location_detail": "Near Starbucks on ground floor",
  "date_time": "2026-01-03T14:30:00Z",
  "contact_method": "in_app",
  "view_count": 12,
  "match_count": 3,
  "created_at": "2026-01-03T15:00:00Z",
  "owner": {
    "id": "user-uuid",
    "full_name": "Ahmad Ali",
    "avatar_url": "..."
  }
}
```

#### GET /api/v1/items/{item_id}/matches
Get matches for a specific item (requires auth, must be owner)
```json
Query Parameters:
- min_similarity: float (default: 0.6, range: 0.0-1.0)
- confidence: string (optional: 'high', 'medium', 'low')

Response (200):
{
  "matches": [
    {
      "id": "match-uuid",
      "matched_item": {
        "id": "item-uuid",
        "type": "found",
        "title": "Black iPhone found",
        "image_url": "...",
        "thumbnail_url": "...",
        "location": "Dubai Mall",
        "date_time": "2026-01-03T15:00:00Z"
      },
      "similarity": 0.87,
      "confidence": "high",
      "matching_features": {
        "visual_similarity": 0.87,
        "category_match": true,
        "color_match": true,
        "location_nearby": true,
        "time_proximity": "1 hour"
      },
      "status": "pending",
      "created_at": "2026-01-03T15:01:00Z"
    }
  ],
  "total": 3
}
```

#### DELETE /api/v1/items/{item_id}
Delete an item (requires auth, must be owner)
```json
Response (200):
{
  "message": "Item deleted successfully"
}
```

#### PUT /api/v1/items/{item_id}/status
Update item status (requires auth, must be owner)
```json
Request:
{
  "status": "closed"
}

Response (200):
{
  "id": "uuid",
  "status": "closed",
  "updated_at": "2026-01-03T16:00:00Z"
}
```

### Match Endpoints

#### POST /api/v1/matches/{match_id}/confirm
Confirm or reject a match (requires auth)
```json
Request:
{
  "confirmed": true,
  "notes": "This looks like my item!"
}

Response (200):
{
  "match": {
    "id": "match-uuid",
    "status": "contacted",
    "user_item_owner_confirmed": true,
    "updated_at": "2026-01-03T16:00:00Z"
  }
}
```

### Notification Endpoints

#### GET /api/v1/notifications
Get user notifications (requires auth)
```json
Query Parameters:
- page: integer (default: 1)
- page_size: integer (default: 20)
- unread_only: boolean (default: false)

Response (200):
{
  "notifications": [
    {
      "id": "notif-uuid",
      "type": "match",
      "title": "New Match Found!",
      "message": "We found 1 potential match for your lost iPhone",
      "item_id": "item-uuid",
      "match_id": "match-uuid",
      "is_read": false,
      "created_at": "2026-01-03T15:01:00Z"
    }
  ],
  "unread_count": 3,
  "total": 12,
  "has_more": false
}
```

#### PUT /api/v1/notifications/{notification_id}/read
Mark notification as read (requires auth)
```json
Response (200):
{
  "id": "notif-uuid",
  "is_read": true,
  "read_at": "2026-01-03T16:00:00Z"
}
```

#### PUT /api/v1/notifications/read-all
Mark all notifications as read (requires auth)
```json
Response (200):
{
  "message": "All notifications marked as read",
  "count": 3
}
```

### Upload Endpoints

#### POST /api/v1/upload/image
Upload image separately (optional, for avatar uploads)
```json
Request (multipart/form-data):
{
  "image": <File>,
  "type": "avatar" | "item"
}

Response (201):
{
  "url": "https://cdn.mafqood.ae/uploads/uuid.jpg",
  "thumbnail_url": "https://cdn.mafqood.ae/uploads/uuid_thumb.jpg"
}
```

### Health & Admin Endpoints

#### GET /health
Health check endpoint (public)
```json
Response (200):
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-03T16:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "s3": "healthy",
    "ai_worker": "healthy"
  }
}
```

#### DELETE /api/reset
Reset database (dev/test only, requires admin auth)
```json
Response (200):
{
  "message": "Database reset successfully"
}
```

---

## 🤖 AI/CV Pipeline Architecture

### Image Processing Workflow

```
┌──────────────┐
│ User Uploads │
│    Image     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Image Validation│
│  - Format check  │
│  - Size check    │
│  - NSFW filter   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Image Processing │
│  - Resize        │
│  - Compress      │
│  - Generate      │
│    thumbnails    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Upload to S3   │
│   + Generate CDN │
│      URLs        │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│  Queue AI Processing │
│   (Async - Celery)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  AI Worker Process   │
│  1. YOLO Detection   │
│  2. Feature Extract  │
│  3. Generate Embed   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Similarity Search   │
│  - Vector search     │
│  - FAISS index       │
│  - Filter by meta    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Create Matches     │
│   - Store in DB      │
│   - Send notifs      │
└──────────────────────┘
```

### AI/CV Components

#### 1. Object Detection (YOLOv8)
```python
# Pseudo-code
def detect_objects(image_path):
    model = YOLO('yolov8n.pt')
    results = model(image_path)
    
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            detections.append({
                'class': model.names[int(box.cls)],
                'confidence': float(box.conf),
                'bbox': box.xyxy[0].tolist()
            })
    
    return detections
```

**Use Cases:**
- Identify item type automatically
- Verify category selected by user
- Extract additional metadata (brand logos, text)

#### 2. Feature Extraction & Embedding
```python
# Using ResNet or CLIP
def extract_features(image_path):
    model = torchvision.models.resnet50(pretrained=True)
    model.eval()
    
    # Preprocess image
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])
    
    img = Image.open(image_path)
    img_tensor = transform(img).unsqueeze(0)
    
    # Extract features
    with torch.no_grad():
        features = model(img_tensor)
    
    # Convert to 512-dim vector
    embedding = features.squeeze().numpy()[:512]
    
    return embedding
```

#### 3. Similarity Search (FAISS + PostgreSQL)
```python
def find_similar_items(embedding, item_type, category, location, date_time):
    # Option 1: PostgreSQL pgvector (simpler, integrated)
    query = """
        SELECT 
            id, 
            title, 
            image_url,
            1 - (embedding <=> %s) AS similarity
        FROM items
        WHERE type = %s
          AND category = %s
          AND status = 'open'
          AND date_time BETWEEN %s AND %s
          AND earth_distance(
              ll_to_earth(latitude, longitude),
              ll_to_earth(%s, %s)
          ) < 10000  -- Within 10km
        ORDER BY embedding <=> %s
        LIMIT 20
    """
    
    # Option 2: FAISS (faster for large datasets)
    # Build FAISS index periodically
    index = faiss.IndexFlatIP(512)  # Inner product for cosine similarity
    index.add(all_embeddings)
    
    D, I = index.search(embedding.reshape(1, -1), k=50)
    
    # Then filter by metadata (type, category, location, date)
    matches = filter_by_metadata(I, item_type, category, location, date_time)
    
    return matches
```

#### 4. Matching Algorithm
```python
def calculate_match_score(item1, item2):
    # Visual similarity (most important)
    visual_score = cosine_similarity(item1.embedding, item2.embedding)
    
    # Category match
    category_score = 1.0 if item1.category == item2.category else 0.5
    
    # Color match
    color_score = 1.0 if item1.color == item2.color else 0.7
    
    # Location proximity
    distance = haversine_distance(
        (item1.latitude, item1.longitude),
        (item2.latitude, item2.longitude)
    )
    location_score = max(0, 1.0 - (distance / 10000))  # Max 10km
    
    # Time proximity (within 7 days)
    time_diff = abs((item1.date_time - item2.date_time).total_seconds())
    time_score = max(0, 1.0 - (time_diff / (7 * 86400)))
    
    # Weighted combination
    final_score = (
        visual_score * 0.50 +
        category_score * 0.20 +
        color_score * 0.10 +
        location_score * 0.15 +
        time_score * 0.05
    )
    
    # Determine confidence
    if final_score >= 0.80:
        confidence = 'high'
    elif final_score >= 0.60:
        confidence = 'medium'
    else:
        confidence = 'low'
    
    return final_score, confidence
```

### AI Worker Architecture (Celery)

```python
# celery_tasks.py
from celery import Celery

celery = Celery('mafqood', broker='redis://localhost:6379/0')

@celery.task
def process_image_and_find_matches(item_id):
    """
    Async task to process image and find matches
    """
    # 1. Load item from database
    item = db.get_item(item_id)
    
    # 2. Download image from S3
    image_path = download_image(item.image_url)
    
    # 3. Run YOLO detection
    detections = detect_objects(image_path)
    item.detected_objects = detections
    
    # 4. Extract features
    embedding = extract_features(image_path)
    item.embedding = embedding
    
    # 5. Save to database
    db.update_item(item)
    
    # 6. Find similar items
    opposite_type = 'found' if item.type == 'lost' else 'lost'
    similar_items = find_similar_items(
        embedding=embedding,
        item_type=opposite_type,
        category=item.category,
        location=item.location,
        date_time=item.date_time
    )
    
    # 7. Create matches
    matches = []
    for similar_item in similar_items:
        score, confidence = calculate_match_score(item, similar_item)
        
        if score >= 0.50:  # Minimum threshold
            match = db.create_match(
                user_item_id=item.id,
                matched_item_id=similar_item.id,
                similarity_score=score,
                confidence=confidence
            )
            matches.append(match)
    
    # 8. Send notifications
    if matches:
        notify_user_of_matches(item.user_id, item, matches)
    
    return {
        'item_id': item_id,
        'matches_found': len(matches)
    }
```

### Performance Considerations

**Image Processing:**
- Max upload size: 10MB
- Supported formats: JPEG, PNG, WebP
- Resize to max 1920x1080 for storage
- Generate thumbnails: 200x200, 400x400
- Use WebP for compression

**AI Processing Time:**
- YOLO inference: ~50-100ms per image
- Feature extraction: ~100-200ms per image
- Similarity search: ~10-50ms (with proper indexing)
- Total processing: < 1 second per image

**Scalability:**
- Use Celery workers (horizontal scaling)
- Batch processing for embeddings
- Periodic FAISS index rebuilding
- Cache frequent queries in Redis

---

## 🔐 Authentication & Authorization

### JWT Token Structure

**Access Token (short-lived: 1 hour)**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "is_venue": false,
  "exp": 1704294000,
  "iat": 1704290400,
  "type": "access"
}
```

**Refresh Token (long-lived: 30 days)**
```json
{
  "user_id": "uuid",
  "token_id": "refresh-token-uuid",
  "exp": 1706882400,
  "iat": 1704290400,
  "type": "refresh"
}
```

### Security Measures

1. **Password Requirements:**
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number
   - bcrypt hashing with cost factor 12

2. **Rate Limiting:**
   - Login: 5 attempts per 15 minutes per IP
   - Registration: 3 attempts per hour per IP
   - API calls: 100 requests per minute per user
   - Image upload: 10 uploads per hour per user

3. **Token Security:**
   - Access tokens in memory only (not localStorage)
   - Refresh tokens stored securely (httpOnly cookies or secure storage)
   - Token rotation on refresh
   - Automatic revocation on logout

4. **API Security:**
   - HTTPS only (TLS 1.3)
   - CORS configuration
   - Request validation (Pydantic schemas)
   - SQL injection prevention (parameterized queries)
   - XSS protection (input sanitization)

5. **Data Privacy:**
   - Contact information only visible to matched users
   - Personal data encryption at rest
   - GDPR compliance (data export, deletion)
   - Audit logging for sensitive operations

---

## 📦 File Storage & CDN Strategy

### Storage Architecture

```
┌──────────────┐
│  S3 Bucket   │
│  (mafqood)   │
├──────────────┤
│ /items/      │ ← Item images
│ /thumbnails/ │ ← Thumbnails (200x200, 400x400)
│ /avatars/    │ ← User avatars
│ /temp/       │ ← Temporary uploads (auto-delete after 24h)
└──────────────┘
       │
       ▼
┌──────────────┐
│  CloudFront  │
│     CDN      │
│ (cached edge)│
└──────────────┘
```

### File Organization

```
s3://mafqood-app/
├── items/
│   ├── {uuid}.jpg          # Original image (max 1920x1080)
│   ├── {uuid}_thumb.jpg    # Thumbnail (400x400)
│   └── {uuid}_small.jpg    # Small thumbnail (200x200)
├── avatars/
│   ├── {user_uuid}.jpg
│   └── {user_uuid}_thumb.jpg
└── temp/
    └── {upload_uuid}.jpg   # Deleted after 24h or after processing
```

### Upload Flow

1. Client uploads image via multipart/form-data
2. Backend validates (format, size, content)
3. Generate UUID for filename
4. Upload to S3 temp folder
5. Queue image processing (resize, thumbnail, compression)
6. Move to permanent location
7. Update database with final URLs
8. Queue AI processing

### CDN Configuration

- **Cache TTL:** 1 year for immutable files
- **Invalidation:** On item deletion only
- **Compression:** Gzip/Brotli enabled
- **Image optimization:** CloudFront automatic image optimization
- **Signed URLs:** For private content (future feature)

---

## 🔔 Real-time Features & Notifications

### WebSocket Architecture

```python
# WebSocket server (FastAPI + WebSockets)
from fastapi import WebSocket

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    # Store connection
    connection_manager.connect(user_id, websocket)
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            
            # Handle ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect(user_id)
```

### Real-time Events

1. **New Match Notification**
   ```json
   {
     "type": "new_match",
     "match": {
       "id": "match-uuid",
       "item_id": "item-uuid",
       "similarity": 0.87,
       "confidence": "high"
     }
   }
   ```

2. **Match Confirmation**
   ```json
   {
     "type": "match_confirmed",
     "match_id": "match-uuid",
     "other_user": {
       "name": "Ahmad Ali",
       "contact": "+971501234567"
     }
   }
   ```

3. **Item Status Update**
   ```json
   {
     "type": "item_status",
     "item_id": "item-uuid",
     "status": "closed"
   }
   ```

### Push Notifications (Firebase Cloud Messaging)

```python
def send_push_notification(user_id, title, body, data):
    # Get user's FCM token
    fcm_token = db.get_user_fcm_token(user_id)
    
    if not fcm_token:
        return
    
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data=data,
        token=fcm_token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                sound='default',
                channel_id='matches'
            )
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound='default',
                    badge=1
                )
            )
        )
    )
    
    response = messaging.send(message)
    return response
```

---

## 🚀 Deployment & Infrastructure

### Docker Setup

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # Main API
  api:
    build: ./backend
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mafqood
      - REDIS_URL=redis://redis:6379/0
      - S3_BUCKET=mafqood-app
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  # Celery Worker (AI Processing)
  worker:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mafqood
      - REDIS_URL=redis://redis:6379/0
      - S3_BUCKET=mafqood-app
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
    command: celery -A celery_tasks worker --loglevel=info

  # PostgreSQL
  db:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_USER=mafqood
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=mafqood
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Nginx (Reverse Proxy)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

### Production Infrastructure (AWS)

```
┌─────────────────────────────────────┐
│         Route 53 (DNS)              │
│      api.mafqood.ae                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   CloudFront (CDN + SSL)            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Application Load Balancer         │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│   ECS/EKS   │  │   ECS/EKS   │
│   API       │  │   API       │
│  Container  │  │  Container  │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                ▼
       ┌────────────────┐
       │  RDS Postgres  │
       │  (Multi-AZ)    │
       └────────────────┘
                │
       ┌────────────────┐
       │ ElastiCache    │
       │    Redis       │
       └────────────────┘
                │
       ┌────────────────┐
       │   S3 Bucket    │
       │   + CloudFront │
       └────────────────┘
```

### Kubernetes Deployment (Production)

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mafqood-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mafqood-api
  template:
    metadata:
      labels:
        app: mafqood-api
    spec:
      containers:
      - name: api
        image: mafqood/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mafqood-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t mafqood/api:${{ github.sha }} ./backend
      - name: Push to registry
        run: docker push mafqood/api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/mafqood-api \
            api=mafqood/api:${{ github.sha }}
          kubectl rollout status deployment/mafqood-api
```

### Monitoring & Logging

**Prometheus Metrics:**
- API request count/latency
- Database connection pool
- Redis cache hit rate
- AI processing queue length
- Image upload success rate

**Grafana Dashboards:**
- API performance
- User registration/activity
- Match generation rate
- System resource usage

**Logging (ELK Stack):**
- Application logs (INFO, WARN, ERROR)
- Access logs
- AI processing logs
- Security events

**Alerting:**
- API response time > 2s
- Error rate > 1%
- Database connection issues
- High queue backlog (> 100 jobs)
- Storage usage > 80%

---

## 📈 Scalability Plan

### Phase 1: MVP (0-1K users)
- Single server (API + DB + Redis)
- S3 for storage
- Basic monitoring

### Phase 2: Growth (1K-10K users)
- Horizontal scaling (2-3 API servers)
- Load balancer
- Separate Celery workers
- RDS Multi-AZ
- CloudFront CDN

### Phase 3: Scale (10K-100K users)
- Auto-scaling groups
- Read replicas for database
- Redis Cluster
- Kubernetes orchestration
- FAISS for faster similarity search
- Separate microservices (auth, items, AI)

### Phase 4: Enterprise (100K+ users)
- Multi-region deployment
- Global CDN
- Elasticsearch for search
- Data warehouse for analytics
- ML model optimization
- Separate admin dashboard

---

## 🔒 Security Checklist

- [ ] HTTPS/TLS 1.3 enforcement
- [ ] JWT token rotation
- [ ] Rate limiting on all endpoints
- [ ] Input validation (Pydantic)
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] CORS configuration
- [ ] Password hashing (bcrypt)
- [ ] Secrets management (AWS Secrets Manager)
- [ ] Audit logging
- [ ] GDPR compliance (data export/deletion)
- [ ] Image content moderation (NSFW filter)
- [ ] DDoS protection (CloudFlare)
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Penetration testing

---

## 📝 API Documentation

- **Swagger/OpenAPI**: Auto-generated at `/docs`
- **ReDoc**: Alternative docs at `/redoc`
- **Postman Collection**: For testing
- **API Versioning**: `/api/v1/` prefix

---

## 🧪 Testing Strategy

### Unit Tests
- Model validation (Pydantic)
- Business logic (matching algorithm)
- Utility functions

### Integration Tests
- API endpoints (pytest + TestClient)
- Database operations
- Authentication flow

### E2E Tests
- Complete user flows
- Image upload and processing
- Match generation

### Load Testing
- JMeter or Locust
- Test 1000 concurrent users
- Image upload stress test

---

## 📊 Analytics & Metrics

### Key Metrics to Track

1. **User Metrics:**
   - New registrations
   - Daily/Monthly active users
   - Retention rate

2. **Item Metrics:**
   - Items posted (lost vs found)
   - Items closed/claimed
   - Average time to match

3. **Match Metrics:**
   - Match accuracy (user feedback)
   - Match acceptance rate
   - False positive rate

4. **Performance Metrics:**
   - API response time
   - Image processing time
   - AI inference time

5. **Business Metrics:**
   - User satisfaction (NPS)
   - Successful reunions
   - Platform engagement

---

## 🌐 Internationalization (i18n)

- Support English and Arabic
- Database: UTF-8 encoding
- API: Accept-Language header
- Right-to-left (RTL) support
- Date/time localization
- Number formatting (Arabic numerals)

---

## 🔮 Future Enhancements

1. **Advanced AI:**
   - Fine-tuned model for lost items
   - OCR for text in images (IDs, documents)
   - Brand logo detection
   - Multi-object detection in single image

2. **Features:**
   - In-app messaging
   - Video uploads
   - Reward system
   - Premium accounts (venues, businesses)
   - Integration with UAE government databases
   - QR code generation for items

3. **Platform:**
   - Web application
   - Admin dashboard
   - Venue partnerships (malls, airports)
   - API for third-party integration

---

## 💰 Cost Estimation (AWS)

**Monthly costs for 10K active users:**

- **Compute (ECS/EKS):** $150-300
- **Database (RDS):** $100-200
- **Redis (ElastiCache):** $50-100
- **S3 Storage (1TB):** $25
- **Data Transfer:** $50-100
- **CloudFront CDN:** $30-50
- **Monitoring/Logging:** $30-50

**Total: ~$435-825/month**

---

## 📚 Documentation Deliverables

1. **API Documentation** (Swagger/OpenAPI)
2. **Database Schema** (ER Diagram)
3. **Architecture Diagrams** (System, Data Flow, AI Pipeline)
4. **Deployment Guide** (Docker, K8s, AWS)
5. **Developer Guide** (Setup, Testing, Contributing)
6. **Operations Runbook** (Monitoring, Troubleshooting)

---

## 🎯 Implementation Roadmap

### Week 1-2: Core Backend
- [ ] Project setup (FastAPI + PostgreSQL)
- [ ] Database schema implementation
- [ ] Authentication system (JWT)
- [ ] User CRUD operations
- [ ] Basic API endpoints

### Week 3-4: Item Management
- [ ] Item CRUD endpoints
- [ ] Image upload (S3)
- [ ] Image processing pipeline
- [ ] Thumbnail generation

### Week 5-6: AI/CV Integration
- [ ] YOLO integration
- [ ] Feature extraction (ResNet/CLIP)
- [ ] Embedding storage (pgvector)
- [ ] Similarity search

### Week 7-8: Matching System
- [ ] Matching algorithm
- [ ] Match creation logic
- [ ] Match confirmation flow
- [ ] Notification system

### Week 9-10: Real-time Features
- [ ] WebSocket server
- [ ] Push notifications (FCM)
- [ ] Real-time match updates

### Week 11-12: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Docker setup
- [ ] Production deployment
- [ ] Monitoring setup

---

## 🤝 Team Recommendations

**Minimum Team:**
- 1 Backend Developer (Python/FastAPI)
- 1 AI/ML Engineer (Computer Vision)
- 1 DevOps Engineer
- 1 Frontend Developer (React Native - already have)

**Ideal Team:**
- 2 Backend Developers
- 1 AI/ML Engineer
- 1 DevOps Engineer
- 2 Frontend Developers
- 1 QA Engineer
- 1 Product Manager

---

## 📞 Support & Maintenance

**Ongoing Tasks:**
- Model retraining (quarterly)
- Database optimization
- Security updates
- Performance monitoring
- User support
- Bug fixes
- Feature enhancements

---

This comprehensive backend architecture plan provides a production-ready foundation for Mafqood. The system is designed to be scalable, secure, and maintainable while leveraging cutting-edge AI/CV technology for accurate lost item matching.

**Next Steps:**
1. Review and approve architecture
2. Set up development environment
3. Start implementation (Week 1-2 tasks)
4. Establish CI/CD pipeline
5. Begin testing strategy

For any questions or clarifications, please reach out!
