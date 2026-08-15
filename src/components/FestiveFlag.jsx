import { useMemo } from "react";

// Renders in place of FestiveParticles when festiveTheme.pattern === "flag"
// (Republic Day / Independence Day). A real tricolour with an Ashoka Chakra,
// given cloth motion via SVG feTurbulence + feDisplacementMap rather than
// the old flat diagonal-stripe gradient — reads as an actual waving flag
// instead of a colour swatch.
//
// Kept as a small fixed-size badge (not a full-hero background layer) so
// the turbulence recompute stays cheap; the animated <animate> is dropped
// on mobile and under prefers-reduced-motion, leaving a static (still
// correctly-drawn) flag.
export default function FestiveFlag({ className = "" }) {
  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(max-width: 640px)").matches,
    []
  );
  const animate = !reduceMotion && !isMobile;

  return (
    <svg
      className={`festive-flag ${className}`}
      viewBox="0 0 160 110"
      role="img"
      aria-label="Indian flag"
    >
      <title>Indian flag</title>
      <defs>
        <filter id="flagWave" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.045"
            numOctaves="2"
            seed="4"
            result="noise"
          >
            {animate && (
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.01 0.045;0.014 0.055;0.008 0.04;0.01 0.045"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <line x1="14" y1="6" x2="14" y2="104" stroke="#7A6A4E" strokeWidth="3" strokeLinecap="round" />

      <g filter="url(#flagWave)">
        <rect x="16" y="10" width="130" height="24" fill="#FF9933" />
        <rect x="16" y="34" width="130" height="24" fill="#F3ECE0" />
        <rect x="16" y="58" width="130" height="24" fill="#128807" />
        <g transform="translate(81,46)">
          <circle r="9.5" fill="none" stroke="#0B3B8C" strokeWidth="1.1" />
          <circle r="1.6" fill="#0B3B8C" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="0" y1="0" x2="0" y2="-9.5"
              stroke="#0B3B8C"
              strokeWidth="0.6"
              transform={`rotate(${i * 15})`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
