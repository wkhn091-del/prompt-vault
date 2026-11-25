"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type MedalVisual = {
  id: string;
  name: string;
  emoji: string;
  tier: number;
  open: boolean;
};

const TIER_METAL: Record<
  number,
  { color: string; metalness: number; roughness: number; emissive: string; clearcoat: number }
> = {
  0: {
    color: "#c9a06a",
    metalness: 0.92,
    roughness: 0.22,
    emissive: "#2a1808",
    clearcoat: 0.55,
  },
  1: {
    color: "#d7dde8",
    metalness: 0.96,
    roughness: 0.16,
    emissive: "#121820",
    clearcoat: 0.7,
  },
  2: {
    color: "#f0c14b",
    metalness: 0.98,
    roughness: 0.14,
    emissive: "#3a2200",
    clearcoat: 0.85,
  },
  3: {
    color: "#ffb35c",
    metalness: 0.97,
    roughness: 0.12,
    emissive: "#4a2008",
    clearcoat: 0.9,
  },
  4: {
    color: "#ffe0a8",
    metalness: 1,
    roughness: 0.1,
    emissive: "#5a3810",
    clearcoat: 1,
  },
};

function Padlock({ open }: { open: boolean }) {
  if (open) return null;
  return (
    <group position={[0, -0.02, 0.12]} scale={0.55}>
      <mesh castShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[0.28, 0.22, 0.12]} />
        <meshStandardMaterial color="#1a120c" metalness={0.4} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.028, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#c45a28" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.06, 0.07]}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
        <meshStandardMaterial
          color="#ff7a45"
          emissive="#ff7a45"
          emissiveIntensity={0.45}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function Ribbon({ color }: { color: string }) {
  return (
    <group position={[0, 0.78, 0]}>
      <mesh castShadow position={[-0.12, -0.18, -0.02]} rotation={[0.15, 0, 0.35]}>
        <boxGeometry args={[0.16, 0.55, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0.12, -0.18, -0.02]} rotation={[0.15, 0, -0.35]}>
        <boxGeometry args={[0.16, 0.55, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.08} />
      </mesh>
    </group>
  );
}

function ProceduralMedal({
  medal,
  selected,
}: {
  medal: MedalVisual;
  selected: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const float = useRef(0);
  const metal = TIER_METAL[medal.tier] ?? TIER_METAL[0]!;

  useFrame((state, dt) => {
    if (!group.current) return;
    const speed = selected ? 0.25 : medal.open ? 0.75 : 0.2;
    group.current.rotation.y += dt * speed;
    if (medal.open) {
      float.current += dt;
      group.current.position.y = Math.sin(float.current * 1.4) * 0.035;
    } else {
      group.current.position.y = 0;
    }
    if (selected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.015;
      group.current.scale.setScalar(pulse);
    }
  });

  const face = !medal.open
    ? {
        color: "#2a2622",
        metalness: 0.18,
        roughness: 0.88,
        emissive: "#050403",
        clearcoat: 0.05,
      }
    : metal;

  const rim = medal.open ? "#fff1d0" : "#14110e";
  const accent = medal.open ? "#ff7a45" : "#1a1512";
  const ribbon = medal.open ? "#8b1e12" : "#2a2018";

  return (
    <group ref={group}>
      {medal.open && <Ribbon color={ribbon} />}

      {/* body disc */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.74, 0.74, 0.09, 96]} />
        <meshPhysicalMaterial
          color={face.color}
          metalness={face.metalness}
          roughness={face.roughness}
          emissive={face.emissive}
          emissiveIntensity={medal.open ? 0.22 : 0.04}
          clearcoat={face.clearcoat}
          clearcoatRoughness={0.18}
          reflectivity={1}
        />
      </mesh>

      {/* reeded outer rim */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
        <torusGeometry args={[0.74, 0.048, 20, 96]} />
        <meshPhysicalMaterial
          color={rim}
          metalness={0.98}
          roughness={0.16}
          clearcoat={0.8}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* inner bezel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
        <torusGeometry args={[0.52, 0.022, 14, 64]} />
        <meshPhysicalMaterial
          color={accent}
          metalness={0.9}
          roughness={0.25}
          emissive={medal.open ? accent : "#000"}
          emissiveIntensity={medal.open ? 0.4 : 0}
          clearcoat={0.6}
        />
      </mesh>

      {/* recessed center plate */}
      <mesh position={[0, 0, 0.052]} receiveShadow>
        <circleGeometry args={[0.46, 64]} />
        <meshPhysicalMaterial
          color={medal.open ? "#120c08" : "#080706"}
          metalness={0.55}
          roughness={0.42}
          clearcoat={0.35}
        />
      </mesh>

      {/* embossed ring detail */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.058]}>
        <torusGeometry args={[0.34, 0.012, 10, 48]} />
        <meshStandardMaterial
          color={medal.open ? "#e8c078" : "#1c1814"}
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* engraved emblem */}
      <Html
        center
        position={[0, 0.02, 0.08]}
        style={{
          fontSize: "36px",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          filter: medal.open
            ? "drop-shadow(0 2px 6px rgba(0,0,0,0.55))"
            : "grayscale(1) brightness(0.45) opacity(0.55)",
        }}
        transform
        occlude={false}
      >
        <span aria-hidden>{medal.emoji}</span>
      </Html>

      <Padlock open={medal.open} />

      {medal.open && (
        <pointLight
          position={[0.35, 0.4, 0.55]}
          intensity={selected ? 1.1 : 0.45}
          distance={2.2}
          color="#ffd5a0"
        />
      )}
    </group>
  );
}

const TIER_TINT = ["#e8b86a", "#d5dde8", "#ffd24a", "#ffb35c", "#ffe6a8"] as const;

function paintMedalMaterials(
  root: THREE.Object3D,
  open: boolean,
  tier: number,
) {
  const tint = new THREE.Color(TIER_TINT[tier] ?? TIER_TINT[2]!);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const mat of mats) {
      const std = mat as THREE.MeshStandardMaterial;
      // Keep albedo only — full PBR maps + env + shadows blow past
      // MAX_TEXTURE_IMAGE_UNITS(16) when many medals share a scene.
      std.normalMap = null;
      std.roughnessMap = null;
      std.metalnessMap = null;
      std.aoMap = null;
      std.emissiveMap = null;
      std.bumpMap = null;
      std.displacementMap = null;
      if ("clearcoatMap" in std) (std as THREE.MeshPhysicalMaterial).clearcoatMap = null;
      if (open) {
        if (std.map) {
          std.map.colorSpace = THREE.SRGBColorSpace;
          std.map.anisotropy = 4;
          std.map.needsUpdate = true;
        }
        if (std.color) std.color.copy(tint);
        std.metalness = 0.88;
        std.roughness = 0.28;
        if ("envMapIntensity" in std) std.envMapIntensity = 1.1;
        if (std.emissive) std.emissive.copy(tint).multiplyScalar(0.08);
      } else {
        std.map = null;
        if (std.color) std.color.set("#2a2622");
        std.metalness = 0.2;
        std.roughness = 0.92;
        if (std.emissive) std.emissive.set("#050403");
        if ("envMapIntensity" in std) std.envMapIntensity = 0.2;
      }
      std.needsUpdate = true;
    }
  });
}

