import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadSnowPreset } from "@tsparticles/preset-snow";
import { loadConfettiPreset } from "@tsparticles/preset-confetti";
import { loadFireworksPreset } from "@tsparticles/preset-fireworks";
import { loadStarsPreset } from "@tsparticles/preset-stars";

// Module-scoped (not defined inside the component) so the function reference
// never changes across renders/remounts — ParticlesProvider requires a
// stable `init` identity for the lifetime of the app.
async function registerPresets(engine) {
  await loadSlim(engine);
  await loadSnowPreset(engine);
  await loadConfettiPreset(engine);
  await loadFireworksPreset(engine);
  await loadStarsPreset(engine);
}

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

const scaleCount = (n, isMobile) => Math.round(n * (isMobile ? 0.55 : 1));

function sharedFor() {
  return {
    fullScreen: { enable: false }, // confine to the parent container, not the viewport
    fpsLimit: 60,
    detectRetina: true,
    background: { color: { value: "transparent" } },
  };
}

function diyaLayer(colors, isMobile) {
  const [c1, , c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(22, isMobile) },
      color: { value: [c1, c3, "#fff3d6"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.25, max: 0.9 },
        animation: { enable: true, speed: { min: 0.8, max: 1.8 }, sync: false, startValue: "random" },
      },
      size: {
        value: { min: 1.5, max: 4.5 },
        animation: { enable: true, speed: 1.5, sync: false, startValue: "random" },
      },
      shadow: { enable: !isMobile, color: c1, blur: 6 },
      move: { enable: true, speed: { min: 0.3, max: 0.9 }, direction: "top", random: true, straight: false, outModes: { default: "out" } },
      links: { enable: false },
      life: { count: 1, delay: { value: { min: 0, max: 3 } } },
    },
  };
}

function crackerLayer(colors, isMobile) {
  // Sparse, slow firework bursts layered above the diyas — a handful of
  // shells, not a nonstop show, so it stays a backdrop, not the headline.
  return {
    ...sharedFor(),
    preset: "fireworks",
    particles: { color: { value: colors } },
    sounds: { enable: false },
    emitters: {
      rate: { quantity: 1, delay: isMobile ? 2.4 : 1.6 },
      life: { count: isMobile ? 3 : 6, duration: 0.35 },
    },
  };
}

function pichkariLayer(colors, isMobile) {
  // Two upward colour sprays from the lower corners (like a pichkari squirt)
  // plus a soft ambient colour-blotch backdrop.
  return {
    ...sharedFor(),
    particles: {
      number: { value: 0 },
      color: { value: colors },
      shape: { type: "circle" },
      opacity: { value: { min: 0.4, max: 0.85 }, animation: { enable: true, speed: 1, sync: false, startValue: "random" } },
      size: { value: { min: 2, max: 6 } },
      shadow: { enable: !isMobile, color: colors[0], blur: 6 },
      move: { enable: true, speed: { min: 3, max: 7 }, gravity: { enable: true, acceleration: 5 }, outModes: { default: "destroy" } },
      life: { count: 1 },
    },
    emitters: [
      {
        position: { x: 8, y: 100 },
        rate: { quantity: 2, delay: 0.12 },
        life: { count: 0 },
        particles: { move: { direction: "top-right", angle: { value: 25, offset: 10 } } },
      },
      {
        position: { x: 92, y: 100 },
        rate: { quantity: 2, delay: 0.12 },
        life: { count: 0 },
        particles: { move: { direction: "top-left", angle: { value: 25, offset: 10 } } },
      },
    ],
  };
}

function splashLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(34, isMobile) },
      color: { value: [c1, c2, c3] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.2, max: 0.6 }, animation: { enable: true, speed: 0.8, sync: false, startValue: "random" } },
      size: { value: { min: 3, max: 10 }, animation: { enable: true, speed: 2, sync: false, startValue: "random" } },
      shadow: { enable: !isMobile, color: c2, blur: 8 },
      move: { enable: true, speed: { min: 0.4, max: 1.2 }, direction: "none", random: true, outModes: { default: "out" } },
    },
  };
}

