// Rural Fintech Literacy & Access Platform - Main Application Controller

import { personas } from './data/personas.js';
import { translations } from './data/translations.js';
import { audioEngine } from './modules/audioEngine.js';
import { TrustScoreEngine } from './modules/trustScoreEngine.js';
import { Marketplace } from './modules/marketplace.js';
import { Literacy } from './modules/literacy.js';
import { KycAgent } from './modules/kycAgent.js';
import { ApplicationTracker } from './modules/tracker.js';
import { LenderDashboard } from './modules/lenderDashboard.js';
import { OfflineSync } from './modules/offlineSync.js';
import { GyanVoiceAgent } from './modules/gyanVoiceAgent.js';
import { OnboardingQuestionnaire } from './modules/onboardingQuestionnaire.js';
import { SchemeEngine } from './modules/schemeEngine.js';
import { AuthManager } from './modules/authManager.js';
import { AdminDashboard } from './modules/adminDashboard.js';

class App {
  constructor() {
    this.state = {
      personaId: 'meena',
      language: 'hi',
      activeTab: 'score',
      isAudioMuted: false,
      isOffline: false,
      currentScore: 685,
      completedLessons: [],
      interviewCompleted: false,
      scoreModifiers: {},
      applications: [
        {
          appId: 'APP-9082',
          productTitle: 'Tyohar & Stock Working Capital',
          lender: 'Gramin Small Finance Bank',
          statusText: 'Bank Disbursed to UPI',
          statusClass: 'status-disbursed',
          date: '03 Sept 2026',
          step: 4
        }
      ]
    };

    // Modules
    this.trustEngine = new TrustScoreEngine(this);
    this.marketplace = new Marketplace(this);
    this.literacy = new Literacy(this);
    this.kycAgent = new KycAgent(this);
    this.tracker = new ApplicationTracker(this);
    this.lenderDashboard = new LenderDashboard(this);
    this.offlineSync = new OfflineSync(this);
    this.gyanAgent = new GyanVoiceAgent(this);
    this.onboardingQuestionnaire = new OnboardingQuestionnaire(this);
    this.schemeEngine = new SchemeEngine(this);
    this.authManager = new AuthManager(this);
    this.adminDashboard = new AdminDashboard(this);

    this.init();
  }

  init() {
    this.renderHeader();
    this.attachHeaderEvents();
    this.renderActiveTab();
    this.gyanAgent.initWidget();
    this.schemeEngine.reMatchAndNotify(false);

    // Global audio engine state feedback
    audioEngine.onStateChange = (isSpeaking) => {
      const wave = document.getElementById('global-audio-wave');
      if (wave) {
        if (isSpeaking) wave.classList.add('playing');
        else wave.classList.remove('playing');
      }
    };
  }

  getCurrentPersona() {
    return personas.find(p => p.id === this.state.personaId) || personas[0];
  }

  t(key) {
    const dict = translations[this.state.language] || translations['hi'];
    return dict[key] || translations['en'][key] || key;
  }

