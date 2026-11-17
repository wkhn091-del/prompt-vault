# Haldoren — "Laptop Dive" Portfolio Hero: Build Brief

Build a single-file (`index.html`, inline CSS and JS, no frameworks, no build step) one-screen portfolio hero for a fictional motion designer, **Haldoren**.

On load you see a photographic hero:
- a young man in a black leather jacket, white shirt and dark-red tie stands in a deep-green studio, holding a retro brick phone to his ear with his **right** hand and an open silver laptop in his **left**;
- a giant white "HALDOREN" wordmark sits *behind* him;
- a handwritten "motion-design" sits over the wordmark;
- a lanyard ID badge hangs from the top right.

When you scroll, a 5-second AI camera move (played in ~1.7 s) pushes into the laptop. The laptop floats out of his hand, turns square to camera and fills the view. Then the laptop screen plays a portfolio case video, framed by a punched paper ticket card, a short description and round prev/next buttons. Cases switch in place. "my studio" eases back out to the hero.

The page never scrolls. `html, body` are `height:100%; overflow:hidden`. Every interaction is captured (wheel, touch, keys, clicks).

---

## 1. Assets (exact URLs — do not re-host)

```
HX(u) = 'https://images.higgs.ai/?default=1&output=webp&url=' + encodeURIComponent(u) + '&w=2048&q=85'
CF    = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/'
```

| Key | Raw URL |
|---|---|
| `plate` | `CF + 'hf_20261111_001031_a09dc558-2c69-4e05-83a4-5f01ebdd1363.png'` (wrap HX) |
| `casePlate` | `CF + 'hf_20261111_001031_4a7c3fd9-2168-4219-9736-096a17bbb0e2.png'` (HX) |
| `cut` | `CF + 'hf_20261111_001143_ec356b1a-50a2-4b50-82fc-e346c914a406.png'` (HX) |
| `badge` | HX with w=1200 of `CF + 'hf_20261111_001143_65c037e6-0768-4b12-9f17-17be132ce16b.png'` |
| `trans` | `CF + 'hf_20261111_001144_2b054228-95af-41d5-922d-b02979fe485b.mp4'` (NOT wrapped) — 1280×720, 24fps, 5.04s |

Case videos (`R2 = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/aaaf/'`):
1. `vell-lookbook.mp4` — VELL LOOKBOOK / STUDIO VELL / E-COMMERCE / 2026
2. `vasari-vhs-hero.mp4` — VASARI SHELF / VASARI ARCHIVE / PORTFOLIO / 2026
3. `living-portrait-hero.mp4` — MINA PORTRAIT / MINA 3D / PERSONAL SITE / 2025

## 2–3. Fonts & tokens

Inter Tight 100–900, Caveat Brush 400, Anton 400. `--green-900:#0b2f20`, `--green-800:#11402c`, `--mint:#cfeee0`, `--ink:#0d0f0e`. Stage gradient `#0c3523 → #14503a → #9fd8bf`.

## 4–5. Frame 1440×810

Plate/cut/caseplate/trans/screen layers with exact offsets. Wordmark HALDOREN SVG Inter Tight 900. Handwriting "motion-design" Caveat Brush −8deg. Badge lanyard with DESIGNER CARD / E. HALDOREN fields.

## 6–8. UI, fit, entrance

Nav tags my studio / portfolio / contacts / discuss a project. Ticket + description + prev/next in case mode. `pose(mode)` cover/fit. Mask fades via `@property`. Entrance WAAPI: tags spring, wordmark rise, script write-on, badge drop + sway.

## 9–12. Dive / arrive / swap / back

`toCase`: heroOut → eased clip playbackRate sin curve (~1.72s) → caseplate. `arriveCase` flash + video 1. `swapTo` caseOut/in. `toHero` blur zoom-out reveal.

## 13–15. Mobile ≤820, reduced motion, copy

Mobile UI copies of wordmark/script/badge; laptop bottom-anchored. All strings exact. Title: `Haldoren — Motion Design Portfolio`.

Categories: Hero, Portfolio, Animations, Landing Page, Creative
