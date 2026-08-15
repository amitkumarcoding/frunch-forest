// Local fallback calendar — used only when Google Calendar is
// unreachable/unconfigured. Dates are year-specific and must be
// updated annually (Google Calendar is the source of truth otherwise).
// `priority` breaks ties when two entries land on the same date.
// `eyebrow` is the small line above the greeting in the festive banner.
const DEFAULT_FESTIVALS = [
  { date: "2026-01-01", key: "new-year", text: "Happy New Year", eyebrow: "Welcome 2026", emoji: "🎊", priority: 5 },
  { date: "2026-01-14", key: "makar-sankranti", text: "Happy Makar Sankranti", eyebrow: "Celebrating the harvest", emoji: "🪁", priority: 5 },
  { date: "2026-01-15", key: "pongal", text: "Happy Pongal", eyebrow: "Celebrating the harvest", emoji: "🌾", priority: 5 },
  { date: "2026-01-26", key: "republic-day", text: "Happy Republic Day", eyebrow: "Celebrating the Republic of India", emoji: "🇮🇳", priority: 5 },
  { date: "2026-02-15", key: "maha-shivratri", text: "Happy Maha Shivratri", eyebrow: "Celebrating divine energy", emoji: "🔱", priority: 5 },
  { date: "2026-03-04", key: "holi", text: "Happy Holi", eyebrow: "Celebrating colors of joy", emoji: "🎨", priority: 5 },
  { date: "2026-03-19", key: "ugadi", text: "Happy Ugadi", eyebrow: "Celebrating a new beginning", emoji: "🥭", priority: 5 },
  { date: "2026-03-20", key: "eid-al-fitr", text: "Eid Mubarak", eyebrow: "Celebrating joy & togetherness", emoji: "🌙", priority: 5 },
  { date: "2026-03-26", key: "ram-navami", text: "Happy Ram Navami", eyebrow: "Celebrating faith & courage", emoji: "🛕", priority: 5 },
  { date: "2026-03-31", key: "mahavir-jayanti", text: "Happy Mahavir Jayanti", eyebrow: "Celebrating peace & compassion", emoji: "🕉️", priority: 5 },
  { date: "2026-04-02", key: "hanuman-jayanti", text: "Happy Hanuman Jayanti", eyebrow: "Celebrating strength & devotion", emoji: "🐒", priority: 5 },
  { date: "2026-04-03", key: "good-friday", text: "Good Friday", eyebrow: "A day of hope & reflection", emoji: "✝️", priority: 5 },
  { date: "2026-05-01", key: "buddha-purnima", text: "Happy Buddha Purnima", eyebrow: "Celebrating peace & mindfulness", emoji: "☸️", priority: 5 },
  { date: "2026-05-27", key: "eid-al-adha", text: "Eid Mubarak", eyebrow: "Celebrating faith & togetherness", emoji: "🕌", priority: 5 },
  { date: "2026-06-26", key: "muharram", text: "Muharram", eyebrow: "A time for reflection", emoji: "🌑", priority: 5 },
  { date: "2026-08-15", key: "independence-day", text: "Happy Independence Day", eyebrow: "Celebrating the spirit of India", emoji: "🇮🇳", priority: 5 },
  { date: "2026-08-26", key: "onam", text: "Happy Onam", eyebrow: "Celebrating the harvest", emoji: "🌺", priority: 5 },
  { date: "2026-08-28", key: "raksha-bandhan", text: "Happy Raksha Bandhan", eyebrow: "Celebrating the bond of love", emoji: "🎗️", priority: 5 },
  { date: "2026-09-04", key: "janmashtami", text: "Happy Janmashtami", eyebrow: "Celebrating divine joy", emoji: "🪈", priority: 5 },
  { date: "2026-09-14", key: "ganesh-chaturthi", text: "Happy Ganesh Chaturthi", eyebrow: "Celebrating new beginnings", emoji: "🐘", priority: 5 },
  { date: "2026-09-17", key: "vishwakarma-puja", text: "Happy Vishwakarma Puja", eyebrow: "Celebrating creation & craftsmanship", emoji: "🛠️", priority: 5 },
  { date: "2026-10-02", key: "gandhi-jayanti", text: "Gandhi Jayanti", eyebrow: "Celebrating truth & peace", emoji: "🕊️", priority: 5 },
  { date: "2026-10-11", key: "navratri", text: "Happy Navratri", eyebrow: "Celebrating nine nights", emoji: "💃", priority: 5 },
  { date: "2026-10-20", key: "dussehra", text: "Happy Dussehra", eyebrow: "Celebrating the victory of good", emoji: "🏹", priority: 5 },
  { date: "2026-10-29", key: "karwa-chauth", text: "Happy Karwa Chauth", eyebrow: "Celebrating love & togetherness", emoji: "🌕", priority: 5 },
  { date: "2026-11-06", key: "dhanteras", text: "Happy Dhanteras", eyebrow: "Celebrating prosperity & wellness", emoji: "🪙", priority: 5 },
  { date: "2026-11-08", key: "diwali", text: "Happy Diwali", eyebrow: "Celebrating the festival of lights", emoji: "🪔", priority: 6 },
  { date: "2026-11-09", key: "govardhan-puja", text: "Happy Govardhan Puja", eyebrow: "Celebrating nature & gratitude", emoji: "🐄", priority: 5 },
  { date: "2026-11-11", key: "bhai-dooj", text: "Happy Bhai Dooj", eyebrow: "Celebrating sibling bonds", emoji: "👫", priority: 5 },
  { date: "2026-11-14", key: "children-s-day", text: "Happy Children's Day", eyebrow: "Celebrating the joy of childhood", emoji: "🧒", priority: 5 },
  { date: "2026-11-24", key: "guru-nanak-jayanti", text: "Happy Guru Nanak Jayanti", eyebrow: "Celebrating peace & service", emoji: "🙏", priority: 5 },
  { date: "2026-12-25", key: "christmas", text: "Merry Christmas", eyebrow: "Celebrating warmth & joy", emoji: "🎄", priority: 5 },
];

