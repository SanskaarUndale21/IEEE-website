"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function smoothstep(x: number) {
  const c = THREE.MathUtils.clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
}

/** small overshoot as the globe settles into place, peaks ~0.05 past full scale */
function settleBump(x: number) {
  return Math.sin(Math.PI * THREE.MathUtils.clamp((x - 0.7) / 0.3, 0, 1)) * 0.05;
}

const START_SCALE = 0.08;
/** widest feature is the outer torus at r=2.6, so the object spans ~5.2 units */
const EXTENT = 5.9;

export default function LoaderGlobe({
  progressRef,
  onReady,
  reducedMotion = false,
}: {
  progressRef: React.MutableRefObject<number>;
  onReady?: () => void;
  reducedMotion?: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.Mesh>(null!);
  const announced = useRef(false);
  const { viewport } = useThree();

  /** scale that keeps the whole object on screen in any aspect ratio */
  const fit = THREE.MathUtils.clamp(
    Math.min(viewport.width, viewport.height) / EXTENT,
    0.3,
    1.25
  );

  useEffect(() => {
    if (announced.current) return;
    announced.current = true;
    onReady?.();
  }, [onReady]);

  useFrame((_, delta) => {
    const p = progressRef.current;
    if (!group.current) return;

    if (reducedMotion) {
      group.current.scale.setScalar(fit);
      return;
    }

    const grow = START_SCALE + (1 - START_SCALE) * smoothstep(p) + settleBump(p);
    group.current.scale.setScalar(grow * fit);
    group.current.rotation.y += delta * (2.2 * (1 - p) + 0.15);
    group.current.rotation.x = Math.sin(p * Math.PI) * 0.15;

    if (core.current) {
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + (1 - p) * 0.8;
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <group ref={group} scale={START_SCALE * fit}>
      {/* lights travel with the loader so it never depends on the hero's dim rig */}
      <pointLight position={[3, 2, 4]} intensity={2.2} color="#7DD3FC" />
      <pointLight position={[-4, -2, 2]} intensity={1.4} color="#00629B" />

      <mesh ref={core}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial
          color="#0EA5E9"
          emissive="#00A3E0"
          emissiveIntensity={0.9}
          transparent
          opacity={0.92}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>

      <mesh ref={wire}>
        <sphereGeometry args={[1.95, 32, 32]} />
        <meshStandardMaterial color="#7DD3FC" wireframe transparent opacity={0.35} />
      </mesh>

      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.35, 0.012, 16, 100]} />
        <meshStandardMaterial color="#00A3E0" emissive="#00A3E0" emissiveIntensity={0.7} transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <torusGeometry args={[2.6, 0.01, 16, 100]} />
        <meshStandardMaterial color="#00629B" emissive="#00629B" emissiveIntensity={0.7} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
