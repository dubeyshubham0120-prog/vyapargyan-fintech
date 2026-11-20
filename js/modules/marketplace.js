// Rural Fintech Literacy & Access Platform - Marketplace Module

import { products } from '../data/products.js';
import { audioEngine } from './audioEngine.js';

export class Marketplace {
  constructor(appContext) {
    this.app = appContext;
    this.selectedCategory = 'all';
  }

  renderMarketplaceSection(container) {
    const persona = this.app.getCurrentPersona();
    const currentScore = this.app.state.currentScore || persona.baseScore;

    const filteredProducts = this.selectedCategory === 'all' 
      ? products 
      : products.filter(p => p.category === this.selectedCategory);

    const html = `
      <div class="marketplace-header flex-between mb-3">
        <div>
          <span class="badge badge-accent">Curated Marketplace</span>
          <h2 class="card-title mt-1">Simplified Loans & Business Insurance</h2>
          <p class="text-muted">Plain-language products with no fine-print traps or hidden APR math.</p>
        </div>
        <div class="user-score-pill" style="background:#EEF2FF; border:1px solid #C7D2FE; padding:0.5rem 1rem; border-radius:999px;">
          ⭐ Current Trust Score: <strong>${currentScore}</strong>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="filter-pills-row mb-3">
        <button class="pill-btn ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">All Products</button>
        <button class="pill-btn ${this.selectedCategory === 'working_capital' ? 'active' : ''}" data-cat="working_capital">📦 Working Capital</button>
        <button class="pill-btn ${this.selectedCategory === 'crop_cycle' ? 'active' : ''}" data-cat="crop_cycle">🌾 Crop & Harvest</button>
        <button class="pill-btn ${this.selectedCategory === 'equipment' ? 'active' : ''}" data-cat="equipment">⚙️ Equipment</button>
        <button class="pill-btn ${this.selectedCategory === 'insurance' ? 'active' : ''}" data-cat="insurance">🛡️ Shop Insurance</button>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        ${filteredProducts.map(p => {
          const isEligible = currentScore >= p.minScore;
          return `
            <div class="card glass-card product-card ${!isEligible ? 'locked-card' : ''}">
              <div class="product-card-header flex-between">
                <div class="product-icon-box">${p.icon}</div>
                <span class="badge ${isEligible ? 'badge-success' : 'badge-warning'}">
                  ${isEligible ? '✓ Pre-Approved' : `🔒 Unlocks at Score ${p.minScore}`}
                </span>
              </div>

              <h3 class="product-title mt-2">${p.title}</h3>
              <div class="product-lender text-sm text-muted">Provided by ${p.lender}</div>

              <div class="product-term-banner mt-2">
                <span class="term-title">Plain Term:</span>
                <p class="term-body">"${p.sampleTerm}"</p>
              </div>

              <p class="product-desc text-sm mt-2">${p.plainLanguageExplanation}</p>

              <div class="product-features mt-2">
                ${p.features.map(f => `<div class="feature-line">✓ ${f}</div>`).join('')}
              </div>

              <div class="product-card-actions flex-between mt-3">
                <button class="btn btn-audio btn-sm btn-audio-prod" data-audio="${p.audioExplanation}">
                  🔊 Listen Term
                </button>
                <button class="btn ${isEligible ? 'btn-primary' : 'btn-outline'} btn-apply-prod" 
                        data-id="${p.id}" ${!isEligible ? 'disabled' : ''}>
                  ${isEligible ? '⚡ Apply Now (Voice Guided)' : 'Locked'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Interactive Repayment Calculator Card -->
      <div class="card glass-card mt-4">
        <h3 class="card-title">🧮 Plain-Language Repayment Calculator</h3>
        <p class="text-muted">Choose your required loan amount to see exactly how much you repay each week without complicated percentages:</p>

        <div class="calc-grid mt-3">
          <div>
            <label><strong>Select Amount Needed:</strong> ₹<span id="calc-amt-lbl">25,000</span></label>
            <input type="range" id="calc-amt-slider" min="10000" max="150000" step="5000" value="25000">

            <label class="mt-2"><strong>Repayment Frequency:</strong></label>
            <div class="flex-gap mt-1">
              <button class="btn btn-sm btn-outline calc-freq active" data-freq="weekly">Weekly (Shopkeepers)</button>
              <button class="btn btn-sm btn-outline calc-freq" data-freq="harvest">Post-Harvest Bullet (Farmers)</button>
            </div>
          </div>

          <div class="calc-result-box">
            <div class="result-highlight">
              <span class="result-label">You Repay:</span>
              <h2 id="calc-result-amt">₹590 / week</h2>
              <p id="calc-result-desc" class="text-sm">Total 48 weekly instalments. Zero hidden processing fees.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  attachEvents(container) {
    // Filter pill buttons
    container.querySelectorAll('.pill-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedCategory = btn.dataset.cat;
        this.renderMarketplaceSection(container);
      };
    });

    // Audio read aloud for products
    container.querySelectorAll('.btn-audio-prod').forEach(btn => {
      btn.onclick = () => {
        audioEngine.speak(btn.dataset.audio, this.app.state.language);
      };
    });

    // Apply button -> Launches Application workflow
    container.querySelectorAll('.btn-apply-prod').forEach(btn => {
      btn.onclick = () => {
        const prodId = btn.dataset.id;
        const prod = products.find(p => p.id === prodId);
        this.startApplicationWorkflow(prod);
      };
    });

    // Calculator slider and toggles
    const slider = container.querySelector('#calc-amt-slider');
    const amtLbl = container.querySelector('#calc-amt-lbl');
    const resultAmt = container.querySelector('#calc-result-amt');
    const resultDesc = container.querySelector('#calc-result-desc');

    let currentFreq = 'weekly';

    const updateCalc = () => {
      const amt = parseInt(slider.value);
      amtLbl.innerText = amt.toLocaleString();

      if (currentFreq === 'weekly') {
        const weekly = Math.round((amt * 1.12) / 48);
        resultAmt.innerText = `₹${weekly} / week`;
        resultDesc.innerText = `48 weekly payments of ₹${weekly} (Total ₹${(weekly * 48).toLocaleString()}). Safe auto-debit from UPI.`;
      } else {
        const total = Math.round(amt * 1.07);
        resultAmt.innerText = `₹${total.toLocaleString()} (One-time)`;
        resultDesc.innerText = `Zero payments for 6 months! Repay full ₹${total.toLocaleString()} after harvesting and selling crop at Mandi.`;
      }
    };

    if (slider) {
      slider.oninput = updateCalc;
    }

    container.querySelectorAll('.calc-freq').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.calc-freq').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFreq = btn.dataset.freq;
        updateCalc();
      };
    });
  }

  startApplicationWorkflow(product) {
    const persona = this.app.getCurrentPersona();
    const modalHtml = `
      <div class="modal-backdrop" id="modal-apply">
        <div class="modal-box">
          <div class="modal-header flex-between">
            <h3>⚡ Guided Voice Application — ${product.title}</h3>
            <button class="btn-close" id="modal-close-apply">×</button>
          </div>
          <div class="modal-body">
            <div class="audio-banner mb-3">
              🔊 <strong>Voice Assistant:</strong> "Aap ${product.title} ke liye aavedan kar rahe hain. Kripya apne dukan ke dastavez verify karein."
            </div>

            <div class="application-summary-box">
              <p><strong>Applicant:</strong> ${persona.name} (${persona.role})</p>
              <p><strong>Product Provider:</strong> ${product.lender}</p>
              <p><strong>Repayment Structure:</strong> ${product.sampleTerm}</p>
              <p><strong>Current Trust Score:</strong> <span class="highlight-green">${this.app.state.currentScore} (Pre-Approved)</span></p>
            </div>

            <div class="kyc-check-list mt-3">
              <h4>✓ Automatic Verification Steps:</h4>
              <ul>
                <li>✓ Trust Score & UPI Cashflow Verified</li>
                <li>✓ Community Vouching Credentials Attached</li>
                <li>⏳ Aadhaar / Mandi Slip Upload (Simulated OCR)</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer flex-end">
            <button class="btn btn-secondary mr-2" id="btn-agent-assist">📞 Connect Local Agent (Gramin Mitra)</button>
            <button class="btn btn-primary" id="btn-submit-loan-app">Submit Application & Track Status</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('modal-apply');

    audioEngine.speak(`Aap ${product.title} ke liye aavedan kar rahe hain. Submit button dabayein.`, this.app.state.language);

    document.getElementById('modal-close-apply').onclick = () => modal.remove();
    document.getElementById('btn-agent-assist').onclick = () => {
      modal.remove();
      this.app.switchTab('kyc');
    };
    document.getElementById('btn-submit-loan-app').onclick = () => {
      // Add application to tracker
      this.app.addApplicationRecord(product);
      audioEngine.speak("Aavedan safaltapoorvak jama ho gaya hai! WhatsApp par update mil jayega.", this.app.state.language);
      modal.remove();
      this.app.switchTab('tracker');
    };
  }
}
