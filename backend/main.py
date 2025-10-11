from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import librosa
import numpy as np
import io
import json
import asyncio
from datetime import datetime
import os
import uuid
from typing import List, Dict, Any
import sqlite3
import wave

app = FastAPI(title="English Speaking Fluency Game API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database
def init_database():
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            sentence_id INTEGER,
            audio_file_path VARCHAR(255),
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            total_duration FLOAT,
            first_pause_time FLOAT,
            score FLOAT,
            volume_consistency FLOAT,
            speech_rate FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audio_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            timestamp FLOAT,
            volume_db FLOAT,
            is_speaking BOOLEAN,
            speech_confidence FLOAT,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_database()

# Audio processing functions
def calculate_rms(audio_data):
    """Calculate RMS of audio data"""
    return np.sqrt(np.mean(audio_data**2))

def calculate_db(rms_value):
    """Convert RMS to dB"""
    if rms_value <= 0:
        return -60
    return 20 * np.log10(rms_value)

def detect_speech_segments(audio_data, sr, threshold_db=-40):
    """Detect speech segments in audio"""
    # Calculate RMS for each frame
    frame_length = int(0.025 * sr)  # 25ms frames
    hop_length = int(0.010 * sr)    # 10ms hop
    
    rms = librosa.feature.rms(y=audio_data, frame_length=frame_length, hop_length=hop_length)[0]
    db = librosa.amplitude_to_db(rms)
    
    # Detect speech frames
    speech_frames = db > threshold_db
    
    # Convert to time segments
    times = librosa.frames_to_time(np.arange(len(speech_frames)), sr=sr, hop_length=hop_length)
    
    segments = []
    in_speech = False
    start_time = 0
    
    for i, is_speech in enumerate(speech_frames):
        if is_speech and not in_speech:
            start_time = times[i]
            in_speech = True
        elif not is_speech and in_speech:
            segments.append((start_time, times[i]))
            in_speech = False
    
    if in_speech:
        segments.append((start_time, times[-1]))
    
    return segments

def find_first_pause(speech_segments, min_pause_duration=0.5):
    """Find the first significant pause in speech

    Returns:
        - Time before first pause (in seconds)
        - If no pause found, returns total speaking time (= perfect 100%)
    """
    if not speech_segments:
        return 0

    # If only one segment, NO PAUSE - return total speaking time
    if len(speech_segments) == 1:
        return speech_segments[0][1] - speech_segments[0][0]

    # Find first gap longer than min_pause_duration
    for i in range(len(speech_segments) - 1):
        gap = speech_segments[i+1][0] - speech_segments[i][1]
        if gap >= min_pause_duration:
            return speech_segments[i][1] - speech_segments[0][0]

    # If no significant pause found, return total speaking time (perfect!)
    return speech_segments[-1][1] - speech_segments[0][0]

def calculate_volume_consistency(audio_data, sr):
    """Calculate volume consistency (lower is better)"""
    frame_length = int(0.025 * sr)
    hop_length = int(0.010 * sr)
    
    rms = librosa.feature.rms(y=audio_data, frame_length=frame_length, hop_length=hop_length)[0]
    db = librosa.amplitude_to_db(rms)
    
    # Calculate standard deviation of volume
    volume_std = np.std(db)
    
    # Convert to consistency score (0-1, higher is better)
    consistency = max(0, 1 - (volume_std / 20))  # Normalize by 20dB
    return consistency

def calculate_speech_rate(audio_data, sr, speech_segments=None):
    """Calculate improved speech rate (words per minute) using syllable detection"""
    try:
        from scipy.signal import find_peaks
        
        # Calculate spectral centroid for syllable detection
        frame_length = int(0.025 * sr)  # 25ms frames
        hop_length = int(0.010 * sr)    # 10ms hop
        
        # Calculate spectral centroid
        spectral_centroids = []
        for i in range(0, len(audio_data) - frame_length, hop_length):
            frame = audio_data[i:i + frame_length]
            if len(frame) > 0:
                # Calculate FFT
                fft = np.fft.fft(frame)
                freqs = np.fft.fftfreq(len(frame), 1/sr)
                magnitude = np.abs(fft)
                
                # Calculate spectral centroid
                if np.sum(magnitude) > 0:
                    centroid = np.sum(freqs * magnitude) / np.sum(magnitude)
                    spectral_centroids.append(abs(centroid))
                else:
                    spectral_centroids.append(0)
            else:
                spectral_centroids.append(0)
        
        spectral_centroids = np.array(spectral_centroids)
        
        # Find peaks in spectral centroid (potential syllables)
        peaks, _ = find_peaks(spectral_centroids, height=np.mean(spectral_centroids))
        
        # Filter peaks that occur during speech segments
        speech_peaks = []
        times = np.arange(len(spectral_centroids)) * hop_length / sr
        
        if speech_segments:
            for peak_idx in peaks:
                peak_time = times[peak_idx]
                # Check if peak is within a speech segment
                for start, end in speech_segments:
                    if start <= peak_time <= end:
                        speech_peaks.append(peak_time)
                        break
        else:
            speech_peaks = [times[i] for i in peaks]
        
        # Calculate syllables per second
        if speech_segments and speech_segments:
            total_speech_time = sum(end - start for start, end in speech_segments)
            syllables_per_second = len(speech_peaks) / total_speech_time if total_speech_time > 0 else 0
        else:
            duration = len(audio_data) / sr
            syllables_per_second = len(speech_peaks) / duration if duration > 0 else 0
        
        # Convert to WPM (assuming average 1.5 syllables per word)
        words_per_second = syllables_per_second / 1.5
        wpm = words_per_second * 60
        
        return wpm
        
    except Exception as e:
        print(f"Warning: Error in advanced WPM calculation: {e}")
        # Fallback to simple estimation
        duration = len(audio_data) / sr
        estimated_words = duration * 2.5  # Average 2.5 words per second
        return estimated_words * 60 / duration if duration > 0 else 0

def analyze_audio(audio_data, sr):
    """Main audio analysis function"""
    try:
        # Detect speech segments
        speech_segments = detect_speech_segments(audio_data, sr)
        
        # Calculate timing metrics
        total_duration = len(audio_data) / sr
        first_pause_time = find_first_pause(speech_segments)

        # Calculate quality metrics
        volume_consistency = calculate_volume_consistency(audio_data, sr)
        speech_rate = calculate_speech_rate(audio_data, sr, speech_segments)

        # ✅ CORRECT FLUENCY SCORE CALCULATION
        # Formula: (Time before first pause / Total duration) × 100
        #
        # Example:
        # - Total duration: 10s
        # - No pause: first_pause_time = 10s → Score = 100%
        # - Pause at 5s: first_pause_time = 5s → Score = 50%
        # - Pause at 1s: first_pause_time = 1s → Score = 10%

        # Calculate fluency score based on TOTAL DURATION (not speaking time)
        if total_duration > 0:
            fluency_score = (first_pause_time / total_duration) * 100
        else:
            fluency_score = 0

        # Add bonuses for quality
        consistency_bonus = volume_consistency * 10  # Up to +10 points
        rate_bonus = min(speech_rate / 150.0, 1.0) * 5  # Up to +5 points

        # Final score calculation
        final_score = min(100, fluency_score + consistency_bonus + rate_bonus)
        
        # Speech rate assessment
        if speech_rate < 100:
            rate_assessment = "Too slow - consider speaking faster"
        elif speech_rate > 200:
            rate_assessment = "Too fast - consider slowing down"
        elif 120 <= speech_rate <= 180:
            rate_assessment = "Excellent speech rate!"
        else:
            rate_assessment = "Good speech rate"
        
        # Determine pause status
        if first_pause_time >= total_duration * 0.95:  # 95% threshold for "no pause"
            pause_status = "No significant pause detected - Excellent!"
        elif first_pause_time == 0:
            pause_status = "Paused immediately"
        else:
            pause_status = f"First pause at {round(first_pause_time, 2)}s"

        return {
            'fluency_score': round(fluency_score, 2),
            'final_score': round(final_score, 2),
            'first_pause_time': round(first_pause_time, 2),
            'pause_status': pause_status,
            'total_duration': round(total_duration, 2),
            'volume_consistency': round(volume_consistency, 2),
            'speech_rate': round(speech_rate, 2),
            'rate_assessment': rate_assessment,
            'num_pauses': max(0, len(speech_segments) - 1),  # Number of pauses
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    except Exception as e:
        print(f"Error analyzing audio: {e}")
        return {
            'fluency_score': 0,
            'final_score': 0,
            'first_pause_time': 0,
            'total_duration': 0,
            'volume_consistency': 0,
            'speech_rate': 0,
            'rate_assessment': "Error in analysis",
            'speech_segments': [],
            'error': str(e)
        }

# API Endpoints
@app.get("/")
async def root():
    return {"message": "English Speaking Fluency Game API"}

@app.get("/sentences")
async def get_sentences():
    """Get available sentences"""
    sentences = [
        {"id": 1, "sentence": "The quick brown fox jumps over the lazy dog"},
        {"id": 2, "sentence": "She sells seashells by the seashore"},
        {"id": 3, "sentence": "How much wood would a woodchuck chuck if a woodchuck could chuck wood"},
        {"id": 4, "sentence": "Peter Piper picked a peck of pickled peppers"},
        {"id": 5, "sentence": "The rain in Spain falls mainly on the plain"},
        {"id": 6, "sentence": "To be or not to be, that is the question"},
        {"id": 7, "sentence": "A journey of a thousand miles begins with a single step"},
        {"id": 8, "sentence": "The early bird catches the worm"},
        {"id": 9, "sentence": "Practice makes perfect"},
        {"id": 10, "sentence": "Where there's a will, there's a way"}
    ]
    return sentences

@app.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    student_id: int = Form(1),
    sentence_id: int = Form(1),
    session_data: str = Form("{}"),
    frontend_analysis: str = Form(None)  # ✅ NEW: Frontend can send analysis results
):
    """Upload and analyze audio file"""
    try:
        print(f"Received audio file: {file.filename}, size: {file.size}")
        # Read audio file
        audio_bytes = await file.read()
        print(f"Audio bytes read: {len(audio_bytes)} bytes")

        # ✅ Parse frontend analysis if provided
        frontend_results = None
        if frontend_analysis:
            try:
                frontend_results = json.loads(frontend_analysis)
                print(f"📊 Frontend analysis received: {frontend_results}")
            except:
                print("⚠️ Failed to parse frontend_analysis")

        # ✅ STEP 1: SAVE AUDIO FILE FIRST (before any analysis)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'wav'
        audio_filename = f"rec_{timestamp}.{file_extension}"

        # Get absolute path to backend directory and go up one level to DCF
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        dcf_dir = os.path.dirname(backend_dir)
        record_folder = os.path.join(dcf_dir, "record")

        # Create record folder if it doesn't exist
        os.makedirs(record_folder, exist_ok=True)
        print(f"✅ Record folder created/verified: {record_folder}")

        audio_path = os.path.join(record_folder, audio_filename)

        # Save audio file
        print(f"💾 Saving audio file to: {audio_path}")
        try:
            with open(audio_path, "wb") as f:
                f.write(audio_bytes)
            print(f"✅ Audio file saved successfully: {audio_path}")
            print(f"📊 File size: {len(audio_bytes)} bytes")

            # Verify file was saved
            if os.path.exists(audio_path):
                file_size = os.path.getsize(audio_path)
                print(f"✅ File verified: {audio_path} ({file_size} bytes)")
            else:
                print(f"❌ ERROR: File not found after saving: {audio_path}")
        except Exception as save_error:
            print(f"❌ ERROR saving audio file: {save_error}")
            import traceback
            traceback.print_exc()

        # ✅ STEP 2: ANALYZE AUDIO (with fallback)
        analysis = None

        # Check file type and handle accordingly
        if file.filename.endswith('.webm'):
            # For WebM files, try to load with librosa (may need ffmpeg)
            try:
                audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)
                analysis = analyze_audio(audio_data, sr)
            except Exception as e:
                print(f"⚠️ Error loading WebM with librosa: {e}")
                # ⚠️ FALLBACK: Cannot analyze WebM without ffmpeg
                # Use frontend's local analysis instead
                print("⚠️ WebM analysis not available - using frontend local analysis")

                session_info = json.loads(session_data) if session_data else {}
                start_time = session_info.get('start_time', 0)
                end_time = session_info.get('end_time', 0)

                # Calculate duration from session data
                if start_time and end_time:
                    duration = (end_time - start_time) / 1000.0  # Convert to seconds
                else:
                    duration = 5.0  # Default duration

                # ❌ CANNOT accurately calculate first_pause_time without analyzing audio
                # Return minimal analysis - frontend will use local analysis
                analysis = {
                    'fluency_score': 0,  # Let frontend calculate
                    'final_score': 0,  # Let frontend calculate
                    'first_pause_time': 0,  # Unknown
                    'total_duration': round(duration, 2),
                    'volume_consistency': 0,
                    'speech_rate': 0,
                    'rate_assessment': "Audio saved but analysis unavailable (install ffmpeg for WebM support)",
                    'num_pauses': 0,
                    'pause_status': "Analysis unavailable - install ffmpeg",
                    'analysis_timestamp': datetime.now().isoformat(),
                    'note': 'WebM analysis requires ffmpeg - audio file saved to disk',
                    'use_frontend_analysis': True  # Signal frontend to use local analysis
                }
        else:
            # For other formats (WAV, etc.)
            try:
                audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)
                analysis = analyze_audio(audio_data, sr)
            except Exception as e:
                print(f"⚠️ Error loading audio: {e}")
                analysis = {
                    'fluency_score': 50.0,
                    'final_score': 50.0,
                    'first_pause_time': 0.5,
                    'total_duration': 3.0,
                    'volume_consistency': 0.5,
                    'speech_rate': 120.0,
                    'rate_assessment': "Could not analyze audio",
                    'speech_segments': [],
                    'analysis_timestamp': datetime.now().isoformat(),
                    'note': 'Audio file saved but analysis failed'
                }

        # ✅ STEP 3: SAVE TO DATABASE
        # ✅ Use frontend_results if available, otherwise use backend analysis
        save_analysis = frontend_results if frontend_results else analysis

        print(f"💾 Saving to database: {save_analysis}")

        conn = sqlite3.connect('fluency_game.db')
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO sessions
            (student_id, sentence_id, audio_file_path, start_time, end_time,
             total_duration, first_pause_time, score, volume_consistency, speech_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            student_id, sentence_id, audio_path,
            datetime.now().isoformat(), datetime.now().isoformat(),
            save_analysis.get('total_duration', 0),
            save_analysis.get('first_pause_time', 0),
            save_analysis.get('final_score', save_analysis.get('fluency_score', 0)),  # Use final_score
            save_analysis.get('volume_consistency', 0),
            save_analysis.get('speech_rate', 0)
        ))

        session_id = cursor.lastrowid
        conn.commit()
        conn.close()

        print(f"✅ Saved to database with session_id: {session_id}")

        # Add session ID to response
        analysis['session_id'] = session_id
        analysis['audio_file_path'] = audio_path

        # ✅ If frontend provided analysis, return that instead
        if frontend_results:
            frontend_results['session_id'] = session_id
            frontend_results['audio_file_path'] = audio_path
            return frontend_results
        
        return analysis
    
    except Exception as e:
        print(f"Error processing audio: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{student_id}")
