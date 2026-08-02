import { lazy, Suspense } from "react";
import { ClientOnly, useLocation } from "@tanstack/react-router";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, Torus, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ─── Lightweight version of the Three.js scene optimized for background use ──

function CoreBg() {
  const mesh = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.14;
      mesh.current.rotation.x += delta * 0.045;
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.3;
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      inner.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      <Icosahedron ref={mesh} args={[1.55, 1]}>
        <meshStandardMaterial
          color="#0d2b38"
          emissive="#22d3ee"
          emissiveIntensity={0.3}
          metalness={1}
          roughness={0.18}
          wireframe
        />
      </Icosahedron>
      <Icosahedron ref={inner} args={[1.05, 2]}>
        <meshStandardMaterial
          color="#1c0d06"
          emissive="#ff7a2f"
          emissiveIntensity={0.12}
          metalness={0.95}
          roughness={0.35}
          flatShading
        />
      </Icosahedron>
    </group>
  );
}

function RingsBg() {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.z = state.clock.elapsedTime * 0.1;
    g.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.3;
  });
  return (
    <group ref={g}>
      <Torus args={[2.5, 0.012, 12, 128]}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
      </Torus>
      <Torus args={[3.1, 0.008, 12, 128]} rotation={[Math.PI / 2.6, 0, 0]}>
        <meshBasicMaterial color="#e879f9" transparent opacity={0.4} />
      </Torus>
      <Torus args={[3.7, 0.006, 12, 128]} rotation={[0, Math.PI / 3, 0]}>
        <meshBasicMaterial color="#ff7a2f" transparent opacity={0.35} />
      </Torus>
    </group>
  );
}

function DustFieldBg() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_state, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.03} color="#7dd3fc" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function RigBg() {
  useFrame((state) => {
    const x = state.pointer.x * 0.35;
    const y = state.pointer.y * 0.2;
    state.camera.position.lerp(new THREE.Vector3(x, y + 0.3, 7.2), 0.015);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function BackgroundCanvas() {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 0.3, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <color attach="background" args={["#08111a"]} />
      <fog attach="fog" args={["#08111a", 8, 22]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 4, 5]} intensity={55} color="#22d3ee" />
      <pointLight position={[-6, -2, 2]} intensity={35} color="#ff7a2f" />
      <spotLight position={[0, 8, 3]} angle={0.5} penumbra={1} intensity={45} color="#e879f9" />
      <group position={[2.9, 0.1, 0]} scale={0.82}>
        <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.6}>
          <CoreBg />
        </Float>
        <RingsBg />
      </group>
      <DustFieldBg />
      <gridHelper
        args={[60, 60, "#22d3ee", "#123845"]}
        position={[0, -3.2, 0]}
        // @ts-ignore
        material-transparent
        // @ts-ignore
        material-opacity={0.14}
      />
      <Stars radius={60} depth={40} count={1200} factor={3} saturation={0} fade speed={0.5} />
      <RigBg />
    </Canvas>
  );
}

/**
 * GlobalBackground – mounts the Three.js scene as a fixed, full-viewport layer
 * behind all content on every page except the home page (which has its own
 * full-opacity hero scene).  On the home page we render nothing so the hero's
 * own canvas takes over.
 */
export function GlobalBackground() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // On the home page the hero section already renders HeroScene; skip the
  // global layer so we don't double-render two WebGL contexts at once.
  if (isHome) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {/* Three.js canvas */}
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <BackgroundCanvas />
        </Suspense>
      </ClientOnly>

      {/* Dark vignette so text on inner pages stays legible */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(8,17,26,0.62) 0%, rgba(8,17,26,0.45) 40%, rgba(8,17,26,0.62) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Left-side darkening (where the ArenaShell content lives) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 80% at 30% 50%, rgba(8,17,26,0.0) 0%, rgba(8,17,26,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
