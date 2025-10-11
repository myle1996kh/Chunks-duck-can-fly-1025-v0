#!/bin/bash

echo "🎤 English Speaking Fluency Game - Quick Start"
echo "================================================"
echo

echo "📦 Installing dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
cd ..

echo
echo "🚀 Starting backend server..."
gnome-terminal --title="Backend Server" -- bash -c "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000; read -p 'Press Enter to close...'"

echo
echo "🌐 Starting frontend server..."
gnome-terminal --title="Frontend Server" -- bash -c "python -m http.server 3000 --directory .; read -p 'Press Enter to close...'"

echo
echo "🌍 Starting ngrok tunnel..."
gnome-terminal --title="ngrok Tunnel" -- bash -c "./ngrok start --all --config=ngrok.yml; read -p 'Press Enter to close...'"

echo
echo "🎉 All services starting..."
echo
echo "📱 Access URLs:"
echo "   • Landing Page: http://localhost:3000/index.html"
echo "   • Desktop Version: http://localhost:3000/frontend.html"
echo "   • Mobile Version: http://localhost:3000/mobile.html"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs: http://localhost:8000/docs"
echo
echo "🌐 Opening game in browser..."
sleep 3
open http://localhost:3000/index.html

echo
echo "✅ Setup complete! Check the opened terminals for service status."
echo "🛑 Close the terminal windows to stop the services."
echo
