# 🎯 Mafqood Railway Deployment Checklist

## ✅ Pre-Deployment (COMPLETED)

- [x] Created `Procfile` with uvicorn command
- [x] Created `railway.json` with deployment config
- [x] Updated `requirements.txt` with CPU-only PyTorch
- [x] Updated `config.py` to support environment variables
- [x] Created `.env.example` template
- [x] Tested locally - application starts successfully
- [x] Created deployment documentation

## 🚀 Railway Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "feat: Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project
- [ ] Go to https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `dubai-lostfound-ai` repository
- [ ] Set Root Directory: `backend`

### 3. Configure Environment Variables
Set these in Railway dashboard:
```
MEDIA_ROOT=/app/media
DATABASE_URL=sqlite:///./dubai_lostfound.db
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Monitor Deployment
Watch for these success messages:
- [ ] `Successfully installed torch-2.2.0+cpu`
- [ ] `Loading resnet18 model...`
- [ ] `Database initialized successfully`
- [ ] `Application ready!`
- [ ] `Uvicorn running on http://0.0.0.0:$PORT`

### 5. Generate Public Domain
- [ ] Go to Settings → Networking
- [ ] Click "Generate Domain"
- [ ] Copy your URL: `https://your-project.up.railway.app`

### 6. Test Deployment
Test these endpoints:
- [ ] `GET /health` → Returns `{"status":"ok"}`
- [ ] `GET /docs` → Shows Swagger UI
- [ ] `GET /` → Returns API info

### 7. Update CORS Settings
Add your Railway URL to allowed origins:
```
ALLOWED_ORIGINS=https://your-project.up.railway.app,http://localhost:5173
```

### 8. Test API Endpoints

#### Test Lost Item Submission
```bash
curl -X POST "https://your-project.up.railway.app/api/lost" \
  -F "file=@test-image.jpg" \
  -F "title=Lost Wallet" \
  -F "location_type=Mall" \
  -F "location_detail=Dubai Mall" \
  -F "time_frame=Today"
```

#### Test Found Item Submission
```bash
curl -X POST "https://your-project.up.railway.app/api/found" \
  -F "file=@test-image.jpg" \
  -F "title=Found Keys" \
  -F "location_type=Metro" \
  -F "location_detail=Red Line" \
  -F "time_frame=Yesterday"
```

#### Test History
```bash
curl "https://your-project.up.railway.app/api/history"
```

### 9. Update Frontend Configuration
Run the configuration script:
```powershell
.\configure-railway.ps1 -RailwayUrl "https://your-project.up.railway.app"
```

Or manually update `frontend/.env`:
```
VITE_API_BASE_URL=https://your-project.up.railway.app
```

### 10. Update Railway CORS for Frontend
After deploying frontend, add its URL:
```
ALLOWED_ORIGINS=https://your-project.up.railway.app,https://your-frontend.vercel.app,http://localhost:5173
```

## 🔍 Verification Checklist

### Backend Verification
- [ ] Health endpoint responds
- [ ] API documentation loads
- [ ] Database initializes on startup
- [ ] AI model loads successfully
- [ ] Media directories are created
- [ ] CORS headers are correct
- [ ] Image uploads work
- [ ] AI matching returns results

### Frontend Integration
- [ ] Frontend can connect to backend
- [ ] No CORS errors
- [ ] Image upload works
- [ ] Match results display
- [ ] History page loads
- [ ] Images display correctly

## 📊 Expected Build Output

```
[INFO] Installing dependencies from requirements.txt
[INFO] Successfully installed fastapi-0.109.0
[INFO] Successfully installed torch-2.2.0+cpu
[INFO] Successfully installed torchvision-0.17.0+cpu
[INFO] Build completed successfully
[INFO] Starting deployment...
[INFO] 🚀 Starting Dubai AI Lost & Found API...
[INFO] 🔄 Loading resnet18 model...
[INFO] ✅ resnet18 model loaded successfully
[INFO] ✅ Database initialized successfully
[INFO] ✅ Application ready!
[INFO] Uvicorn running on http://0.0.0.0:$PORT
```

## 🚨 Troubleshooting

### Build Fails
- Check Railway logs for specific error
- Verify `requirements.txt` has correct PyTorch CPU index
- Ensure Root Directory is set to `backend`

### Model Loading Fails
- Verify PyTorch CPU version installed correctly
- Check available memory (upgrade Railway plan if needed)
- Review model loading logs

### CORS Errors
- Add frontend URL to `ALLOWED_ORIGINS`
- Ensure no typos in environment variable
- Redeploy after changing environment variables

### Images Not Saving
- Check `MEDIA_ROOT` is set correctly
- Verify write permissions (should be automatic)
- Consider adding Railway Volume for persistence

### Database Errors
- Verify `DATABASE_URL` format
- For production, consider PostgreSQL
- Add Railway Volume for SQLite persistence

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Backend URL is accessible
2. ✅ `/docs` shows interactive API documentation
3. ✅ Health check returns OK
4. ✅ Can submit lost item with image
5. ✅ Can submit found item with image
6. ✅ AI returns match results
7. ✅ History endpoint returns data
8. ✅ Images are accessible via `/media/` URLs
9. ✅ No CORS errors from frontend
10. ✅ Ready for pitch demo!

## 📝 Railway URLs to Save

Fill these in after deployment:

- **Backend API:** `https://________________________.up.railway.app`
- **API Docs:** `https://________________________.up.railway.app/docs`
- **Health Check:** `https://________________________.up.railway.app/health`
- **Frontend (Vercel):** `https://________________________.vercel.app`

## 🎯 Final Demo Test

Before your pitch:
1. [ ] Upload a lost item from frontend
2. [ ] Upload a matching found item
3. [ ] Verify AI shows match
4. [ ] Check history page displays both items
5. [ ] Verify images load correctly
6. [ ] Test from mobile device
7. [ ] Clear browser cache and test again

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **PyTorch Docs:** https://pytorch.org/docs

---

**Status:** 🟢 Ready for Railway Deployment
**Estimated Time:** 5-10 minutes
**Next Action:** Push to GitHub and create Railway project
