// Colour + pattern per occasion for the hero's festive backdrop and
// particle layer. `pattern` is either:
//   "stripes" — diagonal tricolour band, for national days
//   "glow"    — soft radial colour wash, for cultural/religious festivals
// Colours are drawn from the existing gold/forest palette where possible,
// with festival-appropriate accents layered in.
export const FESTIVE_THEMES = {
  "new-year": { colors: ["#F1D48A", "#C9973B", "#3E7C4A"], pattern: "glow" },
  "republic-day": { colors: ["#FF9933", "#F3ECE0", "#128807"], pattern: "stripes" },
  "independence-day": { colors: ["#FF9933", "#F3ECE0", "#128807"], pattern: "stripes" },
  "gandhi-jayanti": { colors: ["#EDE3C8", "#8FBF6E", "#C9973B"], pattern: "glow" },
  christmas: { colors: ["#B23B3B", "#2F6B3F", "#F1D48A"], pattern: "glow" },
  holi: { colors: ["#D4537E", "#378ADD", "#F1D48A"], pattern: "glow" },
  "raksha-bandhan": { colors: ["#B23B3B", "#F1D48A", "#8B6420"], pattern: "glow" },
  janmashtami: { colors: ["#2A4B8D", "#F1D48A", "#3E7C4A"], pattern: "glow" },
  "ganesh-chaturthi": { colors: ["#D85A30", "#F1D48A", "#8B6420"], pattern: "glow" },
  dussehra: { colors: ["#D85A30", "#B23B3B", "#F1D48A"], pattern: "glow" },
  diwali: { colors: ["#8B6420", "#F1D48A", "#B23B3B"], pattern: "glow" },
};

export const DEFAULT_FESTIVE_THEME = {
  colors: ["#F1D48A", "#8FBF6E", "#C9973B"],
  pattern: "glow",
};

export function getFestiveTheme(key) {
  return FESTIVE_THEMES[key] || DEFAULT_FESTIVE_THEME;
}
