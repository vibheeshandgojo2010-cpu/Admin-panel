// auth.js - Authentication Class
class AuthManager {
    constructor() {
        if (!auth) {
            console.error('Firebase auth not loaded');
            return;
        }
        this.auth = auth;
        this.user = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            this.user = user;
            this.updateUI();
            this.saveUserToLocalStorage(user);
        });
    }

    async signUp(email, password, displayName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName });
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    async signInWithGoogle() {
        try {
            const result = await this.auth.signInWithPopup(googleProvider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');

        if (!userMenu) return; // Only need userMenu to be present

        if (this.user) {
            if (loginBtn) loginBtn.style.display = 'none';
            userMenu.style.display = 'flex';

            const avatarUrl = this.user.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.displayName || this.user.email)}&background=ff6a00&color=000&bold=true`;

            userMenu.innerHTML = `
                <div class="user-info">
                    <img src="${avatarUrl}" class="user-avatar">
                    <span class="user-name">${this.user.displayName || this.user.email}</span>
                </div>
                <button class="logout-btn" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;

            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                this.signOut();
            });
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    saveUserToLocalStorage(user) {
        if (user) {
            localStorage.setItem('customLabsUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            }));
        } else {
            localStorage.removeItem('customLabsUser');
        }
    }

    getStoredUser() {
        const stored = localStorage.getItem('customLabsUser');
        return stored ? JSON.parse(stored) : null;
    }

    getErrorMessage(error) {
        const errors = {
            'auth/email-already-in-use': 'Email already in use',
            'auth/invalid-email': 'Invalid email',
            'auth/weak-password': 'Password too weak (min 6 chars)',
            'auth/user-not-found': 'User not found',
            'auth/wrong-password': 'Wrong password',
            'auth/popup-closed-by-user': 'Popup closed'
        };
        return errors[error.code] || error.message;
    }
}