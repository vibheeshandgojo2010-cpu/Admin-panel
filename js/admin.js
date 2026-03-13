// ═══════════════════════════════════════════════════════════════
// CUSTOM LABS — ADMIN PANEL LOGIC (Minimalist)
// ═══════════════════════════════════════════════════════════════

// ── Admin Email Whitelist ──
const ADMIN_EMAILS = [
    'taran@customlabs.com',
    'vibheeshsm@gmail.com',
    'vibheesh@customlabs.com'
];

// 🔐 Hardcoded Admin Credentials
const ADMIN_CREDENTIALS = {
    'taran': 'taran@customlabs',
    'vibheesh': 'vibheesh@customlabs'
};

// ── State ──
let currentPanel = 'dashboard';
let isAdmin = false;
let liveProducts = [];
let liveOrders = [];

// ════════════════════════════════════════
// AUTH GATE — Verify Admin Access
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof firebase === 'undefined') {
            showGateDenied('Firebase not loaded');
            return;
        }
        checkAdminAccess();
    }, 1200);
});

function checkAdminAccess() {
    const authInstance = firebase.auth();

    authInstance.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log('🛡️ No user found. Signing in anonymously...');
            try {
                await firebase.auth().signInAnonymously();
            } catch (e) {
                console.error('❌ Anonymous Auth Failed:', e);
                showGateDenied('Auth Error: ' + e.message);
            }
            return;
        }

        const email = user.email || 'anonymous@customlabs.com';
        if (ADMIN_EMAILS.includes(email) || user.isAnonymous) {
            grantAccess(user);
            return;
        }

        try {
            const adminDoc = await db.collection('admins').doc(email).get();
            if (adminDoc.exists) {
                grantAccess(user);
                return;
            }
        } catch (e) {
            console.warn('Firestore admin check failed:', e.message);
        }

        // Dev mode: Grant access if logged in
        grantAccess(user);
    });

    // Fallback Login
    window.handleAdminManualLogin = function() {
        const user = document.getElementById('adminUser')?.value.trim();
        const pass = document.getElementById('adminPass')?.value.trim();

        if (ADMIN_CREDENTIALS[user] && ADMIN_CREDENTIALS[user] === pass) {
            grantAccess({ 
                displayName: user.charAt(0).toUpperCase() + user.slice(1), 
                email: `${user}@customlabs.com` 
            });
            localStorage.setItem('admin_session', user);
        } else {
            showToast('Invalid credentials', 'error');
        }
    };

    const saved = localStorage.getItem('admin_session');
    if (saved && ADMIN_CREDENTIALS[saved]) {
        grantAccess({ displayName: saved, email: `${saved}@customlabs.com` });
    }
}

function grantAccess(user) {
    isAdmin = true;
    document.getElementById('adminAuthGate').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';

    const name = user.displayName || user.email.split('@')[0];
    document.getElementById('sidebarName').textContent = name;
    document.getElementById('sidebarAvatar').textContent = name.charAt(0).toUpperCase();

    initSidebar();
    startLiveListeners();
    initModals();
    logAudit(`${name} logged in`);
}

function showGateDenied(msg) {
    document.getElementById('gateLoading').style.display = 'none';
    document.getElementById('gateDenied').style.display = 'block';
}

// ════════════════════════════════════════
// SIDEBAR & PANEL NAVIGATION
// ════════════════════════════════════════

function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link[data-panel]');
    links.forEach(link => {
        link.addEventListener('click', () => {
            switchPanel(link.getAttribute('data-panel'));
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Quick actions
    document.querySelectorAll('.quick-action[data-goto]').forEach(qa => {
        qa.addEventListener('click', () => {
            const target = qa.getAttribute('data-goto');
            switchPanel(target);
            links.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('data-panel') === target) l.classList.add('active');
            });
        });
    });
}

function switchPanel(name) {
    currentPanel = name;
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name)?.classList.add('active');
    document.getElementById('headerTitle').textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

// ════════════════════════════════════════
// LIVE LISTENERS & DATA RENDERING
// ════════════════════════════════════════

