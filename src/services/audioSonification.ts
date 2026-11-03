import { depthToFrequency } from '../utils/coordinateTransform';

class SonificationEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.65;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isDroneActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Generates a calibrated seismic audio pulse:
   * - Frequency pitch is mapped to focal depth (42 Hz deep to 460 Hz shallow)
   * - Amplitude gain & saturation are mapped to magnitude / energy release
   */
  public triggerSeismicEvent(depthKm: number, magnitude: number, durationSec: number = 1.4) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const baseFreq = depthToFrequency(depthKm);

    // Primary Deep Oscillator (Sine for fundamental planetary resonance)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    // Harmonic Overtone Oscillator (Triangle for crustal texture)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    // Deep events get sub-octave, shallow events get upper harmonic
    const harmonicMult = depthKm > 200 ? 0.5 : 1.5;
    osc2.frequency.setValueAtTime(baseFreq * harmonicMult, now);

    // Depth-tuned Lowpass Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    // Shallower events allow higher acoustic harmonics through
    const cutoffFreq = Math.min(1800, baseFreq * (2.0 + Math.max(0, magnitude - 2)));
    filter.frequency.setValueAtTime(cutoffFreq, now);
    filter.Q.setValueAtTime(2.5, now);

    // Dynamic Gain Envelope (ADSR)
    const eventGain = this.ctx.createGain();
    const peakGain = Math.min(0.9, 0.15 + Math.max(0, magnitude - 2.5) * 0.12);

    eventGain.gain.setValueAtTime(0.0001, now);
    // Sharp P-wave attack (20ms)
    eventGain.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
    // S-wave decay & coda rumble
    eventGain.gain.exponentialRampToValueAtTime(peakGain * 0.45, now + 0.35);
    eventGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    // Routing
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(eventGain);
    eventGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + durationSec + 0.1);
    osc2.stop(now + durationSec + 0.1);
  }

  /**
   * Rapid subtle acoustic tick for interactive hover probing
   */
  public triggerProbeHover(depthKm: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const freq = depthToFrequency(depthKm);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Continuous ambient deep earth sub-drone
   */
  public startAmbientDrone() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isDroneActive) return;

    const now = this.ctx.currentTime;
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();

    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(55, now); // A1 sub-harmonic 55 Hz

    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(82.4, now); // E2 resonant fifth 82.4 Hz

    this.droneGain.gain.setValueAtTime(0.0001, now);
    this.droneGain.gain.linearRampToValueAtTime(0.05, now + 3);

    this.droneOsc1.connect(this.droneGain);
    this.droneOsc2.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start(now);
    this.droneOsc2.start(now);
    this.isDroneActive = true;
  }

  public stopAmbientDrone() {
    if (this.droneGain && this.ctx && this.isDroneActive) {
      const now = this.ctx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneGain?.disconnect();
        } catch {
          // cleanup
        }
        this.isDroneActive = false;
      }, 1600);
    }
  }
}

export const sonification = new SonificationEngine();
