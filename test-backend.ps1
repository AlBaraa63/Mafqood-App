# Test Backend Connection Script
# Run this to verify the backend is accessible from your machine

param(
    [string]$BackendUrl = "http://localhost:8000"
)

Write-Host "🔍 Testing Mafqood Backend Connection..." -ForegroundColor Cyan
Write-Host "   URL: $BackendUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check (/health)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get -TimeoutSec 5
    Write-Host "   ✅ Success!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Version: $($response.version)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Is the backend running? Run: cd backend; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
    Write-Host "   2. Check the URL: $BackendUrl" -ForegroundColor White
    Write-Host "   3. Check firewall settings" -ForegroundColor White
    exit 1
}

Write-Host ""

# Test 2: Root endpoint
Write-Host "Test 2: Root Endpoint (/)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/" -Method Get -TimeoutSec 5
    Write-Host "   ✅ Success!" -ForegroundColor Green
    Write-Host "   Name: $($response.name)" -ForegroundColor Gray
    Write-Host "   Description: $($response.description)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: API Docs
Write-Host "Test 3: API Documentation (/docs)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/docs" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Success! Docs are accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Lost items endpoint
Write-Host "Test 4: Lost Items Endpoint (GET /api/lost)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/api/lost" -Method Get -TimeoutSec 5
    Write-Host "   ✅ Success!" -ForegroundColor Green
    Write-Host "   Items count: $($response.count)" -ForegroundColor Gray
    if ($response.count -gt 0) {
        Write-Host "   Sample item: $($response.items[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Found items endpoint
Write-Host "Test 5: Found Items Endpoint (GET /api/found)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/api/found" -Method Get -TimeoutSec 5
    Write-Host "   ✅ Success!" -ForegroundColor Green
    Write-Host "   Items count: $($response.count)" -ForegroundColor Gray
    if ($response.count -gt 0) {
        Write-Host "   Sample item: $($response.items[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Backend is ready!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Next: Start the frontend with 'npx expo start'" -ForegroundColor Yellow
Write-Host "📚 API Docs: $BackendUrl/docs" -ForegroundColor Gray
Write-Host ""