function startLiveListeners() {
    // 1. Products
    db.collection('products').onSnapshot(snapshot => {
        liveProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProductsTable(liveProducts);
        updateDashboardMetrics();
    });

    // 2. Orders
    db.collection('orders').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        liveOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrdersTable(liveOrders);
        updateDashboardMetrics();
    });

    // 3. Audit Logs
    db.collection('audit_logs').orderBy('timestamp', 'desc').limit(20).onSnapshot(snapshot => {
        renderAuditLogs(snapshot.docs.map(doc => doc.data()));
    });

    // 4. Users CRM
    db.collection('users').orderBy('lastLogin', 'desc').onSnapshot(snapshot => {
        renderUsersTable(snapshot.docs.map(doc => doc.data()));
    });

    initDashboard();
}

function updateDashboardMetrics() {
    const totalRev = liveOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeUsers = Math.floor(Math.random() * 5) + 1;

    document.getElementById('metricRevenue').textContent = `₹${totalRev.toLocaleString()}`;
    document.getElementById('metricOrders').textContent = liveOrders.length;
    document.getElementById('metricActiveUsers').textContent = activeUsers;

    const aov = liveOrders.length > 0 ? Math.round(totalRev / liveOrders.length) : 0;
    document.getElementById('metricAOV').textContent = `₹${aov.toLocaleString()}`;
}

function initDashboard() {
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        showToast('Data Refreshed', 'success');
    });
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id.substring(0, 8)}</td>
            <td>${order.customerName || 'Guest'}</td>
            <td>₹${(order.total || 0).toLocaleString()}</td>
            <td><span class="status-badge ${order.status || 'new'}">${order.status || 'new'}</span></td>
            <td>${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}</td>
            <td><button class="btn-icon" onclick="viewOrder('${order.id}')" title="View Details"><i class="fas fa-eye"></i></button></td>
        </tr>
    `).join('');
}

let activeOrderId = null;

function viewOrder(id) {
    const order = liveOrders.find(o => o.id === id);
    if (!order) return;
    activeOrderId = id;

    document.getElementById('odId').textContent = `(#${id.substring(0, 8)})`;
    const body = document.getElementById('odBody');

    const itemsHtml = order.items?.map(item => `
        <div style="display:flex; gap:15px; padding:12px 0; border-bottom:1px solid var(--admin-border);">
            <div style="width:50px; height:50px; background:var(--admin-bg-dark); border-radius:4px; display:flex; align-items:center; justify-content:center;">
                <i class="fas fa-box" style="color:var(--admin-accent);"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:600; font-size:14px;">${item.name}</div>
                <div style="font-size:12px; color:var(--admin-text-dim);">
                    ${item.size ? `Size: ${item.size} | ` : ''} 
                    ${item.color ? `Color: ${item.color} | ` : ''} 
                    Qty: ${item.quantity || 1}
                </div>
            </div>
            <div style="font-weight:600;">₹${item.price}</div>
        </div>
    `).join('') || '<p style="padding:20px; text-align:center; color:var(--admin-text-dim);">No items found.</p>';

    body.innerHTML = `
        <div style="margin-bottom:25px; padding:15px; background:var(--admin-bg-light); border-radius:8px; border:1px solid var(--admin-border);">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div>
                    <label style="display:block; font-size:10px; color:var(--admin-text-dim); margin-bottom:4px; letter-spacing:1px;">CUSTOMER</label>
                    <div style="font-weight:600;">${order.customerName}</div>
                    <div style="font-size:12px; color:var(--admin-text-dim);">${order.customerEmail}</div>
                </div>
                <div>
                    <label style="display:block; font-size:10px; color:var(--admin-text-dim); margin-bottom:4px; letter-spacing:1px;">STATUS</label>
                    <span class="status-badge ${order.status || 'new'}">${(order.status || 'new').toUpperCase()}</span>
                </div>
            </div>
        </div>
        
        <label style="display:block; font-size:11px; color:var(--admin-text-dim); margin-bottom:10px; letter-spacing:1px; font-weight:700;">ITEMS ORDERED</label>
        <div style="margin-bottom:20px;">${itemsHtml}</div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:15px; border-top:2px solid var(--admin-border);">
            <span style="font-weight:700; font-size:16px;">ORDER TOTAL</span>
            <span style="font-weight:900; font-size:20px; color:var(--admin-accent);">₹${(order.total || 0).toLocaleString()}</span>
        </div>
    `;

    openModal('orderModal');
}

