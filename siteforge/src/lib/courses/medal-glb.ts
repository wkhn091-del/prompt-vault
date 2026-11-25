import fs from "fs";
import path from "path";

/** Shared lightweight award GLBs (meshopt + webp). */
const SHARED_KINDS = ["medal", "trophy", "star", "crown"] as const;

const CACHE_BUST = "v7";

function sharedUrl(kind: (typeof SHARED_KINDS)[number]): string | null {
  const file = path.join(
    process.cwd(),
    "public",
    "medals",
    "shared",
    `${kind}.glb`,
  );
  if (!fs.existsSync(/*turbopackIgnore: true*/ file)) return null;
  return `/medals/shared/${kind}.glb?${CACHE_BUST}`;
}

/** Stable kind pick from medal id so every pedestal gets a distinct silhouette. */
export function medalGlbUrl(_courseId: string, medalId: string): string | null {
  const n = medalId.replace(/\D/g, "");
  const idx = n ? Number.parseInt(n, 10) : 0;
  const kind = SHARED_KINDS[Math.abs(idx) % SHARED_KINDS.length]!;
  return sharedUrl(kind);
}

export function allSharedMedalUrls(): string[] {
  return SHARED_KINDS.map((k) => sharedUrl(k)).filter(
    (u): u is string => Boolean(u),
  );
}
