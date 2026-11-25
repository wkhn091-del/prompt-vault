"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CourseId } from "../../lib/courses/types";
import { examHref, stageHref, certificateHref } from "../../lib/courses/adapter";

export type MapPayload = {
  kicker: string;
  title: string;
  titleEm: string;
  sub: string;
  foot: string;
  current: string;
  stats: [number, string][];
  modules: {
    id: string;
    title: string;
    week?: string;
    medal: { name: string; icon: string; tier: number };
    stages: {
      id: string;
      n: number | string;
      label: string;
      gate?: string;
      bonus: { id: string; label: string }[];
    }[];
  }[];
  bonusList: {
    id: string;
    stageId: string;
    title: string;
    after: string;
    unlocksAfterId: string;
  }[];
  final: { questions: number; pass: number };
};

const ICON: Record<string, string> = {
  sprout:
    '<path d="M0 34 V-2" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M0 4 C-4 -18 -22 -26 -36 -22 C-34 -6 -20 6 0 4Z" stroke-width="0"/><path d="M0 -6 C4 -28 22 -36 36 -32 C34 -14 20 -4 0 -6Z" stroke-width="0"/>',
  toolbox:
    '<rect x="-34" y="-12" width="68" height="40" rx="7" stroke-width="0"/><path d="M-14 -12 V-24 H14 V-12" fill="none" stroke-width="6" stroke-linejoin="round"/><rect x="-34" y="2" width="68" height="5" fill="#0c0a09" stroke-width="0"/><rect x="-6" y="-2" width="12" height="13" rx="3" fill="#0c0a09" stroke-width="0"/>',
  page: '<path d="M-24 -34 H10 L26 -18 V34 H-24Z" fill="none" stroke-width="6" stroke-linejoin="round"/><path d="M10 -34 V-18 H26" fill="none" stroke-width="5"/><path d="M-14 -6 H16 M-14 6 H16 M-14 18 H6" stroke-width="5" stroke-linecap="round"/>',
  target:
    '<circle r="32" fill="none" stroke-width="6"/><circle r="18" fill="none" stroke-width="6"/><circle r="6" stroke-width="0"/>',
  rocket:
    '<path d="M0 -36 C16 -22 18 -4 12 12 H-12 C-18 -4 -16 -22 0 -36Z" stroke-width="0"/><circle cx="0" cy="-12" r="6" fill="#0c0a09"/><path d="M-12 4 L-24 18 L-10 16 M12 4 L24 18 L10 16" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M-5 20 L0 32 L5 20" stroke-width="5" fill="none"/>',
  search:
    '<circle cx="-6" cy="-6" r="22" fill="none" stroke-width="7"/><path d="M10 10 L30 30" stroke-width="9" stroke-linecap="round"/>',
  shield:
    '<path d="M0 -36 L30 -24 V2 C30 20 16 30 0 36 C-16 30 -30 20 -30 2 V-24Z" fill="none" stroke-width="6" stroke-linejoin="round"/><path d="M-13 0 L-3 10 L15 -10" fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
  briefcase:
    '<rect x="-34" y="-16" width="68" height="46" rx="7" stroke-width="0"/><path d="M-12 -16 V-28 H12 V-16" fill="none" stroke-width="6"/><rect x="-34" y="0" width="68" height="4" fill="#0c0a09" stroke-width="0"/>',
  star: '<path d="M0 -34 L9 -11 L34 -10 L14 5 L21 30 L0 16 L-21 30 L-14 5 L-34 -10 L-9 -11Z" stroke-width="0"/>',
  trophy:
    '<path d="M-20 -30 H20 V-6 C20 8 10 16 0 16 C-10 16 -20 8 -20 -6Z" stroke-width="0"/><path d="M-20 -24 H-32 C-32 -8 -24 -4 -18 -4 M20 -24 H32 C32 -8 24 -4 18 -4" fill="none" stroke-width="5"/><path d="M0 16 V26 M-16 32 H16" stroke-width="7" stroke-linecap="round"/>',
};

