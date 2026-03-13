// products-data.js - Centralized product database
const productsData = [
    // DRINKWARE
    {
        id: 'magic-mug',
        name: 'Magic Coffee Mug',
        category: 'drinkware',
        basePrice: 349,
        description: 'Watch your design appear as if by magic when you pour in a hot beverage.',
        variants: {
            colors: ['Black', 'Blue', 'Red', 'Green'],
            sizes: ['11oz Standard']
        },
        imageIcon: 'fa-mug-hot',
        customizationHint: 'Upload your photo or text for the invisible-to-visible effect.'
    },
    {
        id: 'white-mug',
        name: 'White Coffee Mug',
        category: 'drinkware',
        basePrice: 249,
        description: 'Classic high-quality white ceramic mug, perfect for any design.',
        variants: {
            colors: ['White'],
            sizes: ['11oz Standard']
        },
        imageIcon: 'fa-mug-hot',
        customizationHint: 'Best for vibrant colorful logos or high-contrast photos.'
    },
    {
        id: 'black-mug',
        name: 'Black Coffee Mug',
        category: 'drinkware',
        basePrice: 299,
        description: 'Sleek matte black finish for a premium professional look.',
        variants: {
            colors: ['Black'],
            sizes: ['11oz Standard']
        },
        imageIcon: 'fa-mug-hot',
        customizationHint: 'Looks stunning with white or gold-colored text.'
    },
    {
        id: 'colour-mug',
        name: 'Colour Coffee Mug',
        category: 'drinkware',
        basePrice: 269,
        description: 'Features a colorful interior and handle for an extra pop of personality.',
        variants: {
            colors: ['Yellow', 'Blue', 'Red', 'Pink', 'Green', 'Orange'],
            sizes: ['11oz Standard']
        },
        imageIcon: 'fa-mug-hot',
        customizationHint: 'Match the inner color with your brand or photo elements.'
    },
    {
        id: 'steel-bottle-black',
        name: 'Steel Water Bottle (Black)',
        category: 'drinkware',
        basePrice: 449,
        description: 'Durable stainless steel with a premium matte black engraved finish.',
        variants: {
            colors: ['Matte Black'],
            sizes: ['500ml', '750ml']
        },
        imageIcon: 'fa-bottle-water',
        customizationHint: 'Your logo will be laser-engraved for a permanent metallic look.'
    },
    {
        id: 'steel-bottle-white',
        name: 'Steel Water Bottle (White)',
        category: 'drinkware',
        basePrice: 449,
        description: 'Clean white stainless steel, ideal for full-color sublimation prints.',
        variants: {
            colors: ['White'],
            sizes: ['750ml']
        },
        imageIcon: 'fa-bottle-water',
        customizationHint: 'Support full-color wrap-around prints.'
    },

    // ACCESSORIES
    {
        id: 'bookmark',
        name: 'Custom Bookmark',
        category: 'accessories',
        basePrice: 169,
        description: 'Keep your place in style with a durable, personalized bookmark.',
        variants: {
            colors: ['Default'],
            materials: ['Premium Cardstock', 'Plastic']
        },
        imageIcon: 'fa-bookmark',
        customizationHint: 'Perfect for quotes, names, or thin vertical illustrations.'
    },
    {
        id: 'keychain',
        name: 'Custom Keychain',
        category: 'accessories',
        basePrice: 169,
        description: 'A pocket-sized memory. Choose between different shapes.',
        variants: {
            shapes: ['Square', 'Rectangle', 'Circle'],
            materials: ['Acrylic', 'Metal']
        },
        imageIcon: 'fa-key',
        customizationHint: 'Add a small photo or contact info for safety.'
    },
    {
        id: 'mousepad',
        name: 'Pro Mouse Pad',
        category: 'accessories',
        basePrice: 219,
        description: 'Smooth surface for precision tracking with a non-slip base.',
        variants: {
            colors: ['Default'],
            shapes: ['Square (9x8)', 'Circle'],
            thickness: ['3mm', '5mm']
        },
        imageIcon: 'fa-computer-mouse',
        customizationHint: 'Great for gaming setups or branded office gifts.'
    },
    {
        id: 'deskpad',
        name: 'Premium Desk Pad',
        category: 'accessories',
        basePrice: 349,
        description: 'Upgrade your workspace with a large-format custom desk mat.',
        variants: {
            sizes: ['30×60 cm', '80×33 cm']
        },
        imageIcon: 'fa-desktop',
        customizationHint: 'Consider a wide landscape-oriented design.'
    },
    {
        id: 'badge',
        name: 'Button Badge',
        category: 'accessories',
        basePrice: 99,
        description: 'Pin-back buttons in various sizes for events or personalization.',
        variants: {
            sizes: ['32mm', '44mm', '58mm', '75mm']
        },
        imageIcon: 'fa-id-badge',
        customizationHint: 'Bulk discounts available for events!'
    },

    // PRINTS & STATIONERY
    {
        id: 'canvas',
        name: 'Canvas Print',
        category: 'prints',
        basePrice: 419,
        description: 'Turn your photos into museum-quality wall art.',
        variants: {
            sizes: ['8×12"', '16×20"', '20×30"']
        },
        imageIcon: 'fa-image',
        customizationHint: 'High-resolution photos are recommended for large formats.'
    },
    {
        id: 'poster-standard',
        name: 'Standard Poster',
        category: 'prints',
        basePrice: 169,
        description: 'Classic posters on high-quality semi-glossy paper.',
        variants: {
            sizes: ['A5', 'A4', 'A3']
        },
        imageIcon: 'fa-file-image',
        customizationHint: 'Perfect for room decor or motivational quotes.'
    },
    {
        id: 'notepad-ruled',
        name: 'Ruled Notepad',
        category: 'prints',
        basePrice: 229,
        description: '120 pages of high-quality ruled paper with a custom cover.',
        variants: {
            sizes: ['A5', 'Standard']
        },
        imageIcon: 'fa-book',
        customizationHint: 'Personalize the cover with your name or artwork.'
    },

    // APPAREL
    {
        id: 'hoodie',
        name: 'Comfort Hoodie',
        category: 'apparel',
        basePrice: 600,
        description: 'Premium heavy-weight cotton blend hoodie.',
        variants: {
            colors: ['Blue', 'Black', 'Green', 'Maroon', 'Grey'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        },
        imageIcon: 'fa-vest',
        customizationHint: 'Logo placement on chest, back, or sleeves available.'
    },
    {
        id: 'oversized-tshirt',
        name: 'Oversized T-Shirt',
        category: 'apparel',
        basePrice: 449,
        description: 'Trendy drop-shoulder fit made from 100% premium cotton.',
        variants: {
            colors: ['Black', 'White', 'Lilac', 'Sage Green'],
            sizes: ['S', 'M', 'L', 'XL']
        },
        imageIcon: 'fa-tshirt',
        customizationHint: 'Minimalist designs look best on this relaxed fit.'
    },
    {
        id: 'tshirt-plain',
        name: 'Premium T-Shirt',
        category: 'apparel',
        basePrice: 299,
        description: 'Everyday comfort in a classic fit.',
        variants: {
            colors: ['All Colors Available'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        },
        imageIcon: 'fa-tshirt',
        customizationHint: 'Perfect for company uniforms or birthday gifts.'
    }
];
