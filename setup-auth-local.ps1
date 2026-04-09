# ============================================
# AuthService Local Development Setup Script
# ============================================
# This script starts PostgreSQL in Docker and initializes the auth database

param(
    [string]$Port = "5433",
    [string]$DbName = "authdb",
    [string]$DbUser = "admin",
    [string]$DbPassword = "admin123"
)

Write-Host "🔧 CareLink AuthService Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if Docker is available
Write-Host "`n📦 Checking Docker installation..." -ForegroundColor Yellow
$dockerCheck = docker --version 2>$null
if ($null -eq $dockerCheck) {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker found: $dockerCheck" -ForegroundColor Green

# Stop existing container if it exists
Write-Host "`n🛑 Checking for existing PostgreSQL container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=carelink-postgres-local" --format "{{.ID}}" 2>$null
if ($existingContainer) {
    Write-Host "   Stopping existing container..." -ForegroundColor Yellow
    docker stop carelink-postgres-local 2>$null | Out-Null
    docker rm carelink-postgres-local 2>$null | Out-Null
    Write-Host "✅ Cleaned up old container" -ForegroundColor Green
}

# Start PostgreSQL container
Write-Host "`n🚀 Starting PostgreSQL container on port $Port..." -ForegroundColor Yellow
docker run `
    --name carelink-postgres-local `
    -e POSTGRES_USER=$DbUser `
    -e POSTGRES_PASSWORD=$DbPassword `
    -e POSTGRES_DB=$DbName `
    -p "$Port`:5432" `
    -d `
    postgres:15

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start PostgreSQL container" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL started successfully" -ForegroundColor Green

# Wait for PostgreSQL to be ready
Write-Host "`n⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts) {
    try {
        docker exec carelink-postgres-local pg_isready -U $DbUser | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
            break
        }
    }
    catch {
        # Ignore errors during polling
    }
    Start-Sleep -Seconds 1
    $attempt++
    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
}

if (-not $dbReady) {
    Write-Host "❌ PostgreSQL failed to start within 30 seconds" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

# Create databases
Write-Host "`n📁 Creating databases..." -ForegroundColor Yellow
$databases = @("authdb", "patientdb", "doctordb", "appointmentdb", "paymentdb")

foreach ($db in $databases) {
    docker exec carelink-postgres-local psql -U $DbUser -d postgres -c "CREATE DATABASE $db;" 2>$null
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {  # 1 = database already exists (OK)
        Write-Host "✅ Database '$db' ready" -ForegroundColor Green
    }
}

# Connection string info
$connectionString = "Host=localhost;Port=$Port;Database=$DbName;Username=$DbUser;Password=$DbPassword"

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "`nPostgreSQL is running on port $Port" -ForegroundColor Cyan
Write-Host "Connection String:" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor White

Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open a new PowerShell terminal" -ForegroundColor White
Write-Host "2. Navigate to the AuthService:" -ForegroundColor White
Write-Host "   cd backend/Services/AuthService" -ForegroundColor Gray
Write-Host "3. Run the service:" -ForegroundColor White
Write-Host "   dotnet run" -ForegroundColor Gray
Write-Host "`n4. Test the registration endpoint:" -ForegroundColor White
Write-Host "   POST http://localhost:5001/api/v1/auth/register" -ForegroundColor Gray
Write-Host "   Body: {" -ForegroundColor Gray
Write-Host "     'email': 'test@example.com'," -ForegroundColor Gray
Write-Host "     'password': 'Test@123'," -ForegroundColor Gray
Write-Host "     'firstName': 'John'," -ForegroundColor Gray
Write-Host "     'lastName': 'Doe'" -ForegroundColor Gray
Write-Host "   }" -ForegroundColor Gray

Write-Host "`n📊 To see PostgreSQL logs:" -ForegroundColor Yellow
Write-Host "   docker logs -f carelink-postgres-local" -ForegroundColor Gray

Write-Host "`n🛑 To stop PostgreSQL:" -ForegroundColor Yellow
Write-Host "   docker stop carelink-postgres-local" -ForegroundColor Gray

Write-Host "`n" -ForegroundColor Green
