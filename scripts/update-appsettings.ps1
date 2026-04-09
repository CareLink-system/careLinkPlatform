param(
  [string]$DbHost = 'localhost',
  [int]$Port = 5433,
  [string]$User = 'admin',
  [string]$Password = 'admin123'
)

$map = @{
  'AuthService' = 'authdb'
  'PatientService' = 'patientdb'
  'DoctorService' = 'doctordb'
  'AppointmentService' = 'appointmentdb'
  'PaymentService' = 'paymentdb'
}

foreach ($svc in $map.Keys) {
  $db = $map[$svc]
  $svcPath = Join-Path -Path 'backend/Services' -ChildPath $svc
  if (-not (Test-Path $svcPath)) { continue }

  $candidateFiles = @(
    (Join-Path $svcPath 'appsettings.Development.json'),
    (Join-Path $svcPath 'appsettings.json')
  )

  # Ensure at least development settings exist for each service.
  if (-not (Test-Path $candidateFiles[0])) {
    Set-Content -Path $candidateFiles[0] -Value '{}' -Encoding UTF8
  }

  foreach ($file in $candidateFiles) {
    if (-not (Test-Path $file)) { continue }

    $raw = Get-Content -Path $file -Raw
    if ([string]::IsNullOrWhiteSpace($raw)) {
      $raw = '{}'
    }

    try {
      $json = $raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
      Write-Host "Skipped invalid JSON: $file"
      continue
    }

    if (-not $json.PSObject.Properties['ConnectionStrings']) {
      $json | Add-Member -MemberType NoteProperty -Name ConnectionStrings -Value ([pscustomobject]@{})
    }

    $conn = "Host=$DbHost;Port=$Port;Database=$db;Username=$User;Password=$Password"
    if ($json.ConnectionStrings.PSObject.Properties['DefaultConnection']) {
      $json.ConnectionStrings.DefaultConnection = $conn
    }
    else {
      $json.ConnectionStrings | Add-Member -MemberType NoteProperty -Name DefaultConnection -Value $conn
    }

    $json | ConvertTo-Json -Depth 20 | Set-Content -Path $file -Encoding UTF8
    Write-Host "Updated $file"
  }
}

Write-Host 'Connection string update complete.'