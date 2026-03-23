$services = @(
    "AuthService",
    "PatientService", 
    "DoctorService",
    "AppointmentService",
    "TelemedicineService",
    "NotificationService",
    "PaymentService"
)

foreach ($service in $services) {
    $programPath = "backend\Services\$service\Program.cs"
    
    if (Test-Path $programPath) {
        $content = Get-Content $programPath -Raw
        
        # Check if CORS already exists
        if ($content -notmatch "AddCors") {
            Write-Host "Adding CORS to $service..." -ForegroundColor Yellow
            
            # Add CORS after builder creation
            $newContent = $content -replace "var builder = WebApplication.CreateBuilder\(args\);", 
                "var builder = WebApplication.CreateBuilder(args);`r`n`r`n// Add CORS`r`nbuilder.Services.AddCors(options =>`r`n{`r`n    options.AddPolicy(`"AllowAll`", policy =>`r`n    {`r`n        policy.AllowAnyOrigin()`r`n              .AllowAnyMethod()`r`n              .AllowAnyHeader();`r`n    });`r`n});"
            
            # Add UseCors before UseAuthentication
            $newContent = $newContent -replace "app.UseAuthentication\(\);", 
                "app.UseCors(`"AllowAll`");`r`napp.UseAuthentication();"
            
            Set-Content -Path $programPath -Value $newContent
            Write-Host "✅ CORS added to $service" -ForegroundColor Green
        } else {
            Write-Host "⚠️ CORS already exists in $service" -ForegroundColor Gray
        }
    }
}

Write-Host "`n✅ All services updated! Press F5 to restart." -ForegroundColor Green