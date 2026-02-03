# 🔍 Mafqood App

**AI-Powered Lost & Found Mobile Application**

A React Native (Expo) mobile application for reporting and finding lost items using AI-powered image matching and similarity detection.

## ✨ Features

- 📱 **Mobile App**: React Native with Expo
- 🤖 **AI Matching**: YOLOv8 object detection and image similarity
- 🔐 **Secure Backend**: FastAPI with SQLite database
- 📍 **Location Services**: GPS-based item tracking
- 🔔 **Notifications**: Real-time match alerts

## 🛠️ Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- NativeWind (Tailwind CSS)

### Backend
- Python FastAPI
- SQLite Database
- YOLOv8 (Object Detection)
- CLIP (Image Similarity)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/AlBaraa63/Mafqood-App.git
cd Mafqood-App

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Start the development servers
./start-dev.ps1
```

## 📁 Project Structure

```
Mafqood-App/
├── src/               # React Native source code
├── backend/           # FastAPI backend
├── assets/            # Images and static files
├── App.tsx            # Main app entry
└── package.json       # Dependencies
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for helping people find what they've lost**
