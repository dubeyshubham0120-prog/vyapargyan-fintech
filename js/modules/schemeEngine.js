// Scheme Matching Engine & myScheme.gov.in Discovery Hub
// Rules-based matching, gap analysis, 3 discovery modes, scheme comparison, and notifications.

import { schemesData } from '../data/schemes.js';

export class SchemeEngine {
  constructor(app) {
    this.app = app;
    this.selectedForComparison = new Set();
    this.activeDiscoveryTab = 'matched'; // 'matched' | 'category' | 'state'
    this.selectedCategory = 'all';
    this.selectedStateFilter = 'all';
    this.searchQuery = '';
  }

  // Calculate scheme matches for current user profile
  evaluateMatches() {
    const profile = this.app.onboardingQuestionnaire ? this.app.onboardingQuestionnaire.getProfile() : this.app.state.userProfile;
    if (!profile) return [];

    return schemesData.map(scheme => {
      let matchScore = 100;
      let matchStatus = 'full'; // 'full' | 'partial' | 'unmatched'
      const rules = scheme.eligibilityRules || {};

      // 1. State / UT Location Check
      if (scheme.type === 'State') {
        const stateMatch = rules.applicableStates && rules.applicableStates.some(st => 
          st.toLowerCase() === (profile.state || '').toLowerCase()
        );
        if (!stateMatch) {
          matchStatus = 'unmatched';
          matchScore -= 50;
        }
      }

      // 2. Business Type Check
      if (rules.applicableBusinessTypes && rules.applicableBusinessTypes.length > 0) {
        if (!rules.applicableBusinessTypes.includes(profile.businessType)) {
          matchScore -= 20;
          if (matchStatus === 'full') matchStatus = 'partial';
        }
      }

      // 3. Gender Requirement Check
      if (rules.genderRequirements && rules.genderRequirements.length > 0) {
        const isGenderEligible = rules.genderRequirements.includes(profile.gender) ||
          (rules.genderRequirements.includes('sc_st') && (profile.category === 'sc' || profile.category === 'st'));
        if (!isGenderEligible) {
          matchScore -= 30;
          if (matchStatus === 'full') matchStatus = 'partial';
        }
      }

      // 4. Age Check
      if (rules.minAge && profile.age < rules.minAge) {
        matchScore -= 20;
        if (matchStatus === 'full') matchStatus = 'partial';
      }
      if (rules.maxAge && profile.age > rules.maxAge) {
        matchScore -= 20;
        if (matchStatus === 'full') matchStatus = 'partial';
      }

      // Evaluate Qualification Gaps
      const gaps = scheme.gapAnalysisRules ? scheme.gapAnalysisRules(profile) : [];
      if (gaps.length > 0 && matchStatus === 'full') {
        matchStatus = 'partial';
        matchScore = Math.max(65, matchScore - gaps.length * 10);
      }

      if (matchScore < 40) matchStatus = 'unmatched';

      return {
        ...scheme,
        matchStatus,
        matchScore: Math.max(10, matchScore),
        gaps
      };
    });
  }

  getMatchedCount() {
    const matches = this.evaluateMatches();
    return matches.filter(m => m.matchStatus === 'full' || m.matchStatus === 'partial').length;
  }

  reMatchAndNotify(showToast = false) {
    const count = this.getMatchedCount();
    this.updateHeaderBellBadge(count);

    if (showToast) {
      this.showNotificationToast(`🎉 Profile updated! Found ${count} Government Schemes matching your profile.`);
    }
  }

