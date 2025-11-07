// Duck Can Fly - Mobile Version
class DuckCanFlyMobile {
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
            y: 300,
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

        // Mobile specific
        this.isFullscreen = false;
        this.settingsOpen = false;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.startGame = this.startGame.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.toggleSettings = this.toggleSettings.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize
        this.setupCanvas();
        this.setupUI();
        this.setupSettings();
        this.drawStartScreen();

        // Handle orientation changes
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = document.querySelector('.game-area');
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;

            // Update duck starting position
            this.duck.y = this.canvas.height / 2;

            if (this.gameState === 'start') {
                this.drawStartScreen();
            }
        };

        resizeCanvas();
        this.handleResize = resizeCanvas;
    }

    setupUI() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.initAudio();
        });

        // Restart button
        document.getElementById('restartBtn').addEventListener('click', this.restartGame);

        // Settings toggle
        document.getElementById('settingsToggle').addEventListener('click', this.toggleSettings);
        document.getElementById('closeSettings').addEventListener('click', this.toggleSettings);

        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', this.toggleFullscreen);

        // Close settings when tapping overlay
        document.addEventListener('click', (e) => {
            if (this.settingsOpen && !e.target.closest('.settings-panel-mobile') && !e.target.closest('#settingsToggle')) {
                this.toggleSettings();
            }
        });
    }

    toggleSettings() {
        this.settingsOpen = !this.settingsOpen;
        const panel = document.getElementById('settingsPanel');
        panel.classList.toggle('active');
    }

    toggleFullscreen() {
        const gameArea = document.querySelector('.game-area');

        if (!this.isFullscreen) {
            // Enter fullscreen
            if (gameArea.requestFullscreen) {
                gameArea.requestFullscreen();
            } else if (gameArea.webkitRequestFullscreen) {
                gameArea.webkitRequestFullscreen();
            } else if (gameArea.mozRequestFullScreen) {
                gameArea.mozRequestFullScreen();
            } else if (gameArea.msRequestFullscreen) {
                gameArea.msRequestFullscreen();
            }
            this.isFullscreen = true;
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
        }

        setTimeout(() => this.handleResize(), 100);
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

        // Game settings
        this.setupSlider('pipeGap', 'game', 'pipeGap');
        this.setupSlider('pipeSpeed', 'game', 'pipeSpeed');
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

        updateSlider('silenceThreshold', 'audio', 'silenceThreshold');
        updateSlider('minVolume', 'audio', 'minVolume');
        updateSlider('smoothing', 'audio', 'smoothing');
        updateSlider('gravity', 'physics', 'gravity');
        updateSlider('baseLift', 'physics', 'baseLift');
        updateSlider('maxLift', 'physics', 'maxLift');
        updateSlider('pipeGap', 'game', 'pipeGap');
        updateSlider('pipeSpeed', 'game', 'pipeSpeed');
        updateSlider('duckSize', 'game', 'duckSize');
    }

    async initAudio() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                }
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.audio.fftSize;
            this.analyser.smoothingTimeConstant = this.config.audio.smoothing;

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.startGame();
        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('Cần quyền truy cập microphone để chơi game. Vui lòng cho phép và thử lại.');
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.frameCount = 0;
        this.duck.y = this.canvas.height / 2;
        this.duck.velocity = 0;
        this.pipes = [];

        document.getElementById('startScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');

        this.gameLoop();
    }

    restartGame() {
        this.startGame();
    }

    getVolumeLevel() {
        if (!this.analyser) return -80;

        this.analyser.getByteFrequencyData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i] * this.dataArray[i];
        }
        const rms = Math.sqrt(sum / this.dataArray.length);
        const db = 20 * Math.log10(rms / 255);

        return isFinite(db) ? db : -80;
    }

    updatePhysics() {
        this.currentVolume = this.getVolumeLevel();
        this.isSpeaking = this.currentVolume > this.config.audio.silenceThreshold;

        this.updateVoiceIndicator();

        if (this.isSpeaking) {
            const volumeRange = this.config.audio.maxVolume - this.config.audio.minVolume;
            const volumeNormalized = Math.max(0, Math.min(1,
                (this.currentVolume - this.config.audio.minVolume) / volumeRange
            ));

            const liftForce = this.config.physics.baseLift +
                (this.config.physics.maxLift - this.config.physics.baseLift) * volumeNormalized;

            this.duck.velocity -= liftForce;
        } else {
            this.duck.velocity += this.config.physics.gravity * this.config.physics.fallMultiplier;
        }

        this.duck.velocity += this.config.physics.gravity;
        this.duck.velocity *= this.config.physics.dampening;

        this.duck.velocity = Math.max(
            -this.config.physics.maxVelocityUp,
            Math.min(this.config.physics.maxVelocityDown, this.duck.velocity)
        );

        this.duck.y += this.duck.velocity;
        this.duck.rotation = Math.max(-30, Math.min(30, this.duck.velocity * 3));

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

        const minVol = -80;
        const maxVol = -10;
        const percentage = Math.max(0, Math.min(100,
            ((this.currentVolume - minVol) / (maxVol - minVol)) * 100
        ));

        voiceBar.style.width = percentage + '%';

        if (this.isSpeaking) {
            voiceStatus.textContent = 'Speaking';
            voiceStatus.className = 'voice-status-mobile speaking';
        } else {
            voiceStatus.textContent = 'Silent';
            voiceStatus.className = 'voice-status-mobile';
        }
    }

    updatePipes() {
        if (this.frameCount % Math.floor(this.config.game.pipeSpacing / this.config.game.pipeSpeed) === 0) {
            const gapY = Math.random() * (this.canvas.height - this.config.game.pipeGap - 100) + 50;

            this.pipes.push({
                x: this.canvas.width,
                topHeight: gapY,
                bottomY: gapY + this.config.game.pipeGap,
                scored: false
            });
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.config.game.pipeSpeed;

            if (this.pipes[i].x + this.config.game.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            if (!this.pipes[i].scored && this.pipes[i].x + this.config.game.pipeWidth < this.duck.x) {
                this.pipes[i].scored = true;
                this.score++;
                document.getElementById('scoreDisplay').textContent = this.score;
            }

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

        if (duckRight > pipeLeft && duckLeft < pipeRight) {
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

        this.ctx.fillStyle = this.config.visual.duckColor;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.duck.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = this.config.visual.duckOutlineColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Beak
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(this.duck.radius - 5, 0);
        this.ctx.lineTo(this.duck.radius + 10, -5);
        this.ctx.lineTo(this.duck.radius + 10, 5);
        this.ctx.closePath();
        this.ctx.fill();

        // Eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.duck.radius / 3, -this.duck.radius / 3, this.duck.radius / 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.duck.radius / 3, -this.duck.radius / 3, this.duck.radius / 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Wing
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
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds
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

        this.updatePhysics();
        this.updatePipes();

        this.drawBackground();
        this.drawPipes();
        this.drawDuck();

        requestAnimationFrame(this.gameLoop);
    }

    gameOver() {
        this.gameState = 'gameOver';

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.add('active');
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new DuckCanFlyMobile();
});