  renderHeader() {
    const p = this.getCurrentPersona();
    const matchedCount = this.schemeEngine ? this.schemeEngine.getMatchedCount() : 0;
    const currentUser = this.authManager ? this.authManager.getCurrentUser() : null;
    const isAdmin = this.authManager ? this.authManager.isAdmin() : false;

    const headerHtml = `
      <header class="app-header glass-header">
        <div class="header-top flex-between">
          <div class="brand-box flex-gap align-center">
            <span class="brand-logo">🌾</span>
            <div>
              <h1 class="brand-title">${this.t('appName')}</h1>
              <div class="brand-tagline">${this.t('tagline')}</div>
            </div>
          </div>

          <!-- Controls: Auth Login, Language, Persona, Voice Toggle, Schemes Bell, Offline -->
          <div class="header-controls flex-gap align-center">
            
            <!-- Auth Login / Account Status Button -->
            <button class="btn btn-sm ${isAdmin ? 'btn-primary' : 'btn-outline-primary'}" id="btn-header-auth-login" style="font-weight:800; border-radius:10px; ${isAdmin ? 'background:#3730A3; border-color:#4338CA;' : ''}">
              ${isAdmin ? '🛡️ Admin Account' : currentUser ? `👤 ${currentUser.name}` : '🔑 Login'}
            </button>

            <!-- Persona Switcher -->
            <div class="control-group">
              <label class="control-lbl">👤 Persona:</label>
              <select id="persona-select" class="form-select-sm">
                ${personas.map(pers => `
                  <option value="${pers.id}" ${pers.id === this.state.personaId ? 'selected' : ''}>
                    ${pers.avatar} ${pers.name} (${pers.role})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Language Select -->
            <div class="control-group">
              <label class="control-lbl">🌐 Lang:</label>
              <select id="language-select" class="form-select-sm">
                <option value="hi" ${this.state.language === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                <option value="en" ${this.state.language === 'en' ? 'selected' : ''}>English</option>
                <option value="gu" ${this.state.language === 'gu' ? 'selected' : ''}>ગુજરાતી (Gujarati)</option>
                <option value="kn" ${this.state.language === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
                <option value="ta" ${this.state.language === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                <option value="te" ${this.state.language === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
                <option value="mr" ${this.state.language === 'mr' ? 'selected' : ''}>मराठी (Marathi)</option>
                <option value="bn" ${this.state.language === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
              </select>
            </div>

            <!-- Voice Mute Toggle -->
            <button class="btn btn-audio-toggle ${this.state.isAudioMuted ? 'muted' : ''}" id="btn-toggle-voice">
              <span id="global-audio-wave" class="audio-wave">
                <span></span><span></span><span></span>
              </span>
              <span id="lbl-voice-state">${this.state.isAudioMuted ? '🔇 Voice Muted' : '🔊 Voice Guide'}</span>
            </button>

            <!-- Schemes Bell Trigger -->
            <button class="btn btn-sm btn-outline-primary" id="btn-header-schemes-bell" style="font-weight:800; border-radius:10px;">
              🔔 Schemes <span class="badge badge-danger" id="hdr-scheme-badge" style="display:${matchedCount > 0 ? 'inline-block' : 'none'}; font-size:0.7rem;">${matchedCount}</span>
            </button>

            <!-- Gyan Voice Agent Header Button -->
            <button class="btn btn-primary btn-sm" id="btn-header-gyan-mic" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color:#FFF; font-weight:800; border:1px solid #34D399;">
              🎙️ Talk to Gyan (ज्ञान AI)
            </button>

            <!-- Offline Mode Toggle -->
            <button class="btn btn-sm btn-offline-toggle ${this.state.isOffline ? 'is-offline' : ''}" id="btn-toggle-offline">
              ${this.state.isOffline ? '📡 Offline (USSD)' : '📶 Online 4G'}
            </button>
          </div>
        </div>

        <!-- Vernacular Voice Banner -->
        <div class="voice-assistant-bar flex-between" id="voice-bar" style="background: linear-gradient(90deg, #ECFDF5 0%, #FEF3C7 100%); border: 2px solid #059669; padding: 0.85rem 1.25rem;">
          <div class="flex-gap align-center">
            <span class="pulse-mic" style="font-size:1.6rem;">🎙️</span>
            <div>
              <strong style="font-size:1.05rem; color:#065F46;">Gyan (ज्ञान Real-Time Hindi Voice AI)</strong>
              <div id="voice-bar-text" class="text-sm">
                "Namaste ${p.name} ji! Ask me anything about Trust Score, loans, or government schemes in Hindi."
              </div>
            </div>
          </div>
          <div class="flex-gap align-center">
            <button class="btn btn-primary" id="btn-banner-gyan-start" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color:#FFF; font-size:1rem; font-weight:800; padding:0.6rem 1.2rem; border-radius:10px; box-shadow:0 4px 12px rgba(5,150,105,0.3);">
              🎙️ Talk to Gyan Now
            </button>
            <button class="btn btn-sm btn-audio" id="btn-read-bar">🔊 Page Help</button>
          </div>
        </div>

        <!-- Offline Banner -->
        <div class="offline-banner" id="offline-banner" style="display:${this.state.isOffline ? 'block' : 'none'};">
          📡 <strong>Offline Mode Active (USSD Fallback):</strong> Changes queued and synced automatically via SMS when network returns.
        </div>

        <!-- Navigation Tabs -->
        <nav class="app-nav mt-2">
          <button class="nav-tab ${this.state.activeTab === 'score' ? 'active' : ''}" data-tab="score">
            ⭐ ${this.t('navScore')}
          </button>
          <button class="nav-tab ${this.state.activeTab === 'schemes' ? 'active' : ''}" data-tab="schemes" style="position:relative;">
            🏛️ ${this.t('navSchemes')}
            <span id="scheme-bell-badge" class="badge badge-danger" style="position:absolute; top:-4px; right:-4px; font-size:0.7rem; padding:0.15rem 0.4rem; border-radius:10px; display:${matchedCount > 0 ? 'inline-block' : 'none'};">${matchedCount}</span>
          </button>
          <button class="nav-tab ${this.state.activeTab === 'marketplace' ? 'active' : ''}" data-tab="marketplace">
            📦 ${this.t('navMarketplace')}
          </button>
          <button class="nav-tab ${this.state.activeTab === 'literacy' ? 'active' : ''}" data-tab="literacy">
            🎓 ${this.t('navLiteracy')}
          </button>
          <button class="nav-tab ${this.state.activeTab === 'kyc' ? 'active' : ''}" data-tab="kyc">
            📸 ${this.t('navKyc')}
          </button>
          <button class="nav-tab ${this.state.activeTab === 'tracker' ? 'active' : ''}" data-tab="tracker">
            📋 ${this.t('navTracker')}
          </button>
          <button class="nav-tab ${this.state.activeTab === 'lender' ? 'active' : ''}" data-tab="lender">
            🏦 ${this.t('navLender')}
          </button>
          <button class="nav-tab ${this.state.activeTab === 'admin' ? 'active' : ''}" data-tab="admin" style="font-weight:800; color:${isAdmin ? '#3730A3' : 'inherit'};">
            🛡️ ${this.t('navAdmin')}
          </button>
        </nav>
      </header>
    `;

    document.getElementById('header-container').innerHTML = headerHtml;
  }

  attachHeaderEvents() {
    // Auth login trigger
    const authBtn = document.getElementById('btn-header-auth-login');
    if (authBtn) {
      authBtn.onclick = () => {
        this.authManager.renderLoginModal();
      };
    }

    // Persona dropdown
    const personaSelect = document.getElementById('persona-select');
    if (personaSelect) {
      personaSelect.onchange = (e) => {
        this.state.personaId = e.target.value;
        const p = this.getCurrentPersona();
        this.state.language = p.preferredLanguage || 'hi';
        this.state.scoreModifiers = {};
        this.state.interviewCompleted = false;

        // Reset user profile to persona defaults
        if (this.onboardingQuestionnaire) {
          const defProf = this.onboardingQuestionnaire.getDefaultProfileForPersona(p.id);
          this.onboardingQuestionnaire.saveProfile(defProf);
        }

        audioEngine.speak(`Swagat hai ${p.name} ji! Aapki dukan aavedan profile load ho gayi hai.`, this.state.language);
        this.renderHeader();
        this.attachHeaderEvents();
        this.renderActiveTab();
      };
    }

    // Language dropdown
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
      langSelect.onchange = (e) => {
        this.state.language = e.target.value;
        this.renderHeader();
        this.attachHeaderEvents();
        this.renderActiveTab();
      };
    }

    // Voice mute toggle
    const voiceBtn = document.getElementById('btn-toggle-voice');
    if (voiceBtn) {
      voiceBtn.onclick = () => {
        this.state.isAudioMuted = !this.state.isAudioMuted;
        audioEngine.setMuted(this.state.isAudioMuted);
        this.renderHeader();
        this.attachHeaderEvents();
      };
    }

    // Header Schemes Bell Trigger
    const schemesBell = document.getElementById('btn-header-schemes-bell');
    if (schemesBell) {
      schemesBell.onclick = () => {
        this.switchTab('schemes');
      };
    }

    // Header Gyan Voice Agent button trigger
    const headerGyanBtn = document.getElementById('btn-header-gyan-mic');
    const bannerGyanBtn = document.getElementById('btn-banner-gyan-start');
    
    const triggerGyanMic = () => {
      const floatMic = document.getElementById('btn-gyan-mic');
      const chatCard = document.getElementById('gyan-chat-card');
      if (chatCard) chatCard.style.display = 'block';
      if (floatMic) floatMic.click();
    };

    if (headerGyanBtn) headerGyanBtn.onclick = triggerGyanMic;
    if (bannerGyanBtn) bannerGyanBtn.onclick = triggerGyanMic;

    // Offline mode toggle
    const offlineBtn = document.getElementById('btn-toggle-offline');
    if (offlineBtn) {
      offlineBtn.onclick = () => {
        this.state.isOffline = !this.state.isOffline;
        this.offlineSync.toggleOfflineMode(this.state.isOffline);
        this.renderHeader();
        this.attachHeaderEvents();
      };
    }

    // Read bar help button
    const readBarBtn = document.getElementById('btn-read-bar');
    if (readBarBtn) {
      readBarBtn.onclick = () => {
        const p = this.getCurrentPersona();
        audioEngine.speak(`Swagat hai ${p.name} ji! Neeche alag alag tab hain. Pehla tab Trust score ka hai, doosra tab sarkari yojnaon ka hai.`, this.state.language);
      };
    }

    // Nav tabs
    document.querySelectorAll('.nav-tab').forEach(tabBtn => {
      tabBtn.onclick = () => {
        const tab = tabBtn.dataset.tab;
        this.switchTab(tab);
      };
    });
  }

  switchTab(tab) {
    if (tab === 'admin' && !this.authManager.isAdmin()) {
      this.authManager.renderLoginModal();
      return;
    }
    this.state.activeTab = tab;
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    this.renderActiveTab();
  }

  renderActiveTab() {
    const mainContainer = document.getElementById('main-content');
    mainContainer.innerHTML = '';

    switch (this.state.activeTab) {
      case 'score':
        this.trustEngine.renderScoreSection(mainContainer);
        break;
      case 'schemes':
        this.schemeEngine.renderSchemesSection(mainContainer);
        break;
      case 'marketplace':
        this.marketplace.renderMarketplaceSection(mainContainer);
        break;
      case 'literacy':
        this.literacy.renderLiteracySection(mainContainer);
        break;
      case 'kyc':
        this.kycAgent.renderKycSection(mainContainer);
        break;
      case 'tracker':
        this.tracker.renderTrackerSection(mainContainer);
        break;
      case 'lender':
        this.lenderDashboard.renderLenderSection(mainContainer);
        break;
      case 'admin':
        this.adminDashboard.renderAdminSection(mainContainer);
        break;
      default:
        this.trustEngine.renderScoreSection(mainContainer);
    }
  }

  addApplicationRecord(product) {
    const appId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      appId,
      productTitle: product.title,
      lender: product.lender,
      statusText: 'Bank Sanctioned — Pending Disbursement',
      statusClass: 'status-approved',
      date: 'Today',
      step: 3
    };
    this.state.applications.unshift(newApp);
    this.offlineSync.addToQueue('loan_application', newApp);
  }
}

// Initialize application safely across all script loading states
const startApp = () => {
  if (!window.app) {
    window.app = new App();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
