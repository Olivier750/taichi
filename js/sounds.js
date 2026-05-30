/**
 * Zen Audio Synthesizer using Web Audio API
 */
class ZenSounds {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Synthesizes a deep Tibetan singing bowl sound
     */
    playBowl() {
        this.init();
        const now = this.ctx.currentTime;
        
        // Base frequencies for singing bowl harmonics
        const fund = 180; // 180 Hz base
        const ratios = [1.0, 1.51, 1.98, 2.44, 3.01];
        const gains = [0.4, 0.25, 0.15, 0.08, 0.04];
        
        const mainGain = this.ctx.createGain();
        mainGain.gain.setValueAtTime(0.001, now);
        mainGain.gain.linearRampToValueAtTime(0.6, now + 0.3);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);
        mainGain.connect(this.ctx.destination);

        // LFO for the beating / vibration effect
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(4, now); // 4Hz vibration
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.15, now);
        lfo.connect(lfoGain);

        ratios.forEach((ratio, index) => {
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(fund * ratio, now);
            
            // Apply slight frequency detune for richness
            osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
            
            oscGain.gain.setValueAtTime(gains[index], now);
            
            // Connect LFO to vibrate the main frequencies slightly
            if (index < 2) {
                lfoGain.connect(osc.detune);
            }
            
            osc.connect(oscGain);
            oscGain.connect(mainGain);
            
            osc.start(now);
            osc.stop(now + 5.2);
        });

        lfo.start(now);
        lfo.stop(now + 5.2);
    }

    /**
     * Synthesizes a resonant Zen Gong sound
     */
    playGong() {
        this.init();
        const now = this.ctx.currentTime;

        const fund = 110; // Low frequency base for gong
        const ratios = [1.0, 1.48, 1.95, 2.62, 3.11, 4.15];
        const gains = [0.5, 0.3, 0.2, 0.15, 0.08, 0.04];

        const mainGain = this.ctx.createGain();
        mainGain.gain.setValueAtTime(0.001, now);
        // Sudden strike, then very long decay
        mainGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
        mainGain.gain.exponentialRampToValueAtTime(0.15, now + 1.5);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 7.0);
        mainGain.connect(this.ctx.destination);

        // Slow low frequency modulation for gong metallic shimmer
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(6, now); // 6Hz shimmer
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(15, now); // detune range
        lfo.connect(lfoGain);

        ratios.forEach((ratio, index) => {
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            
            // Mix sine and triangle for metallic strike
            osc.type = index % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(fund * ratio, now);
            
            oscGain.gain.setValueAtTime(gains[index], now);
            // Quick decay on high frequencies, longer on low
            const decayTime = 7.0 / (index * 0.7 + 1);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

            lfoGain.connect(osc.detune);

            osc.connect(oscGain);
            oscGain.connect(mainGain);
            
            osc.start(now);
            osc.stop(now + 7.2);
        });

        lfo.start(now);
        lfo.stop(now + 7.2);
    }
}

// Export a single instance to be used globally
window.zenSounds = new ZenSounds();
