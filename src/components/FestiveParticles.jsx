import { useMemo } from "react";
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

// Fewer particles on small screens — keeps this from competing with the
// scroll thread on mobile (see Home.css hero perf pass).
const isMobile =
  typeof window !== "undefined" && window.matchMedia?.("(max-width: 640px)").matches;
const scaleCount = (n) => Math.round(n * (isMobile ? 0.55 : 1));

const shared = {
  fullScreen: { enable: false }, // confine to the parent container, not the viewport
  fpsLimit: 60,
  detectRetina: true,
  background: { color: { value: "transparent" } },
};

function diyaLayer(colors) {
  const [c1, , c3] = colors;
  return {
    ...shared,
    particles: {
      number: { value: scaleCount(22) },
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
      shadow: { enable: true, color: c1, blur: 6 },
      move: { enable: true, speed: { min: 0.3, max: 0.9 }, direction: "top", random: true, straight: false, outModes: { default: "out" } },
      links: { enable: false },
      life: { count: 1, delay: { value: { min: 0, max: 3 } } },
    },
  };
}

function crackerLayer(colors) {
  // Sparse, slow firework bursts layered above the diyas — a handful of
  // shells, not a nonstop show, so it stays a backdrop, not the headline.
  return {
    ...shared,
    preset: "fireworks",
    particles: { color: { value: colors } },
    sounds: { enable: false },
    emitters: {
      life: { count: 0, duration: 0.35, delay: isMobile ? 2.4 : 1.6 },
    },
  };
}

function pichkariLayer(colors) {
  // Two upward colour sprays from the lower corners (like a pichkari squirt)
  // plus a soft ambient colour-blotch backdrop.
  return {
    ...shared,
    particles: {
      number: { value: 0 },
      color: { value: colors },
      shape: { type: "circle" },
      opacity: { value: { min: 0.4, max: 0.85 }, animation: { enable: true, speed: 1, sync: false, startValue: "random" } },
      size: { value: { min: 2, max: 6 } },
      shadow: { enable: true, color: colors[0], blur: 6 },
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

function splashLayer(colors) {
  const [c1, c2, c3] = colors;
  return {
    ...shared,
    particles: {
      number: { value: scaleCount(34) },
      color: { value: [c1, c2, c3] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.2, max: 0.6 }, animation: { enable: true, speed: 0.8, sync: false, startValue: "random" } },
      size: { value: { min: 3, max: 10 }, animation: { enable: true, speed: 2, sync: false, startValue: "random" } },
      shadow: { enable: true, color: c2, blur: 8 },
      move: { enable: true, speed: { min: 0.4, max: 1.2 }, direction: "none", random: true, outModes: { default: "out" } },
    },
  };
}

function snowLayer() {
  return {
    ...shared,
    preset: "snow",
    particles: {
      color: { value: "#ffffff" },
      number: { value: scaleCount(46) },
      opacity: { value: { min: 0.35, max: 0.85 }, animation: { enable: true, speed: 0.6, sync: false, startValue: "random" } },
      size: { value: { min: 1, max: 4 } },
      shadow: { enable: true, color: "#ffffff", blur: 3 },
      move: { speed: { min: 0.5, max: 1.6 }, drift: { min: -0.4, max: 0.4 } },
      wobble: { enable: true, distance: 6, speed: { min: 4, max: 10 } },
      life: { count: 1, delay: { value: { min: 0, max: 2 } } },
    },
  };
}

function confettiLayer(colors) {
  const [c1, c2, c3] = colors;
  return {
    ...shared,
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
    emitters: { life: { duration: 0 }, rate: { quantity: 2, delay: 0.35 } },
  };
}

function glowLayer(colors) {
  const [c1, c2, c3] = colors;
  return {
    ...shared,
    preset: "stars",
    particles: {
      color: { value: [c1, c2, c3, "#ffffff"] },
      number: { value: scaleCount(32) },
      opacity: { value: { min: 0.15, max: 0.65 }, animation: { enable: true, speed: { min: 0.5, max: 1.2 }, sync: false, startValue: "random" } },
      size: { value: { min: 0.5, max: 2.2 }, animation: { enable: true, speed: 1, sync: false, startValue: "random" } },
      shadow: { enable: true, color: c1, blur: 4 },
      move: { speed: { min: 0.15, max: 0.4 } },
    },
  };
}

// pattern -> one or more layered configs. Order matters: earlier layers
// render underneath later ones (e.g. diyas glow under cracker bursts).
function buildLayers(pattern, colors) {
  switch (pattern) {
    case "flag":
      return []; // rendered by <FestiveFlag/> instead — no particle layer
    case "crackers":
      return [diyaLayer(colors), crackerLayer(colors)];
    case "pichkari":
      return [splashLayer(colors), pichkariLayer(colors)];
    case "diyas":
      return [diyaLayer(colors)];
    case "splash":
      return [splashLayer(colors)];
    case "snow":
      return [snowLayer()];
    case "confetti":
      return [confettiLayer(colors)];
    case "glow":
    default:
      return [glowLayer(colors)];
  }
}

// Drop this in place of the old .fp/.fp-spark markup inside
// .hero-festive-layer. For pattern === "flag" this renders nothing —
// render <FestiveFlag/> alongside it instead (see Home.jsx).
// Respects prefers-reduced-motion by simply not mounting.
export default function FestiveParticles({ pattern, colors }) {
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const layers = useMemo(() => buildLayers(pattern, colors), [pattern, colors]);

  if (prefersReducedMotion || !layers.length) return null;

  return (
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
  );
}
