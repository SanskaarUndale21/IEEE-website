"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FloatingGlobe } from "./Models";

/* Steady growth across the whole load — easeOutBack would hit full size
   around 40% and then sit there for the rest of the sequence.        */
function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

/* The swell lives in the last third: the globe pushes just past its resting
   size, then settles exactly onto it at 100%. This is the "sets down" beat. */
function settleBump(x: number) {
  return Math.sin(Math.PI * THREE.MathUtils.clamp((x - 0.68) / 0.32, 0, 1)) * 0.06;
}

const START_SCALE = 0.11;
const BOOST = 3.4;

/**
 * The hero globe, driven by load progress instead of by the clock.
 * Reads progress from a ref so the canvas never re-renders per frame.
 */
export default function LoaderGlobe({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!group.current) return;

    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

    if (reduced) {
      group.current.scale.setScalar(1);
      if (core.current) {
        (core.current.material as THREE.Material).opacity = 0;
      }
      return;
    }

    const s = START_SCALE + (1 - START_SCALE) * smoothstep(p) + settleBump(p);
    group.current.scale.setScalar(s);

    // Spin fast while small, decay to the hero's idle drift as it fills the frame.
    group.current.rotation.y += delta * (2.6 * (1 - p) + 0.1);
    // Tilt straightens and the globe drifts down into its resting position.
    group.current.rotation.z = (1 - p) * 0.4;
    group.current.position.y = (1 - p) * 0.5;

    // A hot core carries the early frames, then dissolves into the globe itself.
    if (core.current) {
      (core.current.material as THREE.Material).opacity = 0.85 * Math.pow(1 - p, 1.6);
    }
  });

  return (
    <>
      {/* The loader has no photo behind it, so the globe needs its own light. */}
      <pointLight position={[0, 0, 4]} intensity={2.2} color="#4DC8F5" />
      <pointLight position={[-4, 3, 2]} intensity={1.2} color="#00A3E0" />

      <group ref={group} scale={START_SCALE}>
        <FloatingGlobe boost={BOOST} />

        <mesh ref={core}>
          <sphereGeometry args={[1.55, 32, 32]} />
          <meshBasicMaterial color="#7FDBFF" transparent opacity={0.85} />
        </mesh>
      </group>
    </>
  );
}
