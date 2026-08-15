// Time-of-day greeting — the hero banner's fallback content on days with
// no festival. Shape matches festiveGreeting.js ({key,text,eyebrow,emoji})
// so Home.jsx can treat whichever one is active identically.
const TIME_SLOTS = [
  { key: "morning", text: "Good Morning", eyebrow: "Rise, shine & snack", emoji: "🌅" },
  { key: "afternoon", text: "Good Afternoon", eyebrow: "Midday munchies, sorted", emoji: "☀️" },
  { key: "evening", text: "Good Evening", eyebrow: "Golden hour, gold nuts", emoji: "🌇" },
  { key: "night", text: "Good Night", eyebrow: "Late-night cravings, sorted", emoji: "🌙" },
];

function toGreeting(slot) {
  return { key: slot.key, text: slot.text, eyebrow: slot.eyebrow, emoji: slot.emoji };
}

// Dev/preview override: ?timeOfDay=<key> in the URL, same pattern as
// festiveGreeting.js's ?festival= override. Only ever narrows to an
// existing slot — never fabricates one.
function getPreviewKey() {
  if (typeof window === "undefined" || !window.location) return null;
  try {
    return new URLSearchParams(window.location.search).get("timeOfDay");
  } catch {
    return null;
  }
}

function slotForHour(hour) {
  if (hour >= 5 && hour < 12) return TIME_SLOTS[0]; // morning
  if (hour >= 12 && hour < 17) return TIME_SLOTS[1]; // afternoon
  if (hour >= 17 && hour < 21) return TIME_SLOTS[2]; // evening
  return TIME_SLOTS[3]; // night: 21:00–04:59
}

export function getTimeGreeting(date = new Date()) {
  const previewKey = getPreviewKey();
  if (previewKey) {
    const preview = TIME_SLOTS.find((s) => s.key === previewKey);
    if (preview) return toGreeting(preview);
  }
  return toGreeting(slotForHour(date.getHours()));
}