function topDustLayer(colors, isMobile) {
  const [c1] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(6, isMobile) },
      color: { value: c1 },
      shape: { type: "circle" },
      opacity: { value: { min: 0.15, max: 0.35 }, animation: { enable: true, speed: 0.4, sync: false, startValue: "random" } },
      size: { value: { min: 1, max: 2.5 } },
      move: { enable: true, speed: { min: 0.1, max: 0.25 }, direction: "top", random: true, outModes: { default: "out" } },
    },
    emitters: { position: { x: 50, y: 5 }, rate: { quantity: 1, delay: 2 }, life: { count: 0 } },
  };
}

function bottomDustLayer(colors, isMobile) {
  const [, , c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(6, isMobile) },
      color: { value: c3 },
      shape: { type: "circle" },
      opacity: { value: { min: 0.15, max: 0.35 }, animation: { enable: true, speed: 0.4, sync: false, startValue: "random" } },
      size: { value: { min: 1, max: 2.5 } },
      move: { enable: true, speed: { min: 0.1, max: 0.25 }, direction: "top", random: true, outModes: { default: "out" } },
    },
    emitters: { position: { x: 50, y: 95 }, rate: { quantity: 1, delay: 2 }, life: { count: 0 } },
  };
}

function snowLayer(isMobile) {
  return {
    ...sharedFor(),
    preset: "snow",
    particles: {
      color: { value: "#ffffff" },
      number: { value: scaleCount(46, isMobile) },
      opacity: { value: { min: 0.35, max: 0.85 }, animation: { enable: true, speed: 0.6, sync: false, startValue: "random" } },
      size: { value: { min: 1, max: 4 } },
      shadow: { enable: !isMobile, color: "#ffffff", blur: 3 },
      move: { speed: { min: 0.5, max: 1.6 }, drift: { min: -0.4, max: 0.4 } },
      wobble: { enable: true, distance: 6, speed: { min: 4, max: 10 } },
      life: { count: 1, delay: { value: { min: 0, max: 2 } } },
    },
  };
}

function confettiLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(),
    preset: "confetti",
    particles: {
      color: { value: [c1, c2, c3, "#ffffff"] },
      shape: { type: ["square", "circle"] },
      size: { value: { min: 3, max: 7 } },
      opacity: { value: { min: 0.7, max: 1 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: { min: 8, max: 24 }, sync: false } },
      tilt: { enable: true, animation: { enable: true, speed: { min: 8, max: 20 } } },
      move: { speed: { min: 3, max: 7 }, gravity: { enable: true, acceleration: 6 } },
    },
    emitters: { life: { duration: 0 }, rate: { quantity: scaleCount(2, isMobile), delay: 0.35 } },
  };
}

function glowLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(),
    preset: "stars",
    particles: {
      color: { value: [c1, c2, c3, "#ffffff"] },
      number: { value: scaleCount(32, isMobile) },
      opacity: { value: { min: 0.15, max: 0.65 }, animation: { enable: true, speed: { min: 0.5, max: 1.2 }, sync: false, startValue: "random" } },
      size: { value: { min: 0.5, max: 2.2 }, animation: { enable: true, speed: 1, sync: false, startValue: "random" } },
      shadow: { enable: !isMobile, color: c1, blur: 4 },
      move: { speed: { min: 0.15, max: 0.4 } },
    },
  };
}

// Slow, glinting coin-like discs for Dhanteras — heavier and slower than
// the diya flame-dots, with a warm metallic twinkle instead of a soft glow.
function coinsLayer(colors, isMobile) {
  const [c1, c2] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(16, isMobile) },
      color: { value: [c1, c2, "#fff3d6"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.4, max: 0.95 },
        animation: { enable: true, speed: { min: 1.2, max: 2.2 }, sync: false, startValue: "random" },
      },
      size: { value: { min: 3, max: 7 }, animation: { enable: true, speed: 1, sync: false, startValue: "random" } },
      shadow: { enable: !isMobile, color: c1, blur: 8 },
      stroke: { width: 1, color: { value: "#fff3d6" } },
      move: { enable: true, speed: { min: 0.2, max: 0.5 }, direction: "bottom", random: true, straight: false, outModes: { default: "out" } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: { min: 3, max: 8 }, sync: false } },
    },
  };
}

