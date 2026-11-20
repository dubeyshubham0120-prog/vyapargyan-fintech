// Rural Fintech Literacy & Access Platform - Trust Score Engine

import { audioEngine } from './audioEngine.js';

export class TrustScoreEngine {
  constructor(appContext) {
    this.app = appContext;
  }

  calculateScore(persona, modifiers = {}) {
    const base = persona.baseScore;
    
    // 1. UPI Transaction Factor (-40 to +60)
    const upiVol = modifiers.upiVol !== undefined ? modifiers.upiVol : persona.upiMonthlyVolume;
    const upiFactor = Math.min(60, Math.max(-40, Math.round((upiVol - 30000) / 1500)));

    // 2. Seasonal Factor (+0 to +40)
    const seasonMap = {
      "Festive Spike (Diwali/Holi)": 35,
      "Harvest Peak (Post-Mandi Sale)": 40,
      "Wedding Season Peak": 30,
      "Crushing Season (Nov-April)": 35,
      "Off-Season Normal": 10
    };
    const currentSeason = modifiers.season || persona.seasonalFactor;
    const seasonBonus = seasonMap[currentSeason] || 15;

    // 3. Vouching Factor (+15 per voucher, max 75)
    const vouchersCount = modifiers.vouchersCount !== undefined ? modifiers.vouchersCount : persona.vouchers;
    const vouchBonus = Math.min(75, vouchersCount * 15);

    // 4. Utility Factor (+0 to +30)
    const utilScore = modifiers.utilityScore !== undefined ? modifiers.utilityScore : persona.utilityScore;
    const utilBonus = Math.round((utilScore / 100) * 30);

    // 5. Quiz / Literacy Bonus
    const literacyBonus = (this.app.state.completedLessons || []).length * 15;

    // 6. Voice Interview Bonus
    const interviewBonus = this.app.state.interviewCompleted ? 30 : 0;

    let finalScore = base + upiFactor + seasonBonus + vouchBonus + utilBonus + literacyBonus + interviewBonus;
    finalScore = Math.min(880, Math.max(300, finalScore));

    return {
      totalScore: finalScore,
      upiFactor,
      seasonBonus,
      vouchBonus,
      utilBonus,
      literacyBonus,
      interviewBonus,
      tier: this.getScoreTier(finalScore)
    };
  }

  getScoreTier(score) {
    if (score >= 780) return { name: "Platinum Bankable", color: "#059669", badge: "🌟 Priority Micro-Credit", maxLoan: "₹2,50,000" };
    if (score >= 700) return { name: "Gold Bankable", color: "#2563EB", badge: "✅ Standard Bank Approved", maxLoan: "₹1,20,000" };
    if (score >= 620) return { name: "Silver Bankable", color: "#D97706", badge: "⚡ Micro-Loan Ready", maxLoan: "₹50,000" };
    return { name: "Emerging Trust", color: "#DC2626", badge: "🌱 Build with Micro-Lessons", maxLoan: "₹15,000" };
  }

