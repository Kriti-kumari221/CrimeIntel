@echo off
echo ================================================
echo   Chicago Crime Intelligence - Starting...
echo ================================================
echo.
echo Starting Backend on http://localhost:8000
echo Starting Frontend on http://localhost:5173
echo.
echo NOTE: First startup takes 2-3 minutes to load crime data.
echo Don't close either window!
echo.

:: Start backend in new window
start "Crime Intel - Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

:: Wait 3 seconds then start frontend
timeout /t 3 /nobreak >nul

:: Start frontend in new window
start "Crime Intel - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting...
echo Open http://localhost:5173 in your browser
echo.
pause
