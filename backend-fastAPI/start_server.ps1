# Script para iniciar el servidor FastAPI en PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando servidor FastAPI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si el puerto 8000 está en uso
$portInUse = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($portInUse) {
    $processId = $portInUse.OwningProcess
    Write-Host "⚠️  El puerto 8000 está en uso por el proceso PID: $processId" -ForegroundColor Yellow
    Write-Host "Intentando detener el proceso..." -ForegroundColor Yellow
    
    try {
        Stop-Process -Id $processId -Force -ErrorAction Stop
        Write-Host "✅ Proceso detenido correctamente" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "❌ No se pudo detener el proceso. Por favor, ciérralo manualmente o usa otro puerto." -ForegroundColor Red
        Write-Host "Para ver qué proceso usa el puerto 8000, ejecuta: netstat -ano | findstr :8000" -ForegroundColor Yellow
        exit 1
    }
}

# Activar el entorno virtual
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "Error: No se encontró el entorno virtual" -ForegroundColor Red
    exit 1
}

# Verificar que uvicorn está instalado
$uvicornInstalled = python -m pip list | Select-String "uvicorn"
if (-not $uvicornInstalled) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Iniciar el servidor
Write-Host ""
Write-Host "🚀 Iniciando servidor en http://localhost:8000" -ForegroundColor Green
Write-Host "📚 Documentación: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔗 API: http://localhost:8000/api/gamerooms" -ForegroundColor Cyan
Write-Host "Presiona CTRL+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Usar 127.0.0.1 en lugar de 0.0.0.0 para mayor compatibilidad en Windows
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
