// Duck Can Fly - Voice Controlled Game
class DuckCanFly {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Load configuration
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

        // Game state
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        this.frameCount = 0;

        // Duck properties
        this.duck = {
            x: 100,
            y: this.config.game.duckStartY,
            velocity: 0,
            radius: this.config.game.duckSize,
            rotation: 0
        };

        // Pipes
        this.pipes = [];

        // Audio
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.currentVolume = -80;
        this.isSpeaking = false;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.startGame = this.startGame.bind(this);
        this.restartGame = this.restartGame.bind(this);

        // Initialize
        this.setupUI();
        this.setupSettings();
        this.drawStartScreen();
    }

    setupUI() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.initAudio();
        });

        // Restart button
        document.getElementById('restartBtn').addEventListener('click', this.restartGame);
    }

    setupSettings() {
        // Audio settings
        this.setupSlider('silenceThreshold', 'audio', 'silenceThreshold');
        this.setupSlider('minVolume', 'audio', 'minVolume');
        this.setupSlider('smoothing', 'audio', 'smoothing', (value) => {
            if (this.analyser) {
                this.analyser.smoothingTimeConstant = value;
            }
        });

        // Physics settings
        this.setupSlider('gravity', 'physics', 'gravity');
        this.setupSlider('baseLift', 'physics', 'baseLift');
        this.setupSlider('maxLift', 'physics', 'maxLift');
        this.setupSlider('fallMultiplier', 'physics', 'fallMultiplier');
        this.setupSlider('maxVelocityUp', 'physics', 'maxVelocityUp');
        this.setupSlider('maxVelocityDown', 'physics', 'maxVelocityDown');
        this.setupSlider('dampening', 'physics', 'dampening');

        // Game settings
        this.setupSlider('pipeGap', 'game', 'pipeGap');
        this.setupSlider('pipeSpeed', 'game', 'pipeSpeed');
        this.setupSlider('pipeSpacing', 'game', 'pipeSpacing');
        this.setupSlider('duckSize', 'game', 'duckSize', (value) => {
            this.duck.radius = value;
        });

        // Reset button
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            this.updateAllSliders();
            this.duck.radius = this.config.game.duckSize;
        });
    }

    setupSlider(id, category, property, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.config[category][property] = value;
            valueDisplay.textContent = value;

            // Update threshold line position for silence threshold
            if (id === 'silenceThreshold') {
                this.updateThresholdLine();
            }

            if (callback) callback(value);
        });
    }

    updateAllSliders() {
        const updateSlider = (id, category, property) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(id + 'Value');
            const value = this.config[category][property];
            slider.value = value;
            valueDisplay.textContent = value;
        };

        // Update all sliders
        updateSlider('silenceThreshold', 'audio', 'silenceThreshold');
        updateSlider('minVolume', 'audio', 'minVolume');
        updateSlider('smoothing', 'audio', 'smoothing');
        updateSlider('gravity', 'physics', 'gravity');
        updateSlider('baseLift', 'physics', 'baseLift');
        updateSlider('maxLift', 'physics', 'maxLift');
        updateSlider('fallMultiplier', 'physics', 'fallMultiplier');
        updateSlider('maxVelocityUp', 'physics', 'maxVelocityUp');
        updateSlider('maxVelocityDown', 'physics', 'maxVelocityDown');
        updateSlider('dampening', 'physics', 'dampening');
        updateSlider('pipeGap', 'game', 'pipeGap');
        updateSlider('pipeSpeed', 'game', 'pipeSpeed');
        updateSlider('pipeSpacing', 'game', 'pipeSpacing');
        updateSlider('duckSize', 'game', 'duckSize');

        this.updateThresholdLine();
    }

    updateThresholdLine() {
        const threshold = this.config.audio.silenceThreshold;
        const minVol = -80;
        const maxVol = -10;
        const percentage = ((threshold - minVol) / (maxVol - minVol)) * 100;
        document.getElementById('thresholdLine').style.left = percentage + '%';
    }

    async initAudio() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                }
            });

            // Setup audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.audio.fftSize;
            this.analyser.smoothingTimeConstant = this.config.audio.smoothing;

            // Connect microphone
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            // Setup data array
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            // Start game
            this.startGame();

        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('Microphone access is required to play this game. Please allow microphone access and try again.');
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.frameCount = 0;
        this.duck.y = this.config.game.duckStartY;
        this.duck.velocity = 0;
        this.pipes = [];

        // Hide start screen
        document.getElementById('startScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');

        // Start game loop
        this.gameLoop();
    }

    restartGame() {
        this.startGame();
    }

    getVolumeLevel() {
        if (!this.analyser) return -80;

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i] * this.dataArray[i];
        }
        const rms = Math.sqrt(sum / this.dataArray.length);

        // Convert to decibels
        const db = 20 * Math.log10(rms / 255);

        return isFinite(db) ? db : -80;
    }

    updatePhysics() {
        // Get current volume
        this.currentVolume = this.getVolumeLevel();

        // Check if speaking (above silence threshold)
        this.isSpeaking = this.currentVolume > this.config.audio.silenceThreshold;

        // Update voice indicator
        this.updateVoiceIndicator();

        // Apply physics
        if (this.isSpeaking) {
            // Calculate lift based on volume
            const volumeRange = this.config.audio.maxVolume - this.config.audio.minVolume;
            const volumeNormalized = Math.max(0, Math.min(1,
                (this.currentVolume - this.config.audio.minVolume) / volumeRange
            ));

            // Apply lift force (interpolate between base and max lift)
            const liftForce = this.config.physics.baseLift +
                (this.config.physics.maxLift - this.config.physics.baseLift) * volumeNormalized;

            this.duck.velocity -= liftForce;
        } else {
            // Apply increased gravity when silent
            this.duck.velocity += this.config.physics.gravity * this.config.physics.fallMultiplier;
        }

        // Always apply base gravity for smooth descent
        this.duck.velocity += this.config.physics.gravity;

        // Apply dampening for smooth motion
        this.duck.velocity *= this.config.physics.dampening;

        // Clamp velocity
        this.duck.velocity = Math.max(
            -this.config.physics.maxVelocityUp,
            Math.min(this.config.physics.maxVelocityDown, this.duck.velocity)
        );

        // Update position
        this.duck.y += this.duck.velocity;

        // Update rotation based on velocity
        this.duck.rotation = Math.max(-30, Math.min(30, this.duck.velocity * 3));

        // Check boundaries
        if (this.duck.y - this.duck.radius < 0) {
            this.duck.y = this.duck.radius;
            this.duck.velocity = 0;
        }

        if (this.duck.y + this.duck.radius > this.canvas.height) {
            this.gameOver();
        }
    }

    updateVoiceIndicator() {
        const voiceBar = document.getElementById('voiceBar');
        const voiceStatus = document.getElementById('voiceStatus');

        // Calculate percentage (map -80 to 0, -10 to 100)
        const minVol = -80;
        const maxVol = -10;
        const percentage = Math.max(0, Math.min(100,
            ((this.currentVolume - minVol) / (maxVol - minVol)) * 100
        ));

        voiceBar.style.width = percentage + '%';

        if (this.isSpeaking) {
            voiceStatus.textContent = 'Speaking';
            voiceStatus.className = 'voice-status speaking';
        } else {
            voiceStatus.textContent = 'Silent';
            voiceStatus.className = 'voice-status silent';
        }
    }

    updatePipes() {
        // Generate new pipes
        if (this.frameCount % Math.floor(this.config.game.pipeSpacing / this.config.game.pipeSpeed) === 0) {
            const gapY = Math.random() * (this.canvas.height - this.config.game.pipeGap - 100) + 50;

            this.pipes.push({
                x: this.canvas.width,
                topHeight: gapY,
                bottomY: gapY + this.config.game.pipeGap,
                scored: false
            });
        }

        // Move and remove pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.config.game.pipeSpeed;

            // Remove off-screen pipes
            if (this.pipes[i].x + this.config.game.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            // Score points
            if (!this.pipes[i].scored && this.pipes[i].x + this.config.game.pipeWidth < this.duck.x) {
                this.pipes[i].scored = true;
                this.score++;
                document.getElementById('scoreDisplay').textContent = this.score;
            }

            // Check collision
            if (this.checkCollision(this.pipes[i])) {
                this.gameOver();
            }
        }
    }

    checkCollision(pipe) {
        const duckLeft = this.duck.x - this.duck.radius;
        const duckRight = this.duck.x + this.duck.radius;
        const duckTop = this.duck.y - this.duck.radius;
        const duckBottom = this.duck.y + this.duck.radius;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.config.game.pipeWidth;

        // Check if duck is within pipe's x range
        if (duckRight > pipeLeft && duckLeft < pipeRight) {
            // Check if duck hits top or bottom pipe
            if (duckTop < pipe.topHeight || duckBottom > pipe.bottomY) {
                return true;
            }
        }

        return false;
    }

    drawDuck() {
        this.ctx.save();
        this.ctx.translate(this.duck.x, this.duck.y);
        this.ctx.rotate((this.duck.rotation * Math.PI) / 180);

        // Duck body
        this.ctx.fillStyle = this.config.visual.duckColor;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.duck.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Duck outline
        this.ctx.strokeStyle = this.config.visual.duckOutlineColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Duck beak
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(this.duck.radius - 5, 0);
        this.ctx.lineTo(this.duck.radius + 10, -5);
        this.ctx.lineTo(this.duck.radius + 10, 5);
        this.ctx.closePath();
        this.ctx.fill();

        // Duck eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.duck.radius / 3, -this.duck.radius / 3, this.duck.radius / 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.duck.radius / 3, -this.duck.radius / 3, this.duck.radius / 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Wing (animated based on velocity)
        const wingFlap = Math.sin(this.frameCount * 0.2) * 5;
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.ellipse(-this.duck.radius / 2, wingFlap, this.duck.radius / 2, this.duck.radius / 3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawPipes() {
        this.ctx.fillStyle = this.config.visual.pipeColor;
        this.ctx.strokeStyle = '#2E7D32';
        this.ctx.lineWidth = 3;

        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.config.game.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, this.config.game.pipeWidth, pipe.topHeight);

            // Top pipe cap
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.config.game.pipeWidth + 10, 30);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 30, this.config.game.pipeWidth + 10, 30);

            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.config.game.pipeWidth, this.canvas.height - pipe.bottomY);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.config.game.pipeWidth, this.canvas.height - pipe.bottomY);

            // Bottom pipe cap
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.config.game.pipeWidth + 10, 30);
            this.ctx.strokeRect(pipe.x - 5, pipe.bottomY, this.config.game.pipeWidth + 10, 30);
        }
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds (simple decoration)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const cloudOffset = (this.frameCount * 0.5) % (this.canvas.width + 200);
        this.drawCloud(cloudOffset - 100, 80);
        this.drawCloud(cloudOffset + 150, 150);
        this.drawCloud(cloudOffset - 50, 220);
    }

    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y - 10, 35, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawStartScreen() {
        this.drawBackground();

        // Draw a demo duck
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2 - 50);

        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 40, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        this.ctx.restore();
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.frameCount++;

        // Update
        this.updatePhysics();
        this.updatePipes();

        // Draw
        this.drawBackground();
        this.drawPipes();
        this.drawDuck();

        // Continue loop
        requestAnimationFrame(this.gameLoop);
    }

    gameOver() {
        this.gameState = 'gameOver';

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.add('active');
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new DuckCanFly();
});
