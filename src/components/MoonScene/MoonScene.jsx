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
        <div className="moon-stars" />
        <div className="moon-twinkle moon-twinkle-1" />
        <div className="moon-twinkle moon-twinkle-2" />
        <div className="moon-twinkle moon-twinkle-3" />
        <div className="moon-twinkle moon-twinkle-4" />
      </div>
    </div>
  );
}