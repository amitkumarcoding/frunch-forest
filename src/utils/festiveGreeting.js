const FIXED = [
  { m: 1, d: 1, key: "new-year", text: "Happy New Year", emoji: "🎊" },
  { m: 1, d: 26, key: "republic-day", text: "Happy Republic Day", emoji: "🪁" },
  { m: 8, d: 15, key: "independence-day", text: "Happy Independence Day", emoji: "🎆" },
  { m: 10, d: 2, key: "gandhi-jayanti", text: "Happy Gandhi Jayanti", emoji: "🕊️" },
  { m: 12, d: 25, key: "christmas", text: "Merry Christmas", emoji: "🎄" },
];

// Lunar-calendar festivals shift every year — update this list annually.
const LUNAR = [
  { date: "2026-03-04", key: "holi", text: "Happy Holi", emoji: "🎨" },
  { date: "2026-08-28", key: "raksha-bandhan", text: "Happy Raksha Bandhan", emoji: "🎗️" },
  { date: "2026-09-04", key: "janmashtami", text: "Happy Janmashtami", emoji: "🪈" },
  { date: "2026-09-14", key: "ganesh-chaturthi", text: "Happy Ganesh Chaturthi", emoji: "🐘" },
  { date: "2026-10-20", key: "dussehra", text: "Happy Dussehra", emoji: "🏹" },
  { date: "2026-11-08", key: "diwali", text: "Happy Diwali", emoji: "🪔" },
];

export function getFestiveGreeting(date = new Date()) {
  const iso = date.toISOString().slice(0, 10);
  const lunar = LUNAR.find((f) => f.date === iso);
  if (lunar) return { key: lunar.key, text: lunar.text, emoji: lunar.emoji };

  const fixed = FIXED.find(
    (f) => f.m === date.getMonth() + 1 && f.d === date.getDate()
  );
  if (fixed) return { key: fixed.key, text: fixed.text, emoji: fixed.emoji };

  return null;
}