  renderScoreSection(container) {
    const persona = this.app.getCurrentPersona();
    const stateMods = this.app.state.scoreModifiers || {};
    const scoreData = this.calculateScore(persona, stateMods);

    // Update global app state score
    this.app.state.currentScore = scoreData.totalScore;

    const html = `
      <div class="score-card-grid">
        <!-- Main Trust Gauge Card -->
        <div class="card glass-card score-main-card">
          <div class="card-header flex-between">
            <div>
              <span class="badge badge-accent">${persona.badge}</span>
              <h2 class="card-title mt-1">${persona.name} — ${this.app.t('trustScoreHeading')}</h2>
            </div>
            <button class="btn btn-audio" id="btn-audio-score">
              🔊 ${this.app.t('listenAudio')}
            </button>
          </div>

          <div class="score-gauge-container">
            <svg class="score-gauge" viewBox="0 0 200 120">
              <path class="gauge-bg" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E2E8F0" stroke-width="18" stroke-linecap="round"/>
              <path class="gauge-fill" id="gauge-fill-path" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="${scoreData.tier.color}" stroke-width="18" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * ((scoreData.totalScore - 300) / 580))}" stroke-linecap="round"/>
            </svg>
            <div class="score-display">
              <span class="score-number" style="color: ${scoreData.tier.color}">${scoreData.totalScore}</span>
              <span class="score-max">/ 900</span>
              <div class="score-tier-tag" style="background: ${scoreData.tier.color}">${scoreData.tier.name}</div>
            </div>
          </div>

          <div class="tier-info-box">
            <p><strong>Status:</strong> ${scoreData.tier.badge}</p>
            <p><strong>Pre-Approved Credit Limit:</strong> <span class="highlight-green">${scoreData.tier.maxLoan}</span></p>
            <button class="btn btn-primary mt-2" id="btn-export-trustpass">
              🪪 View & Export Portable Trust Pass (Digital QR)
            </button>
          </div>
        </div>

        <!-- Interactive Signals Controls -->
        <div class="card glass-card score-signals-card">
          <h3 class="card-title mb-2">⭐ Alternative Signals Simulator</h3>
          <p class="text-muted mb-3">Adjust local economic signals below to see your bankability score adapt in real-time:</p>

          <!-- Signal 1: UPI Volume -->
          <div class="signal-item">
            <div class="flex-between">
              <label><strong>📱 Monthly UPI Cashflow:</strong> ₹<span id="lbl-upi-vol">${(stateMods.upiVol || persona.upiMonthlyVolume).toLocaleString()}</span></label>
              <span class="signal-tag">+${scoreData.upiFactor} pts</span>
            </div>
            <input type="range" id="slider-upi-vol" min="10000" max="200000" step="5000" value="${stateMods.upiVol || persona.upiMonthlyVolume}">
          </div>

          <!-- Signal 2: Seasonal Cycle -->
          <div class="signal-item">
            <div class="flex-between">
              <label><strong>🌾 Cashflow Seasonality:</strong></label>
              <span class="signal-tag">+${scoreData.seasonBonus} pts</span>
            </div>
            <select id="select-season" class="form-select mt-1">
              <option value="Festive Spike (Diwali/Holi)" ${ (stateMods.season || persona.seasonalFactor).includes("Festive") ? "selected" : ""}>Festive Spike (Diwali/Holi)</option>
              <option value="Harvest Peak (Post-Mandi Sale)" ${ (stateMods.season || persona.seasonalFactor).includes("Harvest") ? "selected" : ""}>Harvest Peak (Post-Mandi Sale)</option>
              <option value="Wedding Season Peak" ${ (stateMods.season || persona.seasonalFactor).includes("Wedding") ? "selected" : ""}>Wedding Season Peak</option>
              <option value="Crushing Season (Nov-April)" ${ (stateMods.season || persona.seasonalFactor).includes("Crushing") ? "selected" : ""}>Crushing Season (Sugar/Cane)</option>
              <option value="Off-Season Normal" ${ (stateMods.season || persona.seasonalFactor).includes("Normal") ? "selected" : ""}>Off-Season Normal (No Penalty)</option>
            </select>
          </div>

          <!-- Signal 3: Community Vouching -->
          <div class="signal-item">
            <div class="flex-between">
              <label><strong>🤝 SHG & Peer Vouchers:</strong> <span id="lbl-vouchers">${stateMods.vouchersCount !== undefined ? stateMods.vouchersCount : persona.vouchers} Verified</span></label>
              <span class="signal-tag">+${scoreData.vouchBonus} pts</span>
            </div>
            <div class="vouch-btn-group mt-1">
              <button class="btn btn-sm btn-outline" id="btn-add-voucher">+ Add Community Voucher</button>
              <button class="btn btn-sm btn-outline" id="btn-reset-vouchers">Reset</button>
            </div>
          </div>

          <!-- Signal 4: Voice Interview -->
          <div class="signal-item">
            <div class="flex-between">
              <label><strong>🎙️ Voice AI Financial Interview:</strong></label>
              <span class="signal-tag">+${scoreData.interviewBonus} pts</span>
            </div>
            <button class="btn btn-secondary btn-sm mt-1" id="btn-start-interview">
              ${this.app.state.interviewCompleted ? "✅ Interview Completed (+30 Pts)" : "▶️ Start Vernacular Voice Interview"}
            </button>
          </div>
        </div>
      </div>

      <!-- Vouching Network Visualiser -->
      <div class="card glass-card mt-3">
        <h3 class="card-title">🤝 Community Trust Network (Social Vouching Circle)</h3>
        <p class="text-muted">Verified local leaders co-signing ${persona.name}'s honesty and business reputation:</p>
        <div class="vouch-grid mt-2">
          ${persona.vouchList.map(v => `
            <div class="vouch-card">
              <div class="vouch-avatar">👵</div>
              <div>
                <strong>${v.name}</strong>
                <div class="text-sm text-muted">${v.role}</div>
                <span class="badge badge-success mt-1">✓ ${v.status} (${v.weight})</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container, persona, scoreData);
  }

  attachEvents(container, persona, scoreData) {
    // Audio explanation button
    const audioBtn = container.querySelector('#btn-audio-score');
    if (audioBtn) {
      audioBtn.onclick = () => {
        const text = `Aapka Trust Score ${scoreData.totalScore} hai out of 900. Aap ${scoreData.tier.name} category mein hain aur ${scoreData.tier.maxLoan} tak ke loan ke liye yogya hain.`;
        audioEngine.speak(text, this.app.state.language);
      };
    }

    // Sliders and Selects
    const sliderUpi = container.querySelector('#slider-upi-vol');
    if (sliderUpi) {
      sliderUpi.oninput = (e) => {
        const val = parseInt(e.target.value);
        this.app.state.scoreModifiers.upiVol = val;
        this.renderScoreSection(container);
      };
    }

    const selectSeason = container.querySelector('#select-season');
    if (selectSeason) {
      selectSeason.onchange = (e) => {
        this.app.state.scoreModifiers.season = e.target.value;
        this.renderScoreSection(container);
      };
    }

    const addVoucherBtn = container.querySelector('#btn-add-voucher');
    if (addVoucherBtn) {
      addVoucherBtn.onclick = () => {
        const cur = this.app.state.scoreModifiers.vouchersCount !== undefined ? this.app.state.scoreModifiers.vouchersCount : persona.vouchers;
        if (cur < 5) {
          this.app.state.scoreModifiers.vouchersCount = cur + 1;
          audioEngine.speak("Naya community voucher juda! Trust Score badh gaya hai.", this.app.state.language);
          this.renderScoreSection(container);
        }
      };
    }

    const resetVouchersBtn = container.querySelector('#btn-reset-vouchers');
    if (resetVouchersBtn) {
      resetVouchersBtn.onclick = () => {
        this.app.state.scoreModifiers.vouchersCount = persona.vouchers;
        this.renderScoreSection(container);
      };
    }

    // Interview Modal Trigger
    const interviewBtn = container.querySelector('#btn-start-interview');
    if (interviewBtn) {
      interviewBtn.onclick = () => {
        this.openInterviewModal();
      };
    }

    // TrustPass Modal Trigger
    const passBtn = container.querySelector('#btn-export-trustpass');
    if (passBtn) {
      passBtn.onclick = () => {
        this.openTrustPassModal(persona, scoreData);
      };
    }
  }

  openInterviewModal() {
    const persona = this.app.getCurrentPersona();
    const modalHtml = `
      <div class="modal-backdrop" id="modal-interview">
        <div class="modal-box">
          <div class="modal-header flex-between">
            <h3>🎙️ Vernacular Voice AI Financial Interview</h3>
            <button class="btn-close" id="modal-close-interview">×</button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-2">Our AI agent interviews the entrepreneur in regional dialect, converting spoken business details into bank-consumable risk metrics.</p>

            <div class="chat-bubble bot-bubble">
              <p>🤖 <strong>TrustBridge AI:</strong> Namaste ${persona.name} ji! Aapki dukan ki hafte ki ausat kamai (turnover) kitni hai aur aap maal kahan se khareedte hain?</p>
            </div>

            <div class="chat-bubble user-bubble mt-2">
              <p>🗣️ <strong>Spoken Answer:</strong> "${persona.interviewResponses.turnover} ${persona.interviewResponses.suppliers}"</p>
            </div>

            <div class="interview-signals-extracted mt-3 p-2 border-rounded">
              <h4>🔍 AI Extracted Structured Metrics:</h4>
              <ul>
                <li>✓ Cashflow Consistency: <strong>High (Weekly verified)</strong></li>
                <li>✓ Supplier Network: <strong>Regional Mandi Verified</strong></li>
                <li>✓ Repayment Intent Score: <strong>96 / 100</strong></li>
              </ul>
            </div>
          </div>
          <div class="modal-footer flex-end">
            <button class="btn btn-secondary mr-2" id="btn-listen-interview">🔊 Listen Audio Prompt</button>
            <button class="btn btn-primary" id="btn-complete-interview">Submit & Unlock +30 Pts</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal-interview');

    document.getElementById('modal-close-interview').onclick = () => modal.remove();
    document.getElementById('btn-listen-interview').onclick = () => {
      audioEngine.speak(`Namaste ${persona.name} ji! Aapki dukan ki hafte ki ausat kamai kitni hai?`, this.app.state.language);
    };
    document.getElementById('btn-complete-interview').onclick = () => {
      this.app.state.interviewCompleted = true;
      audioEngine.speak("Voice interview complete! Extra 30 Trust points added to your score.", this.app.state.language);
      modal.remove();
      this.app.renderActiveTab();
    };
  }

  openTrustPassModal(persona, scoreData) {
    const modalHtml = `
      <div class="modal-backdrop" id="modal-trustpass">
        <div class="modal-box trust-pass-modal">
          <div class="modal-header flex-between">
            <h3>🪪 Verified Portable Trust Pass</h3>
            <button class="btn-close" id="modal-close-pass">×</button>
          </div>
          <div class="modal-body text-center">
            <div class="pass-card">
              <div class="pass-header">
                <h2>TrustBridge Rural</h2>
                <span class="badge badge-accent">RBI / NABARD Compliant Signal Protocol</span>
              </div>
              <div class="pass-hero flex-between mt-3">
                <div class="text-left">
                  <div class="pass-name">${persona.name}</div>
                  <div class="pass-role">${persona.role} • ${persona.location}</div>
                  <div class="mt-2"><strong>Trust ID:</strong> TR-IND-2026-${persona.id.toUpperCase()}</div>
                </div>
                <div class="pass-score-badge" style="background:${scoreData.tier.color}">
                  ${scoreData.totalScore}
                </div>
              </div>

              <div class="pass-grid mt-3">
                <div><strong>UPI Cashflow:</strong> ₹${persona.upiMonthlyVolume.toLocaleString()}/mo</div>
                <div><strong>SHG Vouchers:</strong> ${persona.vouchers} Verified</div>
                <div><strong>Seasonality:</strong> Harvest Aligned</div>
                <div><strong>Max Loan Tier:</strong> ${scoreData.tier.maxLoan}</div>
              </div>

              <div class="qr-placeholder mt-3">
                <div class="qr-box">📱 Digital Verification QR Code (Scan by Partner Bank)</div>
              </div>
            </div>
          </div>
          <div class="modal-footer flex-between">
            <button class="btn btn-outline" id="btn-print-pass">🖨️ Download PDF / Print</button>
            <button class="btn btn-primary" id="btn-close-pass-ok">Done</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal-trustpass');
    document.getElementById('modal-close-pass').onclick = () => modal.remove();
    document.getElementById('btn-close-pass-ok').onclick = () => modal.remove();
    document.getElementById('btn-print-pass').onclick = () => {
      alert("Trust Pass PDF generated! Ready for presentation at any partner bank branch.");
    };
  }
}
