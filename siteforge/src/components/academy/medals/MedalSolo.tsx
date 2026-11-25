"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
} from "@react-three/drei";
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
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 2.75], fov: 35, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
      >
        <color attach="background" args={["#050403"]} />
        <ambientLight intensity={0.65} />
        <spotLight
          position={[2.2, 3.5, 2.8]}
          intensity={2.2}
          angle={0.45}
          penumbra={0.75}
          color="#ffd5a0"
        />
        <directionalLight
          position={[-2.5, 2, -1.5]}
          intensity={0.75}
          color="#9ab6ff"
        />
        <Environment preset="city" environmentIntensity={0.9} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.35}>
            <Center>
              <Float
                speed={autoSpin ? 1.2 : 0.15}
                rotationIntensity={0}
                floatIntensity={autoSpin ? 0.22 : 0.05}
              >
                <Medal3D
                  medal={{ ...medal, open: true }}
                  selected
                  glbUrl={glbUrl}
                  grounded={false}
                  targetSize={1.6}
                />
              </Float>
            </Center>
          </Bounds>
          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.5}
            scale={7}
            blur={2.4}
          />
          <OrbitControls
            makeDefault
            enablePan={false}
            autoRotate={autoSpin}
            autoRotateSpeed={1.4}
            minDistance={1.8}
            maxDistance={4.5}
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
