"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CertificateView, type CertData } from "./CertificateView";
import type { CourseId } from "../../lib/courses/types";
import { loadCourseProgress } from "../../lib/courses/progress";
import { courseHref } from "../../lib/courses/adapter";

export function CertificateClient({
  courseId,
  courseTitle,
  siteUrl,
}: {
  courseId: CourseId;
  courseTitle: string;
  siteUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CertData | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const p = loadCourseProgress(courseId);
    let certId = p.certificateId;
    let token = "";
    let percent = p.examPercent ?? 0;
    let correct = p.examScore ?? 0;
    let total = 20;
    let name = p.studentName || "תלמיד SiteForge";
    try {
      const raw = localStorage.getItem(`siteforge-cert-${courseId}`);
      if (raw) {
        const j = JSON.parse(raw) as {
          certId: string;
          certToken: string;
          name: string;
          percent: number;
          correct: number;
          total: number;
        };
        certId = j.certId || certId;
        token = j.certToken || "";
        name = j.name || name;
        percent = j.percent ?? percent;
        correct = j.correct ?? correct;
        total = j.total ?? total;
      }
    } catch {
      /* ignore */
    }
    if (!p.examPassed || !certId) {
      setData(null);
      return;
    }
    const date = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date());
    setData({
      studentName: name,
      courseTitle,
      date,
      certId,
      verifyUrl: token
        ? `${siteUrl.replace(/\/$/, "")}/verify/${token}`
        : `${siteUrl.replace(/\/$/, "")}/verify`,
      score: percent,
      correct,
      total,
    });
  }, [courseId, courseTitle, siteUrl]);

  async function download(kind: "png" | "pdf") {
    if (!ref.current || !data) return;
    setBusy(true);
    setMsg("");
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      if (kind === "png") {
        const a = document.createElement("a");
        a.href = url;
        a.download = `SiteForge-${courseId}-${data.certId}.png`;
        a.click();
      } else {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [1754, 1240],
        });
        pdf.addImage(url, "PNG", 0, 0, 1754, 1240);
        pdf.save(`SiteForge-${courseId}-${data.certId}.pdf`);
      }
    } catch {
      setMsg("ההורדה נכשלה, נסו שוב בדפדפן אחר");
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md py-16 text-center" dir="rtl">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 text-2xl font-extrabold text-[#f5ede6]">אין תעודה עדיין</h1>
        <p className="mt-2 text-[#b9a89b]">צריך לעבור את מבחן הסיום קודם.</p>
        <Link
          href={`/academy/${courseId}/exam`}
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08]"
        >
          למבחן
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#ffe0a8]">התעודה שלך</h1>
          <p className="mt-1 text-[13px] text-[#b9a89b]">{data.certId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => download("pdf")}
            className="rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-4 py-2 text-[13px] font-bold text-[#1a0e08] disabled:opacity-50"
          >
            הורד PDF
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => download("png")}
            className="rounded-full border border-[#ffb35c]/40 px-4 py-2 text-[13px] font-bold text-[#ffe0a8] disabled:opacity-50"
          >
            הורד PNG
          </button>
          <Link
            href={courseHref(courseId)}
            className="rounded-full border border-[#2a211b] px-4 py-2 text-[13px] font-bold text-[#b9a89b]"
          >
            ← מפה
          </Link>
        </div>
      </div>
      {msg && <p className="mb-3 text-[13px] text-[#ff7a45]">{msg}</p>}

      <div className="overflow-auto rounded-2xl border border-[#2a211b] bg-[#0c0a09] p-2">
        <div className="mx-auto w-full max-w-[877px] overflow-hidden" style={{ height: 620 }}>
          <div style={{ transform: "scale(0.5)", transformOrigin: "top right", width: 1754 }}>
            <CertificateView data={data} />
          </div>
        </div>
      </div>

      {/* full-size offscreen for PDF/PNG */}
      <div
        aria-hidden
        style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}
      >
        <CertificateView ref={ref} data={data} />
      </div>
    </div>
  );
}
