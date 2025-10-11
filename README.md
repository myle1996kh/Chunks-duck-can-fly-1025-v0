# 🎤 English Speaking Fluency Game

A professional-grade browser-based game that trains English speaking fluency using real-time audio analysis and AI-powered scoring. The game features a bird flying mechanic where players must speak continuously to keep the bird airborne, with comprehensive fluency analysis and mobile-optimized interface.

## 🏗️ **Project Architecture**

### **Backend (Python + FastAPI)**
- **Real-time Audio Processing**: librosa, numpy, scipy
- **Database**: SQLite with proper schema for sessions and analysis
- **API**: RESTful endpoints for audio upload and analysis
- **Audio Analysis**: RMS, dB conversion, speech detection, syllable counting
- **Scoring Algorithm**: Fluency, consistency, speech rate calculation

### **Frontend (HTML5 + JavaScript)**
- **Audio Recording**: MediaRecorder API with WebM/WAV support
- **Real-time Visualization**: Canvas-based bird flying game
- **Responsive Design**: Desktop and mobile-optimized interfaces
- **Professional UI**: Modern, touch-friendly controls

### **Deployment**
- **Local Development**: Python HTTP server + FastAPI
- **Public Access**: ngrok tunneling for external testing
- **Cross-Platform**: Works on Windows, Mac, Linux, mobile devices

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8+ installed
- Internet connection (for ngrok)
- Modern web browser with microphone support

### **Step 1: Clone/Download Project**
```bash
# Download the project files to your local machine
# Ensure you have the following structure:
DCF/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
├── frontend.html
├── mobile.html
├── index.html
├── ngrok.exe
├── ngrok.yml
└── sample_sentences.csv
```

### **Step 2: Install Backend Dependencies**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Or if using virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### **Step 3: Start Backend Server**
```bash
# From backend directory
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Backend will be available at: http://localhost:8000
# API documentation at: http://localhost:8000/docs
```

### **Step 4: Start Frontend Server**
```bash
# From project root directory
python -m http.server 3000 --directory .

# Frontend will be available at: http://localhost:3000
```

### **Step 5: Start ngrok Tunnel (Optional - for public access)**
```bash
# From project root directory
.\ngrok.exe start --all --config=ngrok.yml

# Or for individual tunnels:
.\ngrok.exe http 8000  # Backend
.\ngrok.exe http 3000  # Frontend
```

### **Step 6: Access the Game**
- **Landing Page**: `http://localhost:3000/index.html`
- **Desktop Version**: `http://localhost:3000/frontend.html`
- **Mobile Version**: `http://localhost:3000/mobile.html`

## 🎮 **How to Play**

### **Game Mechanics**
1. **Start Game**: Click "START" button
2. **Allow Microphone**: Grant microphone permission when prompted
3. **Speak Continuously**: Keep talking to make the bird fly higher
4. **Avoid Silence**: Long pauses will make the bird fall
5. **Stop Game**: Click "STOP" to see your fluency analysis
6. **View Results**: Check your fluency score and detailed metrics

### **Controls**
- **Volume Threshold**: Adjust sensitivity for speech detection (60-70 dB recommended)
- **Pause Threshold**: Set maximum pause time before bird falls (0.5s recommended)
- **Fullscreen**: Toggle fullscreen mode for immersive experience
- **Hide Controls**: Minimize control panel for cleaner interface

### **Scoring System**
- **Fluency Score**: Based on time to first pause vs total duration
- **Volume Consistency**: Measures speaking stability
- **Speech Rate**: Words per minute calculation
- **Final Score**: Combined metrics with bonuses

## 📱 **Mobile Experience**

### **Features**
- **Touch-Optimized**: Large buttons and touch-friendly controls
- **Auto-Detection**: Landing page automatically redirects mobile users
- **Visual Feedback**: Recording indicators and status messages
- **Responsive Design**: Adapts to different screen sizes
- **Gesture Support**: Tap to start/stop, swipe controls

### **Mobile-Specific Controls**
- **Tap Indicator**: Shows when to tap for actions
- **Recording Indicator**: Red blinking dot during recording
- **Game Status**: Real-time status updates
- **Touch Events**: Optimized for mobile touch interactions

## 🔧 **Technical Details**

### **Audio Processing**
- **Format Support**: WebM (primary), WAV (fallback)
- **Sample Rate**: 16kHz for optimal processing
- **Real-time Analysis**: Continuous volume and speech detection
- **Chunked Recording**: 100ms audio chunks for responsive feedback

### **Backend API Endpoints**
- `POST /analyze`: Upload and analyze audio file
- `GET /sentences`: Retrieve practice sentences
- `GET /sessions`: Get user session history
- `POST /sessions`: Create new session