  updateHeaderBellBadge(count) {
    const badge = document.getElementById('scheme-bell-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  showNotificationToast(msg) {
    const existing = document.getElementById('scheme-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'scheme-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #065F46;
      color: #FFF;
      padding: 1rem 1.4rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 10000;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: 2px solid #34D399;
      animation: slideInRight 0.4s ease-out;
    `;
    toast.innerHTML = `
      <span style="font-size:1.4rem;">🔔</span>
      <div>${msg}</div>
      <button onclick="this.parentElement.remove()" style="background:none; border:none; color:#FFF; font-size:1.1rem; cursor:pointer; margin-left:0.5rem;">✖</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 6000);
  }

  renderSchemesSection(container) {
    const profile = this.app.onboardingQuestionnaire ? this.app.onboardingQuestionnaire.getProfile() : this.app.state.userProfile;
    const evaluatedSchemes = this.evaluateMatches();
    const matchedCount = evaluatedSchemes.filter(m => m.matchStatus === 'full' || m.matchStatus === 'partial').length;

    // Filter schemes based on active tab and search/category controls
    let displayedSchemes = evaluatedSchemes;

    if (this.activeDiscoveryTab === 'matched') {
      displayedSchemes = evaluatedSchemes
        .filter(s => s.matchStatus === 'full' || s.matchStatus === 'partial')
        .sort((a, b) => b.matchScore - a.matchScore);
    } else if (this.activeDiscoveryTab === 'category') {
      if (this.selectedCategory !== 'all') {
        displayedSchemes = evaluatedSchemes.filter(s => s.sectorTag === this.selectedCategory);
      }
    } else if (this.activeDiscoveryTab === 'state') {
      if (this.selectedStateFilter === 'central') {
        displayedSchemes = evaluatedSchemes.filter(s => s.type === 'Central');
      } else if (this.selectedStateFilter !== 'all') {
        displayedSchemes = evaluatedSchemes.filter(s => s.state && s.state.toLowerCase() === this.selectedStateFilter.toLowerCase());
      }
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      displayedSchemes = displayedSchemes.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.nameHi.toLowerCase().includes(q) ||
        s.issuingBody.toLowerCase().includes(q) ||
        s.sectorTag.toLowerCase().includes(q)
      );
    }

    const html = `
      <div class="schemes-container fade-in">
        <!-- Top Banner Header -->
        <div class="card mb-3" style="background: linear-gradient(135deg, #065F46 0%, #047857 100%); color: #FFF; padding: 1.5rem 1.75rem; border-radius: 16px;">
          <div class="flex-between align-center flex-wrap gap-2">
            <div>
              <span class="badge" style="background: rgba(255,255,255,0.2); color: #FFF; font-weight: 700; margin-bottom: 0.5rem; display: inline-block;">
                🇮🇳 myScheme.gov.in Integrated Hub
              </span>
              <h2 style="margin: 0; font-size: 1.6rem; color: #FFF;">Government Schemes & Subsidies Finder</h2>
              <p style="margin: 0.4rem 0 0 0; opacity: 0.9; font-size: 0.95rem;">
                Matched against your profile: <strong>${profile.businessTypeName || 'Micro Entrepreneur'}</strong> in <strong>${profile.district}, ${profile.state}</strong>.
              </p>
            </div>
            <div class="flex-gap align-center">
              <button class="btn btn-secondary" id="btn-edit-profile-schemes" style="background:#FFF; color:#065F46; font-weight:800; border:none; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                ✏️ Edit Questionnaire Profile
              </button>
            </div>
          </div>

          <!-- Profile Snapshot Summary Pills -->
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:1.2rem; border-top:1px solid rgba(255,255,255,0.2); padding-top:1rem;">
            <span class="badge" style="background:rgba(255,255,255,0.15); color:#FFF;">📍 ${profile.district}, ${profile.state}</span>
            <span class="badge" style="background:rgba(255,255,255,0.15); color:#FFF;">🏬 ${profile.businessType.toUpperCase()}</span>
            <span class="badge" style="background:rgba(255,255,255,0.15); color:#FFF;">💰 ₹${(profile.monthlyIncome || 25000).toLocaleString('en-IN')}/mo</span>
            <span class="badge" style="background:rgba(255,255,255,0.15); color:#FFF;">⏳ ${profile.yearsInOperation} Yrs in Business</span>
            <span class="badge" style="background:rgba(255,255,255,0.15); color:#FFF;">👤 ${profile.category.toUpperCase()} | ${profile.gender}</span>
            <span class="badge" style="background:#34D399; color:#065F46; font-weight:800;">✨ ${matchedCount} Eligible Scheme Matches</span>
          </div>
        </div>

        <!-- 3 Discovery Modes Tabs -->
        <div class="card mb-3" style="padding: 1rem 1.25rem;">
          <div class="flex-between align-center flex-wrap gap-2 mb-2">
            <!-- Modes Buttons -->
            <div class="tab-group" style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <button class="btn btn-sm ${this.activeDiscoveryTab === 'matched' ? 'btn-primary' : 'btn-secondary'}" id="tab-mode-matched">
                ✨ Find Schemes For You (${matchedCount})
              </button>
              <button class="btn btn-sm ${this.activeDiscoveryTab === 'category' ? 'btn-primary' : 'btn-secondary'}" id="tab-mode-category">
                📂 Browse by Category
              </button>
              <button class="btn btn-sm ${this.activeDiscoveryTab === 'state' ? 'btn-primary' : 'btn-secondary'}" id="tab-mode-state">
                🏛️ Browse by State / Ministry
              </button>
            </div>

            <!-- Compare Trigger Button -->
            <button class="btn btn-outline-primary btn-sm" id="btn-open-compare-modal" style="font-weight:700;">
              ⚖️ Compare Selected (${this.selectedForComparison.size})
            </button>
          </div>

          <!-- Secondary Filter Bar depending on active mode -->
          ${this.renderSecondaryFilterBar()}
        </div>

        <!-- Search Bar -->
        <div class="mb-3 flex-gap align-center">
          <input type="text" id="scheme-search-input" class="form-input" value="${this.searchQuery}" placeholder="🔍 Search schemes by name, ministry, or keyword (e.g. MUDRA, PMEGP, KCC)..." style="width:100%; padding:0.75rem 1rem; border-radius:10px; border:1px solid #D1D5DB; font-size:1rem;" />
        </div>

        <!-- Scheme Cards Grid -->
        <div class="schemes-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:1.25rem;">
          ${displayedSchemes.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem; background:#F9FAFB; border-radius:12px; border:1px dashed #D1D5DB;">
              <h3>No schemes match your current search/filter criteria.</h3>
              <p class="text-muted">Try clearing the search query or switching discovery modes.</p>
            </div>
          ` : displayedSchemes.map(scheme => this.renderSchemeCard(scheme)).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEvents(container);
  }

