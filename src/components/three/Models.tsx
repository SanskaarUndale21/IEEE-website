"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Orbital Line Ring ─────────────────────────────────────── */
function OrbitalRing({
  radius,
  tilt,
  speed,
  color,
  opacity,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Line>(null!);

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * speed;
    }
  });

  return (
    <line ref={ref} rotation={tilt}>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial
        attach="material"
        color={color}
        transparent
        opacity={opacity}
        linewidth={1}
      />
    </line>
  );
}

/* ─── Orbiting Particle Dot ─────────────────────────────────── */
function OrbitingDot({
  orbitRadius,
  speed,
  phase,
  tilt,
  color,
}: {
  orbitRadius: number;
  speed: number;
  phase: number;
  tilt: [number, number, number];
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t) * orbitRadius,
        Math.sin(t * 0.4) * 0.3,
        Math.sin(t) * orbitRadius
      );
    }
  });

  return (
    <mesh ref={ref} rotation={tilt}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

/* ─── Outer Particle Burst ──────────────────────────────────── */
function StarBurst({ count = 300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const ieee1 = new THREE.Color("#00A3E0");
    const ieee2 = new THREE.Color("#00629B");

    for (let i = 0; i < count; i++) {
      // Distribute on a thin shell around the globe (radius 2.4 → 4.5)
      const r = 2.4 + Math.random() * 2.1;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * 2 * Math.PI;
      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(theta);

      const c = Math.random() > 0.5 ? ieee1 : ieee2;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.04;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.015) * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── FloatingGlobe ─────────────────────────────────────────── */
export function FloatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.1;
      wireRef.current.rotation.x = Math.sin(t * 0.08) * 0.15;
    }
  });

  return (
    <group>
      {/* Inner glowing sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          color="#00629B"
          emissive="#00629B"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Wireframe outer sphere */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#00A3E0"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Original orbital ring 1 */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.8, 0.008, 16, 100]} />
        <meshStandardMaterial
          color="#00A3E0"
          emissive="#00A3E0"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Original orbital ring 2 */}
      <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <torusGeometry args={[3.2, 0.006, 16, 100]} />
        <meshStandardMaterial
          color="#00629B"
          emissive="#00629B"
          emissiveIntensity={0.5}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* ── NEW: Line rings around the globe ── */}
      <OrbitalRing radius={2.5} tilt={[0.5, 0, 0.2]}     speed={0.12}  color="#00A3E0" opacity={0.18} />
      <OrbitalRing radius={3.0} tilt={[-0.3, 0.5, 0.1]}  speed={-0.09} color="#00629B" opacity={0.14} />
      <OrbitalRing radius={3.5} tilt={[0.8, -0.3, 0.4]}  speed={0.07}  color="#00A3E0" opacity={0.10} />
      <OrbitalRing radius={2.2} tilt={[Math.PI/2, 0, 0]} speed={0.15}  color="#4DC8F5" opacity={0.12} />

      {/* ── NEW: Orbiting glowing dots along the rings ── */}
      <OrbitingDot orbitRadius={2.5} speed={0.6}  phase={0}           tilt={[0.5, 0, 0.2]}     color="#00A3E0" />
      <OrbitingDot orbitRadius={2.5} speed={0.6}  phase={Math.PI}     tilt={[0.5, 0, 0.2]}     color="#00A3E0" />
      <OrbitingDot orbitRadius={3.0} speed={0.45} phase={1.2}         tilt={[-0.3, 0.5, 0.1]}  color="#00629B" />
      <OrbitingDot orbitRadius={3.5} speed={0.3}  phase={2.5}         tilt={[0.8, -0.3, 0.4]}  color="#4DC8F5" />

      {/* ── NEW: Shell star-burst particles ── */}
      <StarBurst count={280} />
    </group>
  );
}

/* ─── ParticleField ─────────────────────────────────────────── */
export function ParticleField({ count = 2000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      sizes[i] = Math.random() * 0.03 + 0.005;
    }
    return { positions, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00A3E0"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── FloatingTorus ─────────────────────────────────────────── */
export function FloatingTorus() {
  const torusRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.3;
      torusRef.current.rotation.y = t * 0.2;
      torusRef.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={torusRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial
        color="#00629B"
        emissive="#00A3E0"
        emissiveIntensity={0.2}
        wireframe
        transparent
        opacity={0.3}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}
