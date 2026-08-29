import { useCallback, useRef, useState, Suspense } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader, CanvasTexture, AdditiveBlending } from "three";
import { Stars, Cloud, Clouds } from "@react-three/drei";

const MOON_TEXTURE_URL =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg";

// Small radial-gradient sprite for the glow instead of a fake blur —
// generated once, no extra asset to fetch.
function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,246,224,0.55)");
  g.addColorStop(0.5, "rgba(255,246,224,0.18)");
  g.addColorStop(1, "rgba(255,246,224,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

// Real NASA-derived moon texture, shaded by rim + fill lights, with a
// slow spin so it doesn't read as a static sticker.
function Moon() {
  const texture = useLoader(TextureLoader, MOON_TEXTURE_URL);
  const meshRef = useRef();
  const [glowTex] = useState(makeGlowTexture);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group position={[3.4, 2.2, -2]}>
      <sprite scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <mesh ref={meshRef} rotation={[0, 2.4, 0]}>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
      <pointLight position={[4, 3, 3]} intensity={12} color="#fff6e0" />
      <pointLight position={[-3, -2, 2]} intensity={2} color="#7fa8ff" />
    </group>
  );
}

// Clouds drifting side to side in front of/behind the moon — <Cloud>'s
// own `speed` only animates the puffs in place, so position drift needs
// its own useFrame.
function DriftingClouds() {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.12) * 1.4;
  });
  return (
    <group ref={groupRef}>
      <Clouds material={undefined} limit={200}>
        <Cloud seed={1} position={[3, 1.6, 0]} bounds={[3, 1.2, 1]} volume={3} color="#dfe3e6" opacity={0.55} speed={0.15} />
        <Cloud seed={2} position={[2.2, 2.4, 1]} bounds={[2.4, 1, 1]} volume={2} color="#eceff1" opacity={0.4} speed={0.1} />
      </Clouds>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <Suspense fallback={null}>
        <Moon />
      </Suspense>
      <Stars radius={60} depth={30} count={2500} factor={2} saturation={0} fade speed={0.4} />
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
      camera={{ position: [0, 0, 8], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={handleCreated}
    >
      <Scene />
    </Canvas>
  );
}
