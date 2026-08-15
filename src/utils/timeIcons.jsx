// One small line-art SVG per time-of-day slot — the non-festival
// counterpart to festiveIcons.jsx. Same stroke weight/style so the hero
// banner/emblem look identical whichever system is driving them.
import React from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function SunriseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4" />
      <path d="M5 12H3M21 12h-2" />
      <path d="M5.6 6.6l1.4 1.4M18.4 6.6l-1.4 1.4" />
      <path d="M6 15a6 6 0 0 1 12 0" />
      <path d="M3 19h18M3 15h4M17 15h4" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function SunsetIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 9v-4" />
      <path d="M5 12H3M21 12h-2" />
      <path d="M5.6 6.6l1.4 1.4M18.4 6.6l-1.4 1.4" />
      <path d="M6 15a6 6 0 0 1 12 0" />
      <path d="M3 19h18M3 15h4M17 15h4" />
    </svg>
  );
}

export function MoonStarsIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M16 3.5a7.5 7.5 0 1 0 4.5 13.6A7.5 7.5 0 0 1 16 3.5Z" />
      <path d="M19.5 3.5v2.6M18.2 4.8h2.6" />
      <path d="M8.5 15v1.8M7.6 15.9h1.8" />
    </svg>
  );
}

// key (from TIME_THEMES / TIME_SLOTS) -> icon component
const ICON_BY_KEY = {
  morning: SunriseIcon,
  afternoon: SunIcon,
  evening: SunsetIcon,
  night: MoonStarsIcon,
};

export function getTimeIcon(key) {
  return ICON_BY_KEY[key] || SunIcon;
}
