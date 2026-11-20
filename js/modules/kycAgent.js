// Rural Fintech Literacy & Access Platform - Document KYC & Agent Module

import { audioEngine } from './audioEngine.js';

export class KycAgent {
  constructor(appContext) {
    this.app = appContext;
  }

  renderKycSection(container) {
    const persona = this.app.getCurrentPersona();

    const html = `
      <div class="kyc-header flex-between mb-3">
        <div>
          <span class="badge badge-accent">Document Assistance & Agent Co-Pilot</span>
          <h2 class="card-title mt-1">Zero-Hassle Voice & OCR KYC Scanner</h2>
          <p class="text-muted">No complicated forms! Scan Mandi slips, Aadhaar, or UPI QR receipts with guided audio feedback.</p>
        </div>
        <button class="btn btn-secondary" id="btn-call-agent">
          📞 Video Call Gramin Mitra (Agent Support)
        </button>
      </div>

      <div class="kyc-grid">
        <!-- Interactive Document Scanner Camera Simulator -->
        <div class="card glass-card scanner-card">
          <h3 class="card-title mb-2">📸 Live OCR Document Scanner</h3>
          <div class="doc-type-selector flex-gap mb-2">
            <button class="btn btn-sm btn-outline doc-type-btn active" data-type="mandi">🌾 Mandi Sale Slip</button>
            <button class="btn btn-sm btn-outline doc-type-btn" data-type="aadhaar">🪪 Aadhaar Card</button>
            <button class="btn btn-sm btn-outline doc-type-btn" data-type="udyam">📜 Udyam MSME</button>
            <button class="btn btn-sm btn-outline doc-type-btn" data-type="upi">📱 UPI QR Statement</button>
          </div>

          <div class="camera-viewport-box" id="camera-viewport">
            <div class="camera-grid-overlay">
              <div class="scan-laser-line" id="scan-laser"></div>
              <div class="scan-frame-corners"></div>
              <div class="camera-status-overlay" id="camera-status-lbl">
                📷 Align document inside the yellow frame
              </div>
            </div>
            <img src="./assets/rural_hero.png" class="cam-sample-img" alt="Sample Doc">
          </div>

          <div class="scanner-actions flex-between mt-3">
            <button class="btn btn-audio btn-sm" id="btn-audio-kyc">
              🔊 Listen Alignment Guide
            </button>
            <button class="btn btn-primary" id="btn-trigger-scan">
              ⚡ Capture & OCR Scan
            </button>
          </div>
        </div>

        <!-- OCR Extracted Fields Output -->
        <div class="card glass-card ocr-result-card">
          <h3 class="card-title">🔍 OCR Extracted Verification Data</h3>
          <p class="text-muted text-sm mb-3">Verified automatically via Government API & Bank Rails:</p>

          <div id="ocr-results-box" class="ocr-fields-list">
            <div class="ocr-field-row">
              <span class="field-label">Document Type:</span>
              <span class="field-value badge badge-success">Verified Mandi Slip</span>
            </div>
            <div class="ocr-field-row">
              <span class="field-label">Merchant Name:</span>
              <span class="field-value">${persona.name}</span>
            </div>
            <div class="ocr-field-row">
              <span class="field-label">Transaction Volume:</span>
              <span class="field-value">₹${(persona.monthlyTurnover).toLocaleString()} (Last 30 Days)</span>
            </div>
            <div class="ocr-field-row">
              <span class="field-label">Mandi License Code:</span>
              <span class="field-value">MND-UP-2026-8942</span>
            </div>
            <div class="ocr-field-row">
              <span class="field-label">Verification Status:</span>
              <span class="field-value text-green">✓ 100% Authentic Match</span>
            </div>
          </div>

          <div class="verification-badge-box mt-3 p-2 border-rounded text-center">
            🔒 Protected by Voice Consent Protocols. No fine print hidden sharing.
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  attachEvents(container) {
    const laser = container.querySelector('#scan-laser');
    const statusLbl = container.querySelector('#camera-status-lbl');
    const triggerScan = container.querySelector('#btn-trigger-scan');
    const ocrBox = container.querySelector('#ocr-results-box');

    let currentDocType = 'mandi';

    container.querySelectorAll('.doc-type-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.doc-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDocType = btn.dataset.type;
        statusLbl.innerText = `📷 Align ${btn.innerText} inside frame`;
      };
    });

    container.querySelector('#btn-audio-kyc').onclick = () => {
      audioEngine.speak("Kagaj ko camere ke samne rakhein. Chintat hone par local Gramin Mitra se madad lein.", this.app.state.language);
    };

    triggerScan.onclick = () => {
      laser.style.display = 'block';
      statusLbl.innerText = "⏳ Scanning & verifying document signatures...";
      audioEngine.speak("Kagaj ki janch ho rahi hai, kripya thoda intzar karein.", this.app.state.language);

      setTimeout(() => {
        laser.style.display = 'none';
        statusLbl.innerText = "✓ Document Verified Successfully!";
        
        const persona = this.app.getCurrentPersona();
        ocrBox.innerHTML = `
          <div class="ocr-field-row">
            <span class="field-label">Document Type:</span>
            <span class="field-value badge badge-success">${currentDocType.toUpperCase()} Verified</span>
          </div>
          <div class="ocr-field-row">
            <span class="field-label">Document Holder:</span>
            <span class="field-value">${persona.name}</span>
          </div>
          <div class="ocr-field-row">
            <span class="field-label">Verification ID:</span>
            <span class="field-value">VER-2026-${Math.floor(100000 + Math.random()*900000)}</span>
          </div>
          <div class="ocr-field-row">
            <span class="field-label">Authenticity Index:</span>
            <span class="field-value text-green">✓ 99.8% Match</span>
          </div>
        `;

        audioEngine.speak("Dastavez safaltapoorvak verify ho gaya hai!", this.app.state.language);
      }, 2500);
    };

    container.querySelector('#btn-call-agent').onclick = () => {
      this.openAgentCallModal();
    };
  }

  openAgentCallModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="modal-agent">
        <div class="modal-box agent-call-box">
          <div class="modal-header flex-between">
            <h3>📞 Gramin Mitra — Local Agent Video Assistance</h3>
            <button class="btn-close" id="modal-close-agent">×</button>
          </div>
          <div class="modal-body text-center">
            <div class="agent-video-simulator">
              <div class="agent-avatar-lg">👩‍💼</div>
              <h4 class="mt-2">Sunita Sharma (Block Gramin Mitra)</h4>
              <p class="text-sm text-muted">Chandauli District • SHG Micro-Finance Specialist</p>
              <div class="call-pulse mt-2">● Live Video Assistance Connected</div>
            </div>

            <div class="agent-speech-bubble mt-3">
              "Namaste! Main Sunita hoon. Kya aapko dukan ke kagaj upload karne ya loan chunne mein koi dikkat aa rahi hai? Main aapki madad ke liye taiyar hoon."
            </div>
          </div>
          <div class="modal-footer flex-between">
            <button class="btn btn-secondary" id="btn-agent-audio">🔊 Listen Agent</button>
            <button class="btn btn-primary" id="btn-book-visit">📅 Request Free In-Person Visit</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal-agent');
    document.getElementById('modal-close-agent').onclick = () => modal.remove();

    document.getElementById('btn-agent-audio').onclick = () => {
      audioEngine.speak("Namaste! Main Sunita hoon. Kya aapko dukan ke kagaj upload karne mein madad chahiye?", this.app.state.language);
    };

    document.getElementById('btn-book-visit').onclick = () => {
      alert("Gramin Mitra visit requested! Agent Sunita will visit your store tomorrow between 10 AM - 12 PM.");
      modal.remove();
    };
  }
}
