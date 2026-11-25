/**
 * Unique silhouette medals (not the same disc×N).
 * Run: node scripts/build-medal-glbs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    onerror = null;
    readAsArrayBuffer(blob) {
      Promise.resolve(blob.arrayBuffer())
        .then((buf) => {
          this.result = buf;
          this.onloadend?.({ target: this });
        })
        .catch((err) => this.onerror?.(err));
    }
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const GOLD = [0xc9a06a, 0xd7dde8, 0xf0c14b, 0xffb35c, 0xffe0a8];

const SITES = [
  { id: "medal-M0", kind: "seed", tier: 0 },
  { id: "medal-M1", kind: "gear", tier: 0 },
  { id: "medal-M2", kind: "scroll", tier: 1 },
  { id: "medal-M3", kind: "bullseye", tier: 1 },
  { id: "medal-M4", kind: "rocket", tier: 2 },
  { id: "medal-M5", kind: "lens", tier: 2 },
  { id: "medal-M6", kind: "shield", tier: 3 },
  { id: "medal-M7", kind: "briefcase", tier: 3 },
  { id: "medal-M8", kind: "starburst", tier: 4 },
  { id: "medal-M9", kind: "trophy", tier: 4 },
];

const AGENTS = [
  { id: "medal-M0", kind: "puzzle", tier: 0 },
  { id: "medal-M1", kind: "bolt", tier: 0 },
  { id: "medal-M2", kind: "bot", tier: 1 },
  { id: "medal-M3", kind: "bubble", tier: 1 },
  { id: "medal-M4", kind: "tablet", tier: 2 },
  { id: "medal-M5", kind: "plug", tier: 2 },
  { id: "medal-M6", kind: "aegis", tier: 3 },
];

function mat(color, rough = 0.16, metal = 0.96) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: metal,
    roughness: rough,
  });
}

function gold(tier) {
  return GOLD[Math.min(tier, GOLD.length - 1)];
}

function pedestal(g, tier) {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 0.14, 40),
    mat(0x12100e, 0.35, 0.55),
  );
  base.position.y = -0.55;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.02, 10, 40),
    mat(gold(tier), 0.14, 1),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.47;
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.35, 28),
    mat(0x0e0c0a, 0.4, 0.45),
  );
  column.position.y = -0.3;
  g.add(base, ring, column);
}

/** Classic hanging medal — only for star/scroll variants that need it */
function ribbon(g, color = 0x8b1e12) {
  const m = mat(color, 0.55, 0.05);
  const L = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.02), m);
  L.position.set(-0.1, 0.55, -0.02);
  L.rotation.z = 0.32;
  const R = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.02), m);
  R.position.set(0.1, 0.55, -0.02);
  R.rotation.z = -0.32;
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.035), m);
  top.position.set(0, 0.78, 0);
  g.add(L, R, top);
}

function extrude(shape, depth, color, rough = 0.18) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 3,
  });
  return new THREE.Mesh(geo, mat(color, rough, 0.95));
}

