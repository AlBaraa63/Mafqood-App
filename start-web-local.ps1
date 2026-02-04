# Start Mafqood Web Platform Locally
# This script starts both the Backend (on port 8000) and Frontend (on port 5173)

Write-Host "🚀 Starting Mafqood Web Platform..." -ForegroundColor Cyan

# 1. Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
# Using Direct Python Path to avoid activation issues
$backendCommand = "cd web/backend; .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $backendCommand -PassThru
Write-Host "✅ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green

# 2. Wait for Backend to initialize
Start-Sleep -Seconds 5

# 3. Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
$frontendCommand = "cd web/frontend; npm run dev"
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $frontendCommand -PassThru
Write-Host "✅ Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green

Write-Host "`n🎉 Services are running!" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173"
Write-Host "   Backend:  http://localhost:8000"
Write-Host "`n⚠️  If you see 'Failed to fetch', check the Backend window for errors."
Write-Host "Press any key to stop all services..." -ForegroundColor White

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
Write-Host "👋 Services stopped." -ForegroundColor Cyan
