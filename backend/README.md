# Dubai AI Lost & Found - Backend

> FastAPI backend with AI-powered visual similarity matching for lost and found items.

## 🏗️ Architecture

This backend provides:

- **RESTful API** for reporting lost/found items
- **AI Visual Matching** using pretrained CNN (ResNet18) embeddings
- **SQLite Database** for storing items and embeddings
- **Image Storage** with unique filenames
- **Cosine Similarity** for finding matches

## 📋 Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## 🚀 Getting Started

### 1. Create Virtual Environment

**Windows:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** On first run, PyTorch will download the pretrained ResNet18 model (~44MB). This happens automatically.

### 3. Run the Server

```bash
uvicorn app.main:app --reload
```

The server will start at: **http://localhost:8000**

- **API Documentation:** http://localhost:8000/docs
- **ReDoc Documentation:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app, CORS, static files
│   ├── config.py         # Settings and paths
│   ├── database.py       # SQLAlchemy setup
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic request/response models
│   ├── crud.py           # Database operations
│   ├── embeddings.py     # AI model and similarity
│   └── routers/
│       ├── __init__.py
│       └── items.py      # API endpoints
├── media/
│   ├── lost/            # Lost item images
│   └── found/           # Found item images
├── requirements.txt
└── README.md
```

## 🔌 API Endpoints

### Report Lost Item
```
POST /api/lost
Content-Type: multipart/form-data

Fields:
- file: image file (required)
- title: string (required)
- description: string (optional)
- location_type: string (required)
- location_detail: string (optional)
- time_frame: string (required)

Returns: Created item + AI-suggested matches from found items
```

### Report Found Item
```
POST /api/found
Content-Type: multipart/form-data

Same fields as /api/lost

Returns: Created item + AI-suggested matches from lost items
```

### Get Lost Items
```
GET /api/lost?skip=0&limit=100

Returns: List of all lost items
```

### Get Found Items
```
GET /api/found?skip=0&limit=100

Returns: List of all found items
```

### Get User History
```
GET /api/history

Returns: All items (lost & found) with their matches
```

### Get Specific Item
```
GET /api/items/{item_id}

Returns: Single item details
```

### Health Check
```
GET /health

Returns: API status and version
```

## 🤖 AI Model Details

- **Model:** ResNet18 (pretrained on ImageNet)
- **Embedding Dimension:** 512
- **Similarity Metric:** Cosine similarity
- **Preprocessing:** 224x224 resize, ImageNet normalization
- **Top K Matches:** 5 (configurable in config.py)

## 🗄️ Database

- **Engine:** SQLite
- **File:** `dubai_lostfound.db` (created automatically)
- **ORM:** SQLAlchemy

### Database Schema

**Items Table:**
- `id` (Integer, Primary Key)
- `type` (String: "lost" or "found")
- `title` (String)
- `description` (Text, nullable)
- `location_type` (String)
- `location_detail` (String, nullable)
- `time_frame` (String)
- `image_path` (String)
- `embedding_json` (Text: JSON array of floats)
- `created_at` (DateTime)

## 🖼️ Image Storage

- Images are stored in `media/lost/` and `media/found/`
- Filenames are UUIDs to prevent conflicts
- Served via FastAPI StaticFiles at `/media/{type}/{filename}`
- Accepted formats: JPG, PNG, WEBP
- Max size: 10MB

## 🔒 Privacy Features (TODO)

The codebase includes hooks for future privacy enhancements:

- `embeddings.apply_privacy_blur()` - Placeholder for face/ID blurring
- Integration point in `routers/items.py` before saving images

## 🧪 Testing the API

### Using cURL

**Report a Lost Item:**
```bash
curl -X POST http://localhost:8000/api/lost \
  -F "file=@/path/to/image.jpg" \
  -F "title=Black wallet" \
  -F "location_type=Mall" \
  -F "time_frame=Today"
```

**Get All Lost Items:**
```bash
curl http://localhost:8000/api/lost
```

### Using the Interactive Docs

Visit http://localhost:8000/docs for a Swagger UI where you can test all endpoints interactively.

## ⚙️ Configuration

Edit `app/config.py` to customize:

- `MODEL_NAME` - Switch between "resnet18" or "mobilenet_v2"
- `TOP_K_MATCHES` - Number of matches to return
- `MAX_IMAGE_SIZE` - Maximum upload size
- `ALLOWED_EXTENSIONS` - Accepted file types
- `ALLOWED_ORIGINS` - CORS origins

## 🐛 Troubleshooting

**Issue:** Model download fails
- Ensure you have internet connection
- PyTorch will cache models in `~/.cache/torch/hub/`

**Issue:** "Address already in use"
- Another process is using port 8000
- Use: `uvicorn app.main:app --reload --port 8001`

**Issue:** Database locked
- SQLite doesn't handle high concurrency well
- For production, consider PostgreSQL

**Issue:** CORS errors
- Check `ALLOWED_ORIGINS` in config.py
- Ensure frontend URL matches

## 📝 Notes

- This is a **prototype** backend for demos and competitions
- For production, consider:
  - PostgreSQL or MySQL instead of SQLite
  - Redis for caching embeddings
  - S3 or cloud storage for images
  - User authentication and authorization
  - Rate limiting and security middleware
  - Horizontal scaling with multiple workers

## 📄 License

TBD - Choose MIT or similar once finalized.

## 🤝 Contributing

This is a competition prototype. For questions or suggestions, contact the maintainer.
