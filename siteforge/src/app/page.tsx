import Link from "next/link";
import { ArrowLeft, Award, BookOpen, Flame, Layers } from "lucide-react";
import { Shell } from "../components/Shell";
import { getToc } from "../lib/book";

export default function HomePage() {
  const toc = getToc();

  return (
    <Shell active="home">
      <main className="mobile-pad-x mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:pt-20">
        <section className="relative academy-stage px-5 py-10 sm:px-10 sm:py-14" dir="rtl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff9a6c]/75 [direction:ltr] [text-align:right]">
            SiteForge · v{toc.version} · {toc.stage_count} stages
          </p>
          <h1 className="lib-hero-title mt-3 font-extrabold">
            <span className="bg-gradient-to-l from-[#ff7a45] via-[#ffb35c] to-[#ffe0a8] bg-clip-text text-transparent">
              SiteForge
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/55 [font-family:var(--font-heebo),sans-serif] sm:text-[17px]">
            חומר בסיסי + עקרונות. הכל נבנה עם AI — לא לומדים הכול לעומק,
            לומדים מה לבקש, מה לבדוק, ואיך יודעים שזה עובד. {toc.stage_count}{" "}
            שלבים, מדליה כל עשרה, מבחן שער בכל שלב.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/academy"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-6 text-[14px] font-bold text-[#1a0e08]"
            >
              אקדמיה · אתרים + סוכנים
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/learn"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#ff7a45]/35 bg-white/[0.04] px-6 text-[14px] font-bold text-[#ffb08a]"
            >
              מסלול 100 (ישן)
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
          {[
            {
              icon: BookOpen,
              label: "שלבים",
              value: String(toc.stage_count),
              hint: "עקרון · סקריפט AI · מבחן",
            },
            {
              icon: Layers,
              label: "מסלולים",
              value: String(toc.tracks.length),
              hint: "מאפס עד Plus",
            },
            {
              icon: Award,
              label: "מדליות",
              value: String(toc.medals.length),
              hint: "כל 10 שלבים",
            },
            {
              icon: Flame,
              label: "פרויקטים",
              value: String(toc.projects.length),
              hint: "נחיתה עד איקומרס",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="academy-card rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#16120f] to-[#0c0a09] px-4 py-4"
            >
              <item.icon className="mb-3 size-5 text-[#ff7a45]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#ff7a45]/55">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-white">{item.value}</p>
              <p className="mt-1 text-[12px] text-white/40 [font-family:var(--font-heebo),sans-serif]">
                {item.hint}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12" dir="rtl">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff7a45]/55">
            Tracks
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {toc.tracks.map((t, i) => (
              <Link
                key={t.track_id}
                href={`/learn#${t.track_id}`}
                className="academy-card flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#16120f] to-[#0c0a09] px-4 py-3.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#ff7a45]/35 bg-[#ff7a45]/10 font-mono text-[11px] font-bold text-[#ffb08a]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold [font-family:var(--font-heebo),sans-serif]">
                    {t.title}
                  </span>
                  <span className="font-mono text-[10px] text-[#ff7a45]/50 [direction:ltr]">
                    {t.track_id}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Shell>
  );
}
