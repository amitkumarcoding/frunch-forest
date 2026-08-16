import { getDefaultEyebrow } from "../utils/festiveGreeting";
const CALENDAR_ID = "en.indian#holiday@group.v.calendar.google.com";
const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CACHE_KEY = "ff_festivals_cache_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Google's public holiday calendar spells festival names inconsistently
// (e.g. "Mahatma Gandhi Jayanti", "Vinayaka Chaturthi", "Bakri Id /
// Eid ul-Adha", "Budhha Purnima"). Match by keyword instead of exact
// slug so these still resolve to the curated keys in festiveTheme.js.
const ALIASES = [
  { match: /new\s*year/i, key: "new-year" },
  { match: /sankranti/i, key: "makar-sankranti" },
  { match: /pongal/i, key: "pongal" },
  { match: /republic\s*day/i, key: "republic-day" },
  { match: /shivrat/i, key: "maha-shivratri" },
  { match: /holi/i, key: "holi" },
  { match: /ugadi|gudi\s*padwa/i, key: "ugadi" },
  { match: /fitr/i, key: "eid-al-fitr" },
  { match: /ram\s*navami/i, key: "ram-navami" },
  { match: /mahavir/i, key: "mahavir-jayanti" },
  { match: /good\s*friday/i, key: "good-friday" },
  { match: /hanuman/i, key: "hanuman-jayanti" },
  { match: /bud[dh]h?a?\s*purnima/i, key: "buddha-purnima" },
  { match: /adha|bakri/i, key: "eid-al-adha" },
  { match: /muharram/i, key: "muharram" },
  { match: /onam/i, key: "onam" },
  { match: /raksha\s*bandhan|rakhi/i, key: "raksha-bandhan" },
  { match: /janmashtami/i, key: "janmashtami" },
  { match: /ganesh|vinayak/i, key: "ganesh-chaturthi" },
  { match: /vishwakarma/i, key: "vishwakarma-puja" },
  { match: /gandhi/i, key: "gandhi-jayanti" },
  { match: /navratri/i, key: "navratri" },
  { match: /dussehra|dasara|vijayadashami/i, key: "dussehra" },
  { match: /karva\s*chauth|karwa\s*chauth/i, key: "karwa-chauth" },
  { match: /dhanteras/i, key: "dhanteras" },
  { match: /diwali|deepavali/i, key: "diwali" },
  { match: /govardhan/i, key: "govardhan-puja" },
  { match: /bhai\s*dooj/i, key: "bhai-dooj" },
  { match: /guru\s*nanak/i, key: "guru-nanak-jayanti" },
  { match: /children/i, key: "children-s-day" },
  { match: /teachers/i, key: "teachers-day" },
  { match: /baisakhi|vaisakhi/i, key: "baisakhi" },
  { match: /independence\s*day/i, key: "independence-day" },
  { match: /christmas/i, key: "christmas" },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveKey(summary) {
  const alias = ALIASES.find((a) => a.match.test(summary));
  return alias ? alias.key : slugify(summary);
}

export async function loadFestivalsFromGoogleCalendar() {
  if (!API_KEY) {
    console.warn("Google Calendar API key missing — using local festival calendar.");
    return null;
  }

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { savedAt, festivals } = JSON.parse(cached);
      if (Date.now() - savedAt < CACHE_TTL_MS) return festivals;
    }

    const now = new Date();
    const timeMin = new Date(now.getFullYear(), 0, 1).toISOString();
    const timeMax = new Date(now.getFullYear() + 1, 0, 1).toISOString();

    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
      `?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`);

    const data = await res.json();
    const festivals = (data.items || [])
      .filter((event) => event.start?.date && event.summary)
      .map((event) => {
        const key = resolveKey(event.summary);
        return {
          date: event.start.date,
          key,
          text: `Happy ${event.summary}`,
          eyebrow: getDefaultEyebrow(key) || "Wishing you a wonderful day",
          emoji: "🎉",
        };
      });

    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), festivals }));

    return festivals;
  } catch (error) {
    console.warn("Google Calendar unavailable — using local festival calendar.", error);
    return null;
  }
}