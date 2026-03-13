/**
 * bespoke.js
 * Implements a "Bespoke" premium feel by personalizing the UI for logged-in users.
 */

class BespokeManager {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // Run once DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.run());
        } else {
            this.run();
        }

        // Also watch for storage changes (login/logout from other tabs/modals)
        window.addEventListener('storage', (e) => {
            if (e.key === 'customLabsUser') {
                this.run();
            }
        });

        // Polling as a fallback for the SPA-like behavior in auth.js
        setInterval(() => this.run(), 2000);
    }

    getUserName() {
        try {
            const userStr = localStorage.getItem('customLabsUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.displayName || user.email.split('@')[0];
            }
        } catch (e) {
            console.error('Error reading user from storage', e);
        }
        return null;
    }

    run() {
        const userName = this.getUserName();
        if (userName) {
            this.applyPersonalization(userName);
        } else {
            this.removePersonalization();
        }
    }

    applyPersonalization(name) {
        // 1. Update Hero Title/CTA
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && !heroTitle.dataset.personalized) {
            heroTitle.style.display = 'block'; // Ensure it's block for centering
            heroTitle.innerHTML = `<span class="title-line">READY TO EXPERIMENT,</span> <span class="title-line highlight gemini-name">${name.toUpperCase()}?</span>`;
            heroTitle.dataset.personalized = "true";
        }

        const ctaBtn = document.querySelector('.cta-button span');
        if (ctaBtn && ctaBtn.innerText.includes('START CREATING')) {
            ctaBtn.innerText = `BESPOKE PIECES FOR YOU`;
        }

        // 2. Personalize Section Titles
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            if (title.innerText.includes('FEATURED PRODUCTS') && !title.dataset.personalized) {
                title.innerHTML = `CURATED FOR <span class="highlight">${name.toUpperCase()}</span>`;
                title.dataset.personalized = "true";
            }
        });

        // 3. Update Cart Context (handled in cart.js via showToast update)
        window.bespokeUser = name;
    }

    removePersonalization() {
        // Reset handles if needed, but usually login state handles clean-up via page reload/SPA logic
        window.bespokeUser = null;
    }
}

// Global initialization
window.bespoke = new BespokeManager();