// Fine looping red/gold flecks standing in for rakhi thread and tilak
// rice-grains — used for Raksha Bandhan and Bhai Dooj. Deliberately
// small and drifting rather than a bold shape, so it reads as texture,
// not an attempt at an actual thread or hand illustration.
function threadsLayer(colors, isMobile) {
  const [c1, , c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(26, isMobile) },
      color: { value: [c1, c3, "#fff3d6"] },
      shape: { type: ["circle", "square"] },
      opacity: { value: { min: 0.3, max: 0.85 }, animation: { enable: true, speed: 0.9, sync: false, startValue: "random" } },
      size: { value: { min: 1.5, max: 4 } },
      shadow: { enable: !isMobile, color: c1, blur: 4 },
      move: {
        enable: true,
        speed: { min: 0.3, max: 0.8 },
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
        path: { enable: true, options: { sides: 5, turnSpeed: 2, angle: { value: 90, offset: 0 } } },
      },
    },
  };
}

// A single large, slow-breathing glow rising toward the top of the hero —
// stands in for moonlight rather than a literal moon disc — with a thin
// scatter of cool stars beneath it.
function moonGlowLayer(colors, isMobile) {
  const [, , c3] = colors;
  return {
    ...sharedFor(),
    preset: "stars",
    particles: {
      color: { value: ["#EDE3C8", "#ffffff", c3] },
      number: { value: scaleCount(24, isMobile) },
      opacity: { value: { min: 0.15, max: 0.6 }, animation: { enable: true, speed: { min: 0.4, max: 1 }, sync: false, startValue: "random" } },
      size: { value: { min: 0.6, max: 2 }, animation: { enable: true, speed: 0.8, sync: false, startValue: "random" } },
      shadow: { enable: !isMobile, color: "#EDE3C8", blur: 5 },
      move: { speed: { min: 0.08, max: 0.2 }, direction: "top" },
    },
    emitters: { position: { x: 82, y: 15 }, rate: { quantity: 1, delay: 1.5 }, life: { count: 0 } },
  };
}

// Warm diya glow paired with a slow, gentle sparkle overhead — a "blessing"
// treatment for occasions that call for reverence without a specific
// figure (Ganesh Chaturthi, and reusable anywhere the feeling is devotional
// rather than festive-loud).
function blessingSparkleLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(14, isMobile) },
      color: { value: [c1, c2, c3] },
      shape: { type: "star" },
      opacity: { value: { min: 0.25, max: 0.7 }, animation: { enable: true, speed: 0.7, sync: false, startValue: "random" } },
      size: { value: { min: 1.5, max: 3.5 }, animation: { enable: true, speed: 1, sync: false, startValue: "random" } },
      shadow: { enable: !isMobile, color: c2, blur: 5 },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 2, sync: false } },
      move: { enable: true, speed: { min: 0.15, max: 0.35 }, direction: "top", random: true, outModes: { default: "out" } },
    },
  };
}

// Fast, thin golden streaks tracing an arc — evokes an arrow's flight
// (Ram Navami / Dussehra) without drawing a bow or a figure. Sparse and
// occasional, like the cracker bursts, so it punctuates rather than fills.
function arrowsLayer(colors, isMobile) {
  const [c1, c2] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: 0 },
      color: { value: [c1, c2, "#fff3d6"] },
      shape: { type: "triangle" },
      opacity: { value: { min: 0.7, max: 1 } },      // was 0.6–0.9
      size: { value: { min: 4, max: 7 } },            // was 3–5
      shadow: { enable: !isMobile, color: c1, blur: 6 },
      rotate: { value: 90, animation: { enable: false } },
      move: {
        enable: true,
        speed: { min: 5, max: 8 },
        direction: "top-right",
        straight: true,
        trail: { enable: true, length: 8, fill: { color: "#00000000" } },
        outModes: { default: "destroy" },
      },
      life: { count: 1 },
    },
    emitters: {
      position: { x: 6, y: 92 },
      rate: { quantity: 2, delay: isMobile ? 1.4 : 1 },   // was 1 qty / 2–3s
      life: { count: 0 },
    },
  };
}
// Falling snow plus a slow twinkle of ornament-coloured bokeh — an upgrade
// on plain snow for Christmas so it reads as "lights on a tree" rather
// than a generic winter scene.
function ornamentTwinkleLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(18, isMobile) },
      color: { value: [c1, c2, c3, "#F1D48A"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.3, max: 0.9 }, animation: { enable: true, speed: { min: 1, max: 2 }, sync: false, startValue: "random" } },
      size: { value: { min: 1.5, max: 3.5 } },
      shadow: { enable: !isMobile, color: c1, blur: 6 },
      move: { enable: true, speed: { min: 0.1, max: 0.3 }, direction: "none", random: true, outModes: { default: "out" } },
    },
  };
}