  renderSecondaryFilterBar() {
    if (this.activeDiscoveryTab === 'category') {
      const categories = [
        { id: 'all', label: 'All Categories' },
        { id: 'Agriculture', label: '🌾 Agriculture' },
        { id: 'MSME & Startup Support', label: '⚙️ MSME & Startup Support' },
        { id: 'Women Entrepreneurship', label: '👩‍💼 Women Entrepreneurship' },
        { id: 'Financial Assistance', label: '💳 Financial Assistance' },
        { id: 'Skills & Employment', label: '🎓 Skills & Employment' },
        { id: 'Artisan & Craft', label: '🧵 Artisan & Craft' }
      ];

      return `
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid #E5E7EB;">
          ${categories.map(c => `
            <button class="btn btn-sm ${this.selectedCategory === c.id ? 'btn-primary' : 'btn-light'}" class="category-filter-btn" data-cat="${c.id}">
              ${c.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    if (this.activeDiscoveryTab === 'state') {
      const states = [
        { id: 'all', label: 'All Ministries & States' },
        { id: 'central', label: '🏛️ Central Govt Schemes' },
        { id: 'Uttar Pradesh', label: '🔴 Uttar Pradesh' },
        { id: 'Rajasthan', label: '🟡 Rajasthan' },
        { id: 'Gujarat', label: '🔵 Gujarat' },
        { id: 'Karnataka', label: '🟢 Karnataka' }
      ];

      return `
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid #E5E7EB;">
          ${states.map(s => `
            <button class="btn btn-sm ${this.selectedStateFilter === s.id ? 'btn-primary' : 'btn-light'}" class="state-filter-btn" data-state="${s.id}">
              ${s.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    return '';
  }

  renderSchemeCard(scheme) {
    const isSelected = this.selectedForComparison.has(scheme.id);

    return `
      <div class="card scheme-card" style="border: 2px solid ${scheme.matchStatus === 'full' ? '#10B981' : scheme.matchStatus === 'partial' ? '#F59E0B' : '#E5E7EB'}; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
        
        ${scheme.unverifiedFlag ? `
          <div style="background:#FEF2F2; color:#DC2626; font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-bottom:1px solid #FCA5A5;">
            ⚠️ unverified — confirm before launch
          </div>
        ` : ''}

        <div style="padding:1.25rem;">
          <!-- Top Tag Header -->
          <div class="flex-between align-center mb-2">
            <span class="badge ${scheme.type === 'Central' ? 'badge-primary' : 'badge-warning'}">
              ${scheme.type === 'Central' ? '🏛️ Central Scheme' : `🔴 State: ${scheme.state}`}
            </span>
            <span class="badge" style="background:${scheme.matchStatus === 'full' ? '#ECFDF5' : scheme.matchStatus === 'partial' ? '#FEF3C7' : '#F3F4F6'}; color:${scheme.matchStatus === 'full' ? '#065F46' : scheme.matchStatus === 'partial' ? '#92400E' : '#6B7280'}; font-weight:800;">
              ${scheme.matchStatus === 'full' ? `100% Eligible` : scheme.matchStatus === 'partial' ? `${scheme.matchScore}% Match (Gaps)` : `Browse Only`}
            </span>
          </div>

          <h3 style="margin:0.25rem 0 0.5rem 0; font-size:1.15rem; color:#111827; line-height:1.35;">${scheme.name}</h3>
          <div style="font-size:0.9rem; color:#059669; font-weight:700; margin-bottom:0.75rem;">${scheme.nameHi}</div>

          <p class="text-sm text-muted" style="margin-bottom:0.75rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${scheme.summary}
          </p>

          <!-- Benefit Box -->
          <div style="background:#F0FDF4; border-left:4px solid #059669; padding:0.6rem 0.8rem; border-radius:6px; margin-bottom:0.85rem;">
            <div style="font-size:0.75rem; text-transform:uppercase; color:#065F46; font-weight:800;">Financial Benefit</div>
            <strong style="font-size:0.95rem; color:#047857;">${scheme.benefitAmount}</strong>
          </div>

          <!-- Qualification Gap Analysis Card if partial -->
          ${scheme.gaps && scheme.gaps.length > 0 ? `
            <div style="background:#FEF3C7; border:1px solid #FCD34D; padding:0.65rem 0.75rem; border-radius:8px; margin-bottom:0.85rem;">
              <div style="font-weight:700; color:#92400E; font-size:0.85rem; display:flex; align-center; gap:0.4rem;">
                <span>⚠️ Qualification Gap Detected (${scheme.gaps.length})</span>
              </div>
              <div style="font-size:0.8rem; color:#78350F; margin-top:0.25rem;">
                <strong>${scheme.gaps[0].gapTitle}:</strong> ${scheme.gaps[0].description}
              </div>
              <a href="${scheme.gaps[0].actionLink}" target="_blank" style="display:inline-block; font-size:0.78rem; font-weight:800; color:#B45309; text-decoration:underline; margin-top:0.3rem;">
                👉 Action: ${scheme.gaps[0].resolutionAction} ↗
              </a>
            </div>
          ` : ''}

          <div style="font-size:0.82rem; color:#4B5563; margin-bottom:0.5rem;">
            <strong>Issuing Body:</strong> ${scheme.issuingBody}
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="padding:0.85rem 1.25rem; background:#F9FAFB; border-top:1px solid #E5E7EB; display:flex; justify-content:space-between; align-items:center;">
          <label style="font-size:0.82rem; font-weight:700; color:#374151; cursor:pointer; display:flex; align-items:center; gap:0.35rem;">
            <input type="checkbox" class="compare-checkbox" data-id="${scheme.id}" ${isSelected ? 'checked' : ''} />
            <span>Compare</span>
          </label>

          <div class="flex-gap align-center">
            <button class="btn btn-sm btn-light btn-view-scheme" data-id="${scheme.id}">
              📋 Details
            </button>
            <a href="${scheme.applyLink}" target="_blank" class="btn btn-sm btn-primary" style="background:#059669; color:#FFF; font-weight:800; text-decoration:none;">
              Apply Now ↗
            </a>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents(container) {
    // Mode tabs
    const btnMatched = container.querySelector('#tab-mode-matched');
    const btnCategory = container.querySelector('#tab-mode-category');
    const btnState = container.querySelector('#tab-mode-state');

    if (btnMatched) btnMatched.onclick = () => { this.activeDiscoveryTab = 'matched'; this.renderSchemesSection(container); };
    if (btnCategory) btnCategory.onclick = () => { this.activeDiscoveryTab = 'category'; this.renderSchemesSection(container); };
    if (btnState) btnState.onclick = () => { this.activeDiscoveryTab = 'state'; this.renderSchemesSection(container); };

    // Search input
    const searchInput = container.querySelector('#scheme-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderSchemesSection(container);
      };
    }

    // Edit profile trigger
    const editBtn = container.querySelector('#btn-edit-profile-schemes');
    if (editBtn) {
      editBtn.onclick = () => {
        if (this.app.onboardingQuestionnaire) {
          this.app.onboardingQuestionnaire.renderQuestionnaireModal();
        }
      };
    }

    // Category filter pills
    container.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedCategory = btn.dataset.cat;
        this.renderSchemesSection(container);
      };
    });

    // State filter pills
    container.querySelectorAll('.state-filter-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedStateFilter = btn.dataset.state;
        this.renderSchemesSection(container);
      };
    });

    // Compare checkboxes
    container.querySelectorAll('.compare-checkbox').forEach(chk => {
      chk.onchange = (e) => {
        const id = e.target.dataset.id;
        if (e.target.checked) {
          if (this.selectedForComparison.size >= 3) {
            alert('You can compare a maximum of 3 schemes side-by-side.');
            e.target.checked = false;
            return;
          }
          this.selectedForComparison.add(id);
        } else {
          this.selectedForComparison.delete(id);
        }
        this.renderSchemesSection(container);
      };
    });

    // Detail view triggers
    container.querySelectorAll('.btn-view-scheme').forEach(btn => {
      btn.onclick = () => {
        this.renderDetailModal(btn.dataset.id);
      };
    });

    // Open Compare Modal
    const btnCompareModal = container.querySelector('#btn-open-compare-modal');
    if (btnCompareModal) {
      btnCompareModal.onclick = () => {
        if (this.selectedForComparison.size === 0) {
          alert('Please check at least 1 or 2 schemes to compare.');
          return;
        }
        this.renderCompareModal();
      };
    }
  }

  renderDetailModal(schemeId) {
    const scheme = schemesData.find(s => s.id === schemeId);
    if (!scheme) return;

    const existing = document.getElementById('scheme-detail-modal');
    if (existing) existing.remove();

    const profile = this.app.onboardingQuestionnaire ? this.app.onboardingQuestionnaire.getProfile() : this.app.state.userProfile;
    const gaps = scheme.gapAnalysisRules ? scheme.gapAnalysisRules(profile) : [];

    const modalHtml = `
      <div class="modal-backdrop" id="scheme-detail-modal" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
        <div class="modal-card" style="background:#FFF; max-width:800px; width:100%; max-height:92vh; overflow-y:auto; border-radius:16px; padding:1.75rem; border:2px solid #059669; box-shadow:0 20px 40px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <div class="flex-between align-center mb-3" style="border-bottom:2px solid #ECFDF5; padding-bottom:1rem;">
            <div>
              <span class="badge ${scheme.type === 'Central' ? 'badge-primary' : 'badge-warning'} mb-1">
                ${scheme.type === 'Central' ? '🏛️ Central Ministry Scheme' : `🔴 State Govt: ${scheme.state}`}
              </span>
              <h2 style="margin:0; font-size:1.4rem; color:#065F46;">${scheme.name}</h2>
              <div style="font-weight:700; color:#059669;">${scheme.nameHi}</div>
            </div>
            <button class="btn btn-sm" id="btn-close-detail" style="font-size:1.3rem; background:none; border:none; cursor:pointer;">✖</button>
          </div>

          ${scheme.unverifiedFlag ? `
            <div style="background:#FEF2F2; color:#DC2626; border:1px solid #FCA5A5; padding:0.6rem 0.85rem; border-radius:8px; font-weight:700; font-size:0.85rem; margin-bottom:1rem;">
              ⚠️ Note: unverified eligibility rule — please confirm official guidelines before application launch.
            </div>
          ` : ''}

          <!-- Summary & Financial Benefit -->
          <div class="card mb-3" style="background:#F0FDF4; border-left:5px solid #059669; padding:1rem 1.25rem;">
            <div style="font-size:0.8rem; text-transform:uppercase; font-weight:800; color:#065F46;">Financial Support & Subsidy</div>
            <h3 style="margin:0.25rem 0; color:#047857; font-size:1.2rem;">${scheme.benefitAmount}</h3>
            <p style="margin:0.3rem 0 0 0; font-size:0.9rem; color:#374151;">${scheme.summary}</p>
          </div>

          <!-- Qualification Gap Resolution Callout if present -->
          ${gaps.length > 0 ? `
            <div class="card mb-3" style="background:#FEF3C7; border:1px solid #FCD34D; padding:1rem 1.25rem;">
              <h4 style="margin:0 0 0.5rem 0; color:#92400E; display:flex; align-center; gap:0.4rem;">
                ⚠️ Qualification Gap Analysis (${gaps.length} Gaps Found)
              </h4>
              ${gaps.map(g => `
                <div style="margin-bottom:0.6rem; border-bottom:1px dashed #FBBF24; padding-bottom:0.5rem;">
                  <strong style="color:#78350F; font-size:0.92rem;">${g.gapTitle}:</strong>
                  <span style="font-size:0.88rem; color:#451A03;"> ${g.description}</span>
                  <div style="margin-top:0.25rem;">
                    <a href="${g.actionLink}" target="_blank" class="btn btn-sm btn-primary" style="background:#B45309; color:#FFF; font-size:0.8rem; font-weight:700; padding:0.25rem 0.75rem;">
                      1-Click Resolution: ${g.resolutionAction} ↗
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Detailed Sections Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem;">
            <!-- Eligibility Criteria -->
            <div style="background:#F9FAFB; padding:1rem; border-radius:10px; border:1px solid #E5E7EB;">
              <h4 style="margin:0 0 0.5rem 0; color:#1F2937;">📋 Eligibility Criteria</h4>
              <p style="font-size:0.88rem; color:#4B5563; line-height:1.4; margin:0;">${scheme.eligibilityCriteriaText}</p>
              <div style="margin-top:0.6rem; font-size:0.82rem; color:#6B7280;">
                <strong>Income Ceiling:</strong> ${scheme.incomeLimits}
              </div>
            </div>

            <!-- Documents Required -->
            <div style="background:#F9FAFB; padding:1rem; border-radius:10px; border:1px solid #E5E7EB;">
              <h4 style="margin:0 0 0.5rem 0; color:#1F2937;">📄 Required Documents Checklist</h4>
              <ul style="margin:0; padding-left:1.2rem; font-size:0.85rem; color:#374151;">
                ${scheme.requiredDocuments.map(doc => `<li style="margin-bottom:0.35rem;">${doc}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Step by Step Application Guide -->
          <div style="background:#F9FAFB; padding:1rem 1.25rem; border-radius:10px; border:1px solid #E5E7EB; margin-bottom:1.5rem;">
            <h4 style="margin:0 0 0.6rem 0; color:#1F2937;">🗺️ Official Step-by-Step Application Process</h4>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${scheme.applicationProcess.map(step => `
                <div style="font-size:0.88rem; color:#374151; background:#FFF; padding:0.5rem 0.75rem; border-radius:6px; border:1px solid #E5E7EB;">
                  ${step}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Footer Portal Direct Link Button -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #E5E7EB; padding-top:1rem;">
            <div style="font-size:0.82rem; color:#6B7280;">
              <strong>Issuing Department:</strong> ${scheme.issuingBody}
            </div>
            <div class="flex-gap align-center">
              <button class="btn btn-secondary" id="btn-close-detail-bottom">Close</button>
              <a href="${scheme.applyLink}" target="_blank" class="btn btn-primary" style="background:#059669; color:#FFF; font-weight:800; padding:0.6rem 1.4rem; text-decoration:none; font-size:1rem;">
                🚀 Apply via Official Portal (${scheme.applyLink.split('/')[2]}) ↗
              </a>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('btn-close-detail').onclick = () => document.getElementById('scheme-detail-modal').remove();
    document.getElementById('btn-close-detail-bottom').onclick = () => document.getElementById('scheme-detail-modal').remove();
  }

  renderCompareModal() {
    const selectedIds = Array.from(this.selectedForComparison);
    const selectedSchemes = schemesData.filter(s => selectedIds.includes(s.id));

    const existing = document.getElementById('scheme-compare-modal');
    if (existing) existing.remove();

    const modalHtml = `
      <div class="modal-backdrop" id="scheme-compare-modal" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
        <div class="modal-card" style="background:#FFF; max-width:950px; width:100%; max-height:92vh; overflow-y:auto; border-radius:16px; padding:1.75rem; border:2px solid #059669; box-shadow:0 20px 40px rgba(0,0,0,0.3);">
          
          <div class="flex-between align-center mb-3" style="border-bottom:2px solid #ECFDF5; padding-bottom:1rem;">
            <div>
              <span class="badge badge-success mb-1">Side-by-Side Analysis</span>
              <h2 style="margin:0; font-size:1.4rem; color:#065F46;">⚖️ Scheme Comparison Matrix</h2>
            </div>
            <button class="btn btn-sm" id="btn-close-compare" style="font-size:1.3rem; background:none; border:none; cursor:pointer;">✖</button>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
              <thead>
                <tr style="background:#F0FDF4; border-bottom:2px solid #059669;">
                  <th style="padding:0.75rem; text-align:left; width:180px; color:#065F46;">Feature / Criteria</th>
                  ${selectedSchemes.map(s => `
                    <th style="padding:0.75rem; text-align:left; color:#047857; min-width:220px;">
                      <strong>${s.name}</strong>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Issuing Body</td>
                  ${selectedSchemes.map(s => `<td style="padding:0.75rem;">${s.issuingBody} (${s.type})</td>`).join('')}
                </tr>
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Benefit Amount</td>
                  ${selectedSchemes.map(s => `<td style="padding:0.75rem; font-weight:700; color:#059669;">${s.benefitAmount}</td>`).join('')}
                </tr>
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Benefit Type</td>
                  ${selectedSchemes.map(s => `<td style="padding:0.75rem;">${s.benefitType}</td>`).join('')}
                </tr>
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Income Limits</td>
                  ${selectedSchemes.map(s => `<td style="padding:0.75rem;">${s.incomeLimits}</td>`).join('')}
                </tr>
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Eligibility Summary</td>
                  ${selectedSchemes.map(s => `<td style="padding:0.75rem;">${s.eligibilityCriteriaText}</td>`).join('')}
                </tr>
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Required Documents</td>
                  ${selectedSchemes.map(s => `
                    <td style="padding:0.75rem;">
                      <ul style="margin:0; padding-left:1rem; font-size:0.8rem;">
                        ${s.requiredDocuments.map(d => `<li>${d}</li>`).join('')}
                      </ul>
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  <td style="padding:0.75rem; font-weight:700; background:#F9FAFB;">Official Portal</td>
                  ${selectedSchemes.map(s => `
                    <td style="padding:0.75rem;">
                      <a href="${s.applyLink}" target="_blank" class="btn btn-sm btn-primary" style="background:#059669; color:#FFF; font-weight:700; text-decoration:none;">
                        Apply Link ↗
                      </a>
                    </td>
                  `).join('')}
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top:1.5rem; text-align:right;">
            <button class="btn btn-secondary" id="btn-close-compare-bottom">Close Matrix</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('btn-close-compare').onclick = () => document.getElementById('scheme-compare-modal').remove();
    document.getElementById('btn-close-compare-bottom').onclick = () => document.getElementById('scheme-compare-modal').remove();
  }
}
