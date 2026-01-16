@echo off
echo ========================================
echo   Iniciando servidor FastAPI
echo ========================================
echo.

REM Activar el entorno virtual
call venv\Scripts\activate.bat

REM Verificar que uvicorn está instalado
python -m pip list | findstr uvicorn >nul
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r requirements.txt
)

REM Iniciar el servidor
echo.
echo Iniciando servidor en http://localhost:8000
echo Presiona CTRL+C para detener el servidor
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
