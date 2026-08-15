import { collection, getDocs } from 'firebase/firestore';

import { db } from './firebase';

// Admin-managed festival offers / discounts — lets a promo go live from
// the Admin console's "Festival offers" section instead of a code
// deploy. Rendered as cards on the Home page (FestivalOffers component).
//
// Firestore collection: "offers". Doc shape:
//   { title, description, discount, code, image, link, active,
//     startDate, endDate, priority }
// `startDate`/`endDate` are optional "YYYY-MM-DD" strings — when set,
// the offer only shows within that window. `active` lets an admin
// hide an offer without deleting it.
// Firestore doc images sometimes carry a relative path (e.g.
// "./image/offers/x.jpg") — normalize to absolute so it resolves the
// same regardless of which page/route renders it.
function normalizeImagePath(image) {
  if (!image || typeof image !== 'string') return image;
  if (/^(https?:)?\/\//i.test(image)) return image;
  if (image.startsWith('./')) return image.slice(1);
  if (!image.startsWith('/')) return `/${image}`;
  return image;
}

export async function loadOffersFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, 'offers'));
    if (snapshot.empty) return [];

    const today = new Date().toISOString().slice(0, 10);

    return snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        if (!data.title) return null;
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description || '',
          discount: data.discount || '',
          code: data.code || '',
          image: normalizeImagePath(data.image) || '',
          link: data.link || '',
          active: data.active !== false,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          priority: typeof data.priority === 'number' ? data.priority : 10,
        };
      })
      .filter(Boolean)
      .filter((o) => o.active)
      .filter((o) => !o.startDate || o.startDate <= today)
      .filter((o) => !o.endDate || o.endDate >= today)
      .sort((a, b) => b.priority - a.priority);
  } catch (error) {
    console.warn('Firestore festival offers unavailable.', error);
    return [];
  }
}
