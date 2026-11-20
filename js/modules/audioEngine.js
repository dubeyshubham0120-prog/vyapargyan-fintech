// Rural Fintech Literacy & Access Platform - Audio Engine (TTS + Voice Recog)

class AudioEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isMuted = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.langMap = {
      hi: 'hi-IN',
      en: 'en-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      bn: 'bn-IN'
    };
    this.onStateChange = null;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
    }
  }

  speak(text, langCode = 'hi') {
    if (this.isMuted || !this.synth) {
      console.log("[AudioEngine Mock Read]", text);
      this.triggerVisualAudioPulse();
      return;
    }

    this.synth.cancel(); // stop previous

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.langMap[langCode] || 'hi-IN';
    utterance.rate = 0.92; // Slightly slower, clear pace for rural users
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true);
      this.triggerVisualAudioPulse();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    if (this.onStateChange) this.onStateChange(false);
  }

  triggerVisualAudioPulse() {
    const waveElem = document.getElementById('global-audio-wave');
    if (waveElem) {
      waveElem.classList.add('playing');
      setTimeout(() => waveElem.classList.remove('playing'), 4000);
    }
  }

  startSpeechRecognition(langCode = 'hi', onResult, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input simulated! Speech recognition is enabled via fallback.");
      onResult("Main har hafte 25 hazar ka vyapar karta hoon.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = this.langMap[langCode] || 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      onResult(speechToText);
    };

    recognition.onerror = (event) => {
      console.warn("SpeechRec error", event);
      if (onError) onError(event.error);
    };

    recognition.start();
  }
}

export const audioEngine = new AudioEngine();
