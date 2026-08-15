import { useMemo } from "react";
import "./FestiveGarland.css";

// Blinkit-style hanging garland across the top of the hero — but the
// ornament shape changes with the festival instead of always being
// fairy lights, using the same `pattern` field festiveTheme.js already
// assigns per occasion (no new data, just a new visual reading of it).
//
//   lights    — warm glowing bulbs: diya/pooja occasions (Diwali, Dhanteras,
//               Ganesh Chaturthi, Karwa Chauth, generic "glow" default...)
//   bunting   — triangular pennant flags: national days + colour festivals
//               (Republic/Independence Day, Holi, New Year, Navratri, Onam)
//   ornaments — two-tone baubles: Christmas / snow-pattern occasions
//   tassels   — thread + tuft: rakhi/thread occasions (Raksha Bandhan,
//               Bhai Dooj, Eid al-Adha, Mahavir Jayanti)
//   balloons  — tiny drifting balloons: Children's Day, Makar Sankranti
const STYLE_BY_PATTERN = {
  stripes: "bunting",
  confetti: "bunting",
  splash: "bunting",
  threads: "tassels",
  ornaments: "ornaments",
  snow: "ornaments",
  balloons: "balloons",
};

function getGarlandStyle(pattern) {
  return STYLE_BY_PATTERN[pattern] || "lights";
}

const SEGMENTS = 6;
const VIEW_W = 1440;
const VIEW_H = 84;
const SEG_W = VIEW_W / SEGMENTS;
const DIP = 40;
const BASE_Y = 8;

function buildPath() {
  let d = `M0,${BASE_Y}`;
  for (let s = 0; s < SEGMENTS; s++) {
    const cx = s * SEG_W + SEG_W / 2;
    const ex = (s + 1) * SEG_W;
    d += ` Q${cx},${BASE_Y + DIP + 8} ${ex},${BASE_Y}`;
  }
  return d;
}

function buildItems(perSegment) {
  const items = [];
  for (let s = 0; s < SEGMENTS; s++) {
    for (let k = 0; k < perSegment; k++) {
      const t = (k + 1) / (perSegment + 1);
      const x = s * SEG_W + t * SEG_W;
      const y = BASE_Y + DIP * Math.sin(Math.PI * t);
      items.push({ x, y, i: s * perSegment + k });
    }
  }
  return items;
}

export default function FestiveGarland({ theme }) {
  const style = useMemo(() => (theme ? getGarlandStyle(theme.pattern) : "lights"), [theme]);
  const path = useMemo(() => buildPath(), []);
  const items = useMemo(
    () => buildItems(style === "bunting" ? 2 : 3),
    [style]
  );

  if (!theme) return null;
  const [c1, c2, c3] = theme.colors;
  const flagColors = [c1, c2, c3];

  return (
    <svg
      className={`festive-garland festive-garland--${style}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="fg-string" d={path} fill="none" stroke={c3} strokeWidth="1.4" opacity="0.55" />

      {style === "lights" && items.map((it) => (
        <g key={it.i} className="fg-bulb" style={{ "--fg-delay": `${(it.i % 9) * 0.22}s` }}>
          <line x1={it.x} y1={it.y - DIP * 0.15} x2={it.x} y2={it.y} stroke={c3} strokeWidth="1" opacity="0.5" />
          <circle cx={it.x} cy={it.y + 5} r="5" fill={it.i % 2 ? c1 : c2} className="fg-bulb-glow" />
          <circle cx={it.x} cy={it.y + 5} r="2.4" fill="#fff8e6" />
        </g>
      ))}

      {style === "bunting" && items.map((it) => (
        <polygon
          key={it.i}
          className="fg-flag"
          style={{ "--fg-delay": `${(it.i % 7) * 0.3}s` }}
          points={`${it.x - 8},${it.y} ${it.x + 8},${it.y} ${it.x},${it.y + 16}`}
          fill={flagColors[it.i % 3]}
        />
      ))}

      {style === "ornaments" && items.map((it) => (
        <g key={it.i} className="fg-bulb" style={{ "--fg-delay": `${(it.i % 9) * 0.25}s` }}>
          <line x1={it.x} y1={it.y - DIP * 0.1} x2={it.x} y2={it.y} stroke={c3} strokeWidth="1" opacity="0.5" />
          <circle cx={it.x} cy={it.y + 6} r={it.i % 2 ? 5.5 : 4} fill={it.i % 2 ? c1 : c2} stroke="#fff" strokeWidth="0.6" opacity="0.92" />
        </g>
      ))}

      {style === "tassels" && items.map((it) => (
        <g key={it.i} className="fg-tassel" style={{ "--fg-delay": `${(it.i % 8) * 0.28}s` }}>
          <line x1={it.x} y1={it.y - DIP * 0.1} x2={it.x} y2={it.y + 10} stroke={c1} strokeWidth="1.2" opacity="0.75" />
          <circle cx={it.x} cy={it.y + 12} r="2.6" fill={c2} />
        </g>
      ))}

      {style === "balloons" && items.map((it) => (
        <g key={it.i} className="fg-balloon" style={{ "--fg-delay": `${(it.i % 8) * 0.35}s` }}>
          <line x1={it.x} y1={it.y} x2={it.x} y2={it.y + 12} stroke={c3} strokeWidth="1" opacity="0.5" />
          <ellipse cx={it.x} cy={it.y - 2} rx="6" ry="8" fill={flagColors[it.i % 3]} opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}
