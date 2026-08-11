import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from './firebase';

export async function loadProductsFromFirestore() {
  try {
    const snapshot = await getDocs(
      collection(db, 'products')
    );

    if (snapshot.empty) {
      console.log(
        'Firestore products collection is empty.'
      );

      return null;
    }

    const products = {};

    snapshot.forEach((docSnap) => {
      products[docSnap.id] = docSnap.data();
    });

    console.log(
      `Loaded ${Object.keys(products).length} products from Firestore.`
    );

    return products;

  } catch (error) {
    console.warn(
      'Firestore unavailable — using local products.',
      error
    );

    return null;
  }
}