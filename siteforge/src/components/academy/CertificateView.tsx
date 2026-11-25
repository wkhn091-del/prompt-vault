"use client";

import { forwardRef } from "react";

export type CertData = {
  studentName: string;
  courseTitle: string;
  date: string;
  certId: string;
  verifyUrl: string;
  score: number;
  correct: number;
  total: number;
};

export const CertificateView = forwardRef<HTMLDivElement, { data: CertData }>(
  function CertificateView({ data }, ref) {
    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          width: 1754,
          height: 1240,
          position: "relative",
          padding: 70,
          background:
            "radial-gradient(900px 600px at 88% 0%,rgba(255,122,69,.20),transparent 60%),radial-gradient(800px 600px at 5% 100%,rgba(255,179,92,.12),transparent 60%),#070605",
          color: "#f5ede6",
          fontFamily: "var(--font-heebo), Heebo, sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 44,
            border: "1.5px solid rgba(255,224,168,.35)",
            borderRadius: 28,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 60,
            border: "1px solid rgba(255,122,69,.25)",
            borderRadius: 20,
          }}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "60px 120px 40px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              letterSpacing: "0.42em",
              fontSize: 20,
              color: "#ff7a45",
              fontWeight: 700,
            }}
          >
            STUDIO OMEK · SITEFORGE · CERTIFICATE OF COMPLETION
          </div>
          <svg width={150} height={150} viewBox="-100 -100 200 200" style={{ marginTop: 34 }}>
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff4dc" />
                <stop offset=".5" stopColor="#ffd08a" />
                <stop offset="1" stopColor="#ff7a45" />
              </linearGradient>
            </defs>
            <polygon
              points="79.7,46.0 0.0,92.0 -79.7,46.0 -79.7,-46.0 -0.0,-92.0 79.7,-46.0"
              fill="url(#cg)"
            />
            <circle r={72} fill="#0c0a09" stroke="#fff4dc" strokeOpacity={0.6} />
            <g transform="translate(0 -4) scale(1.05)" fill="url(#cg)" stroke="url(#cg)">
              <path
                d="M-20 -30 H20 V-6 C20 8 10 16 0 16 C-10 16 -20 8 -20 -6Z"
                strokeWidth={0}
              />
              <path
                d="M-20 -24 H-32 C-32 -8 -24 -4 -18 -4 M20 -24 H32 C32 -8 24 -4 18 -4"
                fill="none"
                strokeWidth={5}
              />
              <path d="M0 16 V26 M-16 32 H16" strokeWidth={7} strokeLinecap="round" />
            </g>
          </svg>
          <h1 style={{ fontSize: 88, fontWeight: 900, marginTop: 26, lineHeight: 1 }}>
            תעודת{" "}
            <em
              style={{
                fontStyle: "normal",
                background: "linear-gradient(90deg,#ffe0a8,#ffb35c 45%,#ff7a45)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              סיום
            </em>
          </h1>
          <div style={{ fontSize: 30, color: "#b9a89b", marginTop: 26 }}>מוענקת בזאת ל</div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              marginTop: 20,
              padding: "0 60px 14px",
              borderBottom: "2px solid rgba(255,179,92,.55)",
              color: "#fff4dc",
            }}
          >
            {data.studentName}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#b9a89b",
              marginTop: 30,
              maxWidth: 1200,
              lineHeight: 1.45,
            }}
          >
            על השלמת כל שלבי{" "}
            <b style={{ color: "#ffe0a8", fontWeight: 800 }}>{data.courseTitle}</b>
            <br />
            ועמידה במבחן הסיום
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 26,
              fontSize: 22,
              color: "#070605",
              background: "linear-gradient(90deg,#ffe0a8,#ffb35c)",
              padding: "8px 26px",
              borderRadius: 999,
              fontWeight: 800,
            }}
          >
            ציון: {data.score}% · {data.correct}/{data.total}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 120,
            left: 120,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ textAlign: "right", minWidth: 330 }}>
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 16,
                letterSpacing: "0.28em",
                color: "#6f6259",
              }}
            >
              DATE
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data.date}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 330,
                borderTop: "1.5px solid rgba(255,224,168,.5)",
                margin: "0 auto 10px",
              }}
            />
            <div style={{ fontSize: 28, fontWeight: 800 }}>אבישי רוזן</div>
            <div style={{ fontSize: 19, color: "#b9a89b", marginTop: 4 }}>
              סטודיו עומק · SiteForge
            </div>
          </div>
          <div style={{ textAlign: "left", minWidth: 330 }}>
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 16,
                letterSpacing: "0.28em",
                color: "#6f6259",
              }}
            >
              CERTIFICATE ID
            </div>
            <div
              style={{
                direction: "ltr",
                unicodeBidi: "embed",
                fontFamily: "var(--font-mono), monospace",
                fontSize: 24,
                color: "#ffb35c",
                letterSpacing: "0.06em",
                marginTop: 8,
                fontWeight: 700,
              }}
            >
              {data.certId}
            </div>
            <div
              style={{
                direction: "ltr",
                unicodeBidi: "embed",
                fontSize: 17,
                color: "#6f6259",
                marginTop: 6,
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              {data.verifyUrl}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
