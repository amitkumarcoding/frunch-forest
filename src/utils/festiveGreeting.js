const DEFAULT_FIXED = [
  { m: 1, d: 1, key: "new-year", text: "Happy New Year", emoji: "🎊" },
  { m: 1, d: 26, key: "republic-day", text: "Happy Republic Day", emoji: "🪁" },
  { m: 8, d: 15, key: "independence-day", text: "Happy Independence Day", emoji: "🎆" },
  { m: 10, d: 2, key: "gandhi-jayanti", text: "Happy Gandhi Jayanti", emoji: "🕊️" },
  { m: 12, d: 25, key: "christmas", text: "Merry Christmas", emoji: "🎄" },
];

// Used only when Google Calendar is unreachable/unconfigured.
const DEFAULT_LUNAR = [
  { date: "2026-03-04", key: "holi", text: "Happy Holi", emoji: "🎨" },
  { date: "2026-08-28", key: "raksha-bandhan", text: "Happy Raksha Bandhan", emoji: "🎗️" },
  { date: "2026-09-04", key: "janmashtami", text: "Happy Janmashtami", emoji: "🪈" },
  { date: "2026-09-14", key: "ganesh-chaturthi", text: "Happy Ganesh Chaturthi", emoji: "🐘" },
  { date: "2026-10-20", key: "dussehra", text: "Happy Dussehra", emoji: "🏹" },
  { date: "2026-11-08", key: "diwali", text: "Happy Diwali", emoji: "🪔" },
];

function fixedToIso(f, year) {
  return `${year}-${String(f.m).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`;
}

// `festivals` — optional list from Google Calendar ({date,key,text,emoji}).
// Falls back to the local defaults when Google Calendar is unavailable.
export function getFestiveGreeting(date = new Date(), festivals = null) {
  const iso = date.toISOString().slice(0, 10);

  if (festivals && festivals.length) {
    const match = festivals.find((f) => f.date === iso);
    return match ? { key: match.key, text: match.text, emoji: match.emoji } : null;
  }

  const lunarMatch = DEFAULT_LUNAR.find((f) => f.date === iso);
  if (lunarMatch) return { key: lunarMatch.key, text: lunarMatch.text, emoji: lunarMatch.emoji };

  const fixedMatch = DEFAULT_FIXED.find((f) => fixedToIso(f, date.getFullYear()) === iso);
  if (fixedMatch) return { key: fixedMatch.key, text: fixedMatch.text, emoji: fixedMatch.emoji };

  return null;
}