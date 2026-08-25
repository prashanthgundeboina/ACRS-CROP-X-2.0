export interface VoiceSettings {
  isMuted: boolean;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

class FieldVoiceGuidanceService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastSpokenText: string = '';
  private lastSpokenTimestamp: number = 0;
  private listeners: Array<(isSpeaking: boolean, currentText: string) => void> = [];
  private isSpeakingState: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('croperx_field_voice_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // ignore
    }
  }

  public subscribe(callback: (isSpeaking: boolean, currentText: string) => void): () => void {
    this.listeners.push(callback);
    callback(this.isSpeakingState, this.lastSpokenText);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isSpeakingState, this.lastSpokenText));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('croperx_field_voice_muted', String(muted));
    } catch {
      // ignore
    }
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public speak(text: string, force: boolean = false, languageCode: string = 'en-US') {
    if (this.isMuted && !force) return;
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Prevent immediate duplicate utterances within 4 seconds unless forced
    const now = Date.now();
    if (text === this.lastSpokenText && now - this.lastSpokenTimestamp < 4000 && !force) {
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Voice selection heuristic
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(languageCode.split('-')[0]) || v.lang === languageCode);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.lastSpokenText = text;
      this.lastSpokenTimestamp = Date.now();
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.isSpeakingState = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis invocation error:', err);
    }
  }

  public replayLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, true);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingState = false;
    this.currentUtterance = null;
    this.notify();
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }
}

export const fieldVoiceGuidanceService = new FieldVoiceGuidanceService();
