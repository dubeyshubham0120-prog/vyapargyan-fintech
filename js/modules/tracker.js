// Rural Fintech Literacy & Access Platform - Application Tracker Module

import { audioEngine } from './audioEngine.js';

export class ApplicationTracker {
  constructor(appContext) {
    this.app = appContext;
  }

  renderTrackerSection(container) {
    const apps = this.app.state.applications || [];

    const html = `
      <div class="tracker-header flex-between mb-3">
        <div>
          <span class="badge badge-accent">No App Re-entry Required</span>
          <h2 class="card-title mt-1">WhatsApp & SMS Status Tracker</h2>
          <p class="text-muted">Receive updates directly on your feature phone or WhatsApp in plain dialect.</p>
        </div>
        <button class="btn btn-audio" id="btn-read-tracker">
          🔊 Read Latest Status
        </button>
      </div>

      <div class="tracker-grid">
        <!-- Main Applications Timeline -->
        <div class="card glass-card timeline-card">
          <h3 class="card-title mb-3">📋 Active Applications Log</h3>
          ${apps.length === 0 ? `
            <div class="empty-state text-center p-4">
              <span style="font-size:3rem;">📦</span>
              <h4 class="mt-2">No Active Applications Yet</h4>
              <p class="text-muted text-sm">Go to the Fintech Marketplace tab to choose a pre-approved loan or insurance policy!</p>
              <button class="btn btn-primary mt-3" id="btn-goto-market">Browse Marketplace</button>
            </div>
          ` : `
            <div class="apps-timeline-list">
              ${apps.map(a => `
                <div class="app-item-card">
                  <div class="flex-between">
                    <div>
                      <span class="badge badge-success">Application #${a.appId}</span>
                      <h4 class="mt-1">${a.productTitle}</h4>
                      <div class="text-sm text-muted">Provider: ${a.lender}</div>
                    </div>
                    <div class="text-right">
                      <div class="status-chip ${a.statusClass}">${a.statusText}</div>
                      <div class="text-sm text-muted mt-1">${a.date}</div>
                    </div>
                  </div>

                  <div class="timeline-steps-bar mt-3">
                    <div class="t-step step-done">
                      <span class="step-dot">✓</span>
                      <span class="step-lbl">Trust Score Verified</span>
                    </div>
                    <div class="t-step step-done">
                      <span class="step-dot">✓</span>
                      <span class="step-lbl">KYC & Vouchers</span>
                    </div>
                    <div class="t-step ${a.step >= 3 ? 'step-done' : 'step-current'}">
                      <span class="step-dot">${a.step >= 3 ? '✓' : '●'}</span>
                      <span class="step-lbl">Bank Sanction</span>
                    </div>
                    <div class="t-step ${a.step >= 4 ? 'step-done' : ''}">
                      <span class="step-dot">${a.step >= 4 ? '✓' : '○'}</span>
                      <span class="step-lbl">UPI Disbursement</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- WhatsApp / SMS Smartphone Preview Simulator -->
        <div class="card glass-card phone-simulator-card">
          <h3 class="card-title mb-2">💬 WhatsApp Live Alert Simulator</h3>
          <p class="text-muted text-sm mb-3">Updates are pushed automatically to the applicant's WhatsApp:</p>

          <div class="whatsapp-phone-frame">
            <div class="wa-header">
              <div class="wa-avatar">💬</div>
              <div>
                <strong>TrustBridge Rural Bot</strong>
                <div class="wa-online">Online • Verified Official</div>
              </div>
            </div>

            <div class="wa-chat-body">
              <div class="wa-msg wa-in">
                <span class="wa-sender">TrustBridge Bot</span>
                <p>Namaste Meena Ji! Aapka <strong>Tyohar Working Capital Loan (₹25,000)</strong> ka Trust Score verification safal raha! 🎉</p>
                <span class="wa-time">10:14 AM</span>
              </div>

              <div class="wa-msg wa-in">
                <span class="wa-sender">Gramin Bank Officer</span>
                <p>Aapki dukan ki haftavari UPI cashflow aur SHG vouching bank dwaara approve ho gayi hai. Total repayment: ₹590/week.</p>
                <span class="wa-time">10:18 AM</span>
              </div>

              <div class="wa-msg wa-in highlight-wa">
                <span class="wa-sender">Disbursement Update</span>
                <p>⚡ ₹25,000 aapke State Bank UPI account mein credit kar diya gaya hai! UTR: 202609038891.</p>
                <span class="wa-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  attachEvents(container) {
    const gotoMarket = container.querySelector('#btn-goto-market');
    if (gotoMarket) {
      gotoMarket.onclick = () => this.app.switchTab('marketplace');
    }

    const readBtn = container.querySelector('#btn-read-tracker');
    if (readBtn) {
      readBtn.onclick = () => {
        const text = "Aapka Tyohar Working Capital Loan approve ho gaya hai aur bank account mein ₹25,000 credit ho chuka hai.";
        audioEngine.speak(text, this.app.state.language);
      };
    }
  }
}
