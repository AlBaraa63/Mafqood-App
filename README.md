# Mafqood - Open Monorepo

This repository contains the entire Mafqood project, consolidating the Mobile App, Web Platform, and Backend services.

## Structure

### 📱 `/mobile`
**React Native (Expo) Application**
- The production-grade mobile app for Dubai residents.
- **Backend:** `mobile/backend` (FastAPI + PostgreSQL + Async) - The main production backend.
- **Run:** `cd mobile` then `npm start`.

### 🌐 `/web`
**React Web Showcase**
- The web-based "Lost & Found" platform MVP.
- **Backend:** `web/backend` (FastAPI + SQLite) - A lightweight backend optimized for the web demo/showcase.
- **Run:** `cd web/frontend` then `npm run dev`.

---

## Quick Start

### Mobile App
```bash
cd mobile
npm install
# Start Backend
cd backend
pip install -r requirements.txt
python main.py
# Start App
cd ..
npx expo start
```

### Web Platform
```bash
cd web/frontend
npm install
npm run dev
# Start Web Backend
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