function buildKind(kind, tier) {
  const g = new THREE.Group();
  const c = gold(tier);
  pedestal(g, tier);

  if (kind === "trophy") {
    // Real cup trophy — totally different silhouette
    const cup = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(c, 0.12, 1),
    );
    cup.position.y = 0.25;
    cup.rotation.x = Math.PI;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 0.35, 16),
      mat(c, 0.15, 0.98),
    );
    stem.position.y = -0.05;
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 0.08, 24),
      mat(0xfff1d0, 0.18, 1),
    );
    foot.position.y = -0.22;
    const handleL = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.035, 10, 24, Math.PI),
      mat(c, 0.14, 1),
    );
    handleL.position.set(-0.32, 0.2, 0);
    handleL.rotation.y = Math.PI / 2;
    const handleR = handleL.clone();
    handleR.position.x = 0.32;
    g.add(cup, stem, foot, handleL, handleR);
  } else if (kind === "shield" || kind === "aegis") {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.55);
    shape.bezierCurveTo(0.42, 0.45, 0.48, 0.1, 0.4, -0.15);
    shape.bezierCurveTo(0.25, -0.4, 0.08, -0.55, 0, -0.62);
    shape.bezierCurveTo(-0.08, -0.55, -0.25, -0.4, -0.4, -0.15);
    shape.bezierCurveTo(-0.48, 0.1, -0.42, 0.45, 0, 0.55);
    const sh = extrude(shape, 0.12, c, 0.14);
    sh.position.z = -0.06;
    const boss = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 20, 16),
      mat(0xff7a45, 0.2, 0.9),
    );
    boss.position.set(0, 0.05, 0.1);
    g.add(sh, boss);
  } else if (kind === "starburst") {
    ribbon(g);
    const shape = new THREE.Shape();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 0.55 : 0.22;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const star = extrude(shape, 0.1, c, 0.12);
    star.position.z = -0.05;
    g.add(star);
  } else if (kind === "rocket") {
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.95, 20),
      mat(c, 0.14, 0.98),
    );
    body.position.y = 0.15;
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.22, 16),
      mat(0xff7a45, 0.2, 0.9),
    );
    nose.position.y = 0.7;
    const fin1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.18, 0.04),
      mat(0xfff1d0, 0.2, 0.95),
    );
    fin1.position.set(0, -0.25, 0);
    const fin2 = fin1.clone();
    fin2.rotation.y = Math.PI / 2;
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.28, 12),
      mat(0xff7a45, 0.4, 0.3),
    );
    flame.position.y = -0.45;
    flame.rotation.x = Math.PI;
    g.add(body, nose, fin1, fin2, flame);
  } else if (kind === "gear") {
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24),
      mat(c, 0.18, 0.95),
    );
    hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.22, 0.14),
        mat(c, 0.18, 0.95),
      );
      tooth.position.set(Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0);
      tooth.rotation.z = a;
      g.add(tooth);
    }
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16),
      mat(0x120c08, 0.5, 0.4),
    );
    hole.rotation.x = Math.PI / 2;
    g.add(hub, hole);
  } else if (kind === "bullseye") {
    const rings = [
      [0.55, c],
      [0.4, 0x120c08],
      [0.28, c],
      [0.14, 0xff7a45],
    ];
    rings.forEach(([r, col], i) => {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.08 + i * 0.015, 48),
        mat(col, 0.2, 0.9),
      );
      disc.rotation.x = Math.PI / 2;
      disc.position.z = i * 0.01;
      g.add(disc);
    });
  } else if (kind === "lens") {
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.08, 16, 48),
      mat(c, 0.14, 1),
    );
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 48),
      new THREE.MeshStandardMaterial({
        color: 0x88ccee,
        metalness: 0.3,
        roughness: 0.1,
        transparent: true,
        opacity: 0.55,
      }),
    );
    glass.position.z = 0.02;
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.55, 12),
      mat(0xfff1d0, 0.2, 0.9),
    );
    handle.position.set(0.45, -0.45, 0);
    handle.rotation.z = -Math.PI / 4;
    g.add(rim, glass, handle);
  } else if (kind === "briefcase") {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.5, 0.22),
      mat(c, 0.22, 0.88),
    );
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.035, 10, 20, Math.PI),
      mat(0xfff1d0, 0.18, 1),
    );
    handle.position.y = 0.32;
    handle.rotation.x = Math.PI / 2;
    const latch = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.05),
      mat(0xff7a45, 0.2, 0.9),
    );
    latch.position.set(0, 0, 0.14);
    g.add(box, handle, latch);
  } else if (kind === "scroll") {
    const roll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.7, 20),
      mat(0xf5ede6, 0.4, 0.2),
    );
    roll.rotation.z = Math.PI / 2;
    const sheet = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.7, 0.03),
      mat(0xffe0a8, 0.45, 0.15),
    );
    sheet.position.z = 0.08;
    const seal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.04, 20),
      mat(0xff7a45, 0.25, 0.85),
    );
    seal.rotation.x = Math.PI / 2;
    seal.position.set(0, 0, 0.12);
    g.add(roll, sheet, seal);
  } else if (kind === "seed") {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.22, 0.28, 24),
      mat(0x8b5a2b, 0.45, 0.25),
    );
    pot.position.y = -0.05;
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20),
      mat(0x3a2818, 0.7, 0.1),
    );
    soil.position.y = 0.1;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.45, 10),
      mat(0x3d7a3a, 0.5, 0.2),
    );
    stem.position.y = 0.35;
    const leaf1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12),
      mat(0x5cb85c, 0.4, 0.2),
    );
    leaf1.scale.set(1.4, 0.35, 0.8);
    leaf1.position.set(0.15, 0.5, 0);
    const leaf2 = leaf1.clone();
    leaf2.position.set(-0.12, 0.42, 0.05);
    leaf2.rotation.z = 0.4;
    g.add(pot, soil, stem, leaf1, leaf2);
  } else if (kind === "bolt") {
    const shape = new THREE.Shape();
    shape.moveTo(-0.08, 0.7);
    shape.lineTo(0.25, 0.15);
    shape.lineTo(0.02, 0.15);
    shape.lineTo(0.3, -0.7);
    shape.lineTo(-0.2, 0.05);
    shape.lineTo(0.05, 0.05);
    shape.closePath();
    const bolt = extrude(shape, 0.12, 0xffe0a8, 0.12);
    bolt.position.z = -0.06;
    g.add(bolt);
  } else if (kind === "bot") {
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.45, 0.4),
      mat(c, 0.2, 0.9),
    );
    head.position.y = 0.15;
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8),
      mat(0xfff1d0, 0.2, 0.95),
    );
    antenna.position.y = 0.5;
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      mat(0xff7a45, 0.25, 0.8),
    );
    tip.position.y = 0.62;
    const eyeL = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      mat(0xff7a45, 0.3, 0.5),
    );
    eyeL.position.set(-0.14, 0.18, 0.22);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.14;
    g.add(head, antenna, tip, eyeL, eyeR);
  } else if (kind === "bubble") {
    const big = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 28, 20),
      mat(c, 0.2, 0.85),
    );
    big.position.y = 0.1;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.22, 12),
      mat(c, 0.2, 0.85),
    );
    tip.position.set(-0.2, -0.28, 0.15);
    tip.rotation.z = 0.7;
    g.add(big, tip);
  } else if (kind === "tablet") {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.7, 0.06),
      mat(0xf5ede6, 0.4, 0.25),
    );
    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.1),
      mat(c, 0.18, 0.95),
    );
    clip.position.y = 0.38;
    g.add(board, clip);
  } else if (kind === "plug") {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.5, 0.28),
      mat(c, 0.2, 0.9),
    );
    const p1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.28, 10),
      mat(0xfff1d0, 0.15, 1),
    );
    p1.position.set(-0.1, 0.35, 0);
    const p2 = p1.clone();
    p2.position.x = 0.1;
    g.add(body, p1, p2);
  } else if (kind === "puzzle") {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.14),
      mat(c, 0.2, 0.9),
    );
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 12),
      mat(0xff7a45, 0.22, 0.85),
    );
    knob.position.set(0, 0.35, 0);
    const notch = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 10),
      mat(0x120c08, 0.5, 0.3),
    );
    notch.position.set(0.35, 0, 0);
    g.add(tile, knob, notch);
  } else {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), mat(c, 0.1, 1));
    g.add(gem);
  }

  return g;
}

function exportGlb(scene) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(Buffer.from(result));
        else reject(new Error("expected binary glb"));
      },
      (err) => reject(err),
      { binary: true },
    );
  });
}

async function buildOne(course, spec) {
  const scene = new THREE.Scene();
  scene.add(buildKind(spec.kind, spec.tier));
  const buf = await exportGlb(scene);
  const dir = path.join(root, "public", "medals", course);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${spec.id}.glb`);
  fs.writeFileSync(out, buf);
  console.log("wrote", path.relative(root, out), `${(buf.length / 1024).toFixed(1)}kb`, spec.kind);
}

async function main() {
  for (const m of SITES) await buildOne("sites", m);
  for (const m of AGENTS) await buildOne("agents", m);
  console.log("done — unique silhouettes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
