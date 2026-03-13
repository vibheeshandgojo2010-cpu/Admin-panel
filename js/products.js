// products.js - Dynamic Amazon-style product listing & detailed specifications
document.addEventListener('DOMContentLoaded', function () {
    const productsGrid = document.getElementById('productsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');

    // Utility Bar & Sidebar Elements
    const sidebarAuthCheck = document.getElementById('sidebarAuthCheck');
    const productsUtilityBar = document.getElementById('productsUtilityBar');
    const productSearch = document.getElementById('productSearch');
    const productSort = document.getElementById('productSort');
    const recentlyViewedList = document.getElementById('recentlyViewedList');

    // Toggles
    const sortToggle = document.getElementById('sortToggle');
    const sortDropdown = document.getElementById('sortDropdown');
    const wishlistToggle = document.getElementById('wishlistToggle');
    const wishlistDrawer = document.getElementById('wishlistDrawer');
    const closeWishlist = document.getElementById('closeWishlist');

    let currentProduct = null;
    let selectedVariants = {};
    let currentCategory = 'all';
    let dbProducts = []; // Live products from Firestore

    // 1. Initial Setup
    initMockReviews();
    checkAuthAndInit();
    fetchAndRender(); // New unified fetch and render

    async function fetchAndRender() {
        if (typeof db === 'undefined') {
            console.warn('Firestore (db) not found. Falling back to static data.');
            dbProducts = typeof productsData !== 'undefined' ? [...productsData] : [];
        } else {
            try {
                const snapshot = await db.collection('products').get();
                dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // If cloud is empty, fallback to static info
                if (dbProducts.length === 0 && typeof productsData !== 'undefined') {
                    dbProducts = [...productsData];
                }
            } catch (e) {
                console.error('Firestore fetch failed:', e);
                dbProducts = typeof productsData !== 'undefined' ? [...productsData] : [];
            }
        }
        renderProducts();
    }

    function initMockReviews() {
        if (!localStorage.getItem('productReviews')) {
            const mockReviews = {
                'magic-mug': [
                    { userName: 'Vikram S.', rating: 5, text: 'Absolutely magical! The image clarity is way better than I expected. My wife loved the surprise.', date: '12 Feb 2026' },
                    { userName: 'Ananya R.', rating: 4, text: 'Very cool product. Takes a few seconds to show up fully, but the effect is worth it.', date: '05 Jan 2026' }
                ],
                'hoodie': [
                    { userName: 'Rahul K.', rating: 5, text: 'The fabric quality is premium! Usually custom hoodies feel cheap, but this one is solid and thick.', date: '28 Feb 2026' }
                ],
                'steel-bottle-black': [
                    { userName: 'Meera D.', rating: 5, text: 'The engraving is sharp! Looks very professional on my office desk.', date: '15 Feb 2026' }
                ]
            };
            localStorage.setItem('productReviews', JSON.stringify(mockReviews));
        }
    }

    // 2. Auth Check & Utility Init
    function checkAuthAndInit() {
        const user = localStorage.getItem('customLabsUser');
        if (user) {
            if (sidebarAuthCheck) sidebarAuthCheck.style.display = 'none';
            if (productsUtilityBar) productsUtilityBar.style.display = 'flex';
            renderRecentlyViewed();
            renderWishlist();
        } else {
            if (sidebarAuthCheck) sidebarAuthCheck.style.display = 'block';
            if (productsUtilityBar) productsUtilityBar.style.display = 'none';
        }
    }

    // Toggle Listeners
    if (sortToggle && sortDropdown) {
        sortToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('show');
            sortToggle.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            sortDropdown.classList.remove('show');
            sortToggle.classList.remove('active');
        });

        sortDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    if (wishlistToggle && wishlistDrawer) {
        wishlistToggle.addEventListener('click', () => {
            wishlistDrawer.classList.add('active');
        });
    }

    if (closeWishlist && wishlistDrawer) {
        closeWishlist.addEventListener('click', () => {
            wishlistDrawer.classList.remove('active');
        });
    }

    // Listen for auth changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'customLabsUser') {
            checkAuthAndInit();
            renderProducts();
        }
        if (e.key === 'wishlist') renderWishlist();
    });

    // Check periodically as well (optional hack for single-page feel)
    setInterval(checkAuthAndInit, 2000);

    // 3. Filter/Search/Sort Listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            currentCategory = this.getAttribute('data-category');
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            triggerRender();
        });
    });

    if (productSearch) {
        productSearch.addEventListener('input', triggerRender);
    }

    if (productSort) {
        productSort.addEventListener('change', triggerRender);
    }

    function triggerRender() {
        productsGrid.style.opacity = '0.5';
        setTimeout(() => {
            renderProducts();
            productsGrid.style.opacity = '1';
        }, 100);
    }

    // 4. Render Function
    function renderProducts() {
        productsGrid.innerHTML = '';
        const user = localStorage.getItem('customLabsUser');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

        // Filter by category
        let filtered = currentCategory === 'all'
            ? [...dbProducts]
            : dbProducts.filter(p => p.category === currentCategory);

        // Filter by search (only if logged in)
        if (user && productSearch && productSearch.value) {
            const query = productSearch.value.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Sort (only if logged in)
        if (user && productSort) {
            const sortBy = productSort.value;
            if (sortBy === 'price-low') {
                filtered.sort((a, b) => a.basePrice - b.basePrice);
            } else if (sortBy === 'price-high') {
                filtered.sort((a, b) => b.basePrice - a.basePrice);
            } else if (sortBy === 'name') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        if (filtered.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No products found matching your search.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(product => {
            const isWishlisted = wishlist.includes(product.id);
            const card = document.createElement('div');
            card.className = 'product-card';

            // Calculate Rating
            const reviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
            const productReviews = reviews[product.id] || [];
            const avgRating = productReviews.length > 0
                ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
                : null;

            // Badges
            let badgeHTML = '';
            if (product.id === 'magic-mug' || product.id === 'hoodie') {
                badgeHTML = `<div class="product-badge">POPULAR</div>`;
            }

            // Extract variant names for display
            const variants = product.variants || {};
            const variantValues = Object.values(variants).flat();
            const variantDisplay = variantValues.length > 0 
                ? (variantValues.slice(0, 3).join(' / ') + (variantValues.length > 3 ? '...' : ''))
                : 'Customizable';

            card.innerHTML = `
                ${badgeHTML}
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}">
                    <i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i>
                </button>
                <div class="product-image">
                    <i class="fas ${product.imageIcon}"></i>
                </div>
                <div class="product-info">
                    <div class="product-head">
                        <h3>${product.name}</h3>
                        ${avgRating ? `
                            <div class="tile-rating">
                                <i class="fas fa-star"></i>
                                <span>${avgRating}</span>
                                <small>(${productReviews.length})</small>
                            </div>
                        ` : ''}
                    </div>
                    <p class="product-variants">${variantDisplay}</p>
                    <div class="product-price"><span>₹${product.basePrice}</span> <small>Inc. GST</small></div>
                    <div class="add-hint">
                        <i class="fas fa-plus"></i> CHOOSE OPTIONS
                    </div>
                </div>
            `;

            // Wishlist Toggle
            card.querySelector('.wishlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
            });

            card.addEventListener('click', () => openModal(product));
            productsGrid.appendChild(card);
        });
    }

    // 5. Wishlist & Recently Viewed Logic
    function toggleWishlist(productId) {
        const user = localStorage.getItem('customLabsUser');
        if (!user) {
            document.getElementById('loginBtn')?.click();
            return;
        }

        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (wishlist.includes(productId)) {
            wishlist = wishlist.filter(id => id !== productId);
        } else {
            wishlist.push(productId);
        }

        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        renderWishlist();
        renderProducts(); // Refresh heart icons on grid
    }

    function renderWishlist() {
        const list = document.getElementById('wishlistItems');
        if (!list) return;

        const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (wishlistIds.length === 0) {
            list.innerHTML = '<p class="empty-msg">Your wishlist is empty.</p>';
            return;
        }

        list.innerHTML = '';
        wishlistIds.forEach(id => {
            const product = dbProducts.find(p => p.id === id);
            if (product) {
                const item = document.createElement('div');
                item.className = 'recent-item wishlist-item';
                item.innerHTML = `
                    <div class="recent-thumb">
                        <i class="fas ${product.imageIcon}"></i>
                    </div>
                    <div class="recent-info">
                        <h4>${product.name}</h4>
                        <p>₹${product.basePrice}</p>
                    </div>
                    <button class="remove-wishlist">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                item.querySelector('.remove-wishlist').addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                });

                item.addEventListener('click', () => openModal(product));
                list.appendChild(item);
            }
        });
    }

    function addToRecentlyViewed(product) {
        const user = localStorage.getItem('customLabsUser');
        if (!user) return;

        let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        // Remove if already exists (to move to front)
        recentlyViewed = recentlyViewed.filter(id => id !== product.id);

        // Add to front
        recentlyViewed.unshift(product.id);

        // Limit to 5
        recentlyViewed = recentlyViewed.slice(0, 5);

        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        renderRecentlyViewed();
    }

    function renderRecentlyViewed() {
        if (!recentlyViewedList) return;

        const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        if (recentlyViewedIds.length === 0) {
            recentlyViewedList.innerHTML = '<p class="empty-msg">No products viewed yet.</p>';
            return;
        }

        recentlyViewedList.innerHTML = '';
        recentlyViewedIds.forEach(id => {
            const product = dbProducts.find(p => p.id === id);
            if (product) {
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'recent-item';
                item.innerHTML = `
                    <div class="recent-thumb">
                        <i class="fas ${product.imageIcon}"></i>
                    </div>
                    <div class="recent-info">
                        <h4>${product.name}</h4>
                        <p>₹${product.basePrice}</p>
                    </div>
                `;
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal(product);
                });
                recentlyViewedList.appendChild(item);
            }
        });
    }

    // 6. Modal Functions
    function openModal(product) {
        currentProduct = product;
        selectedVariants = {};

        // Track viewing
        addToRecentlyViewed(product);

        // Reset Scroll position
        const modalBody = document.querySelector('.product-modal-body');
        if (modalBody) modalBody.scrollTop = 0;

        document.getElementById('modalCategory').innerText = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        document.getElementById('modalProductName').innerText = product.name;
        document.getElementById('modalProductPrice').innerText = product.basePrice;
        document.getElementById('modalBuyPrice').innerText = product.basePrice;
        document.getElementById('modalProductDesc').innerText = product.description;
        document.getElementById('modalCustomHint').innerText = product.customizationHint;
        document.getElementById('modalMainImage').innerHTML = `<i class="fas ${product.imageIcon}"></i>`;
        document.getElementById('customInstructions').value = '';
        document.getElementById('buyQty').value = "1";

        const selectionsDiv = document.getElementById('modalSelections');
        selectionsDiv.innerHTML = '';

        // Create selection groups for each variant type
        const variants = product.variants || {};
        Object.entries(variants).forEach(([type, options]) => {
            const group = document.createElement('div');
            group.className = 'selection-group';
            group.innerHTML = `<h4>SELECT ${type.toUpperCase()}</h4>`;

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'selection-options';

            options.forEach((option, index) => {
                const optBtn = document.createElement('div');
                optBtn.className = `selection-option ${index === 0 ? 'active' : ''}`;
                optBtn.innerText = option;

                if (index === 0) selectedVariants[type] = option;

                optBtn.addEventListener('click', () => {
                    optionsDiv.querySelectorAll('.selection-option').forEach(b => b.classList.remove('active'));
                    optBtn.classList.add('active');
                    selectedVariants[type] = option;
                });

                optionsDiv.appendChild(optBtn);
            });

            group.appendChild(optionsDiv);
            selectionsDiv.appendChild(group);
        });

        // Initialize Review Section for this product
        initReviewsForProduct(product.id);

        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Image upload preview logic
        const imageInput = document.getElementById('customImage');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');

        // Reset upload preview
        uploadPlaceholder.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Choose image or drag here</span>
        `;

        imageInput.onchange = function () {
            if (this.files && this.files[0]) {
                const fileName = this.files[0].name;
                uploadPlaceholder.innerHTML = `
                    <i class="fas fa-file-image" style="color: var(--green-success, #28a745);"></i>
                    <span style="color: var(--text-primary);">${fileName}</span>
                    <small style="color: var(--accent); cursor: pointer;">Change</small>
                `;
            }
        };
    }

    function initReviewsForProduct(productId) {
        renderReviews(productId);
        checkPurchaseStatus(productId);
    }

    function renderReviews(productId) {
        const reviewsList = document.getElementById('reviewsList');
        const reviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
        const productReviews = reviews[productId] || [];
        const user = JSON.parse(localStorage.getItem('customLabsUser'));
        const userEmail = user ? user.email : null;

        const reviewsCountLink = document.getElementById('reviewsCountLink');
        if (reviewsCountLink) reviewsCountLink.innerText = `${productReviews.length} reviews`;

        if (productReviews.length === 0) {
            reviewsList.innerHTML = '<p class="empty-msg">No reviews yet. Be the first to share your experience!</p>';
            document.querySelector('.rating-num').innerText = '0.0';
            document.querySelector('.rating-count').innerText = '(0 reviews)';
            return;
        }

        reviewsList.innerHTML = '';
        productReviews.forEach((r, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';

            const isAuthor = userEmail && r.userEmail === userEmail;

            reviewItem.innerHTML = `
                <div class="review-meta">
                    <div class="reviewer-info">
                        <span class="reviewer-name">${r.userName}</span>
                        <div class="rating-stars">
                            ${Array(5).fill(0).map((_, i) => `<i class="${i < r.rating ? 'fas' : 'far'} fa-star"></i>`).join('')}
                        </div>
                    </div>
                    <div class="review-actions">
                        <span class="review-date">${r.date}</span>
                        ${isAuthor ? `
                            <button class="delete-review" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <p class="review-text">${r.text}</p>
            `;

            if (isAuthor) {
                reviewItem.querySelector('.delete-review').onclick = () => removeReview(productId, index);
            }

            reviewsList.appendChild(reviewItem);
        });

        // Update modal summary
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / productReviews.length).toFixed(1);

        const ratingNum = document.querySelector('.rating-num');
        const ratingCount = document.querySelector('.rating-count');
        const starContainerSmall = document.querySelector('.rating-stars-small');
        const modalTopStars = document.getElementById('modalTopStars');

        if (ratingNum) ratingNum.innerText = avgRating;
        if (ratingCount) ratingCount.innerText = `(${productReviews.length} review${productReviews.length !== 1 ? 's' : ''})`;

        const starsHTML = Array(5).fill(0).map((_, i) => {
            const starVal = i + 1;
            if (starVal <= avgRating) return '<i class="fas fa-star"></i>';
            if (starVal - 0.5 <= avgRating) return '<i class="fas fa-star-half-alt"></i>';
            return '<i class="far fa-star"></i>';
        }).join('');

        if (starContainerSmall) starContainerSmall.innerHTML = starsHTML;
        if (modalTopStars) modalTopStars.innerHTML = starsHTML;
    }

    function removeReview(productId, index) {
        if (!confirm('Are you sure you want to remove your review?')) return;

        const reviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
        if (reviews[productId]) {
            reviews[productId].splice(index, 1);
            localStorage.setItem('productReviews', JSON.stringify(reviews));
            renderReviews(productId);
            renderProducts(); // Update stars on tiles
        }
    }

    function checkPurchaseStatus(productId) {
        const user = localStorage.getItem('customLabsUser');
        const purchasedProducts = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
        const addReviewSection = document.getElementById('addReviewSection');
        const reviewAuthMessage = document.getElementById('reviewAuthMessage');

        if (user && purchasedProducts.includes(productId)) {
            addReviewSection.style.display = 'block';
            reviewAuthMessage.style.display = 'none';
        } else {
            addReviewSection.style.display = 'none';
            reviewAuthMessage.style.display = 'flex';

            if (!user) {
                reviewAuthMessage.querySelector('span').innerText = 'Please login to leave a review.';
            } else if (!purchasedProducts.includes(productId)) {
                reviewAuthMessage.querySelector('span').innerText = 'Only verified purchasers can leave a review.';
            }
        }
    }

    // Modal Tab Logic Removed (Amazon style handles scrolling)

    // Star Rating Interaction
    let currentVoteRating = 0;
    const starRatingInput = document.getElementById('starRatingInput');
    if (starRatingInput) {
        const stars = starRatingInput.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, i) => {
                    s.classList.remove('far');
                    s.classList.add(i < rating ? 'fas' : 'far');
                });
            });

            star.addEventListener('mouseout', () => {
                stars.forEach((s, i) => {
                    s.classList.remove('fas', 'far');
                    s.classList.add(i < currentVoteRating ? 'fas' : 'far');
                });
            });

            star.addEventListener('click', () => {
                currentVoteRating = parseInt(star.dataset.rating);
            });
        });
    }

    // Submit Review Logic
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', () => {
            const text = document.getElementById('reviewText').value;
            if (!currentVoteRating) {
                alert('Please select a star rating.');
                return;
            }
            if (!text.trim()) {
                alert('Please write a review.');
                return;
            }

            const reviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
            const productReviews = reviews[currentProduct.id] || [];
            const user = JSON.parse(localStorage.getItem('customLabsUser'));

            const newReview = {
                userName: user.name || user.email.split('@')[0],
                userEmail: user.email,
                rating: currentVoteRating,
                text: text,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            };

            productReviews.unshift(newReview);
            reviews[currentProduct.id] = productReviews;
            localStorage.setItem('productReviews', JSON.stringify(reviews));

            // UI Feedback
            submitReviewBtn.innerHTML = 'SUBMIT';
            submitReviewBtn.style.background = 'var(--green-success, #28a745)';

            setTimeout(() => {
                document.getElementById('reviewText').value = '';
                currentVoteRating = 0;
                starRatingInput.querySelectorAll('i').forEach(s => {
                    s.classList.remove('fas');
                    s.classList.add('far');
                });
                renderReviews(currentProduct.id);
                submitReviewBtn.innerHTML = 'SUBMIT';
                submitReviewBtn.style.background = '';
                renderProducts(); // Update tile stars
            }, 1500);
        });
    }

    function closeModal() {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeProductModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });

    // 5. Add to Cart Integration
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
    modalAddToCartBtn.addEventListener('click', function () {
        if (!currentProduct) return;

        const customInstructions = document.getElementById('customInstructions').value;
        const buyQty = parseInt(document.getElementById('buyQty').value) || 1;

        // Combine all info for cart
        const cartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.basePrice,
            variants: { ...selectedVariants },
            instructions: customInstructions,
            imageIcon: currentProduct.imageIcon,
            quantity: buyQty
        };

        // Call global cart add function (assuming cart.js is loaded)
        if (typeof cart !== 'undefined' && cart.addItem) {
            cart.addItem(cartItem);

            // Trigger star tail animation
            if (window.triggerStarAnimation) {
                window.triggerStarAnimation(this);
            }

            // Visual feedback
            const originalBtnText = this.innerHTML;
            this.innerHTML = 'Added to Cart';
            this.style.background = '#00a800';

            setTimeout(() => {
                this.innerHTML = originalBtnText;
                this.style.background = '';
                closeModal();
            }, 1000);
        } else {
            console.error('Cart system not initialized');
            alert('Added to cart');
        }
    });
});
