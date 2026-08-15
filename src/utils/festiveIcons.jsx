// One small line-art SVG per festival, replacing the raw emoji that used
// to sit in the hero banner (festiveGreeting.js `emoji` field). Emoji
// render inconsistently across OS/browser and read as a placeholder next
// to the rest of the site's hand-drawn icon set — these match the stroke
// weight/style already used elsewhere in Home.jsx.
//
// Categories map several festival keys onto one shared icon (e.g. every
// lamp-lit occasion gets the diya) rather than inventing 30 one-off
// drawings. Figurative/deity icons are deliberately avoided — trishul,
// khanda, gada etc. are used as their own recognised symbols instead of
// attempting a face, which tends to render low-quality and can read as
// disrespectful.
import React from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function DiyaIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 15c0 3 4 5 9 5s9-2 9-5" />
      <path d="M3 15c2-2 6-3 9-3s7 1 9 3" />
      <path d="M12 12c-1-2-1-4 0-6 1 2 1 4 0 6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CrackerIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v3M12 3l-2 2M12 3l2 2" />
      <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M12 13 6 7M12 13l8-2M12 13l-3 8M12 13l4 7" />
    </svg>
  );
}

export function ChakraFlagIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 3v18" />
      <rect x="5" y="3" width="14" height="9" rx="0.5" />
      <circle cx="12" cy="7.5" r="2.6" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="12" y1="7.5" x2="12" y2="4.9"
          transform={`rotate(${i * 30} 12 7.5)`}
        />
      ))}
    </svg>
  );
}

export function ColorSplashIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="8" r="3" />
      <circle cx="16" cy="6" r="2.2" />
      <circle cx="15" cy="15" r="3.4" />
      <circle cx="6" cy="17" r="1.8" />
    </svg>
  );
}

export function CrescentMoonIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M17 4a8 8 0 1 0 0 16 7 7 0 1 1 0-16Z" />
    </svg>
  );
}

// The moon-viewing sieve (chalni) — the specific ritual object of Karwa
// Chauth, used instead of a crescent moon so the icon isn't shared with
// four other festivals.
export function SieveIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="11" r="8" />
      <path d="M6 8h12M5.2 11h13.6M6 14h12" />
      <path d="M9 5.5v11M15 5.5v11" />
      <path d="M12 19v3M9.5 22h5" />
    </svg>
  );
}

export function TrishulIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v17" />
      <path d="M12 4 8 8M12 4l4 4" />
      <path d="M6 8v-3M18 8v-3" />
    </svg>
  );
}

export function LotusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20c-5-1-7-4-7-8 3 1 5 3 7 6 2-3 4-5 7-6 0 4-2 7-7 8Z" />
      <path d="M12 12V4" />
    </svg>
  );
}

export function GadaIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="6" r="4" />
      <path d="M12 10v10" />
      <path d="M9 20h6" />
    </svg>
  );
}

export function BowArrowIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3a15 15 0 0 1 0 18" />
      <path d="M6 12h13" />
      <path d="M16 8l3 4-3 4" />
      <path d="M6 3 20 12 6 21" strokeDasharray="1 3" opacity="0.5" />
    </svg>
  );
}

export function FluteIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20 20 4" />
      <path d="M8 16v2M11 13v2M14 10v2M17 7v2" />
    </svg>
  );
}

export function ModakIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 8c4 3 6 6 6 9a6 6 0 1 1-12 0c0-3 2-6 6-9Z" />
      <path d="M9.5 3.5c.5.9.5 1.6 0 2.3M12.5 2.5c.5 1 .5 1.8 0 2.6" />
    </svg>
  );
}

// Tilak mark + a small diya — the specific Bhai Dooj ritual (forehead
// mark and a lit lamp), kept separate from the Raksha Bandhan rakhi icon
// so the two occasions look distinct.
export function TilakDiyaIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v6" />
      <path d="M9.5 7c0-1.5 1-2.5 2.5-2.5S14.5 5.5 14.5 7" />
      <path d="M4 17c0 2.5 3.5 4 8 4s8-1.5 8-4" />
      <path d="M4 17c1.5-1.5 4-2.5 8-2.5s6.5 1 8 2.5" />
      <path d="M12 14.5c-.8-1.6-.8-3.2 0-4.8.8 1.6.8 3.2 0 4.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RakhiIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2" />
    </svg>
  );
}

