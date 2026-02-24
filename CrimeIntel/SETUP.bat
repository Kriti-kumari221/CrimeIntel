@echo off
echo ================================================
echo   Chicago Crime Intelligence - Setup Script
echo ================================================
echo.

echo [1/5] Setting up Python backend...
cd /d %~dp0backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo Backend setup complete!
echo.

echo [2/5] Setting up frontend...
cd /d %~dp0frontend
call npm install
echo Frontend setup complete!
echo.

echo ================================================
echo   SETUP DONE! Now run START.bat to launch
echo ================================================
pause
