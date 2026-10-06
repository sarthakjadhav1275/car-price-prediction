@echo off
title AutoValuate AI - Used Car Price Prediction Server
cd /d "%~dp0"

echo =======================================================
echo           AutoValuate AI - ML Web Server
echo =======================================================
echo.

:: Check if virtualenv or python exists
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)

:: Check if model exists, if not train first
if not exist "models\best_model.pkl" (
    echo [INFO] Trained model not found. Running training pipeline...
    python src\train.py --data data\car_data.csv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Model training failed.
        pause
        exit /b 1
    )
)

echo [INFO] Starting web server on http://127.0.0.1:8000 ...
echo [INFO] Opening browser...
start http://127.0.0.1:8000

echo.
echo =======================================================
echo Server is running! Press Ctrl+C in this window to stop.
echo =======================================================
echo.

python server.py --port 8000
pause
