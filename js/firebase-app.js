// firebase-app.js - Login/Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting CUSTOM LABS...');
    
    setTimeout(() => {
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded');
            return;
        }
        initMaintenanceCheck(); // Check if site is offline
        initAuthSystem();
    }, 1000);
});

// ════════════════════════════════════════
// MAINTENANCE MODE CHECK
// ════════════════════════════════════════

function initMaintenanceCheck() {
    if (typeof db === 'undefined') return;

    // Skip check for admin pages
    if (window.location.pathname.includes('/admin.html')) return;

    db.collection('settings').doc('maintenance').onSnapshot(doc => {
        if (doc.exists && doc.data().active === true) {
            showMaintenanceScreen(doc.data().message);
        } else {
            const screen = document.getElementById('maintenanceOverlay');
            if (screen) screen.remove();
            document.body.style.overflow = '';
        }
    });
}

function showMaintenanceScreen(msg = "We're currently performing some magic behind the scenes. Be back shortly!") {
    if (document.getElementById('maintenanceOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'maintenanceOverlay';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #000; color: #fff; z-index: 99999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 20px; font-family: 'Inter', sans-serif;
    `;
    overlay.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">🛠️</div>
        <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 10px; letter-spacing: -1px;">UNDER MAINTENANCE</h1>
        <p style="color: #888; max-width: 400px; line-height: 1.6; font-size: 15px;">${msg}</p>
        <div style="margin-top: 40px; font-size: 12px; color: #444; letter-spacing: 2px;">CUSTOM LABS</div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function initAuthSystem() {
    // Initialize Auth Manager
    let authManager;
    try {
        authManager = new AuthManager();
        console.log('✅ AuthManager loaded');
    } catch (error) {
        console.error('AuthManager error:', error);
        return;
    }
    
    // Get DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const googleBtns = document.querySelectorAll('.google-auth-btn');
    const authStatus = document.getElementById('authStatus');
    
    // Check if elements exist
    if (!loginBtn) {
        console.log('💡 Login button missing - injecting into header...');
        // Create login button if missing
        createLoginButton();
        return;
    }
    
    console.log('✅ All auth elements found');
    
    // Login button click
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal();
    });
    
    // Close modal
    closeAuthModal?.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });
    
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update tabs
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update forms
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id.includes(tabName)) {
                    form.classList.add('active');
                }
            });
            
            clearStatus();
        });
    });
    
    // Login form
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showStatus('Please fill all fields', 'error');
            return;
        }
        
        showStatus('Logging in...', 'info');
        const result = await authManager.signIn(email, password);
        
        if (result.success) {
            showStatus('Logged in!', 'success');
            syncUserToCRM(result.user); // Added sync for email login
            setTimeout(() => {
                closeModal();
                loginForm.reset();
                clearStatus();
            }, 1500);
        } else {
            showStatus(result.error, 'error');
        }
    });
    
    // Signup form
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirmPassword').value;
        
        if (!name || !email || !password || !confirm) {
            showStatus('Please fill all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            showStatus('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showStatus('Password must be 6+ characters', 'error');
            return;
        }
        
        showStatus('Creating account...', 'info');
        const result = await authManager.signUp(email, password, name);
        
        if (result.success) {
            showStatus('Account created!', 'success');
            syncUserToCRM(result.user); // Added sync for new account
            setTimeout(() => {
                closeModal();
                signupForm.reset();
                clearStatus();
            }, 1500);
        } else {
            showStatus(result.error, 'error');
        }
    });
    
    // Google buttons
    googleBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            showStatus('Connecting with Google...', 'info');
            const result = await authManager.signInWithGoogle();
            
            if (result.success) {
                showStatus('Google login successful!', 'success');
                syncUserToCRM(result.user); // Added sync to CRM
                setTimeout(() => {
                    closeModal();
                    clearStatus();
                }, 1500);
            } else {
                showStatus(result.error, 'error');
            }
        });
    });
    
    // Modal functions
    function openAuthModal() {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Fedora-style blur
        const header = document.querySelector('.morph-header');
        const content = document.querySelector('.main-content');
        if (header) header.style.filter = 'blur(20px) brightness(0.7)';
        if (content) content.style.filter = 'blur(20px) brightness(0.7)';
    }
    
    function closeModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Remove blur
        const header = document.querySelector('.morph-header');
        const content = document.querySelector('.main-content');
        if (header) header.style.filter = '';
        if (content) content.style.filter = '';
        
        // Reset forms
        loginForm?.reset();
        signupForm?.reset();
        clearStatus();
    }
    
    // Status helpers
    function showStatus(message, type) {
        if (!authStatus) return;
        authStatus.textContent = message;
        authStatus.className = 'auth-status ' + type;
        authStatus.style.display = 'block';
    }
    
    function clearStatus() {
        if (!authStatus) return;
        authStatus.textContent = '';
        authStatus.style.display = 'none';
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    console.log('✅ Auth system ready');
}

// Create login button if missing
function createLoginButton() {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;
    
    const navAuth = document.createElement('div');
    navAuth.className = 'nav-auth';
    navAuth.innerHTML = `
        <button class="login-btn" id="loginBtn">
            <i class="fas fa-user"></i>
            <span>LOGIN</span>
        </button>
        <div class="user-menu" id="userMenu" style="display: none;"></div>
    `;
    
    navContainer.appendChild(navAuth);
    console.log('✅ Created login button');
    
    // Reinitialize
    setTimeout(() => initAuthSystem(), 100);
}

// ════════════════════════════════════════
// USER CRM SYNC
// ════════════════════════════════════════

async function syncUserToCRM(user) {
    if (!user || typeof db === 'undefined' || !user) return;

    const userRef = db.collection('users').doc(user.email);
    try {
        await userRef.set({
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            photoURL: user.photoURL || null
        }, { merge: true });
        console.log('👤 CRM: User synced successfully');
    } catch (e) {
        console.error('❌ CRM Error:', e);
    }
}