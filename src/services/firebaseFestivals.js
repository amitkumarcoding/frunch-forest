import { collection, getDocs } from 'firebase/firestore';

import { db } from './firebase';

// Admin-managed festival calendar — lets a date/text/theme change go
// live from the Admin console's "Festival calendar" section instead of
// a code deploy. These entries are merged on top of Google Calendar (or
// the local festiveGreeting.js fallback) in Home.jsx, and always win on
// a shared date because they carry a higher `priority`.
//
// Firestore collection: "festivals". Doc shape:
//   { date: "YYYY-MM-DD", key, text, eyebrow, emoji, priority }
// `key` should match an entry in festiveTheme.js / festiveIcons.jsx to
// get that occasion's colours and icon — an unrecognised key still
// works, it just falls back to the default gold/forest theme and a
// sparkle icon (see getFestiveTheme / getFestiveIcon).
export async function loadFestivalOverridesFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, 'festivals'));
    if (snapshot.empty) return [];

    return snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        if (!data.date || !data.key || !data.text) return null;
        return {
          id: docSnap.id,
          date: typeof data.date === 'string' ? data.date : '',
          key: typeof data.key === 'string' ? data.key : '',
          text: typeof data.text === 'string' ? data.text : '',
          eyebrow: typeof data.eyebrow === 'string' ? data.eyebrow : 'Wishing you a wonderful day',
          emoji: typeof data.emoji === 'string' ? data.emoji : '🎉',
          priority: typeof data.priority === 'number' ? data.priority : 10,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn('Firestore festival calendar unavailable.', error);
    return [];
  }
}
