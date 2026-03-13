// checkout.js - Logic for the multi-step checkout journey
document.addEventListener('DOMContentLoaded', function () {
    const shippingForm = document.getElementById('shippingForm');
    const paymentForm = document.getElementById('paymentForm');
    const stepPayment = document.getElementById('step-payment');
    const stepShipping = document.getElementById('step-shipping');
    const paymentOverlay = document.getElementById('paymentOverlay');
    const statusText = document.getElementById('statusText');
    const successScreen = document.getElementById('successScreen');
    const orderIdSpan = document.getElementById('orderId');

    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutTotalPayable = document.getElementById('checkoutTotalPayable');

    // 1. Initialize Order Summary from localStorage
    const cartItems = JSON.parse(localStorage.getItem('customLabsCart') || '[]');
    if (cartItems.length === 0) {
        window.location.href = 'products.html'; // Go back if cart is empty
        return;
    }

    renderSummaryGrid();

    function renderSummaryGrid() {
        checkoutItemsList.innerHTML = '';
        let subtotal = 0;

        cartItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'summary-item';

            const variantSummary = Object.entries(item.variants)
                .map(([type, value]) => `${type}: ${value}`)
                .join(' | ');

            row.innerHTML = `
                <div class="summary-item-info">
                    <h4>${item.name} x ${item.quantity}</h4>
                    <p>${variantSummary}</p>
                    ${item.instructions ? `<p class="item-note">Note: ${item.instructions}</p>` : ''}
                </div>
                <div class="summary-item-price">
                    ₹${item.price * item.quantity}
                </div>
            `;
            checkoutItemsList.appendChild(row);
            subtotal += item.price * item.quantity;
        });

        // Add 50 for shipping if subtotal < 1000
        const shipping = subtotal > 1000 ? 0 : 50;
        const total = subtotal + shipping;

        summarySubtotal.innerText = `₹${subtotal}`;
        summaryShipping.innerText = shipping === 0 ? 'FREE' : `₹${shipping}`;
        summaryTotal.innerText = `₹${total}`;
        checkoutTotalPayable.innerText = total;
    }

    // 2. Shipping Form Submit - Transition to Payment
    shippingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Disable shipping step and unlock payment step
        stepShipping.classList.add('completed');
        stepPayment.classList.remove('locked');

        // Scroll to the payment step
        const offset = stepPayment.offsetTop - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });

        // Pre-fill card name if available
        const nameInput = document.getElementById('ship-name');
        console.log("Shipping details captured:", nameInput.value);
    });

    // 3. Payment Selection Logic
    const paymentOptions = document.querySelectorAll('.payment-option');

    paymentOptions.forEach(option => {
        option.addEventListener('click', function () {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            const isUPI = this.textContent.includes('UPI');
            if (isUPI) {
                paymentForm.style.opacity = '0.3';
                paymentForm.style.pointerEvents = 'none';

                // Add temporary message
                let upiMsg = document.getElementById('upi-msg');
                if (!upiMsg) {
                    upiMsg = document.createElement('div');
                    upiMsg.id = 'upi-msg';
                    upiMsg.className = 'upi-coming-soon';
                    upiMsg.innerHTML = '<i class="fas fa-info-circle"></i> UPI payment is currently under maintenance. Please use Card.';
                    paymentForm.parentNode.insertBefore(upiMsg, paymentForm);
                }
            } else {
                paymentForm.style.opacity = '1';
                paymentForm.style.pointerEvents = 'all';
                const upiMsg = document.getElementById('upi-msg');
                if (upiMsg) upiMsg.remove();
            }
        });
    });

    // 4. Payment Mock Logic (Card Detection)
    const cardInput = document.getElementById('card-num');
    const cardIcon = document.getElementById('card-icon');

    if (cardInput) {
        cardInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

            // Card type detection
            if (value.startsWith('4')) {
                cardIcon.className = 'fab fa-cc-visa';
                cardIcon.style.color = '#1a1f71';
            } else if (value.startsWith('5')) {
                cardIcon.className = 'fab fa-cc-mastercard';
                cardIcon.style.color = '#eb001b';
            } else {
                cardIcon.className = 'fas fa-credit-card';
                cardIcon.style.color = 'var(--text-faint)';
            }

            // Format: XXXX XXXX XXXX XXXX
            let formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = formatted;
        });
    }

    // 4. Final Payment Simulation
    paymentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // 1. Show processing overlay
        paymentOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 2. Mock API sequence
        setTimeout(() => {
            statusText.innerText = 'Verifying with Bank...';
            setTimeout(() => {
                statusText.innerText = 'Securing Transaction...';
                setTimeout(() => {
                    // Success!
                    paymentOverlay.classList.remove('active');

                    // Generate random order ID
                    const randomId = 'CL-' + Math.floor(Math.random() * 90000 + 10000);
                    orderIdSpan.innerText = '#' + randomId;

                    // Show success screen
                    successScreen.classList.add('active');

                    // Dispatch custom event for mascot
                    document.dispatchEvent(new CustomEvent('purchase-complete', { detail: { orderId: randomId } }));

                    // Clear the cart
                    localStorage.removeItem('customLabsCart');

                    // Save purchased items to localStorage for "Review" logic
                    const purchasedProducts = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
                    cartItems.forEach(item => {
                        if (!purchasedProducts.includes(item.id)) {
                            purchasedProducts.push(item.id);
                        }
                    });
                    localStorage.setItem('purchasedProducts', JSON.stringify(purchasedProducts));

                    // Trigger custom event for cart refresh (if open in other tabs)
                    window.dispatchEvent(new CustomEvent('cartUpdated'));

                    // 5. Send Email Confirmation via EmailJS
                    sendOrderEmail(randomId, cartItems);

                    // 6. Save Order to Firestore (New Database Hook)
                    saveOrderToFirestore(randomId, cartItems);

                }, 2000);
            }, 1500);
        }, 1500);
    });

    /**
     * Sends the order confirmation email using EmailJS
     * @param {string} orderId - The generated order ID
     * @param {Array} items - The items in the order
     */
    function sendOrderEmail(orderId, items) {
        // ... (existing email logic)
    }

    async function saveOrderToFirestore(orderId, items) {
        if (typeof db === 'undefined') {
            console.warn('Firestore not initialized. Order not saved to cloud.');
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 1000 ? 0 : 50;
        const total = subtotal + shipping;

        const orderData = {
            id: orderId,
            customerName: document.getElementById('ship-name').value,
            customerEmail: document.getElementById('ship-email').value,
            customerPhone: document.getElementById('ship-phone').value,
            shippingAddress: {
                address: document.getElementById('ship-address').value,
                city: document.getElementById('ship-city').value,
                zip: document.getElementById('ship-zip').value
            },
            items: items.map(i => ({
                id: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                variants: i.variants,
                instructions: i.instructions || ''
            })),
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            status: 'new',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('orders').doc(orderId).set(orderData);
            console.log('✅ Order saved to Firestore:', orderId);
        } catch (error) {
            console.error('❌ Error saving order to Firestore:', error);
        }
    }
});
