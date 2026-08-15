import { useEffect, useState } from "react";
import "./FestiveWelcomeOverlay.css";

// Blinkit-style full-screen festive takeover: a short, skippable moment
// that greets the user by name-of-festival before settling into the
// normal hero. Reuses the same festive/theme/icon data as the hero
// banner — this is a second surface for the same data, not a new
// festival system.
//
// Shows once per browser tab per festival (sessionStorage), so repeat
// visits/navigations within a session don't replay it.
const AUTO_DISMISS_MS = 3200;

export default function FestiveWelcomeOverlay({ festive, theme, Icon }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!festive) return;
    const seenKey = `ff-festive-seen-${festive.key}`;
    if (typeof window === "undefined" || sessionStorage.getItem(seenKey)) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    sessionStorage.setItem(seenKey, "1");
    setVisible(true);

    if (reduceMotion) return;
    const timer = setTimeout(() => setClosing(true), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [festive]);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => setVisible(false), 520);
    return () => clearTimeout(timer);
  }, [closing]);

  if (!visible || !festive || !theme) return null;

  const vars = {
    "--fw-1": theme.colors[0],
    "--fw-2": theme.colors[1],
    "--fw-3": theme.colors[2],
  };

  return (
    <div
      className={`festive-welcome${closing ? " closing" : ""}`}
      style={vars}
      role="dialog"
      aria-label={`${festive.text} — Frunch Forest`}
      onClick={() => setClosing(true)}
    >
      <div className="festive-welcome-burst" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="fw-shard" style={{ "--i": i }} />
        ))}
      </div>

      <div className="festive-welcome-card">
        <div className="festive-welcome-icon">
          <span className="fw-icon-ring" aria-hidden="true"></span>
          {Icon && <Icon width={40} height={40} />}
        </div>
        <span className="festive-welcome-eyebrow">{festive.eyebrow}</span>
        <h2 className="festive-welcome-text">{festive.text}</h2>
        <p className="festive-welcome-sub">from all of us at Frunch Forest</p>
      </div>

      <button
        type="button"
        className="festive-welcome-skip"
        onClick={(e) => { e.stopPropagation(); setClosing(true); }}
      >
        Skip →
      </button>
    </div>
  );
}
