// ============================================================
// SINGLE SOURCE OF TRUTH FOR ALL PRODUCTS
// To add a NEW product: copy any block below, change the key
// (slug) and its fields, save. It appears on the site with no
// other edits needed — card, price, pack sizes, Buy Now, and
// stock status are all generated from this file.
//
// To remove a product: delete its block.
// To mark out of stock: set inStock: false.
//
// Fields:
//   name        - product title shown on the card
//   hindi       - Hindi name shown under the title
//   tag         - small pill text above the title
//   image       - path to product photo
//   bestSeller  - true shows the gold "★ ..." ribbon (use bestSellerLabel to customize)
//   bestSellerLabel - text for the ribbon, e.g. "Best seller"
//   nutrition   - array of {label, value} shown in the info popup
//   bullets     - array of short feature lines
//   inStock     - false disables buying for this product
//   packs       - array of {size, price, mrp, bestValue?}
// ============================================================
export const PRODUCTS = {

  'almonds': {
    name: 'Almonds', hindi: 'बादाम', tag: 'Farm-fresh pick',
    image: '/image/products/almonds.png',
    bestSeller: true, bestSellerLabel: '★ Best seller',
    nutrition: [
      { label: 'Protein', value: '21g' },
      { label: 'Healthy Fats', value: '50g' },
      { label: 'Dietary Fiber', value: '12g' }
    ],
    bullets: [
      'Hand-sorted for size and quality',
      'Rich in protein and healthy fats',
      'No preservatives, no additives'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 249, mrp: 299 },
      { size: '500g', price: 575, mrp: 699 },
      { size: '1kg',  price: 1099, mrp: 1349, bestValue: true }
    ]
  },

  'cashews': {
    name: 'Cashews', hindi: 'काजू', tag: 'Customer favorite',
    image: '/image/products/cashews.png',
    nutrition: [
      { label: 'Protein', value: '18g' },
      { label: 'Healthy Fats', value: '44g' },
      { label: 'Iron', value: '37% DV' }
    ],
    bullets: [
      'Creamy, whole W-grade kernels',
      'Lightly processed, naturally sweet',
      'Sealed fresh for lasting crunch'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 289, mrp: 349 },
      { size: '500g', price: 675, mrp: 799 },
      { size: '1kg',  price: 1299, mrp: 1599, bestValue: true }
    ]
  },

  'walnuts': {
    name: 'Walnuts', hindi: 'अखरोट', tag: 'Brain superfood',
    image: '/image/products/Walnuts.png',
    nutrition: [
      { label: 'Omega-3', value: '9g' },
      { label: 'Protein', value: '15g' },
      { label: 'Healthy Fats', value: '65g' }
    ],
    bullets: [
      'Light, golden kernel halves',
      'Great source of omega-3s',
      'No preservatives, no additives'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 259, mrp: 319 },
      { size: '500g', price: 599, mrp: 729 },
      { size: '1kg',  price: 1149, mrp: 1399, bestValue: true }
    ]
  },

  'raisins': {
    name: 'Raisins', hindi: 'किशमिश', tag: 'Everyday snacking',
    image: '/image/products/raisin.png',
    nutrition: [
      { label: 'Calories', value: '299 kcal' },
      { label: 'Carbs', value: '79g' },
      { label: 'Iron', value: '10% DV' }
    ],
    bullets: [
      'Naturally sun-dried and sweet',
      'No added sugar or sulphur',
      'Soft texture, seedless'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 129, mrp: 159 },
      { size: '500g', price: 289, mrp: 349 },
      { size: '1kg',  price: 549, mrp: 649, bestValue: true }
    ]
  },

  'pistachios': {
    name: 'Pistachios', hindi: 'पिस्ता', tag: 'Perfectly roasted',
    image: '/image/products/Pistachios.png',
    nutrition: [
      { label: 'Protein', value: '20g' },
      { label: 'Healthy Fats', value: '45g' },
      { label: 'Vitamin B6', value: '85% DV' }
    ],
    bullets: [
      'Lightly salted and perfectly roasted',
      'Premium quality, easy to shell',
      'Rich in antioxidants and protein'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 329, mrp: 399 },
      { size: '500g', price: 769, mrp: 929, bestValue: true }
    ]
  },

  'dates': {
    name: 'Dates', hindi: 'खजूर', tag: "Nature's candy",
    image: '/image/products/Dates.png',
    nutrition: [
      { label: 'Calories', value: '277 kcal' },
      { label: 'Carbs', value: '75g' },
      { label: 'Potassium', value: '19% DV' }
    ],
    bullets: [
      'Soft, chewy, and naturally sweet',
      'Rich in iron and instant energy',
      'No added sugars or syrups'
    ],
    inStock: true,
    packs: [
      { size: '250g', price: 149, mrp: 179 },
      { size: '500g', price: 269, mrp: 319 },
      { size: '1kg',  price: 499, mrp: 599, bestValue: true }
    ]
  },

  'mix-dry-fruits': {
    name: '30% Nuts Mix Dry Fruits', hindi: 'मिक्स ड्राई फ्रूट्स', tag: 'Perfect Trail Mix',
    image: '/image/products/NutsMixDryFruits.png',
    bestSeller: true, bestSellerLabel: '★ Nutrient Powerhouse',
    nutrition: [
      { label: 'Protein', value: '14g' },
      { label: 'Healthy Fats', value: '35g' },
      { label: 'Fiber', value: '8g' }
    ],
    bullets: [
      'Balanced blend with 30% premium nuts',
      'Rich in varied essential nutrients',
      'Perfect everyday energy booster'
    ],
    inStock: true,
    packs: [
      { size: '250g', price: 199, mrp: 249 },
      { size: '500g', price: 369, mrp: 449 },
      { size: '1kg',  price: 699, mrp: 849, bestValue: true }
    ]
  },

  'salted-cashews': {
    name: 'Salted Cashews', hindi: 'नमकीन काजू', tag: 'Savory delight',
    image: '/image/products/SaltedCashews.png',
    nutrition: [
      { label: 'Protein', value: '18g' },
      { label: 'Healthy Fats', value: '45g' },
      { label: 'Sodium', value: 'Moderate' }
    ],
    bullets: [
      'Slow-roasted to a golden crunch',
      'Lightly dusted with premium salt',
      'The ultimate party snack'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 269, mrp: 329 },
      { size: '500g', price: 629, mrp: 759, bestValue: true }
    ]
  },

  'figs': {
    name: 'Dried Figs (Anjeer)', hindi: 'अंजीर', tag: 'High-fiber treat',
    image: '/image/products/DriedFigs.png',
    nutrition: [
      { label: 'Calories', value: '249 kcal' },
      { label: 'Dietary Fiber', value: '10g' },
      { label: 'Calcium', value: '16% DV' }
    ],
    bullets: [
      'Naturally sweet and chewy texture',
      'Excellent source of dietary fiber',
      'Great for digestion and snacking'
    ],
    inStock: true,
    packs: [
      { size: '200g', price: 219, mrp: 269 },
      { size: '500g', price: 489, mrp: 589, bestValue: true }
    ]
  }

  // --- add new products below, same shape as above ---

};