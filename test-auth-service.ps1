# ============================================
# Test AuthService Endpoints
# ============================================

param(
    [string]$ServiceUrl = "http://localhost:5001",
    [string]$Email = "test@example.com",
    [string]$Password = "TestPassword123"
)

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [string]$Description
    )
    
    Write-Host "`n🧪 Testing: $Description" -ForegroundColor Cyan
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = @{ "Content-Type" = "application/json" }
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
            Write-Host "   Body: $($Body | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
        return $response
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "❌ Failed: $errorMsg" -ForegroundColor Red
        return $null
    }
}

Write-Host "🔍 CareLink AuthService Test Suite" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Service URL: $ServiceUrl" -ForegroundColor Yellow

# Test health check
Write-Host "`n📡 Checking service health..." -ForegroundColor Yellow
$health = Test-Endpoint -Method "GET" -Url "$ServiceUrl/health" -Description "Health Check"

if ($null -eq $health) {
    Write-Host "`n⚠️  Service is not responding. Make sure it's running with:" -ForegroundColor Yellow
    Write-Host "   cd backend\Services\AuthService" -ForegroundColor Gray
    Write-Host "   dotnet run" -ForegroundColor Gray
    exit 1
}

# Test register
Write-Host "`n" -ForegroundColor Green
$registerBody = @{
    email = $Email
    password = $Password
    firstName = "Test"
    lastName = "User"
    role = "Patient"
}

$registerResponse = Test-Endpoint `
    -Method "POST" `
    -Url "$ServiceUrl/api/v1/auth/register" `
    -Body $registerBody `
    -Description "User Registration"

if ($registerResponse) {
    $token = $registerResponse.data.token
    $userId = $registerResponse.data.id
    
    # Test login
    Write-Host "`n" -ForegroundColor Green
    $loginBody = @{
        email = $Email
        password = $Password
    }
    
    $loginResponse = Test-Endpoint `
        -Method "POST" `
        -Url "$ServiceUrl/api/v1/auth/login" `
        -Body $loginBody `
        -Description "User Login"
    
    if ($loginResponse) {
        Write-Host "`n" -ForegroundColor Green
        Write-Host "🎉 All tests passed!" -ForegroundColor Green
        Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
        Write-Host "   ✅ Service is healthy" -ForegroundColor Green
        Write-Host "   ✅ User registration works" -ForegroundColor Green
        Write-Host "   ✅ User login works" -ForegroundColor Green
        Write-Host "`n📊 Response Details:" -ForegroundColor Cyan
        Write-Host "   User ID: $userId" -ForegroundColor Yellow
        Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Yellow
    }
}

Write-Host "`n" -ForegroundColor Green
