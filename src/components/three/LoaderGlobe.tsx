"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FloatingGlobe } from "./Models";

/* easeOutBack — grows past its target, then settles back onto it.
   That overshoot is the "sets down" beat of the load sequence.      */
function easeOutBack(x: number) {
  const c1 = 1.05;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const START_SCALE = 0.07;

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

  useFrame((_, delta) => {
    if (!group.current) return;

    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

    if (reduced) {
      group.current.scale.setScalar(1);
      return;
    }

    const s = START_SCALE + (1 - START_SCALE) * easeOutBack(p);
    group.current.scale.setScalar(s);

    // Spin fast while small, decay to the hero's idle drift as it fills the frame.
    group.current.rotation.y += delta * (2.6 * (1 - p) + 0.1);
    // Tilt straightens and the globe drifts down into its resting position.
    group.current.rotation.z = (1 - p) * 0.4;
    group.current.position.y = (1 - p) * 0.5;
  });

  return (
    <group ref={group} scale={START_SCALE}>
      <FloatingGlobe />
    </group>
  );
}
