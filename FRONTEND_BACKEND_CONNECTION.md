# Frontend-Backend Integration Guide

This document explains how the Mafqood mobile app connects to the FastAPI backend.

## 🔗 Architecture Overview

The app uses a **FastAPI backend** with AI-powered image matching and a **React Native (Expo)** frontend.

```
Mobile App (React Native)
    ↓ HTTP/REST
FastAPI Backend (Python)
    ↓
SQLite Database + AI Vision Model
```

## 📡 API Configuration

### Development Setup

The app automatically configures the API URL based on your platform:

- **iOS Simulator**: `http://localhost:8000`
- **Android Emulator**: `http://10.0.2.2:8000` (Android's special IP for host machine)
- **Physical Device**: Set your local IP in `.env` file

### Configuration Files

1. **[.env.example](./.env.example)** - Copy to `.env` and update with your values
2. **[app.config.js](./app.config.js)** - Expo configuration with environment variables
3. **[src/api/config.ts](./src/api/config.ts)** - API configuration with platform-specific URLs

## 🚀 Getting Started

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- Local: http://localhost:8000
- Network: http://YOUR_LOCAL_IP:8000

### 2. Configure the Frontend

For **physical device** testing:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
   ```
   Replace `192.168.1.100` with your actual local IP.

### 3. Start the Frontend

```bash
npm install
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code for physical device

## 📋 API Endpoints

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lost` | Report a lost item with image |
| POST | `/api/found` | Report a found item with image |
| GET | `/api/lost` | Get all lost items |
| GET | `/api/found` | Get all found items |
| GET | `/api/history` | Get user's items with AI matches |
| GET | `/api/items/{id}` | Get specific item details |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health status |
| GET | `/` | API information |

## 🔄 Data Flow Example

### Reporting a Lost Item

1. **Frontend**: User fills form and selects image
2. **Frontend**: Creates FormData with image + metadata
3. **Frontend**: POST to `/api/lost`
4. **Backend**: 
   - Validates image
   - Saves to `media/lost/`
   - Generates AI embedding
   - Finds matches in `found` items
   - Returns item + matches
5. **Frontend**: Displays success + potential matches

### Code Example

```typescript
// Frontend (src/api/index.ts)
export async function createLostItem(formData: ItemFormData) {
  const form = new FormData();
  form.append('file', {
    uri: formData.imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });
  form.append('title', formData.title);
  form.append('location_type', formData.location);
  form.append('time_frame', formData.dateTime);
  
  const response = await uploadFormData('/api/lost', form);
  return transformResponse(response);
}
```

## 🛠️ API Client

The app uses a custom HTTP client ([src/api/client.ts](./src/api/client.ts)) with:

- ✅ **Error handling** - Network errors, timeouts, HTTP errors
- ✅ **FormData support** - For image uploads
- ✅ **Type safety** - Full TypeScript types
- ✅ **Request logging** - Console logs for debugging
- ✅ **Timeout handling** - 30-second default timeout

## 📊 Type Mapping

Frontend and backend types are mapped for compatibility:

| Frontend Type | Backend Type | Description |
|---------------|--------------|-------------|
| `Item` | `ItemInDBBase` | Item representation |
| `ItemFormData` | `ItemCreate` | Item creation data |
| `Match` | `MatchResult` | AI match result |
| `MatchGroup` | `ItemWithMatches` | Item with its matches |

## 🔍 Testing the Connection

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-12-27T..."
}
```

### 2. Test from Frontend

The app will automatically log API requests to the console:

```
[API] POST http://localhost:8000/api/lost
[API] Success: POST http://localhost:8000/api/lost
```

### 3. Common Issues

**Problem**: "Network request failed"
- ✅ Backend is running
- ✅ Correct IP address in `.env`
- ✅ Same WiFi network (physical device)
- ✅ Firewall allows port 8000

**Problem**: "Request timeout"
- ✅ Backend responding to `/health`
- ✅ AI model loaded correctly
- ✅ Check backend logs for errors

**Problem**: Android emulator connection refused
- ✅ Use `10.0.2.2` instead of `localhost`
- ✅ Backend running on `0.0.0.0` (not `127.0.0.1`)

## 🔐 Authentication (Future)

Currently, the app doesn't require authentication. To add it:

1. Backend: Implement JWT tokens
2. Frontend: Store token in SecureStore
3. Frontend: Pass token in API client:
   ```typescript
   const response = await get('/api/items', { token });
   ```

## 📱 Production Deployment

For production, update the backend URL:

1. Deploy backend to a hosting service (Railway, AWS, etc.)
2. Update `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://api.mafqood.ae
   ```
3. Rebuild the app:
   ```bash
   npx expo prebuild
   npx eas build
   ```

## 📚 API Documentation

Full backend API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Debugging

Enable detailed logging:

```typescript
// src/api/client.ts
console.log('[API] Request:', {
  url,
  method,
  headers,
  body: body instanceof FormData ? 'FormData' : body
});
```

Monitor backend logs:
```bash
cd backend
uvicorn app.main:app --reload --log-level debug
```

## 📖 Related Files

- [src/api/index.ts](./src/api/index.ts) - Main API functions
- [src/api/client.ts](./src/api/client.ts) - HTTP client
- [src/api/config.ts](./src/api/config.ts) - API configuration
- [src/types/index.ts](./src/types/index.ts) - TypeScript types
- [backend/app/main.py](./backend/app/main.py) - Backend entry point
- [backend/app/routers/items.py](./backend/app/routers/items.py) - Item endpoints

## ✅ Checklist

- [x] HTTP client created
- [x] API configuration with platform detection
- [x] Type mappings implemented
- [x] Lost item submission connected
- [x] Found item submission connected
- [x] History/matches endpoint connected
- [x] Error handling implemented
- [x] Environment configuration added
- [ ] Authentication (future)
- [ ] Offline support (future)
- [ ] Request caching (future)

---

**Need help?** Check the [backend README](./backend/README.md) or backend [deployment checklist](./backend/DEPLOYMENT_CHECKLIST.md).
