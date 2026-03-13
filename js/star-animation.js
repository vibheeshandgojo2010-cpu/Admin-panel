/**
 * star-animation.js
 * Adds a magical single Lead Star with a solid Ribbon tail animation.
 */

function triggerStarAnimation(sourceElement) {
    const cartBtn = document.getElementById('cartBtn');
    if (!cartBtn) return;

    const startRect = sourceElement.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    createStarWithRibbon(startX, startY, endX, endY, cartBtn);
}

function createStarWithRibbon(x, y, targetX, targetY, cartBtn) {
    // 1. Setup the Ribbon (SVG)
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "star-ribbon-container");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    path.setAttribute("class", "star-ribbon-path");
    svg.appendChild(path);
    document.body.appendChild(svg);

    // 2. Setup the Lead Star
    const star = document.createElement('div');
    star.className = 'star-particle lead-star';
    star.innerHTML = '<i class="fas fa-star"></i>';
    document.body.appendChild(star);

    const starSize = 24;
    star.style.fontSize = `${starSize}px`;

    // 3. Bezier calculations
    const cp1x = x + (targetX - x) / 2;
    const cp1y = Math.min(y, targetY) - 200; // High arch

    const duration = 1000;
    const startTime = performance.now();

    // Track points for the ribbon
    const points = [];
    const maxPoints = 50; // Ribbon length

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in-out cubic
        const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const mt = 1 - t;

        // Calculate position (Quadratic Bezier)
        const curX = mt * mt * x + 2 * mt * t * cp1x + t * t * targetX;
        const curY = mt * mt * y + 2 * mt * t * cp1y + t * t * targetY;

        // Update Lead Star
        star.style.left = `${curX - starSize / 2}px`;
        star.style.top = `${curY - starSize / 2}px`;
        star.style.transform = `scale(${1 + Math.sin(progress * Math.PI) * 0.5}) rotate(${progress * 720}deg)`;

        // Update Ribbon
        points.push(`${curX},${curY}`);
        if (points.length > maxPoints) points.shift();
        path.setAttribute("points", points.join(" "));

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Cleanup & Arrival
            star.remove();

            // Fade out ribbon
            svg.style.transition = 'opacity 0.3s ease-out';
            svg.style.opacity = '0';
            setTimeout(() => svg.remove(), 300);

            arriveAtCart(targetX, targetY, cartBtn);
        }
    }

    requestAnimationFrame(animate);
}

function arriveAtCart(x, y, cartBtn) {
    cartBtn.classList.add('cart-bounce');

    // Final burst of sparkles - reduced on mobile for performance
    const isMobile = window.innerWidth < 1024;
    const particleCount = isMobile ? 5 : 15;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'star-particle';
        p.innerHTML = '<i class="fas fa-star"></i>';
        document.body.appendChild(p);

        const size = Math.random() * 8 + 4;
        p.style.fontSize = `${size}px`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const vx = (Math.random() - 0.5) * 120;
        const vy = (Math.random() - 0.5) * 120;
        const dur = 600 + Math.random() * 400;
        const sTime = performance.now();

        function animSpark(cTime) {
            const el = cTime - sTime;
            const prog = el / dur;

            if (prog >= 1) {
                p.remove();
                return;
            }

            p.style.left = `${x + vx * prog}px`;
            p.style.top = `${y + vy * prog}px`;
            p.style.opacity = 1 - prog;
            p.style.transform = `scale(${1 - prog}) rotate(${prog * 360}deg)`;
            requestAnimationFrame(animSpark);
        }
        requestAnimationFrame(animSpark);
    }

    setTimeout(() => cartBtn.classList.remove('cart-bounce'), 500);
}

// Global exposure
window.triggerStarAnimation = triggerStarAnimation;

// Initialize Scroll Progress Bar
(function initScrollProgress() {
    const container = document.createElement('div');
    container.className = 'scroll-progress-container';
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.id = 'scrollProgressBar';
    container.appendChild(bar);
    document.body.appendChild(container);

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                const progressBar = document.getElementById('scrollProgressBar');
                if (progressBar) {
                    progressBar.style.width = scrolled + "%";
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });
})();
