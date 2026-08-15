import { useEffect, useState } from "react";
import "./FestiveTopRibbon.css";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(max-width: 640px)").matches
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

// Fills the thin empty strip between the header and the hero content with
// a festive treatment, re-themed per-festival via the existing colour/icon
// data.
//
// Desktop: a scrolling marquee ticker (plenty of width for the loop seam
// to stay unnoticed).
// Mobile: NOT the same marquee — on a ~360px screen the loop point is only
// a couple of repeats away and the seam/stutter reads as broken rather
// than premium. Mobile instead gets a static centered strip with a single
// slow shimmer sweep — same festive colours and icon, no looping motion.
export default function FestiveTopRibbon({ festive, theme, Icon }) {
  const isMobile = useIsMobile();
  if (!festive || !theme) return null;

  const vars = {
    "--rb-1": theme.colors[0],
    "--rb-2": theme.colors[1],
    "--rb-3": theme.colors[2],
  };

  if (isMobile) {
    return (
      <div className="festive-ribbon festive-ribbon--static" style={vars} aria-hidden="true">
        <span className="festive-ribbon-icon">
          {Icon && <Icon width={13} height={13} />}
        </span>
        <span className="festive-ribbon-static-text">{festive.text}</span>
        <span className="festive-ribbon-icon">
          {Icon && <Icon width={13} height={13} />}
        </span>
      </div>
    );
  }

  const items = Array.from({ length: 8 });

  return (
    <div className="festive-ribbon" style={vars} aria-hidden="true">
      <div className="festive-ribbon-track">
        {[...items, ...items].map((_, i) => (
          <span className="festive-ribbon-item" key={i}>
            <span className="festive-ribbon-icon">
              {Icon && <Icon width={13} height={13} />}
            </span>
            {festive.text}
          </span>
        ))}
      </div>
    </div>
  );
}
