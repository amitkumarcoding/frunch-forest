// Local fallback calendar — used only when Google Calendar is
// unreachable/unconfigured. Dates are year-specific and must be
// updated annually (Google Calendar is the source of truth otherwise).
const DEFAULT_FESTIVALS = [
  { date: "2026-01-01", key: "new-year", text: "Happy New Year", emoji: "🎊" },
  { date: "2026-01-14", key: "makar-sankranti", text: "Happy Makar Sankranti", emoji: "🪁" },
  { date: "2026-01-15", key: "pongal", text: "Happy Pongal", emoji: "🌾" },
  { date: "2026-01-26", key: "republic-day", text: "Happy Republic Day", emoji: "🇮🇳" },
  { date: "2026-02-15", key: "maha-shivratri", text: "Happy Maha Shivratri", emoji: "🔱" },
  { date: "2026-03-04", key: "holi", text: "Happy Holi", emoji: "🎨" },
  { date: "2026-03-19", key: "ugadi", text: "Happy Ugadi", emoji: "🥭" },
  { date: "2026-03-20", key: "eid-al-fitr", text: "Happy Eid al-Fitr", emoji: "🌙" },
  { date: "2026-03-26", key: "ram-navami", text: "Happy Ram Navami", emoji: "🛕" },
  { date: "2026-03-31", key: "mahavir-jayanti", text: "Happy Mahavir Jayanti", emoji: "🕉️" },
  { date: "2026-04-02", key: "hanuman-jayanti", text: "Happy Hanuman Jayanti", emoji: "🐒" },
  { date: "2026-04-03", key: "good-friday", text: "Good Friday", emoji: "✝️" },
  { date: "2026-05-01", key: "buddha-purnima", text: "Happy Buddha Purnima", emoji: "☸️" },
  { date: "2026-05-27", key: "eid-al-adha", text: "Happy Eid al-Adha", emoji: "🕌" },
  { date: "2026-06-26", key: "muharram", text: "Muharram", emoji: "🌑" },
  { date: "2026-08-15", key: "independence-day", text: "Happy Independence Day", emoji: "🇮🇳" },
  { date: "2026-08-26", key: "onam", text: "Happy Onam", emoji: "🌺" },
  { date: "2026-08-28", key: "raksha-bandhan", text: "Happy Raksha Bandhan", emoji: "🎗️" },
  { date: "2026-09-04", key: "janmashtami", text: "Happy Janmashtami", emoji: "🪈" },
  { date: "2026-09-14", key: "ganesh-chaturthi", text: "Happy Ganesh Chaturthi", emoji: "🐘" },
  { date: "2026-09-17", key: "vishwakarma-puja", text: "Happy Vishwakarma Puja", emoji: "🛠️" },
  { date: "2026-10-02", key: "gandhi-jayanti", text: "Happy Gandhi Jayanti", emoji: "🕊️" },
  { date: "2026-10-11", key: "navratri", text: "Happy Navratri", emoji: "💃" },
  { date: "2026-10-20", key: "dussehra", text: "Happy Dussehra", emoji: "🏹" },
  { date: "2026-10-29", key: "karwa-chauth", text: "Happy Karwa Chauth", emoji: "🌕" },
  { date: "2026-11-06", key: "dhanteras", text: "Happy Dhanteras", emoji: "🪙" },
  { date: "2026-11-08", key: "diwali", text: "Happy Diwali", emoji: "🪔" },
  { date: "2026-11-09", key: "govardhan-puja", text: "Happy Govardhan Puja", emoji: "🐄" },
  { date: "2026-11-11", key: "bhai-dooj", text: "Happy Bhai Dooj", emoji: "👫" },
  { date: "2026-11-14", key: "children-s-day", text: "Happy Children's Day", emoji: "🧒" },
  { date: "2026-11-24", key: "guru-nanak-jayanti", text: "Happy Guru Nanak Jayanti", emoji: "🙏" },
  { date: "2026-12-25", key: "christmas", text: "Merry Christmas", emoji: "🎄" },
];

// `festivals` — optional list from Google Calendar ({date,key,text,emoji}).
// Falls back to DEFAULT_FESTIVALS when Google Calendar is unavailable.
export function getFestiveGreeting(date = new Date(), festivals = null) {
  const iso = date.toISOString().slice(0, 10);
  const list = festivals && festivals.length ? festivals : DEFAULT_FESTIVALS;
  const match = list.find((f) => f.date === iso);
  return match ? { key: match.key, text: match.text, emoji: match.emoji } : null;
}