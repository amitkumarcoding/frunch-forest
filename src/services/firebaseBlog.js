import { collection, getDocs } from 'firebase/firestore';

import { db } from './firebase';

// Admin-managed blog "specimens" — lets the Nutrient Almanac (Blog page)
// be edited from the Admin console's "Blog / Field notes" section
// instead of a code deploy.
//
// Firestore collection: "blogPosts". Doc shape:
//   { no, label, title, lede, sources: string[], note, order, published }
// `sources` names are matched against SOURCE_SLUGS in Blog.jsx to link
// straight to a product page — an unmatched name just renders as plain
// text. `order` controls display order (ascending); ties fall back to
// `no`/title. `published: false` hides the post from the Blog page
// while leaving it editable in Admin (default true when unset).
export async function loadBlogPostsFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, 'blogPosts'));
    if (snapshot.empty) return [];

    return snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        if (!data.title) return null;
        if (data.published === false) return null;
        return {
          id: docSnap.id,
          no: data.no || '',
          label: data.label || '',
          title: data.title,
          lede: data.lede || '',
          sources: Array.isArray(data.sources) ? data.sources : [],
          note: data.note || '',
          order: typeof data.order === 'number' ? data.order : 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.order - b.order || a.no.localeCompare(b.no));
  } catch (error) {
    console.warn('Firestore blog posts unavailable — using local specimens.', error);
    return null;
  }
}
