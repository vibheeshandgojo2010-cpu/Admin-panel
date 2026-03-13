// theme.js - Theme switching with localStorage persistence
// Supports: dark/light mode + accent colors (orange, blue, green, purple)

(function () {
    'use strict';

    const STORAGE_KEY = 'customLabsTheme';
    const defaults = { mode: 'dark', accent: 'orange' };

    // Load saved theme or defaults
    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    mode: parsed.mode || defaults.mode,
                    accent: parsed.accent || defaults.accent
                };
            }
        } catch { }
        return { ...defaults };
    }

    function saveTheme(theme) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme.mode);
        document.documentElement.setAttribute('data-accent', theme.accent);
    }

    // Apply immediately (before DOM renders) to prevent flash
    const currentTheme = getSavedTheme();
    applyTheme(currentTheme);

    // Build UI once DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        const theme = getSavedTheme();

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle-btn';
        toggleBtn.id = 'themeToggleBtn';
        toggleBtn.innerHTML = '<i class="fas fa-palette"></i>';
        toggleBtn.setAttribute('aria-label', 'Theme settings');
        document.body.appendChild(toggleBtn);

        // Create theme panel
        const panel = document.createElement('div');
        panel.className = 'theme-panel';
        panel.id = 'themePanel';
        panel.innerHTML = `
            <h4>Mode</h4>
            <div class="theme-mode-btns">
                <button class="theme-mode-btn${theme.mode === 'dark' ? ' active' : ''}" data-mode="dark">
                    <i class="fas fa-moon"></i> Dark
                </button>
                <button class="theme-mode-btn${theme.mode === 'light' ? ' active' : ''}" data-mode="light">
                    <i class="fas fa-sun"></i> Light
                </button>
            </div>
            <h4>Accent</h4>
            <div class="theme-color-btns">
                <button class="theme-color-btn${theme.accent === 'orange' ? ' active' : ''}" data-color="orange" aria-label="Orange"></button>
                <button class="theme-color-btn${theme.accent === 'blue' ? ' active' : ''}" data-color="blue" aria-label="Blue"></button>
                <button class="theme-color-btn${theme.accent === 'green' ? ' active' : ''}" data-color="green" aria-label="Green"></button>
                <button class="theme-color-btn${theme.accent === 'purple' ? ' active' : ''}" data-color="purple" aria-label="Purple"></button>
            </div>
        `;
        document.body.appendChild(panel);

        // Toggle panel
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            panel.classList.toggle('open');
        });

        // Close panel on outside click
        document.addEventListener('click', function (e) {
            if (!panel.contains(e.target) && e.target !== toggleBtn) {
                panel.classList.remove('open');
            }
        });

        // Mode buttons
        panel.querySelectorAll('.theme-mode-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const mode = this.dataset.mode;
                theme.mode = mode;
                applyTheme(theme);
                saveTheme(theme);

                // Update active states
                panel.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Color buttons
        panel.querySelectorAll('.theme-color-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const color = this.dataset.color;
                theme.accent = color;
                applyTheme(theme);
                saveTheme(theme);

                // Update active states
                panel.querySelectorAll('.theme-color-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });
})();
