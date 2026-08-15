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

function sharedFor(isMobile) {
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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
    ...sharedFor(isMobile),
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

function glowLayer(colors, isMobile) {
  const [c1, c2, c3] = colors;
  return {
    ...sharedFor(isMobile),
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