function GlbMedal({
  url,
  open,
  selected,
  tier,
  grounded = false,
  targetSize = 1.35,
}: {
  url: string;
  open: boolean;
  selected: boolean;
  tier: number;
  /** Sit on a pedestal (bottom at y=0). Otherwise center at origin. */
  grounded?: boolean;
  targetSize?: number;
}) {
  const { scene } = useGLTF(url);
  const prepared = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      const cloned = mats.map((m) => (m as THREE.Material).clone());
      mesh.material = cloned.length === 1 ? cloned[0]! : cloned;
    });
    paintMedalMaterials(root, open, tier);

    const recenter = () => {
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      root.position.x -= center.x;
      root.position.y -= center.y;
      root.position.z -= center.z;
      return size;
    };

    let size = recenter();
    // Flat on the floor → tip upright.
    if (size.y < size.x * 0.55 && size.y < size.z * 0.55) {
      root.rotation.x = -Math.PI / 2;
      size = recenter();
    } else if (size.x > size.z * 1.4 && size.x > size.y * 1.15) {
      root.rotation.y = Math.PI / 2;
      size = recenter();
    }

    const max = Math.max(size.x, size.y, size.z, 0.001);
    root.scale.setScalar(targetSize / max);
    size = recenter();

    if (grounded) {
      // Bottom of mesh sits on the pedestal top.
      root.position.y += size.y * 0.5;
    }
    root.rotation.y += 0.4;
    return root;
  }, [scene, open, tier, grounded, targetSize]);

  const group = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!group.current) return;
    // Keep spinning even when selected — only slow down slightly.
    const speed = selected ? 0.25 : open ? 0.75 : 0.2;
    group.current.rotation.y += dt * speed;
  });

  return (
    <group ref={group}>
      <primitive object={prepared} />
      {!open && <Padlock open={false} />}
    </group>
  );
}

/** Tries GLB override when provided; otherwise premium procedural metal medal. */
export function Medal3D({
  medal,
  selected,
  glbUrl,
  grounded = false,
  targetSize,
}: {
  medal: MedalVisual;
  selected: boolean;
  glbUrl?: string | null;
  grounded?: boolean;
  targetSize?: number;
}) {
  if (glbUrl) {
    return (
      <GlbMedal
        url={glbUrl}
        open={medal.open}
        selected={selected}
        tier={medal.tier}
        grounded={grounded}
        targetSize={targetSize ?? (grounded ? 1.15 : 1.55)}
      />
    );
  }
  return <ProceduralMedal medal={medal} selected={selected} />;
}
