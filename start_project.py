#!/usr/bin/env python3
"""
English Speaking Fluency Game - Quick Start Script
Automatically starts all required services
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def print_banner():
    print("🎤 English Speaking Fluency Game - Quick Start")
    print("=" * 50)
    print()

def check_python():
    """Check if Python is installed"""
    try:
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print("❌ Python 3.8+ required. Current version:", f"{version.major}.{version.minor}")
            return False
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    except Exception as e:
        print(f"❌ Python check failed: {e}")
        return False

def install_backend_deps():
    """Install backend dependencies"""
    print("📦 Installing backend dependencies...")
    try:
        backend_dir = Path("backend")
        if not backend_dir.exists():
            print("❌ Backend directory not found!")
            return False
        
        # Change to backend directory
        os.chdir(backend_dir)
        
        # Install requirements
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Backend dependencies installed successfully")
            return True
        else:
            print(f"❌ Failed to install dependencies: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    finally:
        # Return to project root
        os.chdir("..")

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    try:
        backend_dir = Path("backend")
        if not backend_dir.exists():
            print("❌ Backend directory not found!")
            return None
        
        # Start backend in background
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], cwd=backend_dir)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        print("✅ Backend server started at http://localhost:8000")
        return process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend server"""
    print("🌐 Starting frontend server...")
    try:
        # Start frontend in background
        process = subprocess.Popen([
            sys.executable, "-m", "http.server", "3000", "--directory", "."
        ])
        
        # Wait a moment for server to start
        time.sleep(2)
        
        print("✅ Frontend server started at http://localhost:3000")
        return process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def start_ngrok():
    """Start ngrok tunnel"""
    print("🌍 Starting ngrok tunnel...")
    try:
        ngrok_exe = Path("ngrok.exe")
        if not ngrok_exe.exists():
            print("⚠️  ngrok.exe not found. Skipping ngrok setup.")
            print("   You can still access the game locally at http://localhost:3000")
            return None
        
        # Start ngrok
        process = subprocess.Popen([
            str(ngrok_exe), "start", "--all", "--config=ngrok.yml"
        ])
        
        print("✅ ngrok tunnel started")
        print("   Check ngrok output for public URLs")
        return process
    except Exception as e:
        print(f"❌ Failed to start ngrok: {e}")
        return None

def open_browser():
    """Open the game in browser"""
    print("🌐 Opening game in browser...")
    try:
        webbrowser.open("http://localhost:3000/index.html")
        print("✅ Game opened in browser")
    except Exception as e:
        print(f"⚠️  Could not open browser automatically: {e}")
        print("   Please open http://localhost:3000/index.html manually")

def main():
    print_banner()
    
    # Check Python
    if not check_python():
        return
    
    # Install dependencies
    if not install_backend_deps():
        return
    
    # Start services
    backend_process = start_backend()
    if not backend_process:
        return
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        return
    
    ngrok_process = start_ngrok()
    
    # Open browser
    open_browser()
    
    print("\n🎉 All services started successfully!")
    print("\n📱 Access URLs:")
    print("   • Landing Page: http://localhost:3000/index.html")
    print("   • Desktop Version: http://localhost:3000/frontend.html")
    print("   • Mobile Version: http://localhost:3000/mobile.html")
    print("   • Backend API: http://localhost:8000")
    print("   • API Docs: http://localhost:8000/docs")
    
    if ngrok_process:
        print("\n🌍 Public URLs (check ngrok output):")
        print("   • ngrok will show public URLs in the terminal")
    
    print("\n🛑 Press Ctrl+C to stop all services")
    
    try:
        # Keep running until user stops
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping all services...")
        
        # Terminate processes
        if backend_process:
            backend_process.terminate()
            print("✅ Backend stopped")
        
        if frontend_process:
            frontend_process.terminate()
            print("✅ Frontend stopped")
        
        if ngrok_process:
            ngrok_process.terminate()
            print("✅ ngrok stopped")
        
        print("👋 All services stopped. Goodbye!")

if __name__ == "__main__":
    main()
