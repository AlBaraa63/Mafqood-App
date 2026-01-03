# Setup Instructions - After Implementation

## Backend Setup

### 1. Install New Dependencies

The implementation added authentication packages. Install them:

```bash
cd backend
pip install -r requirements.txt
```

**New packages added:**
- `python-jose[cryptography]` - JWT token handling
- `passlib[bcrypt]` - Password hashing

### 2. Create Environment File

Create `backend/.env` from the template:

```bash
cd backend
cp .env.example .env
```

### 3. Generate Secret Key

**CRITICAL:** Generate a secure secret key for JWT tokens:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and add to `backend/.env`:
```
SECRET_KEY=<paste-generated-key-here>
```

### 4. Delete Old Database (Development Only)

The database schema changed to include users table. Delete old database:

```bash
# From backend directory
rm dubai_lostfound.db
```

On next startup, the application will create a new database with the users table.

### 5. Start Backend

```bash
cd backend
python -m app.main
```

Or use uvicorn:
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Verify Setup

Check that the backend started successfully:
- Visit: http://localhost:8000/docs
- You should see new `/auth/*` endpoints
- Try the health check: http://localhost:8000/health

---

## Frontend Setup

No installation needed! The frontend changes are pure TypeScript updates.

### Test the Flow

1. **Start the app:**
   ```bash
   npm start
   # or
   npx expo start
   ```

2. **Register a new account:**
   - Go to Register screen
   - Enter email, name, phone, password
   - Should receive JWT token and login automatically

3. **Test login:**
   - Logout if logged in
   - Go to Login screen
   - Enter credentials
   - Should login successfully

4. **Verify authentication:**
   - Check Profile screen shows real user data
   - Try accessing protected features
   - Logout and verify token is cleared

---

## Production Deployment

### Environment Variables to Set

**Railway/Backend:**
```bash
SECRET_KEY=<secure-random-key>
DATABASE_URL=<postgresql-url>
ALLOWED_ORIGINS=https://your-frontend-domain.com
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENABLE_TEST_ENDPOINTS=false
```

**Vercel/Frontend:**
```bash
EXPO_PUBLIC_API_URL=https://your-backend.railway.app
```

### Database Migration

The application uses SQLAlchemy and will automatically create tables on startup:

```python
# This runs automatically in app/database.py
Base.metadata.create_all(bind=engine)
```

If you need to add the users table to an existing database manually:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR NOT NULL,
    phone VARCHAR,
    is_active BOOLEAN DEFAULT 1 NOT NULL,
    is_verified BOOLEAN DEFAULT 0 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX ix_users_email ON users (email);
```

---

## Testing the Authentication

### Using the API Docs

1. Go to http://localhost:8000/docs

2. **Register a user:**
   - Expand `POST /auth/register`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "full_name": "Test User",
       "phone": "+971501234567"
     }
     ```
   - Click "Execute"
   - Copy the `token` from the response

3. **Test protected endpoint:**
   - Expand `GET /auth/users/me`
   - Click "Try it out"
   - Click the lock icon (Authorize)
   - Enter: `Bearer <paste-token-here>`
   - Click "Authorize"
   - Click "Execute"
   - Should see your user profile

### Using curl

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone": "+971501234567"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:8000/auth/users/me \
  -H "Authorization: Bearer TOKEN"
```

---

## Troubleshooting

### "Import jose could not be resolved"

**Solution:** Install dependencies
```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

### "SECRET_KEY not set" or weak key warning

**Solution:** Generate and set a strong secret key in `.env`
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### "Email already registered"

**Solution:** Use a different email or delete the user from the database:
```bash
# Development only
rm backend/dubai_lostfound.db
```

### "Invalid token" errors

**Causes:**
- Token expired (default: 30 minutes)
- SECRET_KEY changed
- Token format incorrect

**Solution:** Login again to get a new token

### Users table doesn't exist

**Solution:** Delete old database and restart:
```bash
cd backend
rm dubai_lostfound.db
python -m app.main
```

### CORS errors

**Solution:** Add your frontend URL to `ALLOWED_ORIGINS`:
```python
# backend/.env
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
```

---

## What Changed

### Files You Need to Update Locally

If pulling these changes from git:

1. **Install new backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env and set SECRET_KEY
   ```

3. **Delete old database:**
   ```bash
   rm dubai_lostfound.db
   ```

4. **Restart backend:**
   ```bash
   python -m app.main
   ```

### Files Modified

**Backend:**
- `app/models.py` - Added User model
- `app/schemas.py` - Added auth schemas
- `app/crud.py` - Added user CRUD operations
- `app/main.py` - Added auth router
- `app/config.py` - Removed hard-coded constants
- `requirements.txt` - Added auth packages

**Frontend:**
- `src/api/mockData.ts` - Removed mockUser
- `src/api/config.ts` - Updated endpoint paths
- `src/api/index.ts` - Updated getProfile to pass token
- `src/hooks/useStore.ts` - Implemented token validation

**New Files:**
- `backend/app/auth.py` - Authentication utilities
- `backend/app/routers/auth.py` - Authentication endpoints
- `backend/app/constants.py` - Configuration constants
- `IMPLEMENTATION_COMPLETE.md` - This summary

---

## Summary

✅ Mock authentication removed  
✅ Real JWT-based authentication implemented  
✅ Passwords securely hashed with bcrypt  
✅ User database model created  
✅ Protected endpoints require valid tokens  
✅ Frontend updated to use real auth  
✅ Configuration centralized in constants  

**Action Required:**
1. Install new Python packages
2. Generate and set SECRET_KEY
3. Delete old database (development)
4. Test registration and login

**Production Ready:** 🟡 Almost - Just need to set SECRET_KEY and production database