// Lets calendar-sourced festivals (which don't carry their own eyebrow
// text) reuse the curated copy here instead of shipping with a blank
// eyebrow line. Returns undefined for keys with no local entry.
export function getDefaultEyebrow(key) {
  return DEFAULT_FESTIVALS.find((f) => f.key === key)?.eyebrow;
}

function toGreeting(f) {
  return { key: f.key, text: f.text, eyebrow: f.eyebrow, emoji: f.emoji };
}

// Dev/preview override: ?festival=<key> in the URL. Only ever narrows to
// an existing config entry — never fabricates a festival — so it can't
// leak anything unexpected into production.
function getPreviewKey() {
  if (typeof window === "undefined" || !window.location) return null;
  try {
    return new URLSearchParams(window.location.search).get("festival");
  } catch {
    return null;
  }
}

function toLocalISODate(date) {
  // Local calendar date, not UTC — toISOString() converts to UTC first,
  // which for IST (UTC+5:30) keeps yesterday's date showing for the first
  // ~5.5 hours of today. Festivals are IST calendar days, so match on
  // the browser's local date instead.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// `festivals` — optional list from Google Calendar ({date,key,text,emoji}).
// Falls back to DEFAULT_FESTIVALS when Google Calendar is unavailable.
export function getFestiveGreeting(date = new Date(), festivals = null) {
  const list = festivals && festivals.length ? festivals : DEFAULT_FESTIVALS;

  const previewKey = getPreviewKey();
  if (previewKey) {
    const preview =
      list.find((f) => f.key === previewKey) ||
      DEFAULT_FESTIVALS.find((f) => f.key === previewKey);
    if (preview) return toGreeting(preview);
  }

  const iso = toLocalISODate(date);
  const matches = list.filter((f) => f.date === iso);
  if (!matches.length) return null;
  const match = matches.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  return toGreeting(match);
}