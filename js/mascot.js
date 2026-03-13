/* mascot.js - Logic for the pleasant smiley mascot Labby */

class Mascot {
    constructor() {
        this.container = null;
        this.bubble = null;
        this.mascot = null;
        this.timeoutId = null;
        this.messages = {
            welcome: ["Hi! I'm Labby. Ready to create?", "Hello! Welcome to Custom Labs.", "Great to see you here!"],
            products: ["Check out these cool products!", "Everything is customizable here!", "Find your perfect match.", "What's our vision today?"],
            added: ["Nice choice! Added to cart.", "Excellent! I'll keep it safe for you.", "Love that product!", "Wait, that one is my favorite!"],
            removed: ["Aww, maybe something else?", "Removed. Plenty more to explore!", "Item gone, but vision lives on.", "Change of plans?"],
            purchased: ["Woohoo! Your vision is on its way!", "Yay! Order placed successfully!", "I'm so excited for you!", "Great taste, honestly!"],
            idle: ["Still here if you need me!", "Just vibing...", "Customization is key.", "Click me for a surprise!"]
        };
        this.init();
    }

    init() {
        this.injectHTML();
        this.container = document.getElementById('mascotContainer');
        this.bubble = document.getElementById('mascotBubble');
        this.mascot = document.getElementById('mascot');

        this.bindEvents();

        // Handle introductory message
        const hasIntroduced = localStorage.getItem('labbyIntroduced');
        if (!hasIntroduced) {
            setTimeout(() => {
                this.setExpression('happy');
                this.showMessage(this.getRandom(this.messages.welcome));
                localStorage.setItem('labbyIntroduced', 'true');
            }, 1500);
        }
    }

    injectHTML() {
        const html = `
            <div class="mascot-container" id="mascotContainer">
                <div class="mascot happy" id="mascot">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" class="mascot-body" />
                        <!-- Blush -->
                        <circle cx="28" cy="62" r="8" class="mascot-blush" />
                        <circle cx="72" cy="62" r="8" class="mascot-blush" />
                        <g class="mascot-eyes">
                            <g class="mascot-eye-container left">
                                <circle cx="35" cy="45" r="6" class="mascot-eye left" />
                                <circle cx="33" cy="43" r="2" class="mascot-eye-sparkle" />
                            </g>
                            <g class="mascot-eye-container right">
                                <circle cx="65" cy="45" r="6" class="mascot-eye right" />
                                <circle cx="63" cy="43" r="2" class="mascot-eye-sparkle" />
                            </g>
                        </g>
                        <path d="M 33 65 Q 50 82 67 65" class="mascot-mouth" />
                        <!-- Dimples -->
                        <circle cx="33" cy="65" r="1.5" class="mascot-dimple" />
                        <circle cx="67" cy="65" r="1.5" class="mascot-dimple" />
                    </svg>
                </div>
                <div class="mascot-bubble" id="mascotBubble"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    bindEvents() {
        // Cart Events
        document.addEventListener('cart-item-added', () => {
            this.setExpression('excited');
            this.showMessage(this.getRandom(this.messages.added));
            setTimeout(() => this.setExpression('happy'), 3000);
        });

        document.addEventListener('cart-item-removed', () => {
            this.setExpression('sad');
            this.showMessage(this.getRandom(this.messages.removed));
            setTimeout(() => this.setExpression('happy'), 3000);
        });

        document.addEventListener('purchase-complete', () => {
            this.setExpression('celebrating');
            this.showMessage(this.getRandom(this.messages.purchased));
        });

        // Click interaction
        this.mascot.addEventListener('click', () => {
            const expressions = ['happy', 'excited', 'thinking', 'curious'];
            const randomExp = expressions[Math.floor(Math.random() * expressions.length)];
            this.setExpression(randomExp);
            this.showMessage(this.getRandom(this.messages.idle));
            setTimeout(() => this.setExpression('happy'), 2000);
        });

        // Mouse movement for eye tracking - disabled on mobile/tablet for performance
        if (window.innerWidth >= 1024) {
            document.addEventListener('mousemove', (e) => {
                if (this.mascot.classList.contains('curious')) {
                    const rect = this.mascot.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                    const distance = 2; // pixel movement
                    const lookX = Math.cos(angle) * distance;
                    const lookY = Math.sin(angle) * distance;

                    this.mascot.style.setProperty('--look-x', `${lookX}px`);
                    this.mascot.style.setProperty('--look-y', `${lookY}px`);
                }
            });
        }
    }

    setExpression(type) {
        this.mascot.className = `mascot ${type}`;
    }

    showMessage(text) {
        if (this.timeoutId) clearTimeout(this.timeoutId);

        this.bubble.textContent = text;
        this.bubble.classList.add('show');

        this.timeoutId = setTimeout(() => {
            this.bubble.classList.remove('show');
        }, 4000);
    }

    getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Mascot());
} else {
    new Mascot();
}
