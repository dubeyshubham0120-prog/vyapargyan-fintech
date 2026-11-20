// Master Admin Control Panel & Banker Underwriting Portal Module
// Provides administrative controls for Entrepreneurs, Loan Disbursals, Scheme Dataset, KYC Approvals, and Voice Telemetry.

import { schemesData } from '../data/schemes.js';

export class AdminDashboard {
  constructor(app) {
    this.app = app;
    this.activeSubTab = 'roster'; // 'roster' | 'applications' | 'schemes' | 'kyc' | 'telemetry'
  }

  renderAdminSection(container) {
    const html = `
      <div class="admin-dashboard-container fade-in">
        
        <!-- Header Banner -->
        <div class="card mb-3" style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color:#FFF; padding:1.5rem 1.75rem; border-radius:16px; border:2px solid #4338CA;">
          <div class="flex-between align-center flex-wrap gap-2">
            <div>
              <span class="badge" style="background:#4C1D95; color:#E0E7FF; font-weight:800; margin-bottom:0.5rem; display:inline-block;">
                🛡️ Master Administration & Nodal Banker Portal
              </span>
              <h2 style="margin:0; font-size:1.6rem; color:#FFF;">TrustBridge Admin Control Center</h2>
              <p style="margin:0.3rem 0 0 0; opacity:0.9; font-size:0.95rem;">
                Full platform governance: Entrepreneur Trust Scores, Loan Approvals, Govt Schemes, KYC Verifications, and Voice AI Telemetry.
              </p>
            </div>
            <div class="flex-gap align-center">
              <span class="badge badge-success" style="font-size:0.85rem; padding:0.5rem 0.85rem;">🟢 Systems & Voice Server Online</span>
              <button class="btn btn-sm btn-secondary" id="btn-admin-logout" style="background:#FFF; color:#1E1B4B; font-weight:800;">
                🚪 Logout Admin
              </button>
            </div>
          </div>

          <!-- Key Performance Indicators (KPIs) -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-top:1.25rem; border-top:1px solid rgba(255,255,255,0.15); padding-top:1.2rem;">
            <div style="background:rgba(255,255,255,0.1); padding:0.85rem; border-radius:10px;">
              <div style="font-size:0.75rem; text-transform:uppercase; opacity:0.8;">Registered Entrepreneurs</div>
              <strong style="font-size:1.4rem; color:#A7F3D0;">1,428 Users</strong>
            </div>
            <div style="background:rgba(255,255,255,0.1); padding:0.85rem; border-radius:10px;">
              <div style="font-size:0.75rem; text-transform:uppercase; opacity:0.8;">Total Sanctioned Credit</div>
              <strong style="font-size:1.4rem; color:#FDE68A;">₹4.82 Crores</strong>
            </div>
            <div style="background:rgba(255,255,255,0.1); padding:0.85rem; border-radius:10px;">
              <div style="font-size:0.75rem; text-transform:uppercase; opacity:0.8;">Active Schemes Loaded</div>
              <strong style="font-size:1.4rem; color:#93C5FD;">16 Schemes</strong>
            </div>
            <div style="background:rgba(255,255,255,0.1); padding:0.85rem; border-radius:10px;">
              <div style="font-size:0.75rem; text-transform:uppercase; opacity:0.8;">Avg Platform Trust Score</div>
              <strong style="font-size:1.4rem; color:#F472B6;">712 / 900</strong>
            </div>
            <div style="background:rgba(255,255,255,0.1); padding:0.85rem; border-radius:10px;">
              <div style="font-size:0.75rem; text-transform:uppercase; opacity:0.8;">KYC Verification Queue</div>
              <strong style="font-size:1.4rem; color:#FCA5A5;">3 Pending</strong>
            </div>
          </div>
        </div>

        <!-- Admin Sub-Tab Navigation Bar -->
        <div class="card mb-3" style="padding:0.75rem 1rem;">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-sm ${this.activeSubTab === 'roster' ? 'btn-primary' : 'btn-light'}" id="admin-tab-roster">
              👥 Entrepreneur Roster
            </button>
            <button class="btn btn-sm ${this.activeSubTab === 'applications' ? 'btn-primary' : 'btn-light'}" id="admin-tab-applications">
              📋 Loan Applications Manager
            </button>
            <button class="btn btn-sm ${this.activeSubTab === 'schemes' ? 'btn-primary' : 'btn-light'}" id="admin-tab-schemes">
              🏛️ Govt Schemes Control
            </button>
            <button class="btn btn-sm ${this.activeSubTab === 'kyc' ? 'btn-primary' : 'btn-light'}" id="admin-tab-kyc">
              📸 KYC Approvals Queue
            </button>
            <button class="btn btn-sm ${this.activeSubTab === 'telemetry' ? 'btn-primary' : 'btn-light'}" id="admin-tab-telemetry">
              🎙️ Gyan Voice & Telemetry
            </button>
          </div>
        </div>

        <!-- Dynamic Sub-Tab Content -->
        <div id="admin-subtab-content">
          ${this.renderActiveSubTabContent()}
        </div>

      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  renderActiveSubTabContent() {
    switch (this.activeSubTab) {
      case 'roster':
        return this.renderEntrepreneurRoster();
      case 'applications':
        return this.renderLoanApplicationsManager();
      case 'schemes':
        return this.renderSchemesControl();
      case 'kyc':
        return this.renderKycQueue();
      case 'telemetry':
        return this.renderTelemetryLogs();
      default:
        return this.renderEntrepreneurRoster();
    }
  }

  renderEntrepreneurRoster() {
    const entrepreneurs = [
      { id: 'meena', name: 'Meena Devi', role: 'Kirana Store Owner', location: 'Varanasi, UP', score: 685, upiVol: '₹24,500/mo', status: 'Active (Verified)' },
      { id: 'ramesh', name: 'Ramesh Kumar', role: 'Vegetable Farmer', location: 'Jaipur, RJ', score: 740, upiVol: '₹38,200/mo', status: 'Active (Verified)' },
      { id: 'sunita', name: 'Sunita Ben', role: 'Handloom Weaver', location: 'Surat, GJ', score: 610, upiVol: '₹14,000/mo', status: 'Pending Verification' },
      { id: 'anand', name: 'Anand Singh', role: 'Repair Workshop', location: 'Kanpur, UP', score: 715, upiVol: '₹42,000/mo', status: 'Active (Verified)' },
      { id: 'priya', name: 'Priya Sharma', role: 'Dairy Farm Owner', location: 'Mandya, KA', score: 790, upiVol: '₹65,000/mo', status: 'Active (High Trust)' }
    ];

    return `
      <div class="card" style="padding:1.5rem;">
        <div class="flex-between align-center mb-3">
          <div>
            <h3 style="margin:0; color:#1F2937;">👥 Registered Rural Entrepreneurs Directory</h3>
            <p class="text-sm text-muted" style="margin:0.25rem 0 0 0;">Manage rural business profiles, Trust Score modifiers, and credit status.</p>
          </div>
          <button class="btn btn-sm btn-primary" id="btn-add-entrepreneur" style="background:#059669;">+ Register New Entrepreneur</button>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
            <thead>
              <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                <th style="padding:0.75rem; text-align:left;">Entrepreneur</th>
                <th style="padding:0.75rem; text-align:left;">Business & Location</th>
                <th style="padding:0.75rem; text-align:left;">Trust Score</th>
                <th style="padding:0.75rem; text-align:left;">UPI Cashflow</th>
                <th style="padding:0.75rem; text-align:left;">KYC Status</th>
                <th style="padding:0.75rem; text-align:right;">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              ${entrepreneurs.map(e => `
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="padding:0.85rem;">
                    <strong>${e.name}</strong>
                    <div style="font-size:0.75rem; color:#64748B;">ID: ${e.id}</div>
                  </td>
                  <td style="padding:0.85rem;">
                    ${e.role}
                    <div style="font-size:0.75rem; color:#64748B;">📍 ${e.location}</div>
                  </td>
                  <td style="padding:0.85rem;">
                    <span class="badge badge-success" style="font-size:0.9rem; font-weight:800;">⭐ ${e.score} / 900</span>
                  </td>
                  <td style="padding:0.85rem; font-weight:700; color:#047857;">${e.upiVol}</td>
                  <td style="padding:0.85rem;">
                    <span class="badge ${e.status.includes('Active') ? 'badge-primary' : 'badge-warning'}">${e.status}</span>
                  </td>
                  <td style="padding:0.85rem; text-align:right;">
                    <button class="btn btn-xs btn-outline-primary btn-boost-score" data-id="${e.id}">+25 Score Boost</button>
                    <button class="btn btn-xs btn-light btn-view-entr-profile" data-id="${e.id}">Inspect</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderLoanApplicationsManager() {
    const apps = this.app.state.applications || [];

    return `
      <div class="card" style="padding:1.5rem;">
        <div class="flex-between align-center mb-3">
          <div>
            <h3 style="margin:0; color:#1F2937;">📋 Institutional Credit & Loan Applications Manager</h3>
            <p class="text-sm text-muted" style="margin:0.25rem 0 0 0;">Review, sanction, or disburse working capital loans.</p>
          </div>
          <button class="btn btn-sm btn-outline-primary" id="btn-export-iso20022">💾 Export ISO 20022 Telemetry JSON</button>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
            <thead>
              <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                <th style="padding:0.75rem; text-align:left;">App ID</th>
                <th style="padding:0.75rem; text-align:left;">Product Title</th>
                <th style="padding:0.75rem; text-align:left;">Partner Lender</th>
                <th style="padding:0.75rem; text-align:left;">Date</th>
                <th style="padding:0.75rem; text-align:left;">Current Status</th>
                <th style="padding:0.75rem; text-align:right;">Update Status</th>
              </tr>
            </thead>
            <tbody>
              ${apps.map(a => `
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="padding:0.85rem; font-weight:700;">${a.appId}</td>
                  <td style="padding:0.85rem;">${a.productTitle}</td>
                  <td style="padding:0.85rem; color:#3730A3; font-weight:700;">${a.lender}</td>
                  <td style="padding:0.85rem;">${a.date}</td>
                  <td style="padding:0.85rem;">
                    <span class="badge ${a.statusClass || 'status-approved'}">${a.statusText}</span>
                  </td>
                  <td style="padding:0.85rem; text-align:right;">
                    <select class="form-select-sm status-update-select" data-appid="${a.appId}">
                      <option value="Bank Disbursed to UPI" ${a.statusText.includes('Disbursed') ? 'selected' : ''}>Disbursed to UPI</option>
                      <option value="Bank Sanctioned — Pending Disbursement" ${a.statusText.includes('Sanctioned') ? 'selected' : ''}>Sanctioned</option>
                      <option value="Under Verification" ${a.statusText.includes('Verification') ? 'selected' : ''}>Under Verification</option>
                      <option value="Rejected" ${a.statusText.includes('Rejected') ? 'selected' : ''}>Rejected</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderSchemesControl() {
    return `
      <div class="card" style="padding:1.5rem;">
        <div class="flex-between align-center mb-3">
          <div>
            <h3 style="margin:0; color:#1F2937;">🏛️ Government Schemes Dataset Governance</h3>
            <p class="text-sm text-muted" style="margin:0.25rem 0 0 0;">Manage 16 Central & State Schemes, unverified rule flags, and apply links.</p>
          </div>
          <button class="btn btn-sm btn-primary" id="btn-add-new-scheme-admin" style="background:#059669;">+ Add Government Scheme</button>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
            <thead>
              <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                <th style="padding:0.75rem; text-align:left;">Scheme Title</th>
                <th style="padding:0.75rem; text-align:left;">Issuing Ministry / State</th>
                <th style="padding:0.75rem; text-align:left;">Type</th>
                <th style="padding:0.75rem; text-align:left;">Unverified Flag</th>
                <th style="padding:0.75rem; text-align:left;">Benefit Summary</th>
                <th style="padding:0.75rem; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${schemesData.map(s => `
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="padding:0.75rem; font-weight:700;">
                    ${s.name}
                    <div style="font-size:0.75rem; color:#059669;">${s.nameHi}</div>
                  </td>
                  <td style="padding:0.75rem;">${s.issuingBody}</td>
                  <td style="padding:0.75rem;">
                    <span class="badge ${s.type === 'Central' ? 'badge-primary' : 'badge-warning'}">${s.type} ${s.state ? `(${s.state})` : ''}</span>
                  </td>
                  <td style="padding:0.75rem;">
                    ${s.unverifiedFlag ? `
                      <span class="badge badge-danger">⚠️ Unverified Rule</span>
                    ` : `
                      <span class="badge badge-success">✓ Verified</span>
                    `}
                  </td>
                  <td style="padding:0.75rem; font-size:0.8rem; color:#4B5563;">${s.benefitAmount}</td>
                  <td style="padding:0.75rem; text-align:right;">
                    <button class="btn btn-xs btn-outline-primary btn-toggle-unverified" data-id="${s.id}">
                      Toggle Verification
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderKycQueue() {
    const kycItems = [
      { id: 'KYC-8812', name: 'Meena Devi', docType: 'Aadhaar Card Scan', ocrScore: '98.4% Confidence', status: 'Pending Review' },
      { id: 'KYC-8813', name: 'Ramesh Kumar', docType: 'Khasra Land Record (Khatauni)', ocrScore: '96.1% Confidence', status: 'Pending Review' },
      { id: 'KYC-8814', name: 'Sunita Ben', docType: 'Udyam Registration Certificate', ocrScore: '99.0% Confidence', status: 'Pending Review' }
    ];

    return `
      <div class="card" style="padding:1.5rem;">
        <div class="flex-between align-center mb-3">
          <div>
            <h3 style="margin:0; color:#1F2937;">📸 Document OCR & KYC Approvals Queue</h3>
            <p class="text-sm text-muted" style="margin:0.25rem 0 0 0;">Inspect document OCR extractions and grant verified badges.</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
          ${kycItems.map(item => `
            <div class="card" style="border:1px solid #E2E8F0; padding:1.25rem;">
              <div class="flex-between align-center mb-2">
                <span class="badge badge-accent">${item.id}</span>
                <span class="badge badge-warning">${item.status}</span>
              </div>
              <h4 style="margin:0.25rem 0; color:#1F2937;">${item.name}</h4>
              <div style="font-size:0.85rem; color:#4B5563;"><strong>Doc Type:</strong> ${item.docType}</div>
              <div style="font-size:0.82rem; color:#047857; font-weight:700; margin:0.4rem 0 0.85rem 0;">OCR Match: ${item.ocrScore}</div>
              
              <div class="flex-gap">
                <button class="btn btn-sm btn-primary btn-approve-kyc" data-id="${item.id}" style="flex:1; background:#059669;">✓ Approve KYC</button>
                <button class="btn btn-sm btn-secondary" style="flex:1;">Reject</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderTelemetryLogs() {
    return `
      <div class="card" style="padding:1.5rem;">
        <div class="flex-between align-center mb-3">
          <div>
            <h3 style="margin:0; color:#1F2937;">🎙️ Gyan AI Voice Agent Telemetry & Logs</h3>
            <p class="text-sm text-muted" style="margin:0.25rem 0 0 0;">Live model session logs, ElevenLabs WebSocket connection status, and Sarvam AI translation fallback telemetry.</p>
          </div>
          <span class="badge badge-success">Backend Server http://localhost:8080 Active</span>
        </div>

        <div style="background:#0F172A; color:#38BDF8; font-family:monospace; padding:1.25rem; border-radius:12px; font-size:0.85rem; height:260px; overflow-y:auto; line-height:1.6;">
          <div>[SYSTEM INFO] ElevenLabs Agent ID: agent_0201m37sn98yfd9vqazr6a06qmyy | Voice: Armaan (IP6hMX5nniiLQScQfOs4)</div>
          <div>[SYSTEM INFO] LLM Model: eleven_flash_v2_5 | Primary Language: Hindi (hi-IN)</div>
          <div>[INFO 10:14:02] WebSocket session initialized on ws://localhost:8080/ws/gyan-voice</div>
          <div>[USER INPUT] "Trust Score kaise badhaye aur Mudra loan kaise le?"</div>
          <div>[AGENT RESP] "Namaste! Apni dukan ke UPI QR payments regular rakhein aur community vouching add karein. Isse aapka score 700+ hoga aur Mudra Kishore loan mil jayega."</div>
          <div>[SARVAM TRANS] Gujarati dialect fallback request -> Processed cleanly in 140ms.</div>
          <div>[HEALTH CHECK] Audio buffer 24kHz PCM streamed with 0 packet drops.</div>
        </div>
      </div>
    `;
  }

  attachEvents(container) {
    // Subtab navigation
    const subtabs = ['roster', 'applications', 'schemes', 'kyc', 'telemetry'];
    subtabs.forEach(st => {
      const btn = container.querySelector(`#admin-tab-${st}`);
      if (btn) {
        btn.onclick = () => {
          this.activeSubTab = st;
          this.renderAdminSection(container);
        };
      }
    });

    // Admin Logout
    const logoutBtn = container.querySelector('#btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (this.app.authManager) {
          this.app.authManager.logout();
        }
      };
    }

    // Boost score buttons
    container.querySelectorAll('.btn-boost-score').forEach(b => {
      b.onclick = () => {
        alert(`Granted +25 Trust Score boost to entrepreneur (${b.dataset.id}).`);
      };
    });

    // Status update dropdowns
    container.querySelectorAll('.status-update-select').forEach(sel => {
      sel.onchange = (e) => {
        const appId = e.target.dataset.appid;
        const newStatus = e.target.value;
        const appRecord = this.app.state.applications.find(a => a.appId === appId);
        if (appRecord) {
          appRecord.statusText = newStatus;
          alert(`Application ${appId} status updated to: ${newStatus}`);
        }
      };
    });

    // Export ISO 20022
    const expBtn = container.querySelector('#btn-export-iso20022');
    if (expBtn) {
      expBtn.onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.app.state.applications, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `ISO_20022_Credit_Telemetry_${Date.now()}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      };
    }

    // Toggle unverified
    container.querySelectorAll('.btn-toggle-unverified').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.id;
        const sch = schemesData.find(s => s.id === id);
        if (sch) {
          sch.unverifiedFlag = !sch.unverifiedFlag;
          this.renderAdminSection(container);
        }
      };
    });

    // Approve KYC
    container.querySelectorAll('.btn-approve-kyc').forEach(b => {
      b.onclick = () => {
        alert(`KYC Request ${b.dataset.id} Approved & Verified Badge Issued!`);
        b.parentElement.parentElement.remove();
      };
    });
  }
}
