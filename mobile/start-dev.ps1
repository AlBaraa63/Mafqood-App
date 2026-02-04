# Mafqood App - Development Startup Script
# This script starts both backend and frontend in separate windows

Write-Host "🚀 Starting Mafqood App..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: Backend directory not found" -ForegroundColor Red
    exit 1
}

# Check if .env exists, if not create from example
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. You may need to edit it for physical device testing." -ForegroundColor Green
        Write-Host ""
    }
}

# Start Backend in new window
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🚀 Starting Backend...' -ForegroundColor Green; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "📱 Starting Frontend (Expo)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '📱 Starting Frontend...' -ForegroundColor Green; npx expo start"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Wait for Backend: '✅ Application ready!'" -ForegroundColor White
Write-Host "   2. Wait for Frontend: 'Metro waiting on...'" -ForegroundColor White
Write-Host "   3. Press 'i' for iOS, 'a' for Android, or scan QR code" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Backend will be at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 For more help, see QUICKSTART.md" -ForegroundColor Gray
