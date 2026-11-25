"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AuthBar } from "../auth/AuthBar";
import {
  FACADE_S,
  LEDGE_LUT,
  NIGHT_LUT,
  PAN_LUT,
  PIECE_P,
  SRC,
  facadeCssWidth,
  loadImage,
  lutAt,
  proxyUrl,
  streetCssWidth,
} from "./noche-assets";
import { buildPieces, createGLStreet, type GLStreet, type PieceRuntime } from "./noche-gl";

type CourseCard = {
  id: string;
  en: string;
  he: string;
  blurb: string;
  stats: string;
};

export function NocheVivaHero({ courses }: { courses: CourseCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const halfLRef = useRef<HTMLDivElement>(null);
  const halfRRef = useRef<HTMLDivElement>(null);
  const facadeImgLRef = useRef<HTMLImageElement>(null);
  const facadeImgRRef = useRef<HTMLImageElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const coursesRef = useRef<HTMLElement>(null);
  const worldDayRef = useRef<HTMLImageElement>(null);
  const worldNightRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }

    const openCourses =
      window.location.hash === "#courses" ||
      new URLSearchParams(window.location.search).has("courses");

    if (!openCourses) {
      window.scrollTo(0, 0);
    }

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let plate = { px: 0, pw: 0, ph: 0 };
    let fw = 0;
    let fh = 0;
    let gap = 0;
    let pieces: PieceRuntime[] = [];
    let glStreet: GLStreet | null = null;
    let dayImg: HTMLImageElement | null = null;
    let nightImg: HTMLImageElement | null = null;
    let bandUrl = "";
    let ready = false;
    let failed = false;
    let introT0 = 0;
    let introDone = reduced || openCourses;
    let sCur = 0;
    let sVel = 0;
    let raf = 0;
    let running = false;
    let resizeTimer = 0;

    const HOLD = 0.4;
    const INTRO_END = 1.17;
    const omega = 9;

    function geometry() {
      const hero = heroRef.current;
      if (!hero) return;
      W = hero.clientWidth;
      H = hero.clientHeight;
      const ph = Math.max(W / 1.506, 1.26 * H);
      const pw = 1.506 * ph;
      const px = (W - pw) / 2;
      plate = { px, pw, ph };

      // facade cover
      if (W / H > 1.5) {
        fw = W;
        fh = W / 1.5;
      } else {
        fh = H;
        fw = 1.5 * H;
      }
      gap = (8.5 / 664) * W;

      pieces = buildPieces(W);

      const u = W / 1440;
      hero.style.setProperty("--u", `${u}px`);

      // facade halves
      const halfW = W / 2 - gap;
      const halfL = halfLRef.current;
      const halfR = halfRRef.current;
      const imgL = facadeImgLRef.current;
      const imgR = facadeImgRRef.current;
      if (halfL && halfR && imgL && imgR) {
        halfL.style.width = `${halfW}px`;
        halfR.style.width = `${halfW}px`;
        imgL.style.width = `${fw}px`;
        imgL.style.height = `${fh}px`;
        imgL.style.left = `${W / 2 - gap - fw / 2}px`;
        imgL.style.top = `${(H - fh) / 2}px`;
        imgR.style.width = `${fw}px`;
        imgR.style.height = `${fh}px`;
        imgR.style.left = `${-fw / 2}px`;
        imgR.style.top = `${(H - fh) / 2}px`;
      }

      const band = bandRef.current;
      const title = titleRef.current;
      if (band) {
        const bh = (1 - 0.799 + 0.03) * H;
        band.style.height = `${bh}px`;
        if (bandUrl) band.style.backgroundImage = `url(${bandUrl})`;
      }
      if (title) {
        const fs = Math.min(0.1 * H, 0.12 * W);
        title.style.fontSize = `${fs}px`;
        // High on the street — room for cards beneath once night lands
        title.style.top = "18%";
        title.style.left = "50%";
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      glStreet?.resize(W, H, dpr);
    }

    function scrollProgress() {
      const track = trackRef.current;
      const range = Math.max(
        1,
        (track?.offsetHeight ?? window.innerHeight * 2.6) - window.innerHeight,
      );
      return Math.min(1, Math.max(0, window.scrollY / range));
    }

    function applyFrame(night: number, pan: number, ledgeTop: number, facadeS: number, clipX: number) {
      // facade
      const halfL = halfLRef.current;
      const halfR = halfRRef.current;
      if (halfL && halfR) {
        const dx = facadeS * W;
        halfL.style.transform = `translate3d(${-dx}px,0,0)`;
        halfR.style.transform = `translate3d(${dx}px,0,0)`;
        const hide = dx > W / 2 + 2;
        halfL.style.visibility = hide ? "hidden" : "visible";
        halfR.style.visibility = hide ? "hidden" : "visible";
      }

      const layers = layersRef.current;
      if (layers) {
        if (clipX > 0.5) {
          layers.style.clipPath = `inset(0 ${clipX}px 0 ${clipX}px)`;
        } else {
          layers.style.clipPath = "none";
        }
      }

      const band = bandRef.current;
      if (band) {
        band.style.top = `${ledgeTop * H}px`;
      }

      const title = titleRef.current;
      if (title) {
        // Open with the ledge rise — fully visible before deep night
        const raw = Math.min(
          1,
          Math.max(0, (1.02 - ledgeTop) / (1.02 - 0.86)),
        );
        const reveal = Math.sqrt(raw);
        title.style.opacity = String(reveal);
        title.style.transform = `translate(-50%, -50%) scale(${0.82 + 0.18 * reveal})`;
        title.style.filter = `blur(${(1 - reveal) * 6}px)`;
      }

      // Cards only once the street is dark — match night palette, no page below
      const courses = coursesRef.current;
      if (courses) {
        const cardRaw = Math.min(1, Math.max(0, (night - 0.42) / 0.48));
        const cardReveal = cardRaw * cardRaw * (3 - 2 * cardRaw);
        courses.style.opacity = String(cardReveal);
        courses.style.transform = `translate(-50%, ${((1 - cardReveal) * 36).toFixed(1)}px)`;
        courses.style.pointerEvents = cardReveal > 0.55 ? "auto" : "none";
        courses.setAttribute("aria-hidden", cardReveal < 0.2 ? "true" : "false");
      }

      if (glStreet && ready && !failed) {
        glStreet.draw(pieces, plate, W, H, night, pan);
      } else if (failed || !glStreet) {
        // DOM fallback plates
        const day = worldDayRef.current;
        const nightEl = worldNightRef.current;
        if (day && nightEl) {
          day.style.opacity = String(1 - night);
          nightEl.style.opacity = String(night);
          const rise = pan * 0.2 * H;
          day.style.transform = `translate3d(0,${-rise}px,0)`;
          nightEl.style.transform = `translate3d(0,${-rise}px,0)`;
        }
      }
    }

    let prevNow = 0;
    function tick(now: number) {
      running = true;
      const dt = Math.min(0.05, (prevNow ? now - prevNow : 16) / 1000);
      prevNow = now;

      let night = 0;
      let pan = 0;
      let ledgeTop = 1.02;
      let facadeS = 0;
      let clipX = W / 2;

      if (!ready && !failed) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (reduced) {
        introDone = true;
        pieces.forEach((p) => {
          p.offset = 0;
        });
        const sp = scrollProgress();
        sCur = sp;
        const kNight = sp * (NIGHT_LUT.length - 1);
        const kPan = sp * (PAN_LUT.length - 1);
        const kLedge = sp * (LEDGE_LUT.length - 1);
        night = lutAt(NIGHT_LUT, kNight);
        pan = lutAt(PAN_LUT, kPan);
        ledgeTop = lutAt(LEDGE_LUT, kLedge);
        facadeS = 2;
        clipX = 0;
        applyFrame(night, pan, ledgeTop, facadeS, clipX);
        raf = requestAnimationFrame(tick);
        return;
      }

      const T = introT0 ? (now - introT0) / 1000 - HOLD : -HOLD;

      if (!introDone) {
        if (T < 0) {
          pieces.forEach((p) => {
            p.offset = p.sign * p.travel;
          });
          facadeS = 0;
          clipX = W / 2;
        } else {
          const facadeFrame = T * 30;
          facadeS = lutAt(FACADE_S, facadeFrame);
          const halfWidth = (8.5 / 664 + facadeS - 8 / 664) * W;
          clipX = Math.max(0, W / 2 - halfWidth);

          for (const p of pieces) {
            const lead = Math.max(0, 0.25 * (0.41 - p.travel / Math.max(W, 1)));
            const pFrame = (T + lead) * 30;
            const prog = lutAt(PIECE_P, pFrame);
            p.offset = p.sign * (1 - prog) * p.travel;
          }

          if (T >= INTRO_END) {
            introDone = true;
            pieces.forEach((p) => {
              p.offset = 0;
            });
            facadeS = 2;
            clipX = 0;
          }
        }
        sCur = 0;
        sVel = 0;
      } else {
        facadeS = 2;
        clipX = 0;
        pieces.forEach((p) => {
          p.offset = 0;
        });

        const sp = scrollProgress();
        const a = omega * omega * (sp - sCur) - 2 * omega * sVel;
        sVel += a * dt;
        sCur += sVel * dt;
        if (Math.abs(sp - sCur) < 1e-4 && Math.abs(sVel) < 1e-4) {
          sCur = sp;
          sVel = 0;
        }

        // k = 113 + sCur * 35 → map sCur 0..1 onto LUTs (reel frames remapped to tables)
        night = lutAt(NIGHT_LUT, sCur * (NIGHT_LUT.length - 1));
        pan = lutAt(PAN_LUT, sCur * (PAN_LUT.length - 1));
        ledgeTop = lutAt(LEDGE_LUT, sCur * (LEDGE_LUT.length - 1));
      }

      if (!introDone && T >= 0) {
        night = 0;
        pan = 0;
        ledgeTop = 1.02;
      }

      applyFrame(night, pan, ledgeTop, facadeS, clipX);

      const settled = introDone && Math.abs(sVel) < 1e-4 && Math.abs(scrollProgress() - sCur) < 1e-4;
      if (!settled || !introDone) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function kick() {
      if (!running) {
        prevNow = 0;
        raf = requestAnimationFrame(tick);
      }
    }

    function onScroll() {
      kick();
    }

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        geometry();
        kick();
      }, 120);
    }

    async function boot() {
      try {
        const scw = streetCssWidth(window.innerWidth, window.innerHeight);
        const fcw = facadeCssWidth(window.innerWidth, window.innerHeight);
        const dayUrl = proxyUrl(SRC.day, scw);
        const nightUrl = proxyUrl(SRC.night, scw);
        const facadeUrl = proxyUrl(SRC.facade, fcw);
        bandUrl = proxyUrl(SRC.band, window.innerWidth);

        const timeout = new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), 9000),
        );

        const loaded = (await Promise.race([
          Promise.all([
            loadImage(dayUrl),
            loadImage(nightUrl),
            loadImage(facadeUrl),
            document.fonts.ready,
          ]),
          timeout,
        ])) as [
          HTMLImageElement,
          HTMLImageElement,
          HTMLImageElement,
          FontFaceSet,
        ];

        dayImg = loaded[0];
        nightImg = loaded[1];

        if (facadeImgLRef.current) facadeImgLRef.current.src = facadeUrl;
        if (facadeImgRRef.current) facadeImgRRef.current.src = facadeUrl;
        if (worldDayRef.current) worldDayRef.current.src = dayUrl;
        if (worldNightRef.current) worldNightRef.current.src = nightUrl;

        geometry();

        const canvas = canvasRef.current;
        if (canvas && dayImg && nightImg) {
          try {
            glStreet = createGLStreet(canvas, dayImg, nightImg);
          } catch {
            glStreet = null;
          }
        }

        if (!glStreet) {
          failed = true;
          if (layersRef.current) layersRef.current.style.display = "none";
          const world = document.querySelector(".nv-world") as HTMLElement | null;
          if (world) world.style.display = "block";
        } else {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          glStreet.resize(W, H, dpr);
        }

        ready = true;
        introT0 = performance.now();
        if (reduced || openCourses) {
          pieces.forEach((p) => {
            p.offset = 0;
          });
        }
        if (openCourses) {
          const jumpToNight = () => {
            const track = trackRef.current;
            const y = Math.max(
              0,
              (track?.offsetHeight ?? window.innerHeight * 2.6) -
                window.innerHeight,
            );
            window.scrollTo(0, y);
            sCur = 1;
            sVel = 0;
            const night = 1;
            const pan = lutAt(PAN_LUT, PAN_LUT.length - 1);
            const ledgeTop = lutAt(LEDGE_LUT, LEDGE_LUT.length - 1);
            applyFrame(night, pan, ledgeTop, 2, 0);
          };
          jumpToNight();
          requestAnimationFrame(jumpToNight);
        }
        kick();
      } catch {
        failed = true;
        ready = true;
        introDone = true;
        geometry();
        if (layersRef.current) layersRef.current.style.display = "none";
        const world = document.querySelector(".nv-world") as HTMLElement | null;
        if (world) world.style.display = "block";
        if (openCourses) {
          const track = trackRef.current;
          const y = Math.max(
            0,
            (track?.offsetHeight ?? window.innerHeight * 2.6) -
              window.innerHeight,
          );
          window.scrollTo(0, y);
          sCur = 1;
        }
        kick();
      }
    }

    geometry();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    boot();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
      glStreet?.destroy();
    };
  }, []);

  return (
    <>
      <AuthBar floating />
      <div className="nv-track" ref={trackRef}>
        <main className="nv-hero" ref={heroRef}>
          <div className="nv-world" aria-hidden>
            <img ref={worldDayRef} alt="" className="nv-plate nv-plate-day" />
            <img ref={worldNightRef} alt="" className="nv-plate nv-plate-night" />
          </div>

          <div id="layers" ref={layersRef}>
            <canvas ref={canvasRef} className="nv-canvas" />
          </div>

          <div className="nv-band" ref={bandRef} aria-hidden />

          <h1 className="nv-title" ref={titleRef}>
            SITEFORGE
          </h1>

          <section
            id="courses"
            className="nv-courses"
            ref={coursesRef}
            dir="rtl"
            aria-hidden="true"
          >
            <header className="nv-courses-intro">
              <p className="nv-courses-kicker">CHOOSE YOUR COURSE</p>
              <h2 className="nv-courses-head">שני מסלולים · הכל באתר</h2>
            </header>
            <div className="nv-course-grid">
              {courses.map((c) => (
                <Link key={c.id} href={`/academy/${c.id}`} className="nv-card">
                  <p className="nv-card-en">{c.en}</p>
                  <h3 className="nv-card-he">{c.he}</h3>
                  <p className="nv-card-blurb">{c.blurb}</p>
                  <p className="nv-card-stats">{c.stats}</p>
                  <span className="nv-card-cta">Enter map →</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="nv-half nv-half-l half l" ref={halfLRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={facadeImgLRef} alt="" className="nv-facade-img" />
          </div>
          <div className="nv-half nv-half-r half r" ref={halfRRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={facadeImgRRef} alt="" className="nv-facade-img" />
          </div>

          <Link href="/" className="nv-brand" aria-label="SiteForge">
            <span className="nv-brand-mark">SF</span>
            <span className="nv-brand-name">SiteForge</span>
          </Link>
        </main>
      </div>
    </>
  );
}
