"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Medal3D, type MedalVisual } from "./Medal3D";

export type RoomMedal = MedalVisual & {
  moduleTitle: string;
  earnedAt: string;
  glbUrl?: string | null;
};

function Pedestal({ lit }: { lit: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow={false}>
        <cylinderGeometry args={[0.46, 0.54, 0.2, 24]} />
        <meshStandardMaterial color="#12100e" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 20]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.016, 8, 28]} />
        <meshStandardMaterial
          color={lit ? "#f0c14b" : "#3a2e22"}
          emissive={lit ? "#f0c14b" : "#000"}
          emissiveIntensity={lit ? 0.4 : 0}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 24]} />
        <meshStandardMaterial color="#1a1410" roughness={0.35} metalness={0.65} />
      </mesh>
    </group>
  );
}

function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <circleGeometry args={[7.6, 48]} />
        <meshStandardMaterial color="#080706" roughness={0.7} metalness={0.25} />
      </mesh>
      {[2.4, 3.8, 5.2].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <torusGeometry args={[r, 0.01, 6, 64]} />
          <meshStandardMaterial
            color="#5a3d1c"
            emissive="#3a2810"
            emissiveIntensity={0.3}
            metalness={0.85}
            roughness={0.4}
          />
        </mesh>
      ))}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[7.5, 7.5, 4.4, 32, 1, true]} />
        <meshStandardMaterial
          color="#100e0c"
          side={THREE.BackSide}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function PlaceholderDisc() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 0.06, 24]} />
      <meshStandardMaterial color="#3a2a18" metalness={0.7} roughness={0.4} />
    </mesh>
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
      <Pedestal lit={selected || medal.open} />
      <group
        position={[0, 0.58, 0]}
        scale={selected ? 1.1 : 1}
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
        <Suspense fallback={<PlaceholderDisc />}>
          <Medal3D
            medal={medal}
            selected={selected}
            glbUrl={medal.glbUrl}
            grounded
            targetSize={1.0}
          />
        </Suspense>
      </group>
    </group>
  );
}

function PreloadShared({ urls }: { urls: string[] }) {
  for (const u of urls) useGLTF.preload(u);
  return null;
}

function Scene({
  medals,
  selectedId,
  onSelect,
  onEnter,
  preloadUrls,
}: {
  medals: RoomMedal[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onEnter?: (id: string) => void;
  preloadUrls: string[];
}) {
  const n = medals.length;
  const radius = useMemo(() => Math.max(2.6, n * 0.38), [n]);

  return (
    <>
      <color attach="background" args={["#050403"]} />
      <fog attach="fog" args={["#050403", 14, 26]} />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffe2b8", "#1a1008", 0.7]} />
      <directionalLight position={[4, 8, 3]} intensity={1.8} color="#fff0d8" />
      <directionalLight position={[-3, 2, -4]} intensity={0.55} color="#8aa0ff" />
      <RoomShell />
      <PreloadShared urls={preloadUrls} />

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
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.6}
        maxDistance={10.5}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={Math.PI * 0.24}
        target={[0, 1.05, 0]}
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
  const preloadUrls = useMemo(() => {
    const set = new Set<string>();
    for (const m of medals) if (m.glbUrl) set.add(m.glbUrl);
    return [...set];
  }, [medals]);

  return (
    <div className="medal-hall relative h-[min(76vh,700px)] w-full overflow-hidden rounded-[28px] border border-[#c4a574]/40 bg-[#050403] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,224,168,0.12)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.55)_100%)]"
      />
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        camera={{ position: [0, 2.4, 6.2], fov: 40, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
          stencil: false,
        }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <Scene
            medals={medals}
            selectedId={selectedId}
            onSelect={onSelect}
            onEnter={onEnter}
            preloadUrls={preloadUrls}
          />
        </Suspense>
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 start-3 z-[2] rounded-full border border-[#c4a574]/25 bg-black/55 px-3 py-1.5 text-[11px] tracking-wide text-[#d2c0b0] backdrop-blur-sm">
        החדר מסתובב · גררו לסיבוב ידני · לחצו לבחירה · לחיצה כפולה לכניסה
      </p>
    </div>
  );
}