// Big, slow, playful drifting circles for Children's Day — larger and
// lighter than the splash/glow treatments, moving upward like balloons
// rather than scattering like confetti.
function balloonsLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(),
    particles: {
      number: { value: scaleCount(12, isMobile) },
      color: { value: [c1, c2, c3, "#ffffff"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.5, max: 0.85 } },
      size: { value: { min: 8, max: 16 }, animation: { enable: true, speed: 1.2, sync: false, startValue: "random" } },
      shadow: { enable: !isMobile, color: c2, blur: 6 },
      move: { enable: true, speed: { min: 0.4, max: 0.9 }, direction: "top", random: true, straight: false, wobble: { enable: true, distance: 8, speed: { min: 3, max: 7 } }, outModes: { default: "out" } },
      life: { count: 1, delay: { value: { min: 0, max: 3 } } },
    },
  };
}

// pattern -> one or more layered configs. Order matters: earlier layers
// render underneath later ones (e.g. diyas glow under cracker bursts).
function buildLayers(pattern, colors, isMobile) {
  switch (pattern) {
    case "flag":
      return []; // rendered by <FestiveFlag/> instead — no particle layer
    case "stripes":
      return [topDustLayer(colors, isMobile), bottomDustLayer(colors, isMobile)];
    case "independence":
      return [topDustLayer(colors, isMobile), bottomDustLayer(colors, isMobile)];
    case "crackers":
      return [diyaLayer(colors, isMobile), crackerLayer(colors, isMobile)];
    case "pichkari":
      return [splashLayer(colors, isMobile), pichkariLayer(colors, isMobile)];
    case "diyas":
      return [diyaLayer(colors, isMobile)];
    case "splash":
      return [splashLayer(colors, isMobile)];
    case "snow":
      return [snowLayer(isMobile)];
    case "confetti":
      return [confettiLayer(colors, isMobile)];
    case "coins":
      return [coinsLayer(colors, isMobile)];
    case "threads":
      return [threadsLayer(colors, isMobile)];
    case "moonglow":
      return [moonGlowLayer(colors, isMobile)];
    case "blessing":
      return [diyaLayer(colors, isMobile), blessingSparkleLayer(colors, isMobile)];
    case "arrows":
      return [topDustLayer(colors, isMobile), arrowsLayer(colors, isMobile)];
    case "ornaments":
      return [snowLayer(isMobile), ornamentTwinkleLayer(colors, isMobile)];
    case "balloons":
      return [balloonsLayer(colors, isMobile)];
    case "glow":
    default:
      return [glowLayer(colors, isMobile)];
  }
}

// Drop this in place of the old .fp/.fp-spark markup inside
// .hero-festive-layer. For pattern === "flag" this renders nothing —
// render <FestiveFlag/> alongside it instead (see Home.jsx).
// Respects prefers-reduced-motion by simply not mounting, and pauses
// (unmounts the canvases) when scrolled out of view to save battery/CPU.
export default function FestiveParticles({ pattern, colors }) {
  const isMobile = useIsMobile();
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const layers = useMemo(() => buildLayers(pattern, colors, isMobile), [pattern, colors, isMobile]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (prefersReducedMotion || !layers.length) return null;

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {inView && (
        <ParticlesProvider init={registerPresets}>
          {layers.map((options, i) => (
            <Particles
              key={`${pattern}-${i}`}
              id={`festive-particles-${pattern}-${i}`}
              options={options}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            />
          ))}
        </ParticlesProvider>
      )}
    </div>
  );
}