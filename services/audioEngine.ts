import { HearingProfile, EnvironmentMode } from "../types";

export class AudioEngine {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  
  // Nodes
  private micSource: MediaStreamAudioSourceNode | null = null;
  private testSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private filters: BiquadFilterNode[] = [];
  
  // State
  private currentProfile: HearingProfile | null = null;
  private currentMode: EnvironmentMode = 'QUIET';
  private isBypassed: boolean = false;
  private isTesting: boolean = false;
  
  private readonly frequencies = [500, 1000, 2000, 4000, 8000];

  public async initialize(): Promise<void> {
    if (this.context) return; // Already initialized

    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Core Processing Chain Nodes
    this.gainNode = this.context.createGain();
    this.compressor = this.context.createDynamicsCompressor();
    this.analyser = this.context.createAnalyser();

    // Compressor Defaults (Hearing Protection)
    this.compressor.threshold.value = -20;
    this.compressor.knee.value = 40;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0;
    this.compressor.release.value = 0.25;

    // Analyser Defaults
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.5;

    // Initialize Filter Bank (disconnected initially)
    this.filters = this.frequencies.map(freq => {
      const filter = this.context!.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.0;
      filter.gain.value = 0;
      return filter;
    });

    // Start with Mic
    await this.useMicrophone();
  }

  private async useMicrophone() {
    if (!this.context) return;
    
    // Stop test source if playing
    if (this.testSource) {
      try { this.testSource.stop(); } catch(e) {}
      this.testSource.disconnect();
      this.testSource = null;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,
        noiseSuppression: false, // We want to process raw audio if possible
        autoGainControl: false,
        latency: 0
      } as any });

      this.micSource = this.context.createMediaStreamSource(this.stream);
      this.connectChain(this.micSource);
    } catch (e) {
      console.error("Mic Error:", e);
    }
  }

  public startTestAudio() {
    if (!this.context) return;
    this.isTesting = true;

    // Disconnect Mic
    if (this.micSource) {
      this.micSource.disconnect();
    }

    // Create Pink Noise Buffer for testing EQ
    const bufferSize = 2 * this.context.sampleRate;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Pink noise generation
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // Lower volume
        b6 = white * 0.115926;
    }

    this.testSource = this.context.createBufferSource();
    this.testSource.buffer = buffer;
    this.testSource.loop = true;
    
    this.connectChain(this.testSource);
    this.testSource.start();
  }

  public async stopTestAudio() {
    this.isTesting = false;
    if (this.testSource) {
      this.testSource.stop();
      this.testSource.disconnect();
      this.testSource = null;
    }
    // Revert to Mic
    await this.useMicrophone();
  }

  private connectChain(sourceNode: AudioNode) {
    if (!this.context) return;

    // Disconnect everything first to be safe
    sourceNode.disconnect();
    this.filters.forEach(f => f.disconnect());
    this.compressor!.disconnect();
    this.gainNode!.disconnect();
    this.analyser!.disconnect();

    let currentNode = sourceNode;

    // 1. Filter Chain
    this.filters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });

    // 2. Compressor
    currentNode.connect(this.compressor!);

    // 3. Master Gain
    this.compressor!.connect(this.gainNode!);

    // 4. Analyser
    this.gainNode!.connect(this.analyser!);

    // 5. Output
    this.analyser!.connect(this.context.destination);
  }

  public setProfile(profile: HearingProfile) {
    this.currentProfile = profile;
    this.applySettings();
  }

  public setEnvironment(mode: EnvironmentMode) {
    this.currentMode = mode;
    this.applySettings();
  }

  public setBypass(bypass: boolean) {
    this.isBypassed = bypass;
    this.applySettings();
  }

  private applySettings() {
    if (!this.context || !this.currentProfile) return;

    // Base Gains from Profile
    const baseGains = { ...this.currentProfile.eqBands };

    // Apply Environment Offsets
    // This logic implements the specific hearing requirements
    if (!this.isBypassed) {
      switch (this.currentMode) {
        case 'CONVERSATION':
          // Boost Speech (1k-4k), Cut Rumbe (500), Cut Hiss (8k)
          // Helping user listen to only the person's audio in crowded area
          baseGains[500] -= 5; 
          baseGains[1000] += 4;
          baseGains[2000] += 6;
          baseGains[4000] += 4;
          baseGains[8000] -= 2;
          this.compressor!.threshold.value = -30; // Aggressive compression for consistent volume
          break;
        case 'NOISY':
          // Cut background noise aggressively
          baseGains[500] -= 10;
          baseGains[1000] += 2;
          baseGains[2000] += 5; // Focus on clarity
          baseGains[8000] -= 5; // Cut high pitch noise
          this.compressor!.threshold.value = -15; 
          break;
        case 'QUIET':
        default:
          // True to profile
          this.compressor!.threshold.value = -20;
          break;
      }
    }

    // Apply to nodes
    this.filters.forEach(filter => {
      const freq = filter.frequency.value as keyof HearingProfile['eqBands'];
      // If bypassed, gain is 0 (flat), otherwise Profile + Environment Mode
      const targetGain = this.isBypassed ? 0 : (baseGains[freq] || 0);
      filter.gain.setTargetAtTime(targetGain, this.context!.currentTime, 0.2);
    });
  }

  public setMasterVolume(value: number) {
    if (this.gainNode && this.context) {
      this.gainNode.gain.setTargetAtTime(value, this.context.currentTime, 0.1);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public isRunning(): boolean {
    return !!this.context && this.context.state === 'running';
  }

  public stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    if (this.testSource) {
      this.testSource.stop();
    }
    if (this.context) {
      this.context.close();
    }
    this.context = null;
  }
}

export const audioEngine = new AudioEngine();