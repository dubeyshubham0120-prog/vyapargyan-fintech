// Rural Fintech Literacy & Access Platform - Lender / Banker Portal Module

export class LenderDashboard {
  constructor(appContext) {
    this.app = appContext;
  }

  renderLenderSection(container) {
    const persona = this.app.getCurrentPersona();
    const currentScore = this.app.state.currentScore || persona.baseScore;

    const html = `
      <div class="lender-header flex-between mb-3">
        <div>
          <span class="badge badge-accent">Partner Underwriter View</span>
          <h2 class="card-title mt-1">Institutional Credit Telemetry Portal</h2>
          <p class="text-muted">Converting informal rural economic signals into structured, bankable credit assets.</p>
        </div>
        <div class="flex-gap">
          <button class="btn btn-outline btn-sm" id="btn-export-json">💾 Export ISO 20022 Credit JSON</button>
          <span class="badge badge-success">Interoperable API Active</span>
        </div>
      </div>

      <!-- Applicant Overview Banner -->
      <div class="card glass-card mb-3">
        <div class="applicant-lender-grid">
          <div class="applicant-meta flex-gap align-center">
            <span class="avatar-lg">${persona.avatar}</span>
            <div>
              <h3>${persona.name} <span class="text-sm text-muted">(${persona.age} yrs)</span></h3>
              <div class="text-sm text-muted">${persona.role} • ${persona.location}</div>
              <div class="mt-1">
                <span class="badge badge-accent">${persona.cashflowType}</span>
                <span class="badge badge-success">${persona.preferredLanguage.toUpperCase()} Dialect</span>
              </div>
            </div>
          </div>

          <div class="lender-metrics-row flex-around">
            <div class="metric-box">
              <span class="metric-lbl">Trust Score</span>
              <span class="metric-val text-green">${currentScore} / 900</span>
            </div>
            <div class="metric-box">
              <span class="metric-lbl">Projected Default Rate</span>
              <span class="metric-val text-blue">1.4% (Ultra-Low)</span>
            </div>
            <div class="metric-box">
              <span class="metric-lbl">Monthly UPI Cashflow</span>
              <span class="metric-val">₹${(persona.upiMonthlyVolume).toLocaleString()}</span>
            </div>
            <div class="metric-box">
              <span class="metric-lbl">Social Vouchers</span>
              <span class="metric-val">${persona.vouchers} Verified</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown Cards -->
      <div class="lender-breakdown-grid">
        <!-- Informal Signals Matrix -->
        <div class="card glass-card">
          <h3 class="card-title mb-2">📊 Alternative Signals Telemetry</h3>
          <table class="lender-table">
            <thead>
              <tr>
                <th>Economic Signal</th>
                <th>Observed Pattern</th>
                <th>Traditional Weight</th>
                <th>TrustBridge Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>UPI QR Merchant Velocity</td>
                <td>${persona.upiTxCount} tx/mo (Avg ticket ₹340)</td>
                <td><span class="text-red">Ignored (No CIBIL)</span></td>
                <td><span class="text-green">+60 Pts (Strong Cashflow)</span></td>
              </tr>
              <tr>
                <td>Harvest/Festive Seasonality</td>
                <td>${persona.seasonalFactor}</td>
                <td><span class="text-red">Penalized off-season</span></td>
                <td><span class="text-green">+35 Pts (Cycle Adjusted)</span></td>
              </tr>
              <tr>
                <td>SHG Community Vouching</td>
                <td>${persona.vouchers} Verified local leaders</td>
                <td><span class="text-red">Unrecognized</span></td>
                <td><span class="text-green">+45 Pts (Social Trust)</span></td>
              </tr>
              <tr>
                <td>Utility & Mobile Discipline</td>
                <td>${persona.utilityScore}% On-time bill ratio</td>
                <td><span class="text-red">Unrecognized</span></td>
                <td><span class="text-green">+28 Pts (Discipline)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Risk Telemetry & API Payload -->
        <div class="card glass-card">
          <h3 class="card-title mb-2">⚡ API Credit Risk Assessment</h3>
          <div class="risk-meter-box p-3 border-rounded mb-3" style="background:#F0FDF4; border:1px solid #BBF7D0;">
            <div class="flex-between">
              <strong>Underwriting Recommendation:</strong>
              <span class="badge badge-success">INSTANT APPROVE</span>
            </div>
            <p class="text-sm mt-1 text-muted">
              Applicant demonstrates zero delinquency risk across 18 months of mobile wallet cash flow and peer vouching signals. Recommended interest rate discount: <strong>-2.5% p.a.</strong>
            </p>
          </div>

          <h4 class="mb-1">Exportable Credit API Payload Schema:</h4>
          <pre class="json-payload-code"><code>{
  "applicant_id": "TR-${persona.id.toUpperCase()}-2026",
  "trust_score": ${currentScore},
  "tier": "Gold Bankable",
  "verified_cashflow_monthly": ${persona.upiMonthlyVolume},
  "seasonality_factor": "${persona.seasonalFactor}",
  "social_vouchers_count": ${persona.vouchers},
  "utility_discipline_ratio": ${persona.utilityScore / 100},
  "voice_ai_interview_verified": ${this.app.state.interviewCompleted ? true : false},
  "recommended_credit_limit": 120000,
  "default_risk_tier": "A1_LOW_RISK"
}</code></pre>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  attachEvents(container) {
    const exportBtn = container.querySelector('#btn-export-json');
    if (exportBtn) {
      exportBtn.onclick = () => {
        alert("ISO 20022 Compliant Alternative Credit JSON Payload exported for Banking API integration!");
      };
    }
  }
}