async function updateOrderStatus(newStatus) {
    if (!activeOrderId) return;
    
    try {
        await db.collection('orders').doc(activeOrderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(`Order status updated to: ${newStatus}`, 'success');
        logAudit(`Set order #${activeOrderId.substring(0,8)} status to ${newStatus}`);
        closeModal('orderModal');
    } catch (e) {
        console.error('❌ Status Update Error:', e);
        showToast('Database Error: ' + e.message, 'error');
        alert('PERMISSION DENIED: Update your Firestore Rules in Firebase Console.');
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><i class="fas ${p.imageIcon}"></i> ${p.name}</td>
            <td>${p.category}</td>
            <td>₹${p.basePrice}</td>
            <td>Live</td>
            <td>
                <button class="btn-icon" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.lastLogin?.toDate ? user.lastLogin.toDate().toLocaleString() : 'Never'}</td>
        </tr>
    `).join('');
}

// ════════════════════════════════════════
// PRODUCT ACTIONS
// ════════════════════════════════════════

function initModals() {
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        resetProductForm();
        openModal('productModal');
    });
    document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);

    // Maintenance switch
    document.getElementById('maintenanceSwitch')?.addEventListener('change', async function () {
        const isActive = this.checked;
        try {
            await db.collection('settings').doc('maintenance').set({
                active: isActive,
                message: "We're currently performing some magic behind the scenes. Be back shortly!",
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            showToast(isActive ? '⚠️ Maintenance mode ON' : '✅ Site is LIVE', isActive ? 'warning' : 'success');
        } catch (e) {
            showToast('Update failed', 'error');
            this.checked = !isActive;
        }
    });
}

function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

async function saveProduct() {
    const name = document.getElementById('pmName').value.trim();
    const price = parseInt(document.getElementById('pmPrice').value);
    const existingId = document.getElementById('pmId').value;
    
    // Generate new ID only if it's a new product, otherwise keep the old one
    const id = existingId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!name || !price) return showToast('Fill name and price', 'error');

    try {
        await db.collection('products').doc(id).set({
            id, name, basePrice: price, 
            category: document.getElementById('pmCategory').value,
            description: document.getElementById('pmDesc').value,
            imageIcon: document.getElementById('pmIcon').value || 'fa-box',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        showToast(existingId ? 'Product Updated!' : 'Product Created!', 'success');
        closeModal('productModal');
        logAudit(`${existingId ? 'Updated' : 'Created'} product: ${name}`);
    } catch (e) {
        console.error('❌ Save Product Error:', e);
        showToast('Database Error: ' + e.message, 'error');
        alert('PERMISSION DENIED: Update your Firestore Rules in Firebase Console.');
    }
}

function editProduct(id) {
    const p = liveProducts.find(x => x.id === id);
    if (!p) return;
    document.getElementById('pmId').value = p.id;
    document.getElementById('pmName').value = p.name;
    document.getElementById('pmPrice').value = p.basePrice;
    document.getElementById('pmCategory').value = p.category;
    document.getElementById('pmDesc').value = p.description;
    document.getElementById('pmIcon').value = p.imageIcon;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    openModal('productModal');
}

async function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        await db.collection('products').doc(id).delete();
        showToast('Product deleted', 'warning');
        logAudit(`Deleted product: ${id}`);
    }
}

function resetProductForm() {
    ['pmId', 'pmName', 'pmPrice', 'pmDesc', 'pmIcon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('productModalTitle').textContent = 'Add New Product';
}

// ════════════════════════════════════════
// TOAST & AUDIT
// ════════════════════════════════════════

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function renderAuditLogs(logs) {
    const container = document.getElementById('auditLogContainer');
    if (!container) return;
    container.innerHTML = logs.map(entry => `
        <div class="audit-entry">
            <span class="audit-time">${entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleTimeString() : ''}</span>
            <span class="audit-user">${entry.user}</span>
            <span class="audit-action">${entry.action}</span>
        </div>
    `).join('');
}

function logAudit(action) {
    const user = document.getElementById('sidebarName')?.textContent || 'Admin';
    db.collection('audit_logs').add({ user, action, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
}

console.log('✅ Minimal Admin Panel Loaded');
