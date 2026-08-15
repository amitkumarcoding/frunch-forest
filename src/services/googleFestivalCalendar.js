const CALENDAR_ID = "en.indian#holiday@group.v.calendar.google.com";
const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CACHE_KEY = "ff_festivals_cache_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
      .map((event) => ({
        date: event.start.date,
        key: slugify(event.summary),
        text: `Happy ${event.summary}`,
        emoji: "🎉",
      }));

    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), festivals }));

    console.log(`Loaded ${festivals.length} festivals from Google Calendar.`);
    return festivals;
  } catch (error) {
    console.warn("Google Calendar unavailable — using local festival calendar.", error);
    return null;
  }
}