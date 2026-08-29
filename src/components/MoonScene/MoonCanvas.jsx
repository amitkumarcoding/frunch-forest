import { useCallback, useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader, CanvasTexture, AdditiveBlending, Cache } from "three";
import { Stars, Cloud, Clouds } from "@react-three/drei";
import moonTextureUrl from "../../assets/moon_1024.jpg";

// Bundled locally (not fetched from a remote host at runtime) so a
// WebGL-context remount has nothing to race against — see dev note
// on MoonCanvas below for why remounts happen. three's own loader
// Cache is turned on too, so even a same-origin remount re-reads
// from memory instead of re-requesting the asset.
Cache.enabled = true;

// Small radial-gradient sprite for the glow instead of a fake blur —
// generated once, no extra asset to fetch.
function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(224,232,255,0.5)");
  g.addColorStop(0.5, "rgba(224,232,255,0.16)");
  g.addColorStop(1, "rgba(224,232,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

// Real NASA-derived moon texture, shaded by rim + fill lights, with a
// slow spin and a soft breathing glow so it doesn't read as a static
// sticker.
function Moon() {
  const texture = useLoader(TextureLoader, moonTextureUrl);
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();
  const keyLightRef = useRef();
  const [glowTex] = useState(makeGlowTexture);
  const { viewport, camera } = useThree();
  const MOON_Z = -1.2;

  useFrame(({ clock }, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.02;
    // Slow, gentle pulse — not a hard on/off blink, a soft breathing glow.
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 0.6) * 0.5; // 0..1
    if (glowRef.current) glowRef.current.opacity = 0.32 + pulse * 0.22;
    if (keyLightRef.current) keyLightRef.current.intensity = 1.9 + pulse * 0.6;

    // Pin to the true top-right corner every frame using the actual
    // current viewport size at the moon's depth, rather than a fixed
    // world-unit offset. A fixed offset only lands "in the corner" for
    // one specific aspect ratio — on anything wider/narrower it drifts
    // toward the centre, which is why it was sitting near the wheel
    // instead of the corner.
    if (groupRef.current) {
      const vp = viewport.getCurrentViewport(camera, [0, 0, MOON_Z]);
      // Pulled in slightly (0.8/0.72 -> 0.76/0.66) to keep the larger
      // disc + glow fully clear of the top/right edges instead of
      // clipping now that the radius is bigger.
      groupRef.current.position.x = (vp.width / 2) * 0.76;
      groupRef.current.position.y = (vp.height / 2) * 0.66;
    }
  });

  return (
    // Radius bumped again, 0.5 -> 0.68 (~19% of frame height) — reads
    // as a confident hero moon instead of a distant pinprick. Glow
    // sprite scaled up to match so the halo still fully wraps the disc.
    <group ref={groupRef} position={[0, 0, MOON_Z]}>
      <sprite scale={[1.28, 1.28, 1]}>
        <spriteMaterial ref={glowRef} map={glowTex} blending={AdditiveBlending} depthWrite={false} transparent opacity={0.4} />
      </sprite>
      <mesh ref={meshRef} rotation={[0, 2.4, 0]}>
        <sphereGeometry args={[0.68, 64, 64]} />
        {/* A real full moon reads as almost evenly lit — there's no
            dramatic light/shadow split like a studio-lit sphere. So
            instead of standard-material + point lights fighting the
            texture, this leans on strong, near-shadowless ambient +
            hemisphere light and lets the actual NASA crater texture
            carry all the visual detail, which is what makes it look
            photographic instead of like a lit plastic ball. */}
        <meshStandardMaterial map={texture} color="#f4f1e8" roughness={1} metalness={0} />
      </mesh>
      {/* Soft, warm-neutral, mostly-ambient rig — no more blue tint,
          no more hard directional hotspot. keyLightRef still pulses
          gently so the moon doesn't look static, but subtly. */}
      <hemisphereLight skyColor="#fff8ec" groundColor="#0c0f14" intensity={1.1} />
      <pointLight ref={keyLightRef} position={[3, 2, 4]} intensity={2.2} color="#fff6e8" />
    </group>
  );
}

// Several wisps drifting left-to-right across the full width of the
// hero, each looping seamlessly and at a different depth/speed/height
// so it reads as a real sky rather than one puff shuttling back and
// forth in a small corner box.
function DriftingClouds() {
  const groupRefs = [useRef(), useRef(), useRef()];
  // [depth z, height y, loop speed, start-x offset]
  const layers = [
    { z: 0.8, y: 1.4, speed: 0.09, offset: 0 },
    { z: 0.2, y: -0.4, speed: 0.05, offset: 4 },
    { z: -0.6, y: 2.4, speed: 0.13, offset: 8 },
  ];
  const SPAN = 14; // total horizontal travel before wrapping, in world units

  useFrame(({ clock }) => {
    layers.forEach((layer, i) => {
      const ref = groupRefs[i].current;
      if (!ref) return;
      const t = (clock.elapsedTime * layer.speed + layer.offset) % SPAN;
      ref.position.x = t - SPAN / 2; // sweep from -SPAN/2 to +SPAN/2, then loop
    });
  });

  return (
    <>
      {layers.map((layer, i) => (
        <group key={i} ref={groupRefs[i]} position={[0, layer.y, layer.z]}>
          <Clouds material={undefined} limit={40}>
            <Cloud
              seed={i + 1}
              position={[0, 0, 0]}
              bounds={[1, 0.22, 0.3]}
              segments={12}
              volume={0.3}
              color="#dfe3e6"
              opacity={0.08}
              speed={0.15}
            />
          </Clouds>
        </group>
      ))}
    </>
  );
}

// Orthographic projection has no vanishing point, so a sphere renders
// as a perfect circle no matter where it sits in frame — unlike the
// perspective camera this replaced, which stretched the moon into an
// ellipse once it was positioned out toward the corner (classic
// wide-lens distortion: shapes warp the further they sit off-axis).
// Orthographic zoom isn't resolution-independent by default the way
// perspective fov is, so this recomputes zoom from the actual canvas
// height on every resize to keep the same framing (~3.53 world units
// of half-height) regardless of window size.
const TARGET_HALF_HEIGHT = 3.53;
function CameraRig() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = size.height / (2 * TARGET_HALF_HEIGHT);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Scene() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.35} />
      <Suspense fallback={null}>
        <Moon />
      </Suspense>
      <Stars radius={55} depth={25} count={180} factor={0.8} saturation={0} fade speed={0.4} />
      <DriftingClouds />
    </>
  );
}

// dev note: React StrictMode double-invokes effects on mount, and Vite
// HMR re-runs this module on every edit — in a long dev session that
// piles up live WebGL contexts until Chrome force-drops the oldest one
// ("Context Lost"). Neither happens in a production build. As a safety
// net anyway (GPU driver resets, backgrounded tabs happen in prod too),
// remount the canvas fresh instead of leaving a blank layer.
export default function MoonCanvas() {
  const [instanceKey, setInstanceKey] = useState(0);

  const handleCreated = useCallback(({ gl }) => {
    const onLost = (e) => {
      e.preventDefault();
      setTimeout(() => setInstanceKey((k) => k + 1), 50);
    };
    gl.domElement.addEventListener("webglcontextlost", onLost, { once: true });
  }, []);

  return (
    <Canvas
      key={instanceKey}
      orthographic
      camera={{ position: [0, 0, 8], zoom: 100, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={handleCreated}
    >
      <Scene />
    </Canvas>
  );
}