const TIER = [
  ["#6e2f17", "#b8532a", "#ff9a6c"],
  ["#a84a24", "#e07a45", "#ffb08a"],
  ["#ff7a45", "#ff9a6c", "#ffe0a8"],
  ["#ffb35c", "#ffd08a", "#fff4dc"],
  ["#ffe0a8", "#fff4dc", "#ffffff"],
] as const;

type NodeKind =
  | {
      kind: "stage";
      s: MapPayload["modules"][0]["stages"][0];
      m: MapPayload["modules"][0] & { _rtl?: boolean };
      x: number;
      y: number;
      band: number;
      k: number;
    }
  | {
      kind: "medal";
      m: MapPayload["modules"][0] & { _rtl?: boolean };
      x: number;
      y: number;
      band: number;
      k: number;
    }
  | { kind: "exam" | "cert"; x: number; y: number; band: number; k: number };

function hexPoints(r: number, offsetDeg = 0) {
  return Array.from({ length: 6 }, (_, k) => {
    const an = (Math.PI / 180) * (60 * k + offsetDeg);
    return `${(r * Math.cos(an)).toFixed(1)},${(r * Math.sin(an)).toFixed(1)}`;
  }).join(" ");
}

function pathD(list: [number, number, NodeKind][]) {
  if (!list.length) return "";
  let d = `M${list[0][0]},${list[0][1]}`;
  const W = 1440;
  for (let i = 1; i < list.length; i++) {
    const [x0, y0, a] = list[i - 1];
    const [x1, y1, b] = list[i];
    if (a.band !== b.band) {
      const side = a.x > W / 2 ? W + 10 : -10;
      d += ` C${side},${y0} ${side},${y1} ${x1},${y1}`;
    } else {
      const mx = (x0 + x1) / 2;
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
  }
  return d;
}

function wrapLabel(label: string) {
  const words = label.split(" ");
  const lines = [""];
  for (const w of words) {
    if ((lines[lines.length - 1] + " " + w).trim().length > 17 && lines.length < 2)
      lines.push(w);
    else lines[lines.length - 1] = (lines[lines.length - 1] + " " + w).trim();
  }
  if (lines[1] && lines[1].length > 19) lines[1] = lines[1].slice(0, 18) + "…";
  return lines;
}

function RtlText({
  children,
  className,
  x,
  y,
  fill,
  fontSize,
  fontWeight,
  textAnchor = "middle",
  fontFamily,
  letterSpacing,
}: {
  children: string;
  className?: string;
  x?: number | string;
  y?: number | string;
  fill?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  fontFamily?: string;
  letterSpacing?: string;
}) {
  return (
    <text
      className={className}
      x={x}
      y={y}
      fill={fill}
      fontSize={fontSize}
      fontWeight={fontWeight}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontFamily={fontFamily}
      letterSpacing={letterSpacing}
      direction="rtl"
      style={{ direction: "rtl" }}
    >
      {"\u202B"}
      {children}
      {"\u202C"}
    </text>
  );
}

export function CourseMap({
  courseId,
  map,
  examPassed,
  examUnlocked,
  completedIds,
  slugById,
  allowAllLinks = false,
}: {
  courseId: CourseId;
  map: MapPayload;
  examPassed?: boolean;
  /** all core stages completed */
  examUnlocked: boolean;
  completedIds: string[];
  /** stage id → slug for links */
  slugById: Record<string, string>;
  /** make every stage clickable (dev browse) */
  allowAllLinks?: boolean;
}) {
  const layout = useMemo(() => {
    const W = 1440;
    const X0 = 70;
    const X1 = W - 70;
    const BAND = 270;
    const TOP = 40;
    const modules = map.modules.map((m) => ({ ...m, _rtl: false as boolean, _y: 0 }));
    const nodes: NodeKind[] = [];
    const pts: [number, number, NodeKind][] = [];

    modules.forEach((m, bi) => {
      const rtl = bi % 2 === 0;
      const yBase = TOP + bi * BAND + 120;
      m._rtl = rtl;
      m._y = yBase;
      const items: (
        | { kind: "stage"; s: (typeof m.stages)[0]; m: typeof m }
        | { kind: "medal"; m: typeof m }
      )[] = [
        ...m.stages.map((s) => ({ kind: "stage" as const, s, m })),
        { kind: "medal" as const, m },
      ];
      const n = items.length;
      const step = (X1 - X0 - 80) / Math.max(n - 1, 1);
      items.forEach((it, k) => {
        const x = rtl ? X1 - 40 - k * step : X0 + 40 + k * step;
        const y = yBase + (k % 2 ? 26 : -10);
        const node = { ...it, x, y, band: bi, k } as NodeKind;
        nodes.push(node);
        pts.push([x, y, node]);
      });
    });

    let finalBand: { y: number; rtl: boolean } | null = null;
    if (map.final) {
      const bi = modules.length;
      const rtl = bi % 2 === 0;
      const yBase = TOP + bi * BAND + 120;
      (["exam", "cert"] as const).forEach((kind, k) => {
        const x = rtl
          ? k
            ? W * 0.36
            : W * 0.64
          : k
            ? W * 0.64
            : W * 0.36;
        const y = yBase + (k ? 0 : 10);
        const node: NodeKind = { kind, x, y, band: bi, k };
        nodes.push(node);
        pts.push([x, y, node]);
      });
      finalBand = { y: yBase, rtl };
    }

    const H = TOP + (modules.length + (map.final ? 1 : 0)) * BAND + 60;
    return { W, X0, X1, BAND, TOP, modules, nodes, pts, finalBand, H };
  }, [map]);

  const order = map.modules.flatMap((m) => m.stages.map((s) => s.id));
  const doneSet = new Set(completedIds);
  const firstOpen = order.find((oid) => !doneSet.has(oid));
  const currentId =
    map.current && !doneSet.has(map.current) ? map.current : (firstOpen ?? map.current);
  const stateOf = (id: string): "done" | "cur" | "lock" => {
    if (doneSet.has(id)) return "done";
    if (id === currentId) return "cur";
    return "lock";
  };
  const isClickable = (id: string) => {
    if (allowAllLinks || examUnlocked) return true;
    if (doneSet.has(id) || id === currentId) return true;
    const i = order.indexOf(id);
    if (i <= 0) return true;
    return doneSet.has(order[i - 1]!);
  };
  const modDone = (m: MapPayload["modules"][0]) =>
    m.stages.every((s) => doneSet.has(s.id));
  const examOpen = examUnlocked;
  const certOpen = Boolean(examPassed);

  const lastDoneIdx = (() => {
    let last = -1;
    for (let i = 0; i < layout.pts.length; i++) {
      const n = layout.pts[i]![2];
      if (n.kind === "stage" && doneSet.has(n.s.id)) last = i;
    }
    const curPt = layout.pts.findIndex(
      (p) => p[2].kind === "stage" && p[2].s.id === map.current,
    );
    return Math.max(last, curPt);
  })();
  const doneUpTo = lastDoneIdx;

  const { W, X0, X1, TOP, BAND, modules, nodes, pts, finalBand, H } = layout;

  return (
    <div className="course-map" dir="rtl">
      <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-[#ff7a45] [direction:ltr] [text-align:right]">
        {map.kicker}
      </p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,4.5rem)] font-black leading-[1.02] tracking-tight text-[#f5ede6]">
        {map.title}{" "}
        <em className="not-italic bg-gradient-to-l from-[#ffe0a8] via-[#ffb35c] to-[#ff7a45] bg-clip-text text-transparent">
          {map.titleEm}
        </em>
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#b9a89b] sm:text-[18px]">{map.sub}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {map.stats.map(([n, label]) => (
          <span
            key={label}
            className="rounded-full border border-[#2a211b] bg-[#16120f] px-4 py-2 text-[13px] text-[#b9a89b]"
          >
            <b className="me-1.5 font-extrabold text-[#f5ede6]">{n}</b>
            {label}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 text-[13px] text-[#b9a89b]">
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-[18px] rounded-full bg-gradient-to-br from-[#ffe0a8] to-[#ff7a45]" />
          הושלם
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-[18px] rounded-full bg-[#ffb35c] shadow-[0_0_0_4px_rgba(255,179,92,.25)]" />
          אתה כאן
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-[18px] rounded-full border-2 border-[#3a2e26] bg-[#16120f]" />
          נעול
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-[18px] rounded-full border-2 border-dashed border-[#ffb35c] bg-[#241a0e]" />
          בונוס
        </span>
        <span className="inline-flex items-center gap-2">
          <i
            className="inline-block size-[18px]"
            style={{
              background:
                "conic-gradient(#ffe0a8,#ffb35c,#ff7a45,#ffe0a8)",
              clipPath:
                "polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)",
            }}
          />
          מדליה
        </span>
      </div>

      {/* Desktop SVG map */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <svg
          className="map block min-w-[900px]"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gDone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe0a8" />
              <stop offset=".45" stopColor="#ff9a6c" />
              <stop offset="1" stopColor="#ff7a45" />
            </linearGradient>
            <radialGradient id="gCur" cx=".5" cy=".35" r=".7">
              <stop offset="0" stopColor="#ffd08a" />
              <stop offset="1" stopColor="#ffb35c" />
            </radialGradient>
            <radialGradient id="gLock" cx=".5" cy=".3" r=".8">
              <stop offset="0" stopColor="#211a15" />
              <stop offset="1" stopColor="#110e0c" />
            </radialGradient>
            <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <linearGradient id="gCert" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff4dc" />
              <stop offset=".5" stopColor="#ffd08a" />
              <stop offset="1" stopColor="#ff7a45" />
            </linearGradient>
          </defs>

          <g>
            <path
              d={pathD(pts)}
              fill="none"
              stroke="#2a211b"
              strokeWidth={14}
              strokeLinecap="round"
            />
            <path
              d={pathD(pts)}
              fill="none"
              stroke="#3a2e26"
              strokeWidth={3}
              strokeDasharray="2 12"
              strokeLinecap="round"
            />
            {doneUpTo > 0 && (
              <path
                d={pathD(pts.slice(0, doneUpTo + 1))}
                fill="none"
                stroke="url(#gDone)"
                strokeWidth={8}
                strokeLinecap="round"
              />
            )}
          </g>

          {modules.map((m, bi) => {
            const y = TOP + bi * BAND + 14;
            const x = m._rtl ? X1 : X0;
            const anchor = m._rtl ? "start" : "end";
            return (
              <g key={m.id}>
                <RtlText
                  x={x}
                  y={y}
                  className="mod-code"
                  fill="#ff7a45"
                  fontSize={17}
                  fontWeight={700}
                  textAnchor={anchor}
                  letterSpacing=".06em"
                >
                  {`${m.id} · ${m.stages.length} שלבים${m.week ? " · " + m.week : ""} · מדליה: ${m.medal.name}`}
                </RtlText>
                <RtlText
                  x={x}
                  y={y + 36}
                  fill="#f5ede6"
                  fontSize={28}
                  fontWeight={800}
                  textAnchor={anchor}
                >
                  {m.title}
                </RtlText>
              </g>
            );
          })}

          {finalBand && map.final && (
            <g>
              <RtlText
                x={finalBand.rtl ? X1 : X0}
                y={finalBand.y - 106}
                fill="#ff7a45"
                fontSize={17}
                fontWeight={700}
                textAnchor={finalBand.rtl ? "start" : "end"}
                letterSpacing=".06em"
              >
                {`FINAL · ${map.final.questions} שאלות · ציון עובר ${map.final.pass}% · אפשר לנסות שוב`}
              </RtlText>
              <RtlText
                x={finalBand.rtl ? X1 : X0}
                y={finalBand.y - 70}
                fill="#f5ede6"
                fontSize={28}
                fontWeight={800}
                textAnchor={finalBand.rtl ? "start" : "end"}
              >
                מבחן סיום ותעודה
              </RtlText>
            </g>
          )}

          {nodes.map((it, idx) => {
            if (it.kind === "exam" || it.kind === "cert") {
              const open = it.kind === "exam" ? examOpen : certOpen;
              const op = open ? 1 : 0.55;
              const href =
                it.kind === "exam"
                  ? examOpen
                    ? examHref(courseId)
                    : undefined
                  : examPassed
                    ? certificateHref(courseId)
                    : undefined;
              const inner =
                it.kind === "exam" ? (
                  <g opacity={op}>
                    <circle r={74} fill="#ffe0a8" opacity={0.1} filter="url(#glow)" />
                    <circle
                      r={58}
                      fill="url(#gLock)"
                      stroke="#ffe0a8"
                      strokeWidth={3}
                    />
                    <circle
                      r={66}
                      fill="none"
                      stroke="#ffe0a8"
                      strokeOpacity={0.45}
                      strokeWidth={1.5}
                      strokeDasharray="3 7"
                    />
                    <g transform="translate(0,-6)">
                      <rect
                        x={-20}
                        y={-24}
                        width={40}
                        height={48}
                        rx={6}
                        fill="none"
                        stroke="#ffe0a8"
                        strokeWidth={3.5}
                      />
                      {[-10, 2, 14].map((yy) => (
                        <g key={yy}>
                          <path
                            d={`M-12 ${yy} l4 4 l7 -7`}
                            fill="none"
                            stroke="#ff7a45"
                            strokeWidth={3}
                            strokeLinecap="round"
                          />
                          <line
                            x1={3}
                            y1={yy + 1}
                            x2={13}
                            y2={yy + 1}
                            stroke="#ffe0a8"
                            strokeWidth={3}
                            strokeLinecap="round"
                          />
                        </g>
                      ))}
                    </g>
                    <RtlText y={92} fill="#f5ede6" fontSize={20} fontWeight={800}>
                      מבחן סיום
                    </RtlText>
                    <RtlText y={116} fill="#b9a89b" fontSize={15}>
                      {`${map.final.questions} שאלות · ${map.final.pass}% לעבור`}
                    </RtlText>
                    {!open && (
                      <g transform="translate(42,-42)">
                        <circle r={14} fill="#16120f" stroke="#3a2e26" />
                        <rect x={-6} y={-1} width={12} height={9} rx={2} fill="#b9a89b" />
                        <path
                          d="M-3.5 -1 V-5 A3.5 3.5 0 0 1 3.5 -5 V-1"
                          fill="none"
                          stroke="#b9a89b"
                          strokeWidth={2}
                        />
                      </g>
                    )}
                  </g>
                ) : (
                  <g opacity={op}>
                    <circle r={90} fill="#ffb35c" opacity={0.16} filter="url(#glow)" />
                    <polygon points={hexPoints(72, 30)} fill="url(#gCert)" />
                    <circle r={56} fill="#0c0a09" stroke="#fff4dc" strokeOpacity={0.6} />
                    <g
                      transform="translate(0 -4) scale(.85)"
                      fill="url(#gCert)"
                      stroke="url(#gCert)"
                      dangerouslySetInnerHTML={{ __html: ICON.trophy }}
                    />
                    <RtlText y={106} fill="#ffe0a8" fontSize={22} fontWeight={900}>
                      תעודה
                    </RtlText>
                    <RtlText y={130} fill="#b9a89b" fontSize={15}>
                      PDF עם השם שלך + מזהה ייחודי
                    </RtlText>
                  </g>
                );

              return (
                <g key={`${it.kind}-${idx}`} transform={`translate(${it.x},${it.y})`}>
                  {href ? <a href={href}>{inner}</a> : inner}
                </g>
              );
            }

            if (it.kind === "medal") {
              const earned = modDone(it.m);
              const [a, b, c] = TIER[it.m.medal.tier] ?? TIER[0];
              const gid = `md-${courseId}-${it.m.id}`;
              return (
                <g key={`medal-${it.m.id}`} transform={`translate(${it.x},${it.y})`}>
                  <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor={c} />
                      <stop offset=".5" stopColor={b} />
                      <stop offset="1" stopColor={a} />
                    </linearGradient>
                  </defs>
                  <g opacity={earned ? 1 : 0.33}>
                    <polygon points={hexPoints(52)} fill={`url(#${gid})`} />
                    <circle r={38} fill="#0c0a09" stroke={c} strokeOpacity={0.5} />
                    <g
                      transform="translate(0 -2) scale(.62)"
                      fill={`url(#${gid})`}
                      stroke={`url(#${gid})`}
                      dangerouslySetInnerHTML={{
                        __html: ICON[it.m.medal.icon] || ICON.star,
                      }}
                    />
                  </g>
                  <RtlText y={80} fill={earned ? "#ffe0a8" : "#6f6259"} fontSize={14} fontWeight={700}>
                    {it.m.medal.name}
                  </RtlText>
                  <text
                    y={100}
                    textAnchor="middle"
                    fill={earned ? "#ff7a45" : "#4a3d34"}
                    fontSize={13}
                    fontWeight={800}
                    fontFamily="var(--font-mono),monospace"
                    letterSpacing=".2em"
                  >
                    {earned ? "MEDAL ✓" : "MEDAL"}
                  </text>
                </g>
              );
            }

            if (it.kind !== "stage") return null;

            const s = it.s;
            const st = stateOf(s.id);
            const R = st === "cur" ? 42 : 34;
            const slug = slugById[s.id] ?? s.id;
            const unlocked = isClickable(s.id);
            const href = unlocked ? stageHref(courseId, slug) : undefined;
            const lines = wrapLabel(s.label);

            const stageNode = (
              <g>
                {st === "cur" && (
                  <>
                    <circle r={62} fill="#ffb35c" opacity={0.35} filter="url(#glow)" />
                    <circle
                      r={54}
                      fill="none"
                      stroke="#ffb35c"
                      strokeOpacity={0.5}
                      strokeWidth={2}
                      strokeDasharray="4 6"
                    />
                  </>
                )}
                <circle
                  r={R}
                  fill={
                    st === "done"
                      ? "url(#gDone)"
                      : st === "cur"
                        ? "url(#gCur)"
                        : "url(#gLock)"
                  }
                  stroke={st === "lock" ? "#3a2e26" : "none"}
                  strokeWidth={2}
                />
                {st === "done" && (
                  <circle
                    r={R - 6}
                    fill="none"
                    stroke="#070605"
                    strokeOpacity={0.25}
                    strokeWidth={2}
                  />
                )}
                <text
                  className="num"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={st === "lock" ? "#6f6259" : "#1a0f08"}
                  fontSize={String(s.n).length > 2 ? 20 : 24}
                  fontWeight={900}
                >
                  {String(s.n)}
                </text>
                {st === "done" && (
                  <g transform={`translate(${R * 0.72},${-R * 0.72})`}>
                    <circle r={12} fill="#070605" stroke="#ff7a45" strokeWidth={2} />
                    <path
                      d="M-5 0 L-1 4 L6 -4"
                      fill="none"
                      stroke="#ffe0a8"
                      strokeWidth={2.6}
                      strokeLinecap="round"
                    />
                  </g>
                )}
                {st === "lock" && (
                  <g transform={`translate(${R * 0.72},${-R * 0.72})`}>
                    <circle r={12} fill="#16120f" stroke="#3a2e26" />
                    <rect x={-5} y={-1} width={10} height={8} rx={2} fill="#6f6259" />
                    <path
                      d="M-3 -1 V-4 A3 3 0 0 1 3 -4 V-1"
                      fill="none"
                      stroke="#6f6259"
                      strokeWidth={2}
                    />
                  </g>
                )}
                {lines.map((l, i) => (
                  <RtlText
                    key={i}
                    y={R + 28 + i * 20}
                    fill={
                      st === "cur" ? "#ffb35c" : st === "done" ? "#f5ede6" : "#b9a89b"
                    }
                    fontSize={15.5}
                    fontWeight={st === "cur" ? 700 : 400}
                  >
                    {l}
                  </RtlText>
                ))}
                {st === "cur" && (
                  <g transform="translate(0,-78)">
                    <rect x={-50} y={-16} width={100} height={32} rx={16} fill="#ffb35c" />
                    <RtlText fill="#1a0f08" fontSize={15} fontWeight={800}>
                      אתה כאן
                    </RtlText>
                    <path d="M-7 16 L0 24 L7 16Z" fill="#ffb35c" />
                  </g>
                )}
                {s.gate && (
                  <g transform={`translate(0,${st === "cur" ? -118 : -70})`}>
                    <rect
                      x={-70}
                      y={-15}
                      width={140}
                      height={30}
                      rx={8}
                      fill="#241a0e"
                      stroke="#ffe0a8"
                      strokeWidth={1.5}
                    />
                    <RtlText fill="#ffe0a8" fontSize={13} fontWeight={800}>
                      {s.gate}
                    </RtlText>
                  </g>
                )}
                {(s.bonus || []).map((b, bi) => {
                  const dir = (it.k === 0 ? -1 : 1) * (it.m._rtl ? 1 : -1);
                  const first = it.k === 0;
                  const oy = first ? 44 : -62;
                  return (
                    <g
                      key={b.id}
                      transform={`translate(${dir * ((first ? 84 : 64) + bi * 46)},${oy})`}
                    >
                      <line
                        x1={-dir * 20}
                        y1={first ? -10 : 16}
                        x2={-dir * (first ? 46 : 40)}
                        y2={first ? -30 : 34}
                        stroke="#ffb35c"
                        strokeWidth={2}
                        strokeDasharray="3 4"
                      />
                      <circle
                        r={20}
                        fill="#241a0e"
                        stroke="#ffb35c"
                        strokeWidth={2}
                        strokeDasharray="5 4"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffb35c"
                        fontSize={13}
                        fontWeight={800}
                        fontFamily="var(--font-mono),monospace"
                      >
                        {b.id}
                      </text>
                    </g>
                  );
                })}
              </g>
            );

            return (
              <g key={s.id} transform={`translate(${it.x},${it.y})`}>
                {href ? (
                  <a href={href} style={{ cursor: "pointer" }}>
                    {stageNode}
                  </a>
                ) : (
                  <g style={{ cursor: "not-allowed" }} opacity={0.95}>
                    <title>נעול</title>
                    {stageNode}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile vertical list */}
      <ol className="mt-6 space-y-2 md:hidden">
        {map.modules.map((m) => (
          <li key={m.id} className="rounded-2xl border border-[#2a211b] bg-[#16120f] p-3">
            <p className="font-mono text-[11px] text-[#ff7a45]">
              {m.id} · {m.title}
            </p>
            <ul className="mt-2 space-y-1.5">
              {m.stages.map((s) => {
                const st = stateOf(s.id);
                const slug = slugById[s.id] ?? s.id;
                const unlocked = isClickable(s.id);
                const cls =
                  st === "cur"
                    ? "border-[#ffb35c] bg-[#ffb35c]/15 text-[#ffe0a8]"
                    : st === "done"
                      ? "border-[#ff7a45]/40 bg-[#241a0e] text-[#f5ede6]"
                      : "border-[#3a2e26] text-[#6f6259]";
                const inner = (
                  <span className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] ${cls}`}>
                    <span className="font-mono font-bold">{s.n}</span>
                    <span className="flex-1">{s.label}</span>
                    {st === "lock" && <span>🔒</span>}
                    {st === "done" && <span>✓</span>}
                    {st === "cur" && <span className="text-[11px] font-bold">אתה כאן</span>}
                  </span>
                );
                return (
                  <li key={s.id}>
                    {unlocked ? <Link href={stageHref(courseId, slug)}>{inner}</Link> : inner}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
        <li className="rounded-2xl border border-[#ffe0a8]/35 bg-[#241a0e] p-3">
          {examOpen ? (
            <Link href={examHref(courseId)} className="block font-bold text-[#ffe0a8]">
              מבחן סיום →
            </Link>
          ) : (
            <span className="text-[#6f6259]">מבחן סיום 🔒</span>
          )}
          {examPassed && (
            <Link
              href={certificateHref(courseId)}
              className="mt-2 block font-bold text-[#ffb35c]"
            >
              תעודה →
            </Link>
          )}
        </li>
      </ol>

      {map.bonusList.length > 0 && (
        <section className="bonus-atelier relative mt-12 overflow-hidden rounded-[28px] border border-[#c4a574]/22 bg-[radial-gradient(ellipse_at_top,rgba(196,160,116,0.1),transparent_55%),linear-gradient(180deg,#14110e_0%,#0a0908_100%)] p-5 sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-[#c4a574]/55 to-transparent"
          />
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#c4a574]/75 [direction:ltr] [text-align:right]">
                ATELIER · OPTIONAL
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#e8c78a] sm:text-[1.75rem]">
                בונוסים
              </h2>
            </div>
            <p className="max-w-xs text-[12px] leading-relaxed text-[#7a6c60]">
              מסלול משני · נפתח לפי התקדמות · לא חובה לסיום
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {map.bonusList.map((b) => {
              const open =
                allowAllLinks ||
                !b.unlocksAfterId ||
                doneSet.has(b.unlocksAfterId);
              const slug = slugById[b.stageId];
              const href =
                open && slug ? stageHref(courseId, slug) : null;
              const body = (
                <>
                  <span
                    className={`relative grid size-[3.25rem] shrink-0 place-items-center rounded-full font-mono text-[14px] font-bold tracking-wide ${
                      open
                        ? "bg-[conic-gradient(from_210deg,#ffe0a8,#8a5a28,#f0c14b,#5a3810,#ffe0a8)] text-[#1a1008] shadow-[0_8px_24px_rgba(196,160,116,0.25)]"
                        : "bg-[#16120f] text-[#4a433c] ring-1 ring-[#2a2520]"
                    }`}
                  >
                    <span
                      className={`grid size-[2.55rem] place-items-center rounded-full ${
                        open
                          ? "bg-[linear-gradient(160deg,#2a1c10,#120e0a)] text-[#f0c14b]"
                          : "bg-[#0c0a09] text-[#5a524a]"
                      }`}
                    >
                      {b.id}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[14px] font-bold leading-snug sm:text-[15px] ${
                        open ? "text-[#f7efe6]" : "text-[#6f6259]"
                      }`}
                    >
                      {b.title}
                    </span>
                    <span
                      className={`mt-1.5 block font-mono text-[11px] tracking-[0.04em] ${
                        open ? "text-[#c4a574]/85" : "text-[#4a433c]"
                      }`}
                    >
                      {open
                        ? `OPEN · AFTER STAGE ${b.after}`
                        : `LOCKED · AFTER STAGE ${b.after}`}
                    </span>
                  </span>
                  <span
                    className={`hidden size-8 shrink-0 place-items-center rounded-full sm:grid ${
                      open
                        ? "bg-[#c4a574]/15 text-[#e8c78a]"
                        : "bg-transparent text-[#3a342e]"
                    }`}
                    aria-hidden
                  >
                    {open ? "→" : "◌"}
                  </span>
                </>
              );

              const shell =
                "group relative flex items-center gap-4 overflow-hidden rounded-[20px] px-4 py-4 transition duration-300";

              const surface = open
                ? "border border-[#c4a574]/40 bg-[linear-gradient(135deg,rgba(232,199,138,0.12)_0%,rgba(18,14,10,0.95)_42%,#0a0908_100%)] shadow-[inset_0_1px_0_rgba(255,230,180,0.12),0_14px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:border-[#e8c78a]/70 hover:shadow-[inset_0_1px_0_rgba(255,230,180,0.18),0_22px_50px_rgba(0,0,0,0.5),0_0_32px_rgba(196,160,116,0.14)]"
                : "border border-[#1c1814] bg-[#0c0a09]/85";

              return href ? (
                <Link key={b.id} href={href} className={`${shell} ${surface}`}>
                  {body}
                </Link>
              ) : (
                <div key={b.id} className={`${shell} ${surface}`}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-8 flex justify-between border-t border-[#1f1a16] pt-4 font-mono text-[11px] tracking-[0.18em] text-[#5a524a]">
        <span>{map.foot}</span>
        <span>STUDIO OMEK · SITEFORGE</span>
      </div>

    </div>
  );
}