export function CoinIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="13" r="7" />
      <path d="M8 13h6M11 10v6" />
      <path d="M18 4v3M16.5 5.5h3" />
    </svg>
  );
}

export function KhandaIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2v20" />
      <circle cx="12" cy="12" r="7" />
      <path d="M8 6 4 4M16 6l4-2M8 18l-4 2M16 18l4 2" />
    </svg>
  );
}

export function CharkhaIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="7" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1="12" y1="12" x2="12" y2="5" transform={`rotate(${i * 45} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MountainIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 18 9 8l4 6 2-3 6 7Z" />
    </svg>
  );
}

export function BalloonIcon(props) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="9" cy="8" rx="4.2" ry="5" />
      <ellipse cx="16" cy="10.5" rx="3.2" ry="4" />
      <path d="M9 13v8M16 14.5v6" />
      <path d="M7.7 21h2.6M14.7 20.5h2.6" />
    </svg>
  );
}

export function TreeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5 8 11h2.5l-3 5H11v5h2v-5h3.5l-3-5H16Z" />
      <path d="M12 2v1.4" />
      <circle cx="9.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function KiteIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 4 11l8 10 8-10Z" />
      <path d="M12 3v18M4 11h16" />
      <path d="M12 21c2 2 4 2 6 1" strokeDasharray="1 2.5" />
    </svg>
  );
}

export function WheatIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 22V6" />
      <path d="M12 8 8 5M12 8l4-3M12 12 8 9M12 12l4-3M12 16 8 13M12 16l4-3" />
    </svg>
  );
}

export function BookIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5c3-1 6-1 8 1v13c-2-2-5-2-8-1Z" />
      <path d="M20 5c-3-1-6-1-8 1v13c2-2 5-2 8-1Z" />
    </svg>
  );
}

export function SparkleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M18 18l-3-3M6 18l3-3M18 6l-3 3" />
    </svg>
  );
}

// key (from FESTIVE_THEMES / DEFAULT_FESTIVALS) -> icon component
const ICON_BY_KEY = {
  "new-year": SparkleIcon,
  "makar-sankranti": KiteIcon,
  pongal: SparkleIcon,
  "republic-day": ChakraFlagIcon,
  "independence-day": ChakraFlagIcon,
  "maha-shivratri": TrishulIcon,
  holi: ColorSplashIcon,
  ugadi: LotusIcon,
  "eid-al-fitr": CrescentMoonIcon,
  "eid-al-adha": CrescentMoonIcon,
  muharram: CrescentMoonIcon,
  "ram-navami": BowArrowIcon,
  "mahavir-jayanti": LotusIcon,
  "hanuman-jayanti": GadaIcon,
  "good-friday": SparkleIcon,
  "buddha-purnima": LotusIcon,
  janmashtami: FluteIcon,
  "ganesh-chaturthi": ModakIcon,
  onam: LotusIcon,
  navratri: ColorSplashIcon,
  dussehra: BowArrowIcon,
  "karwa-chauth": SieveIcon,
  dhanteras: CoinIcon,
  diwali: DiyaIcon,
  "govardhan-puja": MountainIcon,
  "bhai-dooj": TilakDiyaIcon,
  "children-s-day": BalloonIcon,
  "guru-nanak-jayanti": KhandaIcon,
  christmas: TreeIcon,
  "gandhi-jayanti": CharkhaIcon,
  "vishwakarma-puja": SparkleIcon,
  "raksha-bandhan": RakhiIcon,
  baisakhi: WheatIcon,
  "teachers-day": BookIcon,
};

export function getFestiveIcon(key) {
  return ICON_BY_KEY[key] || SparkleIcon;
}
