// Colour + pattern per time-of-day slot — the fallback hero theme used
// on days with no festival (see timeGreeting.js). Mirrors festiveTheme.js
// so Home.jsx can drive the exact same hero markup either way.
//
// Only patterns with dedicated backdrop CSS ("glow") or dedicated
// particle art ("moonglow") are used here on purpose — see
// hero-festive-backdrop--* in Home.css.
export const TIME_THEMES = {
  morning: { colors: ["#F7C873", "#F1A65C", "#3E7C4A"], pattern: "glow" },
  afternoon: { colors: ["#F6D365", "#F1D48A", "#3E7C4A"], pattern: "glow" },
  evening: { colors: ["#E8834C", "#8B5FBF", "#8B6420"], pattern: "glow" },
  night: { colors: ["#1F3A5F", "#C9973B", "#3E7C4A"], pattern: "moonglow" },
};

export const DEFAULT_TIME_THEME = TIME_THEMES.afternoon;

export function getTimeTheme(key) {
  return TIME_THEMES[key] || DEFAULT_TIME_THEME;
}
