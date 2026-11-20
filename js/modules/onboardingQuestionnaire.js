// Onboarding Questionnaire & Entrepreneur Profile Management Module
// Modeled on myScheme.gov.in (Enter Details -> Search -> Select & Apply)

export class OnboardingQuestionnaire {
  constructor(app) {
    this.app = app;
    this.storageKey = 'vyapargyan_user_profile_v1';
    this.initProfile();
  }

  initProfile() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.app.state.userProfile = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Failed to parse saved profile:', e);
      }
    }
    // Default fallback based on current persona
    this.app.state.userProfile = this.getDefaultProfileForPersona(this.app.state.personaId);
  }

  getDefaultProfileForPersona(personaId) {
    switch (personaId) {
      case 'meena':
        return {
          businessType: 'kirana',
          businessTypeName: 'Kirana & General Store',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          monthlyIncome: 25000,
          incomeRange: '15000_30000',
          yearsInOperation: 3,
          opYearsRange: '2_5',
          loanHistory: 'mfi',
          assetOwnership: 'rented',
          hasLandOrAsset: false,
          category: 'obc',
          gender: 'female',
          age: 32,
          ageRange: '18_35',
          education: '8th_pass',
          hasUdyam: false,
          hasFssai: false,
          hasBankStatement: true
        };
      case 'ramesh':
        return {
          businessType: 'farming',
          businessTypeName: 'Smallholder Agriculture & Vegetables',
          state: 'Rajasthan',
          district: 'Jaipur',
          monthlyIncome: 18000,
          incomeRange: '15000_30000',
          yearsInOperation: 6,
          opYearsRange: '5_plus',
          loanHistory: 'cleared',
          assetOwnership: 'land',
          hasLandOrAsset: true,
          category: 'general',
          gender: 'male',
          age: 42,
          ageRange: '35_50',
          education: 'primary',
          hasUdyam: false,
          hasFssai: false,
          hasBankStatement: true
        };
      case 'sunita':
        return {
          businessType: 'artisan',
          businessTypeName: 'Handloom & Textile Artisan',
          state: 'Gujarat',
          district: 'Surat',
          monthlyIncome: 14000,
          incomeRange: '< 15000',
          yearsInOperation: 2,
          opYearsRange: '1_2',
          loanHistory: 'none',
          assetOwnership: 'none',
          hasLandOrAsset: false,
          category: 'sc',
          gender: 'female',
          age: 28,
          ageRange: '18_35',
          education: '8th_pass',
          hasUdyam: false,
          hasFssai: false,
          hasBankStatement: false
        };
      default:
        return {
          businessType: 'kirana',
          businessTypeName: 'Micro Business / Shop',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          monthlyIncome: 25000,
          incomeRange: '15000_30000',
          yearsInOperation: 3,
          opYearsRange: '2_5',
          loanHistory: 'mfi',
          assetOwnership: 'rented',
          hasLandOrAsset: false,
          category: 'obc',
          gender: 'female',
          age: 30,
          ageRange: '18_35',
          education: '8th_pass',
          hasUdyam: false,
          hasFssai: false,
          hasBankStatement: true
        };
    }
  }

  getProfile() {
    if (!this.app.state.userProfile) {
      this.initProfile();
    }
    return this.app.state.userProfile;
  }

  saveProfile(updatedProfile) {
    this.app.state.userProfile = { ...this.app.state.userProfile, ...updatedProfile };
    localStorage.setItem(this.storageKey, JSON.stringify(this.app.state.userProfile));
    
    // Trigger scheme re-matching and toast notification
    if (this.app.schemeEngine) {
      this.app.schemeEngine.reMatchAndNotify(true);
    }
  }

  renderQuestionnaireModal() {
    const prof = this.getProfile();

    const existingModal = document.getElementById('questionnaire-modal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
      <div class="modal-backdrop" id="questionnaire-modal" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
        <div class="modal-card" style="background:#FFF; max-width:750px; width:100%; max-height:90vh; overflow-y:auto; border-radius:16px; padding:1.75rem; box-shadow:0 20px 40px rgba(0,0,0,0.3); border:2px solid #059669;">
          <div class="flex-between align-center mb-3" style="border-bottom:2px solid #ECFDF5; padding-bottom:1rem;">
            <div>
              <span class="badge badge-success mb-1">myScheme.gov.in Flow</span>
              <h2 style="margin:0; font-size:1.4rem; color:#065F46;">📋 Onboarding Questionnaire & Scheme Matcher</h2>
              <p class="text-sm text-muted" style="margin:0.25rem 0 0 0;">Fill your details once to discover all eligible Central & State Govt Schemes.</p>
            </div>
            <button class="btn btn-sm" id="btn-close-modal" style="font-size:1.2rem; background:none; border:none; cursor:pointer;">✖</button>
          </div>

          <form id="questionnaire-form" class="form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem;">
            
            <!-- 1. Business Type -->
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" style="font-weight:700; color:#1F2937;">1. Business / Activity Type:</label>
              <select name="businessType" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="kirana" ${prof.businessType === 'kirana' ? 'selected' : ''}>🏬 Kirana & General Provision Store</option>
                <option value="farming" ${prof.businessType === 'farming' ? 'selected' : ''}>🌾 Agriculture / Farming & Horticulture</option>
                <option value="artisan" ${prof.businessType === 'artisan' ? 'selected' : ''}>🧵 Handloom / Artisan Crafts / Pottery / Weaving</option>
                <option value="manufacturing" ${prof.businessType === 'manufacturing' ? 'selected' : ''}>⚙️ Micro-Manufacturing / Agro Processing Workshop</option>
                <option value="dairy" ${prof.businessType === 'dairy' ? 'selected' : ''}>🥛 Dairy / Animal Husbandry / Poultry / Fisheries</option>
                <option value="vendor" ${prof.businessType === 'vendor' ? 'selected' : ''}>🛒 Street Vendor / Hawker / Roadside Kiosk</option>
                <option value="services" ${prof.businessType === 'services' ? 'selected' : ''}>🔧 Repair Shop / Barber / Tailoring / Local Services</option>
              </select>
            </div>

            <!-- 2. Location State & District -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">2. State / UT:</label>
              <select name="state" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="Uttar Pradesh" ${prof.state === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
                <option value="Rajasthan" ${prof.state === 'Rajasthan' ? 'selected' : ''}>Rajasthan</option>
                <option value="Gujarat" ${prof.state === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
                <option value="Karnataka" ${prof.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
                <option value="Madhya Pradesh" ${prof.state === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
                <option value="Bihar" ${prof.state === 'Bihar' ? 'selected' : ''}>Bihar</option>
                <option value="Maharashtra" ${prof.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
                <option value="West Bengal" ${prof.state === 'West Bengal' ? 'selected' : ''}>West Bengal</option>
                <option value="Other" ${prof.state === 'Other' ? 'selected' : ''}>Other State / Union Territory</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">District Name:</label>
              <input type="text" name="district" class="form-input" value="${prof.district || 'Varanasi'}" placeholder="e.g. Varanasi, Jaipur, Surat" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;" required />
            </div>

            <!-- 3. Monthly Income -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">3. Monthly Business Income:</label>
              <select name="incomeRange" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="< 15000" ${prof.incomeRange === '< 15000' ? 'selected' : ''}>Below ₹15,000 / month</option>
                <option value="15000_30000" ${prof.incomeRange === '15000_30000' ? 'selected' : ''}>₹15,000 - ₹30,000 / month</option>
                <option value="30000_60000" ${prof.incomeRange === '30000_60000' ? 'selected' : ''}>₹30,000 - ₹60,000 / month</option>
                <option value="> 60000" ${prof.incomeRange === '> 60000' ? 'selected' : ''}>Above ₹60,000 / month</option>
              </select>
            </div>

            <!-- 4. Years in Operation -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">4. Business Operational Age:</label>
              <select name="opYearsRange" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="0" ${prof.opYearsRange === '0' ? 'selected' : ''}>New Startup / Greenfield (0 yrs)</option>
                <option value="1_2" ${prof.opYearsRange === '1_2' ? 'selected' : ''}>1 to 2 Years in operation</option>
                <option value="2_5" ${prof.opYearsRange === '2_5' ? 'selected' : ''}>2 to 5 Years in operation</option>
                <option value="5_plus" ${prof.opYearsRange === '5_plus' ? 'selected' : ''}>More than 5 Years</option>
              </select>
            </div>

            <!-- 5. Loan & Credit History -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">5. Prior Credit / Loan History:</label>
              <select name="loanHistory" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="none" ${prof.loanHistory === 'none' ? 'selected' : ''}>No prior loans (First-time borrower)</option>
                <option value="mfi" ${prof.loanHistory === 'mfi' ? 'selected' : ''}>Active MFI / SHG loan</option>
                <option value="bank" ${prof.loanHistory === 'bank' ? 'selected' : ''}>Active Bank Commercial loan</option>
                <option value="cleared" ${prof.loanHistory === 'cleared' ? 'selected' : ''}>Repaid prior loan successfully</option>
              </select>
            </div>

            <!-- 6. Land / Asset Ownership -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">6. Asset & Premises Ownership:</label>
              <select name="assetOwnership" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="land" ${prof.assetOwnership === 'land' ? 'selected' : ''}>Owns Agricultural Land (Khatauni)</option>
                <option value="commercial" ${prof.assetOwnership === 'commercial' ? 'selected' : ''}>Owns Commercial Shop / Premises</option>
                <option value="rented" ${prof.assetOwnership === 'rented' ? 'selected' : ''}>Rented Premises / Tenant Shop</option>
                <option value="none" ${prof.assetOwnership === 'none' ? 'selected' : ''}>No major landed asset</option>
              </select>
            </div>

            <!-- 7. Social Category -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">7. Social Category:</label>
              <select name="category" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="obc" ${prof.category === 'obc' ? 'selected' : ''}>OBC (Other Backward Classes)</option>
                <option value="general" ${prof.category === 'general' ? 'selected' : ''}>General Category</option>
                <option value="sc" ${prof.category === 'sc' ? 'selected' : ''}>SC (Scheduled Caste)</option>
                <option value="st" ${prof.category === 'st' ? 'selected' : ''}>ST (Scheduled Tribe)</option>
                <option value="minority" ${prof.category === 'minority' ? 'selected' : ''}>Minority Community</option>
              </select>
            </div>

            <!-- 8. Gender -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">8. Gender:</label>
              <select name="gender" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="female" ${prof.gender === 'female' ? 'selected' : ''}>Female (महिला)</option>
                <option value="male" ${prof.gender === 'male' ? 'selected' : ''}>Male (पुरुष)</option>
                <option value="transgender" ${prof.gender === 'transgender' ? 'selected' : ''}>Transgender / Other</option>
              </select>
            </div>

            <!-- 9. Age Group -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">9. Applicant Age Group:</label>
              <select name="ageRange" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="18_35" ${prof.ageRange === '18_35' ? 'selected' : ''}>18 - 35 Years (Youth)</option>
                <option value="35_50" ${prof.ageRange === '35_50' ? 'selected' : ''}>35 - 50 Years</option>
                <option value="50_plus" ${prof.ageRange === '50_plus' ? 'selected' : ''}>50+ Years</option>
              </select>
            </div>

            <!-- 10. Education Level -->
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1F2937;">10. Education Level:</label>
              <select name="education" class="form-select" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #D1D5DB;">
                <option value="8th_pass" ${prof.education === '8th_pass' ? 'selected' : ''}>8th / 10th Pass</option>
                <option value="non_formal" ${prof.education === 'non_formal' ? 'selected' : ''}>Primary / Non-formal</option>
                <option value="12th_pass" ${prof.education === '12th_pass' ? 'selected' : ''}>12th Pass</option>
                <option value="graduate" ${prof.education === 'graduate' ? 'selected' : ''}>Graduate / Diploma</option>
              </select>
            </div>

            <!-- Active Certifications / Checkbox Options -->
            <div class="form-group" style="grid-column: span 2; background:#F9FAFB; padding:0.85rem; border-radius:10px; border:1px solid #E5E7EB;">
              <label class="form-label" style="font-weight:700; color:#1F2937; display:block; mb-2;">Existing Registration & Documents (Check all that apply):</label>
              <div style="display:flex; gap:1.2rem; flex-wrap:wrap;">
                <label style="cursor:pointer; display:flex; align-center; gap:0.4rem;">
                  <input type="checkbox" name="hasUdyam" ${prof.hasUdyam ? 'checked' : ''} />
                  <span>Has Udyam MSME Certificate</span>
                </label>
                <label style="cursor:pointer; display:flex; align-center; gap:0.4rem;">
                  <input type="checkbox" name="hasFssai" ${prof.hasFssai ? 'checked' : ''} />
                  <span>Has FSSAI Food License</span>
                </label>
                <label style="cursor:pointer; display:flex; align-center; gap:0.4rem;">
                  <input type="checkbox" name="hasBankStatement" ${prof.hasBankStatement ? 'checked' : ''} />
                  <span>Has Active Bank Account Statement (6 Months)</span>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div style="grid-column: span 2; display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary" style="background:#059669; color:#FFF; font-weight:700; padding:0.6rem 1.5rem;">
                🔍 Run Scheme Matcher & Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Event Handlers
    document.getElementById('btn-close-modal').onclick = () => document.getElementById('questionnaire-modal').remove();
    document.getElementById('btn-cancel-modal').onclick = () => document.getElementById('questionnaire-modal').remove();

    const form = document.getElementById('questionnaire-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const updated = {
        businessType: formData.get('businessType'),
        state: formData.get('state'),
        district: formData.get('district'),
        incomeRange: formData.get('incomeRange'),
        opYearsRange: formData.get('opYearsRange'),
        loanHistory: formData.get('loanHistory'),
        assetOwnership: formData.get('assetOwnership'),
        hasLandOrAsset: formData.get('assetOwnership') === 'land' || formData.get('assetOwnership') === 'commercial',
        category: formData.get('category'),
        gender: formData.get('gender'),
        ageRange: formData.get('ageRange'),
        education: formData.get('education'),
        hasUdyam: formData.get('hasUdyam') === 'on',
        hasFssai: formData.get('hasFssai') === 'on',
        hasBankStatement: formData.get('hasBankStatement') === 'on'
      };

      // Calculate numeric helpers
      if (updated.incomeRange === '< 15000') updated.monthlyIncome = 12000;
      else if (updated.incomeRange === '15000_30000') updated.monthlyIncome = 25000;
      else if (updated.incomeRange === '30000_60000') updated.monthlyIncome = 45000;
      else updated.monthlyIncome = 75000;

      if (updated.opYearsRange === '0') updated.yearsInOperation = 0;
      else if (updated.opYearsRange === '1_2') updated.yearsInOperation = 1;
      else if (updated.opYearsRange === '2_5') updated.yearsInOperation = 3;
      else updated.yearsInOperation = 6;

      if (updated.ageRange === '18_35') updated.age = 28;
      else if (updated.ageRange === '35_50') updated.age = 42;
      else updated.age = 54;

      this.saveProfile(updated);
      document.getElementById('questionnaire-modal').remove();
    };
  }
}
