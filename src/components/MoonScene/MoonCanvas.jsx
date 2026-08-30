import { useCallback, useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader, CanvasTexture, AdditiveBlending, Cache, SRGBColorSpace, RepeatWrapping, NoToneMapping } from "three";
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
  g.addColorStop(0, "rgba(230,230,230,0.5)");
  g.addColorStop(0.5, "rgba(230,230,230,0.16)");
  g.addColorStop(1, "rgba(230,230,230,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

// Real NASA-derived moon texture, shaded by a directional "sun" plus
// a faint cool fill, with a bump map from the same texture so craters
// actually respond to light instead of looking painted on.
function Moon() {
  const texture = useLoader(TextureLoader, moonTextureUrl);
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();
  const outerGlowRef = useRef();
  const materialRef = useRef();
  const [glowTex] = useState(makeGlowTexture);
  const { viewport, camera, size } = useThree();
  const MOON_Z = -1.2;

  // The camera only normalizes to canvas *height* (see CameraRig), so
  // the moon's actual on-screen size depends on the viewport's ASPECT
  // RATIO, not raw pixel width. The previous version scaled by pixel
  // width alone, which under-corrected for portrait phones (narrow
  // aspect ratio) — the sphere stayed close to full size even though
  // vp.width (world units) had shrunk far more, so it still covered
  // most of the screen. Keying off aspect ratio directly fixes both
  // desktop and portrait mobile in one formula: full size at wide
  // desktop aspect ratios, down to ~55% at narrow phone aspect ratios.
  const aspect = size.width / size.height;
  const DESKTOP_ASPECT = 2.0;
  const MOBILE_ASPECT = 0.55;
  const MIN_SCALE = 0.55;
  const t = Math.min(1, Math.max(0, (aspect - MOBILE_ASPECT) / (DESKTOP_ASPECT - MOBILE_ASPECT)));
  const scale = MIN_SCALE + t * (1 - MIN_SCALE);

  // Correct color handling for a photographic texture, and let the
  // crater detail read at full sharpness off-axis.
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  // Real full-moon photos are visibly brighter at the center and
  // gently darker toward the edge (limb darkening) — an evenly-lit
  // flat-white disc is the single biggest tell that a moon render is
  // CGI rather than photographic. meshStandardMaterial has no built-in
  // control for this, so this patches a small Fresnel-style term into
  // its fragment shader on first compile: the more a point on the
  // sphere faces away from the camera, the more its output color gets
  // dimmed.
  const handleBeforeCompile = useCallback((shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `
      float limbFacing = clamp(dot(normalize(vViewPosition), normalize(vNormal)), 0.0, 1.0);
      float limbDarken = mix(0.85, 1.0, pow(limbFacing, 0.6));
      gl_FragColor.rgb *= limbDarken;
      #include <dithering_fragment>
      `
    );
  }, []);

  useFrame(({ clock }, delta) => {
    // Extremely slow lunar rotation — no artificial spin-up.
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.008;

    // Only the halo breathes, and barely — the moon itself never
    // pulses brighter/darker, real moonlight doesn't do that.
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 0.25) * 0.5; // 0..1
    if (glowRef.current) glowRef.current.opacity = 0.16 + pulse * 0.05;

    // Pin to the true top-right corner every frame using the actual
    // current viewport size at the moon's depth, rather than a fixed
    // world-unit offset. A fixed offset only lands "in the corner" for
    // one specific aspect ratio — on anything wider/narrower it drifts
    // toward the centre, which is why it was sitting near the wheel
    // instead of the corner.
    if (groupRef.current) {
      const vp = viewport.getCurrentViewport(camera, [0, 0, MOON_Z]);
      // On narrow screens pull the anchor in slightly (0.85->0.78,
      // 0.78->0.72) so the smaller-but-still-relatively-wide glow
      // sprite doesn't clip past the left/bottom edge of a tight
      // portrait frame.
      const xFrac = 0.85 - (1 - scale) * 0.18;
      const yFrac = 0.78 - (1 - scale) * 0.14;
      groupRef.current.position.x = (vp.width / 2) * xFrac;
      groupRef.current.position.y = (vp.height / 2) * yFrac;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, MOON_Z]} scale={scale}>
      {/* Two-layer halo instead of one flat glow: a soft wide outer
          haze (subtle atmospheric scattering) plus the tighter inner
          halo — reads closer to a long-exposure night photo than a
          single uniform glow ring. */}
      <sprite scale={[1.9, 1.9, 1]} position={[0, 0, -0.01]}>
        <spriteMaterial ref={outerGlowRef} map={glowTex} blending={AdditiveBlending} depthWrite={false} transparent opacity={0.08} />
      </sprite>
      <sprite scale={[0.95, 0.95, 1]}>
        <spriteMaterial ref={glowRef} map={glowTex} blending={AdditiveBlending} depthWrite={false} transparent opacity={0.22} />
      </sprite>

      {/* Photographic lunar texture with bump detail so craters
          actually respond to the directional light below, instead of
          looking painted on. Sized to read like a real moon in the
          sky — small and distant — rather than an oversized hero orb. */}
      <mesh ref={meshRef} rotation={[0, 2.4, 0]}>
        <sphereGeometry args={[0.42, 128, 128]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture}
          bumpMap={texture}
          bumpScale={0.075}
          roughness={0.9}
          metalness={0}
          color="#ffffff"
          onBeforeCompile={handleBeforeCompile}
        />
      </mesh>

      {/* Sunlight hitting the moon, replacing the old point light —
          directional light doesn't fall off with distance, so it
          reads as sunlight rather than a nearby bulb. Bumped to fully
          light the disc, matching a bright reference full-moon photo
          instead of a half-shadowed sphere. */}
      <directionalLight position={[2, 1, 6]} intensity={2.4} color="#ffffff" />
      {/* Second light from the opposite side so the far limb isn't
          flat/half-dark — a real full moon reads as evenly bright. */}
      <directionalLight position={[-3, -1, 4]} intensity={1.2} color="#ffffff" />
      <ambientLight intensity={1.05} color="#eef2f7" />
    </group>
  );
}