async def get_student_sessions(student_id: int):
    """Get all sessions for a student"""
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT s.*, st.name as student_name
        FROM sessions s
        LEFT JOIN students st ON s.student_id = st.id
        WHERE s.student_id = ?
        ORDER BY s.created_at DESC
    ''', (student_id,))

    columns = [desc[0] for desc in cursor.description]
    sessions = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()

    return sessions

# ===== STUDENT MANAGEMENT CRUD =====

@app.get("/students")
async def get_students():
    """Get all students"""
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM students ORDER BY created_at DESC')
    columns = [desc[0] for desc in cursor.description]
    students = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()

    return students

@app.get("/students/{student_id}")
async def get_student(student_id: int):
    """Get a specific student"""
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Student not found")

    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))

@app.post("/students")
async def create_student(name: str = Form(...), email: str = Form(None)):
    """Create a new student"""
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO students (name, email)
        VALUES (?, ?)
    ''', (name, email))

    student_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"id": student_id, "name": name, "email": email, "message": "Student created successfully"}

@app.put("/students/{student_id}")
async def update_student(student_id: int, name: str = Form(...), email: str = Form(None)):
    """Update a student"""
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE students
        SET name = ?, email = ?
        WHERE id = ?
    ''', (name, email, student_id))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    conn.commit()
    conn.close()

    return {"id": student_id, "name": name, "email": email, "message": "Student updated successfully"}

@app.delete("/students/{student_id}")
async def delete_student(student_id: int):
    """Delete a student"""
    conn = sqlite3.connect('fluency_game.db')
    cursor = conn.cursor()

    # Check if student has sessions
    cursor.execute('SELECT COUNT(*) FROM sessions WHERE student_id = ?', (student_id,))
    session_count = cursor.fetchone()[0]

    if session_count > 0:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete student with {session_count} sessions. Delete sessions first."
        )

    cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    conn.commit()
    conn.close()

    return {"message": "Student deleted successfully"}

@app.websocket("/ws/{student_id}")
async def websocket_endpoint(websocket: WebSocket, student_id: int):
    """WebSocket for real-time audio processing"""
    await websocket.accept()
    
    try:
        while True:
            # Receive audio data
            data = await websocket.receive_bytes()
            
            # Process audio chunk
            audio_data = np.frombuffer(data, dtype=np.float32)
            
            # Calculate real-time metrics
            rms = calculate_rms(audio_data)
            db = calculate_db(rms)
            
            # Send back real-time data
            response = {
                'volume_db': float(db),
                'is_speaking': db > -40,
                'timestamp': datetime.now().isoformat()
            }
            
            await websocket.send_text(json.dumps(response))
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

