import "./WeatherOverlay.css";
import useRain from "../../utils/useRain";

export default function WeatherOverlay() {
  const isRaining = useRain();

  if (!isRaining) return null;

  return (
    <div className="weather-rain" aria-hidden="true">
      <div className="rain-layer rain-far" />
      <div className="rain-layer rain-mid" />
      <div className="rain-layer rain-near" />
      <div className="rain-mist" />
    </div>
  );
}