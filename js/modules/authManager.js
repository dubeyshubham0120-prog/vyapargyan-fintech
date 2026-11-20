// Auth & User Session Manager Module
// Supports Entrepreneur Login, Registration, Admin Login, Session Storage, and Role Control.

export class AuthManager {
  constructor(app) {
    this.app = app;
    this.storageKey = 'vyapargyan_auth_session_v2';
    this.initSession();
  }

  initSession() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.session = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Failed to parse auth session:', e);
      }
    }

    // Default session: Logged out / Guest mode so Login button is prominently shown
    this.session = {
      isLoggedIn: false,
      role: 'guest', // 'guest' | 'entrepreneur' | 'admin'
      user: null
    };
  }

  saveSession() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.session));
  }

  getCurrentUser() {
    return this.session ? this.session.user : null;
  }

  isLoggedIn() {
    return this.session && this.session.isLoggedIn;
  }

  isAdmin() {
    return this.session && this.session.isLoggedIn && this.session.role === 'admin';
  }

  loginAsAdmin(username, password) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if ((cleanUser === 'admin' || cleanUser === 'admin@vyapargyan.in') && (cleanPass === 'admin123' || cleanPass === '9999')) {
      this.session = {
        isLoggedIn: true,
        role: 'admin',
        user: {
          id: 'admin_master',
          name: 'Chief Credit Officer (Admin)',
          phone: '+91 90000 00000',
          roleTitle: 'System & Nodal Admin',
          avatar: '🛡️',
          state: 'All India',
          district: 'HQ New Delhi'
        }
      };
      this.saveSession();
      this.app.state.activeTab = 'admin';
      this.app.renderHeader();
      this.app.attachHeaderEvents();
      this.app.renderActiveTab();
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin credentials. Try Username: admin, Password: admin123' };
  }

  loginAsEntrepreneur(phone, otpOrPin) {
    if (!phone || phone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    const currentPersona = this.app.getCurrentPersona();
    this.session = {
      isLoggedIn: true,
      role: 'entrepreneur',
      user: {
        id: `user_${Date.now()}`,
        name: currentPersona.name || 'Rural Entrepreneur',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        roleTitle: currentPersona.role || 'Micro Business Owner',
        avatar: currentPersona.avatar || '👤',
        state: this.app.state.userProfile ? this.app.state.userProfile.state : 'Uttar Pradesh',
        district: this.app.state.userProfile ? this.app.state.userProfile.district : 'Varanasi'
      }
    };
    this.saveSession();
    this.app.renderHeader();
    this.app.attachHeaderEvents();
    this.app.renderActiveTab();
    return { success: true };
  }

  logout() {
    this.session = {
      isLoggedIn: false,
      role: 'guest',
      user: null
    };
    localStorage.removeItem(this.storageKey);
    this.app.state.activeTab = 'score';
    this.app.renderHeader();
    this.app.attachHeaderEvents();
    this.app.renderActiveTab();
  }

  renderLoginModal(initialTab = 'admin') {
    const existing = document.getElementById('auth-login-modal');
    if (existing) existing.remove();

    const modalHtml = `
      <div class="modal-backdrop" id="auth-login-modal" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); backdrop-filter:blur(8px); z-index:10000; align-items:center; justify-content:center; padding:1rem;">
        <div class="modal-card" style="background:#FFF; max-width:500px; width:100%; border-radius:20px; padding:2rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); border:2px solid #059669; animation: modalSlide 0.3s ease;">
          
          <!-- Logo & Header -->
          <div class="text-center mb-3">
            <div style="font-size:2.8rem; margin-bottom:0.4rem;">🌾</div>
            <h2 style="margin:0; font-size:1.6rem; color:#065F46; font-weight:800;">VyaparGyan Authentication Portal</h2>
            <p class="text-sm text-muted" style="margin-top:0.3rem;">Log in to access your Rural Entrepreneur profile or Admin Portal</p>
          </div>

          <!-- Role Selector Tabs -->
          <div style="display:flex; background:#F1F5F9; border-radius:12px; padding:0.35rem; margin-bottom:1.5rem; border:1px solid #E2E8F0;">
            <button class="btn btn-sm" id="tab-login-admin" style="flex:1; border-radius:10px; font-weight:800; padding:0.6rem; ${initialTab === 'admin' ? 'background:#3730A3; color:#FFF;' : 'background:none; color:#64748B;'}">
              🛡️ Admin & Banker Portal
            </button>
            <button class="btn btn-sm" id="tab-login-entrepreneur" style="flex:1; border-radius:10px; font-weight:800; padding:0.6rem; ${initialTab === 'entrepreneur' ? 'background:#059669; color:#FFF;' : 'background:none; color:#64748B;'}">
              👩‍🌾 Entrepreneur Login
            </button>
          </div>

          <!-- Form Container -->
          <div id="login-form-container">
            
            <!-- Admin Form -->
            <form id="admin-login-form" style="display:${initialTab === 'admin' ? 'block' : 'none'};">
              <div style="background:#EEF2FF; border:1px solid #C7D2FE; padding:0.85rem; border-radius:10px; margin-bottom:1.2rem;">
                <div style="font-weight:800; color:#3730A3; font-size:0.9rem; margin-bottom:0.2rem;">🔑 Demo Admin Credentials:</div>
                <div style="font-size:0.85rem; color:#1E1B4B;">Username: <code style="background:#FFF; padding:0.15rem 0.4rem; border-radius:4px; font-weight:700;">admin</code> | Password: <code style="background:#FFF; padding:0.15rem 0.4rem; border-radius:4px; font-weight:700;">admin123</code></div>
              </div>

              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:700; color:#1F2937; display:block; margin-bottom:0.3rem;">👤 Admin / Nodal Officer Username:</label>
                <input type="text" id="adminUsername" name="adminUsername" class="form-input" value="admin" placeholder="admin" style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid #CBD5E1; font-size:1rem;" required />
              </div>

              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:700; color:#1F2937; display:block; margin-bottom:0.3rem;">🔑 Security Password:</label>
                <input type="password" id="adminPassword" name="adminPassword" class="form-input" value="admin123" placeholder="admin123" style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid #CBD5E1; font-size:1rem;" required />
              </div>

              <div id="admin-error-msg" style="display:none; color:#DC2626; background:#FEF2F2; padding:0.6rem; border-radius:8px; font-size:0.85rem; font-weight:700; margin-bottom:0.75rem; border:1px solid #FCA5A5;"></div>

              <div style="display:flex; gap:0.75rem; margin-top:1.25rem;">
                <button type="button" class="btn btn-secondary" id="btn-cancel-login" style="flex:1;">Cancel</button>
                <button type="submit" class="btn btn-primary" id="btn-submit-admin-login" style="flex:2; padding:0.75rem; font-size:1rem; font-weight:800; background:#3730A3; color:#FFF; border-radius:10px;">
                  🛡️ Authenticate & Open Admin Dashboard
                </button>
              </div>
            </form>

            <!-- Entrepreneur Form -->
            <form id="entrepreneur-login-form" style="display:${initialTab === 'entrepreneur' ? 'block' : 'none'};">
              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:700; color:#1F2937; display:block; margin-bottom:0.3rem;">📱 Mobile Number (OTP Login):</label>
                <div style="display:flex; gap:0.5rem;">
                  <span style="padding:0.75rem; background:#F3F4F6; border:1px solid #CBD5E1; border-radius:8px; font-weight:700;">+91</span>
                  <input type="tel" name="phone" class="form-input" value="9876543210" placeholder="10-digit mobile number" style="flex:1; padding:0.75rem; border-radius:8px; border:1px solid #CBD5E1; font-size:1rem;" required />
                </div>
              </div>

              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:700; color:#1F2937; display:block; margin-bottom:0.3rem;">🔑 4-Digit Security PIN or OTP:</label>
                <input type="password" name="pin" class="form-input" value="1234" maxlength="4" placeholder="e.g. 1234" style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid #CBD5E1; font-size:1rem;" required />
              </div>

              <div class="form-group mb-3" style="background:#ECFDF5; padding:0.75rem; border-radius:10px; border:1px solid #A7F3D0;">
                <div style="font-size:0.82rem; color:#065F46; font-weight:700; margin-bottom:0.4rem;">
                  ⚡ Quick Demo Login as Entrepreneur Persona:
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <button type="button" class="btn btn-xs btn-outline-primary quick-persona-btn" data-persona="meena">👩‍🌾 Meena Devi (Kirana)</button>
                  <button type="button" class="btn btn-xs btn-outline-primary quick-persona-btn" data-persona="ramesh">👨‍🌾 Ramesh (Farmer)</button>
                  <button type="button" class="btn btn-xs btn-outline-primary quick-persona-btn" data-persona="sunita">🧵 Sunita (Artisan)</button>
                </div>
              </div>

              <div style="display:flex; gap:0.75rem; margin-top:1.25rem;">
                <button type="button" class="btn btn-secondary" id="btn-cancel-login-entr" style="flex:1;">Cancel</button>
                <button type="submit" class="btn btn-primary" style="flex:2; padding:0.75rem; font-size:1rem; font-weight:800; background:#059669; color:#FFF; border-radius:10px;">
                  🚀 Login to Entrepreneur Portal
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Toggle forms
    const btnAdmin = document.getElementById('tab-login-admin');
    const btnEntr = document.getElementById('tab-login-entrepreneur');
    const formAdmin = document.getElementById('admin-login-form');
    const formEntr = document.getElementById('entrepreneur-login-form');

    btnAdmin.onclick = () => {
      btnAdmin.style.background = '#3730A3'; btnAdmin.style.color = '#FFF';
      btnEntr.style.background = 'none'; btnEntr.style.color = '#64748B';
      formAdmin.style.display = 'block'; formEntr.style.display = 'none';
    };

    btnEntr.onclick = () => {
      btnEntr.style.background = '#059669'; btnEntr.style.color = '#FFF';
      btnAdmin.style.background = 'none'; btnAdmin.style.color = '#64748B';
      formEntr.style.display = 'block'; formAdmin.style.display = 'none';
    };

    // Close buttons
    const cancel1 = document.getElementById('btn-cancel-login');
    const cancel2 = document.getElementById('btn-cancel-login-entr');
    if (cancel1) cancel1.onclick = () => document.getElementById('auth-login-modal').remove();
    if (cancel2) cancel2.onclick = () => document.getElementById('auth-login-modal').remove();

    // Quick personas
    document.querySelectorAll('.quick-persona-btn').forEach(b => {
      b.onclick = () => {
        this.app.state.personaId = b.dataset.persona;
        const p = this.app.getCurrentPersona();
        this.loginAsEntrepreneur(p.phone || '9876543210', '1234');
        document.getElementById('auth-login-modal').remove();
      };
    });

    // Submit Admin Form
    formAdmin.onsubmit = (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUsername').value;
      const p = document.getElementById('adminPassword').value;
      const res = this.loginAsAdmin(u, p);
      if (res.success) {
        document.getElementById('auth-login-modal').remove();
      } else {
        const err = document.getElementById('admin-error-msg');
        err.textContent = res.message;
        err.style.display = 'block';
      }
    };

    // Submit Entrepreneur Form
    formEntr.onsubmit = (e) => {
      e.preventDefault();
      const phone = formEntr.phone.value;
      const res = this.loginAsEntrepreneur(phone, formEntr.pin.value);
      if (res.success) {
        document.getElementById('auth-login-modal').remove();
      } else {
        alert(res.message);
      }
    };
  }
}
