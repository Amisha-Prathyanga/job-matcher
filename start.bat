@echo off
echo ================================
echo Job Matcher - Quick Start
echo ================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env and add your API keys:
    echo   - SERPAPI_KEY: Get from https://serpapi.com
    echo   - OPENAI_API_KEY: Get from https://platform.openai.com
    echo.
    pause
)

echo Starting backend server...
start "Job Matcher Backend" cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo Starting frontend...
start "Job Matcher Frontend" cmd /k "cd client && npm run dev"

echo.
echo ================================
echo Servers are starting!
echo ================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo ================================
echo.
echo Press any key to exit this window...
pause > nul
