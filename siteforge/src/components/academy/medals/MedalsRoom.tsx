"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { Medal3D, type MedalVisual } from "./Medal3D";

export type RoomMedal = MedalVisual & {
  moduleTitle: string;
  earnedAt: string;
  glbUrl?: string | null;
};

function Pedestal({
  position,
  lit,
}: {
  position: [number, number, number];
  lit: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.58, 0.16, 48]} />
        <meshPhysicalMaterial
          color="#12100e"
          roughness={0.35}
          metalness={0.55}
          clearcoat={0.4}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 48]} />
        <meshPhysicalMaterial
          color="#1c1612"
          roughness={0.28}
          metalness={0.65}
          clearcoat={0.55}
        />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.018, 12, 48]} />
        <meshStandardMaterial
          color={lit ? "#f0c14b" : "#3a2e22"}
          emissive={lit ? "#f0c14b" : "#000"}
          emissiveIntensity={lit ? 0.55 : 0}
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.38, 0.34, 40]} />
        <meshPhysicalMaterial
          color="#0e0c0a"
          roughness={0.4}
          metalness={0.45}
          clearcoat={0.3}
        />
      </mesh>
      <mesh position={[0, 0.62, 0]} receiveShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.05, 48]} />
        <meshPhysicalMaterial
          color="#1a1410"
          roughness={0.25}
          metalness={0.7}
          clearcoat={0.6}
        />
      </mesh>
      {lit && (
        <pointLight
          position={[0, 2.1, 0.15]}
          intensity={1.4}
          color="#ffc98a"
          distance={4}
          decay={2}
        />
      )}
    </group>
  );
}

function RoomShell() {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 0.04;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8.2, 96]} />
        <meshPhysicalMaterial
          color="#080706"
          roughness={0.55}
          metalness={0.35}
          clearcoat={0.25}
        />
      </mesh>

      {/* gold inlay rings on floor */}
      {[2.2, 3.6, 5.1].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <torusGeometry args={[r, 0.012, 8, 96]} />
          <meshStandardMaterial
            color="#5a3d1c"
            emissive="#3a2810"
            emissiveIntensity={0.35}
            metalness={0.9}
            roughness={0.35}
          />
        </mesh>
      ))}

      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[8.1, 8.1, 4.7, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#100e0c"
          side={THREE.BackSide}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      <mesh ref={ring} position={[0, 4.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[7.2, 0.035, 10, 96]} />
        <meshStandardMaterial
          color="#ff8a4a"
          emissive="#ff7a45"
          emissiveIntensity={1.4}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      <Sparkles
        count={48}
        scale={[10, 3.5, 10]}
        size={2.2}
        speed={0.25}
        opacity={0.35}
        color="#ffd5a0"
        position={[0, 2.2, 0]}
      />
    </group>
  );
}

function MedalOnPedestal({
  medal,
  angle,
  radius,
  selected,
  onSelect,
  onEnter,
}: {
  medal: RoomMedal;
  angle: number;
  radius: number;
  selected: boolean;
  onSelect: () => void;
  onEnter?: () => void;
}) {
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  return (
    <group position={[x, 0, z]} rotation={[0, angle + Math.PI, 0]}>
      <Pedestal position={[0, 0, 0]} lit={selected || medal.open} />
      <group
        position={[0, 0.72, 0]}
        scale={selected ? 1.12 : 1}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEnter?.();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        {medal.open ? (
          <Float speed={selected ? 1.3 : 0.9} rotationIntensity={0} floatIntensity={0.18}>
            <Medal3D
              medal={medal}
              selected={selected}
              glbUrl={medal.glbUrl}
              grounded
              targetSize={1.05}
            />
          </Float>
        ) : (
          <Medal3D
            medal={medal}
            selected={selected}
            glbUrl={medal.glbUrl}
            grounded
            targetSize={1.05}
          />
        )}
      </group>
    </group>
  );
}

function Scene({
  medals,
  selectedId,
  onSelect,
  onEnter,
}: {
  medals: RoomMedal[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onEnter?: (id: string) => void;
}) {
  const n = medals.length;
  const radius = useMemo(() => Math.max(2.75, n * 0.4), [n]);

  return (
    <>
      <color attach="background" args={["#050403"]} />
      <fog attach="fog" args={["#050403", 12, 24]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#ffe2b8", "#1a1008", 0.8]} />
      <directionalLight
        castShadow
        position={[5, 9, 4]}
        intensity={2.2}
        color="#fff0d8"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-4, 3, -5]} intensity={0.85} color="#9ab6ff" />
      <spotLight
        position={[0, 7.2, 0]}
        angle={0.62}
        penumbra={0.7}
        intensity={1.6}
        color="#ffd4a8"
      />
      <RoomShell />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={16}
        blur={2.8}
        far={5}
      />
      <Environment preset="city" environmentIntensity={0.85} />

      {medals.map((m, i) => {
        const angle = (i / n) * Math.PI * 2;
        return (
          <MedalOnPedestal
            key={m.id}
            medal={m}
            angle={angle}
            radius={radius}
            selected={selectedId === m.id}
            onSelect={() => onSelect(selectedId === m.id ? null : m.id)}
            onEnter={() => onEnter?.(m.id)}
          />
        );
      })}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableRotate
        autoRotate={!selectedId}
        autoRotateSpeed={0.55}
        minDistance={3.8}
        maxDistance={11.5}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={Math.PI * 0.22}
        target={[0, 1.15, 0]}
      />
    </>
  );
}

export function MedalsRoom({
  medals,
  selectedId,
  onSelect,
  onEnter,
}: {
  medals: RoomMedal[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onEnter?: (id: string) => void;
}) {
  return (
    <div className="medal-hall relative h-[min(76vh,700px)] w-full overflow-hidden rounded-[28px] border border-[#c4a574]/40 bg-[#050403] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,224,168,0.12)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.55)_100%)]"
      />
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.55, 6.6], fov: 40, near: 0.1, far: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.45,
        }}
      >
        <Suspense fallback={null}>
          <Scene
            medals={medals}
            selectedId={selectedId}
            onSelect={onSelect}
            onEnter={onEnter}
          />
        </Suspense>
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 start-3 z-[2] rounded-full border border-[#c4a574]/25 bg-black/55 px-3 py-1.5 text-[11px] tracking-wide text-[#d2c0b0] backdrop-blur-sm">
        החדר מסתובב · גררו לסיבוב ידני · לחצו לבחירה · לחיצה כפולה לכניסה
      </p>
    </div>
  );
}
