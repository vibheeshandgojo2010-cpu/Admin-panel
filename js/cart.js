// cart.js - Shopping Cart System with localStorage persistence
// Updated to support complex variants and custom instructions

class Cart {
    constructor() {
        this.storageKey = 'customLabsCart';
        this.items = this.loadFromStorage();
        this.renderCartUI();
        this.updateBadge();
        this.bindEvents();
    }

    // ---- Data Methods ----

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }

    addItem(product) {
        // product: { id, name, price, variants (obj), instructions, imageIcon }

        // Find if an identical item (same ID, same variants, same instructions) already exists
        const existing = this.items.find(i =>
            i.id === product.id &&
            JSON.stringify(i.variants) === JSON.stringify(product.variants) &&
            i.instructions === product.instructions
        );

        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.saveToStorage();
        this.updateUI();

        const userName = window.bespokeUser;
        const message = userName
            ? `Bespoke ${product.name} reserved for ${userName}`
            : `${product.name} added to cart`;

        this.showToast(message);

        // Dispatch custom event for mascot
        document.dispatchEvent(new CustomEvent('cart-item-added', { detail: { product } }));
    }

    removeItem(index) {
        const item = this.items[index];
        this.items.splice(index, 1);
        this.saveToStorage();
        this.updateUI();

        // Dispatch custom event for mascot
        document.dispatchEvent(new CustomEvent('cart-item-removed', { detail: { item } }));
    }

    updateQuantity(index, delta) {
        const item = this.items[index];
        if (!item) return;
        item.quantity += delta;
        if (item.quantity < 1) {
            this.removeItem(index);
            return;
        }
        this.saveToStorage();
        this.updateUI();
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();

        // Dispatch custom event for mascot
        document.dispatchEvent(new CustomEvent('cart-cleared'));
    }

    // ---- UI Methods ----

    updateUI() {
        this.updateBadge();
        this.renderCartItems();
    }

    updateBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const count = this.getCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    renderCartUI() {
        if (document.getElementById('cartSidebar')) return;

        const sidebar = document.createElement('div');
        sidebar.id = 'cartSidebar';
        sidebar.className = 'cart-sidebar';
        sidebar.innerHTML = `
            <div class="cart-sidebar-header">
                <h3>YOUR CART</h3>
                <button class="cart-close-btn" id="cartCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-footer" id="cartFooter">
                <div class="cart-total">
                    <span>Total</span>
                    <span id="cartTotal">₹0</span>
                </div>
                <button class="cart-checkout-btn" id="cartCheckoutBtn">
                    <span>CHECKOUT</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button class="cart-clear-btn" id="cartClearBtn">Clear Cart</button>
            </div>
        `;
        document.body.appendChild(sidebar);

        const overlay = document.createElement('div');
        overlay.id = 'cartOverlay';
        overlay.className = 'cart-overlay';
        document.body.appendChild(overlay);

        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        const footer = document.getElementById('cartFooter');
        const totalEl = document.getElementById('cartTotal');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';

        container.innerHTML = this.items.map((item, index) => {
            // Format variants into a string
            const variantStr = item.variants
                ? Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(' | ')
                : '';

            return `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <i class="fas ${item.imageIcon || 'fa-tag'}"></i>
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        ${variantStr ? `<p class="cart-item-variant">${variantStr}</p>` : ''}
                        ${item.instructions ? `<p class="cart-item-instructions"><span>Note:</span> ${item.instructions}</p>` : ''}
                        <span class="cart-item-price">₹${item.price}</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-qty">
                            <button class="cart-qty-btn" data-action="decrease" data-index="${index}">−</button>
                            <span class="qty-num">${item.quantity}</span>
                            <button class="cart-qty-btn" data-action="increase" data-index="${index}">+</button>
                        </div>
                        <button class="cart-remove-btn" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (totalEl) totalEl.textContent = `₹${this.getTotal()}`;
    }

    showToast(message) {
        const existing = document.querySelector('.cart-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    openSidebar() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartBtn')) {
                e.preventDefault();
                this.openSidebar();
            } else if (e.target.closest('#cartCloseBtn') || e.target.closest('#cartOverlay')) {
                this.closeSidebar();
            } else if (e.target.closest('.cart-qty-btn')) {
                const btn = e.target.closest('.cart-qty-btn');
                this.updateQuantity(parseInt(btn.dataset.index), btn.dataset.action === 'increase' ? 1 : -1);
            } else if (e.target.closest('.cart-remove-btn')) {
                const btn = e.target.closest('.cart-remove-btn');
                this.removeItem(parseInt(btn.dataset.index));
            } else if (e.target.closest('#cartClearBtn')) {
                this.clear();
            } else if (e.target.closest('#cartCheckoutBtn')) {
                if (this.items.length > 0) {
                    const isSubPage = window.location.pathname.includes('/pages/');
                    window.location.href = isSubPage ? 'checkout.html' : 'pages/checkout.html';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
});
