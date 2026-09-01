import "./MoonScene.css";
import moonImage from "../../assets/moon.png";
import cloudImage from "../../assets/cloud.png";

export default function MoonScene() {
  return (
    <div className="moon-scene" aria-hidden="true">
      <div className="scene">
        <img className="moon" src={moonImage} alt="" />
        <img className="cloud" src={cloudImage} alt="" />
        <img className="cloud2" src={cloudImage} alt="" />
        <img className="cloud3" src={cloudImage} alt="" />
        <div className="moon-stars" />
        <div className="moon-twinkle moon-twinkle-1" />
        <div className="moon-twinkle moon-twinkle-2" />
        <div className="moon-twinkle moon-twinkle-3" />
        <div className="moon-twinkle moon-twinkle-4" />
      </div>
    </div>
  );
}