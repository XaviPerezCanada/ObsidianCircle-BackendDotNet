# Realiza login contra la API (backend en https://localhost:7200)
# Uso: .\scripts\login-api.ps1 -Email "tu@email.com" -Password "tucontraseña"

param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [Parameter(Mandatory = $true)]
    [string]$Password
)

$url = "https://localhost:7200/api/Auth/login"
$body = @{ email = $Email; password = $Password } | ConvertTo-Json
$deviceId = [guid]::NewGuid().ToString()

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" `
        -Headers @{ "X-Device-Id" = $deviceId } -SkipCertificateCheck
    Write-Host "Login correcto." -ForegroundColor Green
    Write-Host "Usuario: $($response.user.username) | Email: $($response.user.email) | Tipo: $($response.user.type)"
    Write-Host "AccessToken (primeros 50 chars): $($response.accessToken.Substring(0, [Math]::Min(50, $response.accessToken.Length)))..."
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        Write-Host $reader.ReadToEnd()
    }
    exit 1
}
