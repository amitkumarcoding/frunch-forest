import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from './firebase';

// Firestore product docs sometimes carry a relative image path (e.g.
// "./image/products/x.png") — that only resolves correctly on pages
// at the site root. It 404s on nested routes like /products/:slug,
// because the browser resolves "./" against the current URL's path
// depth, not the site root. Normalize to an absolute path so every
// page (Home, Products, ProductDetails) loads the same image.
function normalizeImagePath(image) {
  if (!image || typeof image !== 'string') return image;
  if (/^(https?:)?\/\//i.test(image)) return image; // full URL — leave as-is
  if (image.startsWith('./')) return image.slice(1); // "./image/x.png" -> "/image/x.png"
  if (!image.startsWith('/')) return `/${image}`;
  return image;
}

export async function loadProductsFromFirestore() {
  try {
    const snapshot = await getDocs(
      collection(db, 'products')
    );

    if (snapshot.empty) {
      return null;
    }

    const products = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      products[docSnap.id] = {
        ...data,
        image: normalizeImagePath(data.image),
      };
    });

    return products;

  } catch (error) {
    console.warn(
      'Firestore unavailable — using local products.',
      error
    );

    return null;
  }
}