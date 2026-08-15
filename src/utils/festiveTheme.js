// Colour + pattern per occasion for the hero's festive backdrop and
// particle layer. `pattern` is one of:
//   "stripes" — diagonal tricolour band, for national flag-hoisting days
//   "glow"    — soft radial colour wash, the general-purpose treatment
//   "diyas"   — rows of warm glowing dots, for the Diwali cluster
//   "splash"  — scattered colour blotches, for colour festivals
//   "snow"    — falling white dot pattern, for Christmas
//   "confetti"— gold/white bokeh bursts, for New Year
// Keys are slugified event summaries from Google Calendar (see
// googleFestivalCalendar.js) — must match exactly or it falls back to
// DEFAULT_FESTIVE_THEME. Colours are drawn from the existing gold/forest
// palette where possible, with festival-appropriate accents layered in.
export const FESTIVE_THEMES = {
  "new-year": { colors: ["#F1D48A", "#C9973B", "#3E7C4A"], pattern: "confetti" },
  "republic-day": { colors: ["#FF9933", "#F3ECE0", "#128807"], pattern: "stripes" },
  holi: { colors: ["#D4537E", "#378ADD", "#F1D48A"], pattern: "splash" },
  "maha-shivratri": { colors: ["#2A4B8D", "#EDE3C8", "#8B6420"], pattern: "glow" },
  ugadi: { colors: ["#8FBF6E", "#F1D48A", "#C9973B"], pattern: "glow" },
  "ram-navami": { colors: ["#D85A30", "#F1D48A", "#8B6420"], pattern: "glow" },
  "mahavir-jayanti": { colors: ["#EDE3C8", "#F1D48A", "#C9973B"], pattern: "glow" },
  "good-friday": { colors: ["#5B4B8A", "#EDE3C8", "#8B6420"], pattern: "glow" },
  "buddha-purnima": { colors: ["#D85A30", "#F1D48A", "#EDE3C8"], pattern: "glow" },
  "eid-al-fitr": { colors: ["#2F6B3F", "#F1D48A", "#EDE3C8"], pattern: "glow" },
  "eid-al-adha": { colors: ["#3E7C4A", "#F1D48A", "#8B6420"], pattern: "glow" },
  muharram: { colors: ["#2C2C2A", "#3E7C4A", "#8B6420"], pattern: "glow" },
  "independence-day": { colors: ["#E8A23A", "#F8F1E4", "#315C45"], pattern: "stripes" },
  janmashtami: { colors: ["#2A4B8D", "#F1D48A", "#3E7C4A"], pattern: "glow" },
  "ganesh-chaturthi": { colors: ["#D85A30", "#F1D48A", "#8B6420"], pattern: "glow" },
  onam: { colors: ["#3E7C4A", "#F1D48A", "#B23B3B"], pattern: "glow" },
  navratri: { colors: ["#D4537E", "#2A4B8D", "#F1D48A"], pattern: "splash" },
  dussehra: { colors: ["#D85A30", "#B23B3B", "#F1D48A"], pattern: "glow" },
  diwali: { colors: ["#8B6420", "#F1D48A", "#B23B3B"], pattern: "diyas" },
  "govardhan-puja": { colors: ["#8B6420", "#F1D48A", "#3E7C4A"], pattern: "diyas" },
  "bhai-dooj": { colors: ["#B23B3B", "#F1D48A", "#8B6420"], pattern: "diyas" },
  "guru-nanak-jayanti": { colors: ["#D85A30", "#2A4B8D", "#F1D48A"], pattern: "glow" },
  christmas: { colors: ["#B23B3B", "#2F6B3F", "#F1D48A"], pattern: "snow" },
  "makar-sankranti": { colors: ["#F1D48A", "#378ADD", "#C9973B"], pattern: "glow" },
  pongal: { colors: ["#F1D48A", "#3E7C4A", "#B23B3B"], pattern: "glow" },
  baisakhi: { colors: ["#F1D48A", "#8FBF6E", "#D85A30"], pattern: "glow" },
  "raksha-bandhan": { colors: ["#B23B3B", "#F1D48A", "#8B6420"], pattern: "glow" },
  "karwa-chauth": { colors: ["#B23B3B", "#F1D48A", "#1F3A5F"], pattern: "glow" },
  dhanteras: { colors: ["#C9973B", "#F1D48A", "#8B6420"], pattern: "diyas" },
  "hanuman-jayanti": { colors: ["#D85A30", "#8B6420", "#F1D48A"], pattern: "glow" },
  "vishwakarma-puja": { colors: ["#C9973B", "#8FBF6E", "#5F5E5A"], pattern: "glow" },
  "gandhi-jayanti": { colors: ["#EDE3C8", "#8FBF6E", "#C9973B"], pattern: "glow" },
  "children-s-day": { colors: ["#378ADD", "#F1D48A", "#3E7C4A"], pattern: "glow" },
  "teachers-day": { colors: ["#C9973B", "#3E7C4A", "#EDE3C8"], pattern: "glow" },
};

export const DEFAULT_FESTIVE_THEME = {
  colors: ["#F1D48A", "#8FBF6E", "#C9973B"],
  pattern: "glow",
};

export function getFestiveTheme(key) {
  return FESTIVE_THEMES[key] || DEFAULT_FESTIVE_THEME;
}