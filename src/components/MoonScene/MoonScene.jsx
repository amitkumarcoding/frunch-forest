import "./MoonScene.css";

const MOON_URL = "http://pngimg.com/uploads/moon/moon_PNG46.png";
const CLOUD_URL = "https://pngimg.com/uploads/cloud/cloud_PNG112151.png";

export default function MoonScene() {
  return (
    <div className="moon-scene" aria-hidden="true">
      <div className="scene">
        <img className="moon" src={MOON_URL} alt="" />
        <img className="cloud" src={CLOUD_URL} alt="" />
        <img className="cloud2" src={CLOUD_URL} alt="" />
        <img className="cloud3" src={CLOUD_URL} alt="" />
        <div className="star" />
        <div className="star star-2" />
        <div className="star star-3" />
        <div className="star star-4" />
        <div className="star star-5" />
        <div className="star star-6" />
        <div className="star star-7" />
      </div>
    </div>
  );
}