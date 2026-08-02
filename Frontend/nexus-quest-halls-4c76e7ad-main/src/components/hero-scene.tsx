import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, Torus, Stars, Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.18;
      mesh.current.rotation.x += delta * 0.06;
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.4;
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
      inner.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      <Icosahedron ref={mesh} args={[1.55, 1]}>
        <meshStandardMaterial
          color="#0d2b38"
          emissive="#22d3ee"
          emissiveIntensity={0.35}
          metalness={1}
          roughness={0.18}
          wireframe
        />
      </Icosahedron>
      <Icosahedron ref={inner} args={[1.05, 2]}>
        <meshStandardMaterial
          color="#1c0d06"
          emissive="#ff7a2f"
          emissiveIntensity={0.16}
          metalness={0.95}
          roughness={0.35}
          flatShading
        />
      </Icosahedron>

    </group>
  );
}

function Rings() {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.z = state.clock.elapsedTime * 0.12;
    g.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.35;
  });
  return (
    <group ref={g}>
      <Torus args={[2.5, 0.012, 12, 128]}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.75} />
      </Torus>
      <Torus args={[3.1, 0.008, 12, 128]} rotation={[Math.PI / 2.6, 0, 0]}>
        <meshBasicMaterial color="#e879f9" transparent opacity={0.55} />
      </Torus>
      <Torus args={[3.7, 0.006, 12, 128]} rotation={[0, Math.PI / 3, 0]}>
        <meshBasicMaterial color="#ff7a2f" transparent opacity={0.45} />
      </Torus>
    </group>
  );
}

function DustField() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 900;
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

  useFrame((state, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.035} color="#7dd3fc" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function Grid() {
  return (
    <gridHelper
      args={[60, 60, "#22d3ee", "#123845"]}
      position={[0, -3.2, 0]}
      material-transparent
      material-opacity={0.18}
    />
  );
}

function Rig() {
  useFrame((state) => {
    const x = state.pointer.x * 0.6;
    const y = state.pointer.y * 0.35;
    state.camera.position.lerp(new THREE.Vector3(x, y + 0.3, 7.2), 0.03);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.3, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#08111a"]} />
      <fog attach="fog" args={["#08111a", 8, 20]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 4, 5]} intensity={70} color="#22d3ee" />
      <pointLight position={[-6, -2, 2]} intensity={45} color="#ff7a2f" />
      <spotLight position={[0, 8, 3]} angle={0.5} penumbra={1} intensity={60} color="#e879f9" />
      <group position={[2.9, 0.1, 0]} scale={0.82}>
        <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.7}>
          <Core />
        </Float>
        <Rings />
      </group>
      <DustField />
      <Grid />

      <Stars radius={60} depth={40} count={1800} factor={3} saturation={0} fade speed={0.6} />
      <Environment preset="night" />
      <Rig />
    </Canvas>
  );
}
