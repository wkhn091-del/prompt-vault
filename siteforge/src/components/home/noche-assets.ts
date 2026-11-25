export const SRC = {
  day: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261125_123040_f513c6f7-07d8-410f-a6de-4545268d7e1f.png",
  night:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261125_123132_feb5ca9b-fc48-4930-80a0-a8f2fb824330.png",
  facade:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261125_063353_1267b8e6-3e85-4dde-b424-1647f0a4de2e.png",
  band: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261125_063406_591aa9e3-ad36-4e74-9aa7-01de368920f9.png",
} as const;

const WIDTHS = [1280, 1600, 1920, 2496] as const;

export function proxyUrl(source: string, cssWidth: number): string {
  const need = Math.ceil(cssWidth * Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2));
  let w = WIDTHS.find((x) => x >= need) ?? 2496;
  // Street images capped at 2048
  if (
    source === SRC.day ||
    source === SRC.night
  ) {
    w = Math.min(w, 2048) as (typeof WIDTHS)[number];
  }
  return `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(source)}&q=85&w=${w}`;
}

export function streetCssWidth(vw: number, vh: number) {
  return Math.max(vw, vh * 1.26 * 1.506);
}

export function facadeCssWidth(vw: number, vh: number) {
  return Math.max(vw, vh * 1.5);
}

/** Image U ranges for the eight pieces */
export const PIECE_U = [
  { id: "A", u0: 0, u1: 0.2045 },
  { id: "B", u0: 0.2045, u1: 0.325 },
  { id: "C", u0: 0.325, u1: 0.35 },
  { id: "D", u0: 0.35, u1: 0.372 },
  { id: "E", u0: 0.372, u1: 0.628 },
  { id: "F", u0: 0.628, u1: 0.76 },
  { id: "G", u0: 0.76, u1: 0.805 },
  { id: "H", u0: 0.805, u1: 1 },
] as const;

/** On-screen left/right fractions at 1440×900 (nudged so signs aren't cut) */
export const PIECE_SCREEN = [
  { id: "A", x0: 0, x1: 0.12 },
  { id: "B", x0: 0.12, x1: 0.205 },
  { id: "C", x0: 0.205, x1: 0.27 },
  { id: "D", x0: 0.27, x1: 0.35 },
  { id: "E", x0: 0.35, x1: 0.65 },
  { id: "F", x0: 0.65, x1: 0.8 },
  { id: "G", x0: 0.8, x1: 0.86 },
  { id: "H", x0: 0.86, x1: 1 },
] as const;

export const FACADE_S = [
  0, 0, 1, 2, 3, 6, 10, 15, 22, 30, 40, 51, 64, 79, 95, 112, 129, 148, 166.5,
  185, 203.5, 222, 240.5, 259, 277.5, 296, 314.5, 333, 351.5,
].map((v) => v / 664);

export const PIECE_P = [
  0, 0.005, 0.012, 0.019, 0.021, 0.03, 0.043, 0.061, 0.082, 0.109, 0.141,
  0.176, 0.216, 0.261, 0.308, 0.358, 0.41, 0.464, 0.518, 0.573, 0.626, 0.678,
  0.727, 0.773, 0.814, 0.852, 0.885, 0.915, 0.938, 0.958, 0.972, 0.983, 0.992,
  0.996, 0.999, 1,
];

export const NIGHT_LUT = [
  0, 0.02, 0.04, 0.05, 0.07, 0.09, 0.11, 0.14, 0.18, 0.21, 0.26, 0.3, 0.36,
  0.41, 0.48, 0.54, 0.6, 0.67, 0.74, 0.79, 0.85, 0.91, 0.98, 1,
];

export const PAN_LUT = [
  0, 0.25, 0.5, 1.25, 2.5, 4.25, 6.5, 9.5, 13.25, 17.5, 22.5, 28.25, 34.25,
  40.75, 47.75, 55.25, 62.75, 70.5, 78.5, 86.5, 94.25, 101.5, 108.5, 114.75,
  120.75, 125.75, 130.25, 133.75, 136.5, 138.5, 139.5, 139.75,
].map((v) => v / 139.75);

export const LEDGE_LUT = [
  1.02, 0.978, 0.95, 0.921, 0.895, 0.871, 0.851, 0.834, 0.818, 0.807, 0.801,
  0.799,
];

export function lutAt(table: number[], t: number): number {
  if (t <= 0) return table[0]!;
  if (t >= table.length - 1) return table[table.length - 1]!;
  const i = Math.floor(t);
  const f = t - i;
  return table[i]! * (1 - f) + table[i + 1]! * f;
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`fail ${url}`));
    img.src = url;
  });
}
