# 🚀 Railway Deployment Guide for Mafqood Backend

## ✅ Pre-Deployment Checklist

All necessary files have been created:
- ✅ `Procfile` - Railway start command
- ✅ `railway.json` - Deployment configuration
- ✅ `requirements.txt` - Updated with CPU-only PyTorch
- ✅ `.env.example` - Environment variable template
- ✅ `app/config.py` - Updated for environment variables

## 📋 Step-by-Step Railway Deployment

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub account
3. Verify your email

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `dubai-lostfound-ai` repository
4. Select the repository

### Step 3: Configure Service
1. Railway will detect the backend folder
2. Set **Root Directory** to: `backend`
3. Railway will auto-detect Python and use `Procfile`

### Step 4: Set Environment Variables
In the Railway dashboard, add these variables:

```bash
# Required Environment Variables
MEDIA_ROOT=/app/media
DATABASE_URL=sqlite:///./dubai_lostfound.db
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

**Important Notes:**
- Leave `PORT` unset - Railway automatically provides it
- Update `ALLOWED_ORIGINS` with your actual frontend URL after deployment

### Step 5: Deploy
1. Click "Deploy"
2. Railway will:
   - Install Python dependencies
   - Install PyTorch CPU version
   - Run database initialization
   - Start the FastAPI server

### Step 6: Monitor Deployment
Watch the build logs for:
- ✅ `Loading resnet18 model...`
- ✅ `Database initialized successfully`
- ✅ `Application ready!`
- ✅ `Uvicorn running on http://0.0.0.0:$PORT`

### Step 7: Get Your Public URL
1. Go to Settings → Networking
2. Click "Generate Domain"
3. Your backend URL will be: `https://your-project.up.railway.app`

### Step 8: Test Your Deployment
Test these endpoints:

```bash
# Health Check
GET https://your-project.up.railway.app/health

# API Documentation
GET https://your-project.up.railway.app/docs

# Root Info
GET https://your-project.up.railway.app/
```

## 🔧 Troubleshooting

### Issue: PyTorch Installation Fails
**Solution:** Requirements.txt already configured with CPU-only version:
```
--extra-index-url https://download.pytorch.org/whl/cpu
torch==2.2.0+cpu
torchvision==0.17.0+cpu
```

### Issue: Module 'app' Not Found
**Solution:** Ensure Root Directory is set to `backend` in Railway settings

### Issue: Database Not Persisting
**Solution:** Add Railway Volume:
1. Go to Settings → Volumes
2. Add volume at `/app/data`
3. Update `DATABASE_URL` to: `sqlite:////app/data/dubai_lostfound.db`

### Issue: CORS Errors
**Solution:** Add your frontend URL to environment variables:
```bash
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

### Issue: Images Not Saving
**Solution:** Check media directory permissions:
- Railway automatically creates `/app/media`
- Ensure `MEDIA_ROOT=/app/media` is set

## 🎯 Expected Deployment Result

After successful deployment, you should see:

```
✅ Build successful
✅ Model loaded: resnet18
✅ Database initialized
✅ Server running on Port $PORT
✅ Public URL: https://your-project.up.railway.app
```

## 📝 Post-Deployment Tasks

1. ✅ Copy your Railway URL
2. ✅ Test all endpoints with Postman/Thunder Client
3. ✅ Update frontend `lostFoundApi.ts` with new URL
4. ✅ Update `ALLOWED_ORIGINS` with frontend URL
5. ✅ Test image upload and AI matching

## 🔗 Useful Railway Commands (if using CLI)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Set environment variable
railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ `/health` returns `{"status":"ok"}`
- ✅ `/docs` shows Swagger UI
- ✅ POST `/api/found` accepts image and returns matches
- ✅ POST `/api/lost` accepts image and returns matches
- ✅ `/media/lost/` and `/media/found/` serve images
- ✅ No CORS errors from frontend

## 🚨 Production Considerations

Before going live:
- [ ] Switch to PostgreSQL for production database
- [ ] Add persistent volume for media files
- [ ] Enable Railway's autoscaling
- [ ] Set up monitoring and alerts
- [ ] Add rate limiting
- [ ] Configure CDN for media files
- [ ] Enable HTTPS only
- [ ] Add authentication if needed

---

**Backend Status:** ✅ Ready for Railway Deployment
**Expected Deployment Time:** 3-5 minutes
**Requirements:** Railway account + GitHub repo access
