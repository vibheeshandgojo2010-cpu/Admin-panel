// transitions.js - Simple sliding curtain transition
(function () {
    'use strict';

    // 1. Create and inject simple solid overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.documentElement.appendChild(overlay);

    // 2. Hide overlay (slide it out) when page is loaded
    window.addEventListener('load', function () {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 100);
    });

    // 3. Intercept link clicks to slide curtain back in
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');

        if (link &&
            link.href &&
            link.href.includes(window.location.origin) &&
            !link.href.includes('#') &&
            link.target !== '_blank' &&
            !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) {

            const currentPath = window.location.pathname;
            const targetPath = new URL(link.href).pathname;

            if (currentPath !== targetPath) {
                e.preventDefault();

                // Show overlay (slide it in from the left)
                // First move it to left -100% without transition
                overlay.style.transition = 'none';
                overlay.style.transform = 'translateX(-100%)';
                overlay.classList.remove('hidden');

                // Force reflow
                overlay.offsetHeight;

                // Then slide to 0 with transition
                setTimeout(() => {
                    overlay.style.transition = 'transform 0.45s cubic-bezier(0.77, 0, 0.175, 1)';
                    overlay.style.transform = 'translateX(0)';
                }, 10);

                // Navigate after slide finishes
                setTimeout(() => {
                    window.location.href = link.href;
                }, 500);
            }
        }
    });

    // Handle back/forward
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            overlay.classList.add('hidden');
        }
    });
})();
