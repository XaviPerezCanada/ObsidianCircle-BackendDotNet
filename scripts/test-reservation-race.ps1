# Prueba de condición de carrera: dos POST simultáneos a la misma reserva.
# Uno debe devolver 201, el otro 409.
# Uso: .\scripts\test-reservation-race.ps1 -Email "xavi@gmail.com" -Password "tucontraseña" -GameRoomId "GUID-SALA" [-Date "2026-03-20"]

param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [Parameter(Mandatory = $true)]
    [string]$Password,
    [Parameter(Mandatory = $true)]
    [string]$GameRoomId,
    [string]$Date = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
)

$baseUrl = "https://localhost:7200"
$deviceId = [guid]::NewGuid().ToString()

# 1) Login
Write-Host "Login como $Email..." -ForegroundColor Cyan
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method Post -Body $loginBody `
        -ContentType "application/json" -Headers @{ "X-Device-Id" = $deviceId } -SkipCertificateCheck
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
$token = $loginResponse.accessToken
Write-Host "Token obtenido." -ForegroundColor Green

# 2) Mismo cuerpo para las dos peticiones (misma sala, fecha, franja)
$reservationBody = @{
    gameRoomId = $GameRoomId
    date       = $Date
    slot       = "Morning"
    boardGameId = $null
} | ConvertTo-Json
$url = "$baseUrl/api/reservations"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
    "X-Device-Id"   = $deviceId
}

# 3) Lanzar dos peticiones en paralelo
Write-Host "Enviando 2 POST simultáneos a $url (sala=$GameRoomId, fecha=$Date, slot=Morning)..." -ForegroundColor Cyan
$job1 = Start-Job -ScriptBlock {
    param($u, $h, $b)
    try {
        $r = Invoke-WebRequest -Uri $u -Method Post -Headers $h -Body $b -UseBasicParsing -SkipCertificateCheck
        @{ Status = $r.StatusCode; Body = $r.Content }
    } catch {
        @{ Status = $_.Exception.Response.StatusCode.value__; Body = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() }
    }
} -ArgumentList $url, $headers, $reservationBody

$job2 = Start-Job -ScriptBlock {
    param($u, $h, $b)
    try {
        $r = Invoke-WebRequest -Uri $u -Method Post -Headers $h -Body $b -UseBasicParsing -SkipCertificateCheck
        @{ Status = $r.StatusCode; Body = $r.Content }
    } catch {
        @{ Status = $_.Exception.Response.StatusCode.value__; Body = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() }
    }
} -ArgumentList $url, $headers, $reservationBody

Wait-Job $job1, $job2 | Out-Null
$result1 = Receive-Job $job1
$result2 = Receive-Job $job2
Remove-Job $job1, $job2 -Force

# 4) Resultados
Write-Host "`n--- Resultado 1: $($result1.Status) ---" -ForegroundColor $(if ($result1.Status -eq 201) { "Green" } elseif ($result1.Status -eq 409) { "Yellow" } else { "Red" })
Write-Host $result1.Body
Write-Host "`n--- Resultado 2: $($result2.Status) ---" -ForegroundColor $(if ($result2.Status -eq 201) { "Green" } elseif ($result2.Status -eq 409) { "Yellow" } else { "Red" })
Write-Host $result2.Body

$ok = ($result1.Status -eq 201 -and $result2.Status -eq 409) -or ($result1.Status -eq 409 -and $result2.Status -eq 201)
if ($ok) {
    Write-Host "`nOK: Un 201 y un 409. El bloqueo pesimista se comporta correctamente." -ForegroundColor Green
} else {
    Write-Host "`nRevisar: Se esperaba un 201 y un 409." -ForegroundColor Red
}
