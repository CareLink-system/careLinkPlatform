# deploy-all.ps1
Write-Host "Starting all services..." -ForegroundColor Green

# Stop old containers
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null

# Create network
docker network create carelink-network 2>$null

# Run all services
$services = @(
    @{name="auth-service"; port=5001},
    @{name="patient-service"; port=5002},
    @{name="doctor-service"; port=5003},
    @{name="appointment-service"; port=5004},
    @{name="telemedicine-service"; port=5007},
    @{name="notification-service"; port=5008},
    @{name="payment-service"; port=5010},
    @{name="api-gateway"; port=5000}
)

foreach ($s in $services) {
    Write-Host "Starting $($s.name)..." -ForegroundColor Yellow
    docker run -d --network carelink-network -p $($s.port):$($s.port) --name $($s.name) --env-file .\$($s.name)\.env -e ASPNETCORE_ENVIRONMENT=Development -e ASPNETCORE_URLS="http://+:$($s.port)" dinildulneth/$($s.name):latest
}

Write-Host "All services started!" -ForegroundColor Green
docker ps