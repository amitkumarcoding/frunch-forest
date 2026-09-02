const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function fetchIsRaining(lat, lon) {
  if (!API_KEY) return false;
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("weather fetch failed");
  const data = await res.json();
  const id = data?.weather?.[0]?.id;
  return typeof id === "number" && id >= 200 && id < 600;
}