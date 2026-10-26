// Web Audio Engine: High-fidelity Polyphonic Synthesis for Guitar, Piano, Rhodes & Pad
import { noteToMidi, midiToFrequency } from './theory';
import { InstrumentType, PlaybackStyle } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private guitarBufferCache = new Map<number, AudioBuffer>();

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Compressor / Limiter to prevent clipping with 10 polyphonic notes
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-2, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(6, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Sets master volume (0.0 to 1.0)
   */
  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, vol)),
        this.ctx.currentTime,
        0.05
      );
    }
  }

  /**
   * Plays a chord (array of note strings e.g. ["C4", "E4", "G4", "B4"])
   */
  public playChord(
    notes: string[],
    options: {
      instrument: InstrumentType;
      playbackStyle: PlaybackStyle;
      strumSpeedMs: number;
      fadeDuration: number;
    }
  ) {
    if (!notes || notes.length === 0) return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Trigger haptic feedback on supported Android devices
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore haptic failures
      }
    }

    const { instrument, playbackStyle, strumSpeedMs, fadeDuration } = options;

    // Convert notes to MIDI and sort
    const sortedNotes = [...notes]
      .map((n) => ({ noteStr: n, midi: noteToMidi(n) }))
      .sort((a, b) => a.midi - b.midi);

    // Strum ordering
    let playbackList = sortedNotes;
    if (playbackStyle === 'strum_up') {
      playbackList = [...sortedNotes].reverse();
    }

    const now = this.ctx.currentTime;
    const strumDelaySec = Math.max(0, strumSpeedMs) / 1000;

    playbackList.forEach((item, index) => {
      let delay = 0;
      if (playbackStyle === 'strum_down' || playbackStyle === 'strum_up') {
        delay = index * strumDelaySec;
      } else if (playbackStyle === 'arpeggio') {
        delay = index * 0.12;
      }

      const noteTime = now + delay;
      this.playNote(item.midi, instrument, noteTime, fadeDuration);
    });
  }

  /**
   * Synthesizes a single note with instrument timbre
   */
  public playNote(
    midi: number,
    instrument: InstrumentType,
    startTime: number,
    fadeDuration: number
  ) {
    if (!this.ctx || !this.masterGain) return;

    const freq = midiToFrequency(midi);
    const duration = Math.max(0.5, fadeDuration);

    switch (instrument) {
      case 'acoustic_guitar':
        this.playAcousticGuitar(freq, midi, startTime, duration);
        break;
      case 'grand_piano':
        this.playGrandPiano(freq, midi, startTime, duration);
        break;
      case 'rhodes':
        this.playRhodes(freq, midi, startTime, duration);
        break;
      case 'synth_pad':
        this.playSynthPad(freq, midi, startTime, duration);
        break;
      default:
        this.playGrandPiano(freq, midi, startTime, duration);
    }
  }

  /**
   * Generates or fetches a cached Karplus-Strong plucked acoustic guitar buffer
   * Pre-calculated into an AudioBuffer: 100% stable, natural physics, no feedback loops or screeching.
   */
  private getGuitarBuffer(freq: number, midi: number): AudioBuffer {
    if (this.guitarBufferCache.has(midi) && this.ctx) {
      return this.guitarBufferCache.get(midi)!;
    }

    const sampleRate = this.ctx ? this.ctx.sampleRate : 44100;
    const period = Math.max(2, Math.round(sampleRate / freq));
    // 3.5 seconds buffer is plenty for full acoustic decay
    const bufferDuration = 3.5;
    const bufferLength = Math.floor(sampleRate * bufferDuration);
    const buffer = this.ctx!.createBuffer(1, bufferLength, sampleRate);
    const data = buffer.getChannelData(0);

    // Initial pluck transient (pick excitation)
    for (let i = 0; i < period; i++) {
      const window = Math.sin((i / period) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * window * 0.85;
    }

    // Karplus-Strong string algorithm: low-pass moving average filter with acoustic string tension loss
    // Low bass strings sustain longer (0.996), high treble strings decay faster (0.992)
    const loss = Math.min(0.996, Math.max(0.988, 1 - 0.0025 * Math.log2(Math.max(60, freq) / 80)));

    for (let i = period; i < bufferLength; i++) {
      const prev1 = data[i - period];
      const prev2 = i - period - 1 >= 0 ? data[i - period - 1] : 0;
      data[i] = 0.5 * (prev1 + prev2) * loss;
    }

    this.guitarBufferCache.set(midi, buffer);
    return buffer;
  }

  /**
   * High-quality Clean Acoustic Guitar:
   * Plucked string AudioBuffer + acoustic guitar body warmth filter + stereo spread
   */
  private playAcousticGuitar(freq: number, midi: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const buffer = this.getGuitarBuffer(freq, midi);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    // Body Warmth Filter: subtle peak at 200Hz for acoustic soundboard fullness, and lowpass cutoff at 5500Hz to eliminate digital harshness
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'peaking';
    bodyFilter.frequency.setValueAtTime(200, startTime);
    bodyFilter.Q.setValueAtTime(1.8, startTime);
    bodyFilter.gain.setValueAtTime(3.0, startTime);

    const warmCutoff = this.ctx.createBiquadFilter();
    warmCutoff.type = 'lowpass';
    warmCutoff.frequency.setValueAtTime(5200, startTime);

    // Volume Envelope
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.75, startTime);
    // Smooth exponential fade-out
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Stereo panning based on string pitch (low notes left, high notes right)
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      const panVal = Math.max(-0.5, Math.min(0.5, (midi - 52) / 28));
      panner.pan.setValueAtTime(panVal, startTime);
    }

    source.connect(bodyFilter);
    bodyFilter.connect(warmCutoff);
    warmCutoff.connect(noteGain);

    if (panner) {
      noteGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      noteGain.connect(this.masterGain);
    }

    source.start(startTime);
    source.stop(startTime + duration);

    setTimeout(() => {
      try {
        source.disconnect();
        bodyFilter.disconnect();
        warmCutoff.disconnect();
        noteGain.disconnect();
        if (panner) panner.disconnect();
      } catch {
        // Disconnect cleanup
      }
    }, (duration + 0.5) * 1000);
  }

  /**
   * Acoustic Grand Piano with multi-harmonic hammer transient and sustained resonance
   */
  private playGrandPiano(freq: number, midi: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // 4 harmonic partials for rich grand piano tone
    const harmonics = [
      { ratio: 1.0, gain: 0.65 },
      { ratio: 2.0, gain: 0.28 },
      { ratio: 3.0, gain: 0.12 },
      { ratio: 4.0, gain: 0.05 },
    ];

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, startTime);
    // Instant hammer attack (3ms)
    noteGain.gain.linearRampToValueAtTime(0.6, startTime + 0.003);
    // Natural acoustic two-stage decay
    const halfTime = startTime + Math.min(0.8, duration * 0.4);
    noteGain.gain.exponentialRampToValueAtTime(0.2, halfTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Piano soundboard filter
    const soundboard = this.ctx.createBiquadFilter();
    soundboard.type = 'lowpass';
    soundboard.frequency.setValueAtTime(Math.min(10000, freq * 7), startTime);

    // Stereo Panning (lower piano keys left, higher right)
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      const panVal = Math.max(-0.5, Math.min(0.5, (midi - 60) / 36));
      panner.pan.setValueAtTime(panVal, startTime);
    }

    const oscs: OscillatorNode[] = [];

    harmonics.forEach((h) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const partialGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.ratio, startTime);
      partialGain.gain.setValueAtTime(h.gain, startTime);

      osc.connect(partialGain);
      partialGain.connect(soundboard);
      osc.start(startTime);
      osc.stop(startTime + duration);
      oscs.push(osc);
    });

    if (panner) {
      soundboard.connect(noteGain);
      noteGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      soundboard.connect(noteGain);
      noteGain.connect(this.masterGain);
    }

    setTimeout(() => {
      try {
        oscs.forEach((o) => o.disconnect());
        soundboard.disconnect();
        noteGain.disconnect();
      } catch {
        // Disconnect cleanup
      }
    }, (duration + 0.5) * 1000);
  }

  /**
   * Electric Piano (Rhodes style bell tone FM synthesis)
   */
  private playRhodes(freq: number, midi: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // Carrier
    const carrier = this.ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, startTime);

    // Modulator for chime/bell attack
    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * 3.0, startTime);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(freq * 1.5, startTime);
    modGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.005);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    carrier.connect(noteGain);
    noteGain.connect(this.masterGain);

    modulator.start(startTime);
    carrier.start(startTime);
    modulator.stop(startTime + duration);
    carrier.stop(startTime + duration);
  }

  /**
   * Ambient Warm Synth Pad
   */
  private playSynthPad(freq: number, midi: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Detuning for lush width
    osc1.frequency.setValueAtTime(freq * 0.997, startTime);
    osc2.frequency.setValueAtTime(freq * 1.003, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, startTime);

    const noteGain = this.ctx.createGain();
    // Soft pad attack (120ms)
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.12);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }
}

// Global Singleton
export const audioEngine =
  typeof window !== 'undefined' ? new SoundEngine() : (null as unknown as SoundEngine);
