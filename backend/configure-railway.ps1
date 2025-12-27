# Railway Deployment Script
# Run this after deploying to Railway to update frontend configuration

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl
)

# Validate URL format
if ($RailwayUrl -notmatch '^https://') {
    Write-Error "Railway URL must start with https://"
    exit 1
}

# Remove trailing slash if present
$RailwayUrl = $RailwayUrl.TrimEnd('/')

Write-Host "🚀 Configuring frontend for Railway backend..." -ForegroundColor Cyan
Write-Host "Backend URL: $RailwayUrl" -ForegroundColor Yellow

# Update frontend .env file
$frontendEnvPath = "..\frontend\.env"
$envContent = "VITE_API_BASE_URL=$RailwayUrl"

Set-Content -Path $frontendEnvPath -Value $envContent
Write-Host "✅ Updated $frontendEnvPath" -ForegroundColor Green

# Display next steps
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update Railway environment variables:" -ForegroundColor White
Write-Host "   ALLOWED_ORIGINS=$RailwayUrl,https://your-frontend.vercel.app" -ForegroundColor Yellow
Write-Host "`n2. Rebuild frontend:" -ForegroundColor White
Write-Host "   cd ../frontend" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor Yellow
Write-Host "`n3. Test endpoints:" -ForegroundColor White
Write-Host "   Health: $RailwayUrl/health" -ForegroundColor Yellow
Write-Host "   Docs: $RailwayUrl/docs" -ForegroundColor Yellow
Write-Host "`n4. Deploy frontend to Vercel/Netlify" -ForegroundColor White

Write-Host "`n✨ Configuration complete!" -ForegroundColor Green
