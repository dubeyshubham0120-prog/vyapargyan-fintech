// VyaparGyan - Gyan Real-Time Hindi Voice & Text Agent Client (Gemini Live Integration)

export class GyanVoiceAgent {
  constructor(appContext) {
    this.app = appContext;
    this.ws = null;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.audioContext = null;
    this.currentAudio = null;
    this.audioQueue = [];
    this.isListening = false;
    this.isSpeaking = false;
    this.isConnected = false;
    this.hasGreeted = false; // Flag to prevent repeated greetings on turns
    this.serverUrl = window.GYAN_SERVER_URL || "http://localhost:8080";
    this.wsFallbackUrl = window.GYAN_WS_URL || "ws://localhost:8080/ws/voice";
    this.status = "idle"; // idle, connecting, listening, thinking, speaking
  }

  initWidget() {
    this.renderWidget();
    this.attachWidgetEvents();
  }

  renderWidget() {
    const existing = document.getElementById('gyan-voice-widget');
    if (existing) existing.remove();

    const widgetHtml = `
      <div id="gyan-voice-widget" class="gyan-floating-widget">
        <!-- Main Floating Mic Button -->
        <button id="btn-gyan-mic" class="gyan-mic-btn idle" title="Talk to Gyan (Gemini Live Voice Agent)">
          <div class="mic-icon-box">🎙️</div>
          <div class="mic-pulse-ring"></div>
        </button>

        <!-- Status & Chat Overlay Card -->
        <div id="gyan-chat-card" class="gyan-card glass-card" style="display: none;">
          <div class="gyan-card-header flex-between">
            <div class="flex-gap align-center">
              <span class="gyan-avatar">👨‍🏫</span>
              <div>
                <strong>Gyan (Voice & Financial Assistant)</strong>
                <div class="gyan-status-lbl" id="gyan-status-lbl">Offline • Click Mic to Start</div>
              </div>
            </div>
            <button class="btn-close" id="btn-close-gyan">×</button>
          </div>

          <!-- Timer & Guardrail Banner -->
          <div class="gyan-banner" id="gyan-banner">
            🛡️ Confidentiality Shield: Never share OTP/PIN. Powered by Gemini Live.
          </div>

          <!-- Live Chat Stream -->
          <div class="gyan-chat-body" id="gyan-chat-stream"></div>

          <!-- Quick Text & Voice Input -->
          <div class="gyan-card-footer flex-gap">
            <input type="text" id="gyan-text-input" placeholder="Type or speak in Hindi/English/Marathi..." class="form-select-sm" style="flex:1;">
            <button class="btn btn-primary btn-sm" id="btn-send-gyan-text">Send</button>
            <button class="btn btn-audio btn-sm" id="btn-interrupt-gyan" style="display:none;">🛑 Interrupt</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHtml);
  }

  unlockAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioContext = new AudioCtx();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(e => console.warn("[Gyan Agent] AudioContext resume error:", e));
    }
  }

  attachWidgetEvents() {
    const micBtn = document.getElementById('btn-gyan-mic');
    const chatCard = document.getElementById('gyan-chat-card');
    const closeBtn = document.getElementById('btn-close-gyan');
    const sendBtn = document.getElementById('btn-send-gyan-text');
    const textInput = document.getElementById('gyan-text-input');
    const interruptBtn = document.getElementById('btn-interrupt-gyan');

    // Hold-to-talk: start on press, stop on release
    const startHold = async (e) => {
      e.preventDefault();
      console.log("[Gyan Agent] Mic pressed / clicked");
      this.unlockAudioContext();
      chatCard.style.display = 'block';

      // Keep single persistent session: only connect if not already open
      if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log("[Gyan Agent] Socket not connected, opening single persistent session...");
        await this.connect();

        let attempts = 0;
        while ((!this.ws || this.ws.readyState !== WebSocket.OPEN) && attempts < 25) {
          await new Promise(r => setTimeout(r, 200));
          attempts++;
        }
      }

      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.startListening();
      } else {
        console.warn("[Gyan Agent] Mic click: WebSocket could not be opened in time");
      }
    };

    const endHold = (e) => {
      e.preventDefault();
      console.log("[Gyan Agent] Mic released");
      this.stopListening();
    };

    micBtn.addEventListener('mousedown', startHold);
    micBtn.addEventListener('touchstart', startHold);
    micBtn.addEventListener('mouseup', endHold);
    micBtn.addEventListener('mouseleave', endHold);
    micBtn.addEventListener('touchend', endHold);
    micBtn.addEventListener('touchcancel', endHold);

    // Spacebar hold when input not focused
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement !== textInput) {
        startHold(e);
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        endHold(e);
      }
    });

    closeBtn.onclick = () => {
      console.log("[Gyan Agent] Close button clicked");
      this.disconnect();
      chatCard.style.display = 'none';
    };

    const handleSendText = async () => {
      console.log("[Gyan Agent] Send-button clicked");
      this.unlockAudioContext();
      const val = textInput.value.trim();
      if (!val) {
        console.log("[Gyan Agent] Send-button clicked with empty text, ignoring");
        return;
      }

      chatCard.style.display = 'block';

      // Maintain ONE session across all turns: only connect if socket dropped
      if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log("[Gyan Agent] Socket not open on Send; establishing persistent connection...");
        this.setStatus("connecting");
        await this.connect();

        let attempts = 0;
        while ((!this.ws || this.ws.readyState !== WebSocket.OPEN) && attempts < 25) {
          await new Promise(r => setTimeout(r, 200));
          attempts++;
        }
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log(`[Gyan Agent] Sending text message into active session: "${val}"`);
        this.appendUserMessage(val);
        textInput.value = "";
        this.setStatus("thinking");

        // Send text query to trigger turn immediately
        const payload = JSON.stringify({
          type: "text_query",
          text: val
        });
        this.ws.send(payload);
        console.log("[Gyan Agent] Dispatched JSON payload to WebSocket:", payload);
      } else {
        const errorMsg = "Could not connect to voice server at " + this.wsFallbackUrl;
        console.error("[Gyan Agent] " + errorMsg);
        this.setStatus("error", errorMsg);
        this.appendBotMessage(`⚠️ ${errorMsg}. Please check that the voice server is running.`);
      }
    };

    sendBtn.onclick = handleSendText;
    textInput.onkeypress = (e) => {
      if (e.key === 'Enter') handleSendText();
    };

    interruptBtn.onclick = () => {
      console.log("[Gyan Agent] Interrupt button clicked");
      this.unlockAudioContext();
      this.interrupt();
    };
  }

  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[Gyan Agent] Reusing already open WebSocket session.");
      return;
    }

    console.log("[Gyan Agent] connect() called, opening WebSocket URL:", this.wsFallbackUrl);
    this.setStatus("connecting");

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }

    try {
      this.ws = new WebSocket(this.wsFallbackUrl);
      this.setupWebSocket();
    } catch (e) {
      console.error("[Gyan Agent] WebSocket creation exception:", e);
      this.setStatus("error", `Connection failed: ${e.message}`);
    }
  }

  setupWebSocket() {
    this.ws.onopen = () => {
      console.log(`[Gyan Agent] ws.onopen: Successfully connected to ${this.wsFallbackUrl}`);
      this.isConnected = true;
      this.setStatus("listening");
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        console.log(`[Gyan Agent] ws.onmessage (text, size=${event.data.length} chars):`, event.data.substring(0, 150));
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error("[Gyan Agent] Failed to parse JSON message:", e);
        }
      } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        const size = event.data.size || event.data.byteLength || 0;
        console.log(`[Gyan Agent] ws.onmessage (binary audio chunk, size=${size} bytes)`);
      }
    };

    this.ws.onclose = (event) => {
      console.warn(`[Gyan Agent] ws.onclose: code=${event.code}, reason='${event.reason}', wasClean=${event.wasClean}`);
      this.isConnected = false;
      this.stopListening();
      if (event.code !== 1000) {
        this.setStatus("error", `Server disconnected (code ${event.code})`);
      } else {
        this.setStatus("idle");
      }
    };

    this.ws.onerror = (err) => {
      console.error("[Gyan Agent] ws.onerror:", err);
      this.setStatus("error", `Connection error on ${this.wsFallbackUrl}`);
    };
  }

  handleServerMessage(data) {
    console.log("[Gyan Agent] Processing server event type:", data.type);

    if (data.type === "agent_response") {
      // Check greeting flag
      if (data.is_greeting) {
        if (this.hasGreeted) {
          console.log("[Gyan Agent] Suppressing duplicate greeting bubble.");
          return;
        }
        this.hasGreeted = true;
      }

      if (data.user_text) this.appendUserMessage(data.user_text);
      if (data.text) this.appendBotMessage(data.text, data.guardrail);

      if (data.audio_b64) {
        console.log(`[Gyan Agent] Playing agent audio response (base64 length=${data.audio_b64.length})`);
        this.playAudioB64(data.audio_b64);
      } else {
        if (window.speechSynthesis && data.text && !data.is_greeting) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.text));
        }
        this.setStatus("listening");
      }

      if (data.handoff) {
        setTimeout(() => {
          this.disconnect();
          this.app.switchTab('kyc');
          const kycModule = this.app.kycAgent;
          if (kycModule && kycModule.openAgentCallModal) {
            kycModule.openAgentCallModal();
          }
        }, 2000);
      }
    } else if (data.type === "agent_transcript") {
      console.log(`[Gyan Agent] Live streaming transcript chunk: "${data.text}"`);
    } else if (data.type === "interrupted") {
      console.log("[Gyan Agent] Agent interrupted by user speech");
      this.stopAudioPlayback();
      this.setStatus("listening");
    } else if (data.type === "turn_complete") {
      console.log("[Gyan Agent] Agent turn complete");
    } else if (data.type === "timeout" || data.type === "error") {
      console.error("[Gyan Agent] Server reported error:", data.message);
      this.appendBotMessage(`⚠️ ${data.message}`);
      this.setStatus("error", data.message);
      this.disconnect();
    }
  }

  startListening() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = "Microphone access is not supported in this browser.";
      console.error("[Gyan Agent] " + err);
      alert(err);
      return;
    }

    console.log("[Gyan Agent] Starting audio capture with getUserMedia...");
    navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
      .then(stream => {
        console.log("[Gyan Agent] Microphone access granted, stream active");
        this.audioStream = stream;
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        // Stream audio in real-time slices (250ms chunks) directly into the live Gemini session
        this.mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then(buffer => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(buffer);
              }
            });
          }
        };

        this.mediaRecorder.onstop = () => {
          console.log("[Gyan Agent] MediaRecorder stopped");
          this.setStatus("thinking");
        };

        // Emit chunks every 250ms for low latency
        this.mediaRecorder.start(250);
        this.isListening = true;
        this.setStatus("listening");

        // Limit recording to 6 seconds if held continuously
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
            console.log("[Gyan Agent] Max recording duration reached (6s), stopping...");
            this.mediaRecorder.stop();
          }
        }, 6000);
      })
      .catch(err => {
        console.warn("[Gyan Agent] Microphone access error:", err);
        this.setStatus("error", "Microphone access denied");
        alert("Microphone permission denied. You can still type questions in Hindi/English/Marathi!");
      });
  }

  stopListening() {
    console.log("[Gyan Agent] stopListening() called");
    this.isListening = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }

  interrupt() {
    console.log("[Gyan Agent] Interruption triggered");
    this.stopAudioPlayback();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "interrupt" }));
    }
    this.setStatus("listening");
    this.startListening();
  }

  playAudioB64(b64Data) {
    this.stopAudioPlayback();
    this.unlockAudioContext();
    this.isSpeaking = true;
    this.setStatus("speaking");

    try {
      const audioUrl = "data:audio/wav;base64," + b64Data;
      this.currentAudio = new Audio(audioUrl);

      this.currentAudio.onended = () => {
        console.log("[Gyan Agent] Audio playback finished");
        this.isSpeaking = false;
        this.currentAudio = null;
        this.setStatus("listening");
      };

      this.currentAudio.onerror = (e) => {
        console.warn("[Gyan Agent] Audio element error:", e);
        this.isSpeaking = false;
        this.setStatus("listening");
      };

      const playPromise = this.currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("[Gyan Agent] Autoplay error:", e);
          if (window.speechSynthesis) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Namaste"));
          }
          this.isSpeaking = false;
          this.setStatus("listening");
        });
      }
    } catch (e) {
      console.warn("[Gyan Agent] Audio playback exception:", e);
      this.isSpeaking = false;
      this.setStatus("listening");
    }
  }

  stopAudioPlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isSpeaking = false;
  }

  disconnect() {
    console.log("[Gyan Agent] disconnect() called");
    this.stopListening();
    this.stopAudioPlayback();
    if (this.ws) {
      this.ws.close(1000, "Normal closure by user");
      this.ws = null;
    }
    this.isConnected = false;
    this.hasGreeted = false;
    this.setStatus("idle");
  }

  setStatus(status, errorDetail = null) {
    this.status = status;
    const micBtn = document.getElementById('btn-gyan-mic');
    const statusLbl = document.getElementById('gyan-status-lbl');
    const interruptBtn = document.getElementById('btn-interrupt-gyan');

    if (!micBtn || !statusLbl) return;

    micBtn.className = `gyan-mic-btn ${status}`;

    switch (status) {
      case "connecting":
        statusLbl.innerText = "⏳ Connecting to Gemini Live Server...";
        if (interruptBtn) interruptBtn.style.display = 'none';
        break;
      case "listening":
        statusLbl.innerText = "👂 Listening... Speak in Hindi, English, or Marathi";
        if (interruptBtn) interruptBtn.style.display = 'none';
        break;
      case "thinking":
        statusLbl.innerText = "🧠 Gyan (Gemini Live) is thinking...";
        if (interruptBtn) interruptBtn.style.display = 'none';
        break;
      case "speaking":
        statusLbl.innerText = "🗣️ Gyan is speaking (Click mic or Interrupt to speak)";
        if (interruptBtn) interruptBtn.style.display = 'inline-block';
        break;
      case "error":
        statusLbl.innerText = `⚠️ Error: ${errorDetail || "Connection failed"} • Click Mic to Retry`;
        if (interruptBtn) interruptBtn.style.display = 'none';
        break;
      default:
        statusLbl.innerText = "Offline • Click Mic to Start";
        if (interruptBtn) interruptBtn.style.display = 'none';
    }
  }

  appendUserMessage(text) {
    const stream = document.getElementById('gyan-chat-stream');
    if (!stream) return;
    const msg = document.createElement('div');
    msg.className = 'chat-bubble user-bubble mt-2';
    msg.innerHTML = `<span class="chat-sender">You</span><p>${text}</p>`;
    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
  }

  appendBotMessage(text, guardrail) {
    const stream = document.getElementById('gyan-chat-stream');
    if (!stream) return;

    // Avoid duplicate if last message is identical
    const lastMsg = stream.lastElementChild;
    if (lastMsg && lastMsg.classList.contains('bot-bubble') && lastMsg.textContent.includes(text)) {
      return;
    }

    const msg = document.createElement('div');
    msg.className = `chat-bubble bot-bubble mt-2 ${guardrail ? 'guardrail-alert' : ''}`;
    msg.innerHTML = `<span class="chat-sender">Gyan (ज्ञान - Gemini Live) ${guardrail ? '🛡️ Guardrail' : ''}</span><p>${text}</p>`;
    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
  }
}
