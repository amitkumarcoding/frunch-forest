// Single source of truth for admin access. Used by Header.tsx (to show
// the "Hi, Admin" nav state) and Admin.jsx (to gate the panel itself).
// Note: this only controls the client UI — real protection must come
// from Firestore Security Rules restricting writes to these accounts
// server-side, since anything client-side can be bypassed.
export const ALLOWED_ADMINS = [
  "frunchforest@gmail.com",
  "amitaquarius13@gmail.com",
  "bhardwajakash78@gmail.com",
];
