"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Medal3D, type MedalVisual } from "./Medal3D";

export function MedalSolo({
  medal,
  glbUrl,
  autoSpin = true,
}: {
  medal: MedalVisual;
  glbUrl?: string | null;
  autoSpin?: boolean;
}) {
  return (
    <div className="relative h-[min(56vh,460px)] w-full overflow-hidden rounded-[28px] border border-[#c4a574]/35 bg-[#050403] shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,220,160,0.08)]">
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        camera={{ position: [0, 0.2, 2.75], fov: 35, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
          stencil: false,
        }}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={["#050403"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[2.2, 3.2, 2.5]} intensity={1.9} color="#ffd5a0" />
        <directionalLight position={[-2.2, 1.5, -1.5]} intensity={0.55} color="#9ab6ff" />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.35}>
            <Center>
              <Medal3D
                medal={{ ...medal, open: true }}
                selected
                glbUrl={glbUrl}
                grounded={false}
                targetSize={1.55}
              />
            </Center>
          </Bounds>
          <OrbitControls
            makeDefault
            enablePan={false}
            autoRotate={autoSpin}
            autoRotateSpeed={1.35}
            enableDamping
            dampingFactor={0.08}
            minDistance={1.8}
            maxDistance={4.2}
            maxPolarAngle={Math.PI * 0.55}
            minPolarAngle={Math.PI * 0.28}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 start-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] text-[#b9a89b]">
        גררו לסובב את המדליה
      </p>
    </div>
  );
}
