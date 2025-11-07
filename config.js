// Default Configuration for Duck Can Fly
const DEFAULT_CONFIG = {
    // Audio Settings
    audio: {
        silenceThreshold: -50,    // dB threshold for silence
        minVolume: -45,           // Minimum dB to activate lift
        maxVolume: -10,           // Maximum dB for normalization
        smoothing: 0.8,           // Smoothing factor for audio analysis (0-1)
        fftSize: 2048            // FFT size for frequency analysis
    },

    // Physics Settings
    physics: {
        gravity: 0.5,             // Gravity force (pixels/frame²)
        baseLift: 2,              // Minimum upward force when speaking
        maxLift: 4.5,             // Maximum upward force at loud volume
        fallMultiplier: 2,        // Extra gravity during silence
        maxVelocityUp: 8,         // Maximum upward velocity
        maxVelocityDown: 10,      // Maximum downward velocity
        dampening: 0.92           // Velocity dampening (0-1, closer to 1 = less dampening)
    },

    // Game Settings
    game: {
        pipeGap: 180,            // Gap between top and bottom pipes (pixels)
        pipeSpeed: 3,            // Pipe movement speed (pixels/frame)
        pipeSpacing: 250,        // Distance between pipe pairs (pixels)
        pipeWidth: 60,           // Width of pipes
        duckSize: 25,            // Duck radius (pixels)
        duckStartY: 300          // Duck starting Y position
    },

    // Visual Settings
    visual: {
        backgroundColor: '#87CEEB',  // Sky blue
        pipeColor: '#4CAF50',        // Green pipes
        duckColor: '#FFA500',        // Orange duck
        duckOutlineColor: '#FF8C00'  // Dark orange outline
    }
};

// Export for use in game
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
