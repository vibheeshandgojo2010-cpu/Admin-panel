/**
 * DATA MIGRATION SCRIPT
 * Run this once to upload products from products-data.js to Firestore.
 */

async function migrateProductsToFirestore() {
    if (typeof productsData === 'undefined') {
        console.error('productsData not found. Make sure products-data.js is loaded.');
        return;
    }

    console.log('🚀 Starting migration of', productsData.length, 'products...');
    const batch = db.batch();

    productsData.forEach(product => {
        const docRef = db.collection('products').doc(product.id);
        batch.set(docRef, {
            ...product,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });

    try {
        await batch.commit();
        console.log('✅ Migration successful! All products are now in Firestore.');
        if (typeof showToast === 'function') showToast('Migration successful!', 'success');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        
        let errorMsg = 'Migration failed. ';
        if (error.code === 'permission-denied') {
            errorMsg += 'Check your Firestore Security Rules.';
        } else if (error.code === 'unauthenticated') {
            errorMsg += 'Please log in first.';
        } else {
            errorMsg += error.message;
        }

        if (typeof showToast === 'function') showToast(errorMsg, 'error');
    }
}

// Attach to window for manual execution if needed
window.migrateProductsToFirestore = migrateProductsToFirestore;
