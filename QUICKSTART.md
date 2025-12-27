# Mafqood App - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Start the Backend

Open a terminal and run:

```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for: `✅ Application ready!`

### Step 2: Configure Frontend

**For iOS Simulator or Android Emulator:**
```powershell
# No configuration needed! Will auto-detect.
```

**For Physical Device:**
1. Find your local IP:
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under your WiFi adapter
   # Example: 192.168.1.100
   ```

2. Create `.env` file:
   ```powershell
   cp .env.example .env
   ```

3. Edit `.env` and set your IP:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
   ```

### Step 3: Start the Frontend

Open a **new terminal** and run:

```powershell
npm install
npx expo start
```

Then press:
- **`i`** for iOS Simulator
- **`a`** for Android Emulator
- **Scan QR code** for physical device

### Step 4: Test the Connection

In the app:
1. Click "Continue as Guest"
2. Click "Report Lost Item" or "Report Found Item"
3. Upload a photo
4. Fill in details
5. Submit

Check the backend terminal for:
```
[API] POST http://localhost:8000/api/lost
✅ Application ready!
```

## 🧪 Quick Test

Test backend health:
```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"ok","version":"1.0.0","timestamp":"..."}
```

## 🐛 Troubleshooting

### Backend not responding

```powershell
# Check if backend is running
curl http://localhost:8000/health

# If not, restart backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend can't connect (Physical Device)

1. **Ensure same WiFi**: Phone and computer on same network
2. **Check IP address**: Use `ipconfig` to confirm your IP
3. **Update .env**: Set correct `EXPO_PUBLIC_API_URL`
4. **Restart Expo**: Stop and run `npx expo start` again
5. **Check firewall**: Allow port 8000

### Android Emulator Connection Issues

Edit `.env`:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

## 📚 More Information

- **Full Integration Guide**: [FRONTEND_BACKEND_CONNECTION.md](./FRONTEND_BACKEND_CONNECTION.md)
- **Backend Documentation**: [backend/README.md](./backend/README.md)
- **API Documentation**: http://localhost:8000/docs

## ✅ Success Indicators

You're all set when you see:

✅ Backend terminal: `✅ Application ready!`  
✅ Frontend terminal: `Metro waiting on exp://192.168.x.x:8081`  
✅ App console: `[API] Success: POST http://...`  
✅ App screen: "Report submitted successfully!"

---

**Having issues?** Check [FRONTEND_BACKEND_CONNECTION.md](./FRONTEND_BACKEND_CONNECTION.md) for detailed troubleshooting.
