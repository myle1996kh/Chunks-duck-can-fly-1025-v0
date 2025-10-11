@echo off
echo 🎤 English Speaking Fluency Game - Quick Start
echo ================================================
echo.

echo 📦 Installing dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo.
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "python -m http.server 3000 --directory ."

echo.
echo 🌍 Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "ngrok.exe start --all --config=ngrok.yml"

echo.
echo 🎉 All services starting...
echo.
echo 📱 Access URLs:
echo    • Landing Page: http://localhost:3000/index.html
echo    • Desktop Version: http://localhost:3000/frontend.html
echo    • Mobile Version: http://localhost:3000/mobile.html
echo    • Backend API: http://localhost:8000
echo    • API Docs: http://localhost:8000/docs
echo.
echo 🌐 Opening game in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000/index.html

echo.
echo ✅ Setup complete! Check the opened windows for service status.
echo 🛑 Close the command windows to stop the services.
echo.
pause