// Several small wisps drifting left-to-right across the full width of
// the hero, each looping seamlessly and at a different depth/speed/
// height — small individual puffs rather than one large soft blob.
function DriftingClouds() {
  const groupRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];
  // [depth z, height y, loop speed, start-x offset, opacity, size]
  const layers = [
    { z: 0.8, y: 1.6, speed: 0.08, offset: 0, opacity: 0.11, size: 0.55 },
    { z: 0.3, y: 0.6, speed: 0.05, offset: 4, opacity: 0.08, size: 0.4 },
    { z: -0.5, y: -0.8, speed: 0.1, offset: 8, opacity: 0.09, size: 0.5 },
    { z: 0.1, y: 2.5, speed: 0.065, offset: 11, opacity: 0.07, size: 0.35 },
    { z: -0.9, y: -1.6, speed: 0.12, offset: 13.5, opacity: 0.1, size: 0.45 },
  ];
  const SPAN = 16; // total horizontal travel before wrapping, in world units

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
        <group key={i} ref={groupRefs[i]} position={[0, layer.y, layer.z]} scale={layer.size}>
          <Clouds material={undefined} limit={40}>
            <Cloud
              seed={i + 1}
              position={[0, 0, 0]}
              bounds={[1.4, 0.24, 0.32]}
              segments={16}
              volume={0.32}
              color="#e4e8ec"
              opacity={layer.opacity}
              speed={0.12}
              fade={20}
            />
          </Clouds>
        </group>
      ))}
    </>
  );
}

// A rare, randomly-timed streak across the sky rather than a looping
// animation on a fixed schedule — real shooting stars are sparse and
// unpredictable, so a visible "every N seconds, like clockwork"
// pattern would read as fake immediately. Single thin additive-blend
// plane that fades in fast, fades out slower, then goes idle for a
// random 6–18s before the next one.
function ShootingStar({ phaseOffset = 0 }) {
  const { viewport } = useThree();
  const meshRef = useRef();
  const materialRef = useRef();
  const stateRef = useRef({ active: false, t: 0, nextDelay: 3 + phaseOffset, startX: 0, startY: 0, angle: 0 });

  useFrame((_, delta) => {
    const s = stateRef.current;
    if (!s.active) {
      s.nextDelay -= delta;
      if (s.nextDelay <= 0) {
        s.active = true;
        s.t = 0;
        // Start somewhere in the upper portion of the sky, travelling
        // down-and-across at a shallow angle like a real meteor.
        s.startX = -viewport.width / 2 - 1 + Math.random() * viewport.width * 0.6;
        s.startY = viewport.height * 0.15 + Math.random() * viewport.height * 0.25;
        s.angle = -0.3 - Math.random() * 0.25;
      }
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    s.t += delta;
    const duration = 0.75;
    const progress = s.t / duration;
    if (progress >= 1) {
      s.active = false;
      s.nextDelay = 6 + Math.random() * 12;
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    if (meshRef.current) {
      meshRef.current.visible = true;
      const dist = progress * 5.5;
      meshRef.current.position.set(s.startX + Math.cos(s.angle) * dist, s.startY + Math.sin(s.angle) * dist, 3);
      meshRef.current.rotation.z = s.angle;
    }
    if (materialRef.current) {
      const fadeIn = Math.min(1, progress / 0.12);
      const fadeOut = 1 - Math.max(0, (progress - 0.12) / 0.88);
      materialRef.current.opacity = fadeIn * fadeOut * 0.85;
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[0.7, 0.018]} />
      <meshBasicMaterial ref={materialRef} color="#f4f7ff" transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
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
      {/* Almost-black environment — the old 0.35 ambient was washing
          out the moon's shading and flattening the craters. */}
      <ambientLight intensity={0.06} color="#8d99a8" />
      <Suspense fallback={null}>
        <Moon />
      </Suspense>
      {/* Stars' radius/depth are scaled to the actual visible
          orthographic frustum (~3.5 half-height world units) — a
          real-world radius here would place nearly every star outside
          the camera's view. factor/count tuned for a natural mix of
          faint and bright points rather than one uniform speckle. */}
      <Stars radius={7} depth={6} count={900} factor={1.1} saturation={0} fade speed={0.3} />
      {/* Two independent timers so shooting stars occasionally overlap
          in a natural, non-synchronized way rather than firing in
          lockstep. */}
      <ShootingStar phaseOffset={2} />
      <ShootingStar phaseOffset={9} />
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
      gl={{ alpha: true, antialias: true, toneMapping: NoToneMapping, outputColorSpace: SRGBColorSpace }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={handleCreated}
    >
      <Scene />
    </Canvas>
  );
}