### **Database Schema**
- **students**: User information
- **sessions**: Game sessions and results
- **audio_analysis**: Real-time audio metrics

### **File Structure**
```
DCF/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── fluency_game.db     # SQLite database
│   └── uploads/            # Audio file storage
├── frontend.html           # Desktop interface
├── mobile.html             # Mobile interface
├── index.html              # Landing page
├── ngrok.exe               # Tunnel service
├── ngrok.yml               # Tunnel configuration
├── winner.mp3              # Success sound
├── gameover.mp3            # Game over sound
└── sample_sentences.csv    # Practice sentences
```

## 🎯 **Features**

### **Real-time Audio Analysis**
- ✅ **True dB Calculation**: Real decibel measurement from microphone
- ✅ **Speech Detection**: AI-powered speech segment detection
- ✅ **Fluency Scoring**: (Time to First Pause / Total Duration) × 100
- ✅ **Volume Consistency**: Measures speaking stability
- ✅ **Speech Rate**: Words per minute calculation using syllable detection

### **Game Mechanics**
- ✅ **Volume-Based Flight**: Bird height = real-time dB level
- ✅ **Forward Movement**: Continuous horizontal scrolling
- ✅ **Gravity Physics**: Bird falls when not speaking
- ✅ **Infinite Scrolling**: Seamless game experience
- ✅ **Visual Feedback**: Bird color changes when falling

### **Audio Recording & Storage**
- ✅ **High-Quality Recording**: WebM/WAV format support
- ✅ **Chunked Upload**: Real-time audio processing
- ✅ **Database Storage**: All sessions and analysis results saved
- ✅ **File Management**: Organized audio file storage with short names

### **Sound Effects & Feedback**
- ✅ **Real-time Beeps**: High volume detection alerts
- ✅ **Voice Feedback**: Winner/gameover sounds based on score
- ✅ **Visual Messages**: Fallback when audio playback fails
- ✅ **Status Indicators**: Real-time game state display

### **Mobile Optimization**
- ✅ **Touch Controls**: Optimized for mobile devices
- ✅ **Responsive Design**: Adapts to different screen sizes
- ✅ **Auto-Detection**: Mobile device detection and redirection
- ✅ **Gesture Support**: Touch-friendly interactions

## 🛠️ **Development Setup**

### **Backend Development**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### **Frontend Development**
```bash
python -m http.server 3000 --directory .
```

### **Testing**
- **Local Testing**: Use localhost URLs
- **Mobile Testing**: Use ngrok public URLs
- **Audio Testing**: Test with different microphones and volumes

## 🐛 **Troubleshooting**

### **Common Issues**

**Backend won't start:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend not loading:**
```bash
python -m http.server 3000 --directory .
```

**ngrok authentication failed:**
```bash
# Check if ngrok is already running
# Kill existing processes and restart
.\ngrok.exe start --all --config=ngrok.yml
```

**Microphone not working:**
- Check browser permissions
- Ensure HTTPS for production (ngrok provides this)
- Test with different browsers

**Audio analysis errors:**
- Check audio file format (WebM preferred)
- Verify backend is running
- Check console for error messages

### **PowerShell Issues (Windows)**
If you get `&&` errors in PowerShell:
```powershell
# Use semicolon instead of &&
cd backend; python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📊 **Performance Optimization**

### **Audio Processing**
- **Chunk Size**: 100ms for optimal responsiveness
- **Sample Rate**: 16kHz for good quality/speed balance
- **Format**: WebM for better compression

### **Frontend Optimization**
- **Canvas Rendering**: Optimized for 60fps
- **Event Handling**: Debounced resize events
- **Memory Management**: Proper cleanup of audio streams

### **Mobile Optimization**
- **Touch Events**: Passive listeners for better performance
- **Canvas Scaling**: High DPI support
- **Battery Usage**: Efficient audio processing

## 🚀 **Deployment**

### **Local Development**
- Use localhost URLs for development
- Hot reload enabled for backend
- Live frontend updates

### **Production Deployment**
- Use ngrok for public access
- Configure proper CORS settings
- Set up SSL certificates for HTTPS

### **Mobile Deployment**
- Use ngrok public URLs
- Test on actual mobile devices
- Optimize for different screen sizes

## 📈 **Future Enhancements**

- **Multiplayer Mode**: Compete with other players
- **Progress Tracking**: Long-term fluency improvement
- **Custom Sentences**: Upload your own practice texts
- **Advanced Analytics**: Detailed speaking patterns
- **Voice Recognition**: Text-to-speech accuracy
- **Gamification**: Achievements and levels

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is open source and available under the MIT License.

## 🆘 **Support**

For issues and questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Test with different browsers/devices
4. Check microphone permissions

---

**Happy Speaking! 🎤✨**

*Keep practicing and improve your English fluency with this interactive game!*
