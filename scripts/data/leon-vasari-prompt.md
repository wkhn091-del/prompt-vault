# Prompt: Leon Vasari, VHS filmography shelf hero

Give me the superdetailed exact prompt to recreate this page exactly as it is, including the correct asset URL, all elements, animations, and fonts. This is that prompt.

## What it is

Build a single-screen **filmography hero** for a fictional film director, Leon Vasari. Use plain HTML, CSS and vanilla JavaScript in one file, with no framework, no build step and no libraries.

The page is a warm off-white sheet of paper. Across its middle runs a long, endless shelf of worn VHS tape boxes standing side by side, spine out. One tape, the active film, is pulled out of the shelf and **physically turned in 3D** so its illustrated front cover faces you. It is tilted a few degrees, lifted slightly and pushed towards the viewer.

- **Changing film:** click any spine, the arrows, a decade tab, scroll, drag or use the keyboard. The shelf slides, the open tape turns back into a spine, and the new one turns out to show its cover.
- **Caption:** the film's title, romanised Japanese title, kanji title and year sit under the shelf and slide up through a mask whenever the film changes.
- **Cursor:** a large custom ring cursor follows the mouse. It shrinks over spines and becomes a filled cobalt "OPEN / 開く" disc over the active cover.
- **Opening a film:** click the cover, the play ring or press Enter. A sheet of paper grows out of the cover, rotating from the cover's tilt to straight, until it fills the screen. It becomes a detail page whose poster bleeds in like ink blots spreading on paper, while each line of text rises out of its own mask.

Everything is driven by one `requestAnimationFrame` loop plus the Web Animations API, with no CSS keyframes. There is no opacity fade anywhere; every reveal is a mask slide, a clip or a scale.

## Media: every asset URL

All 24 images come from **four Higgsfield GPT Image 2.5 generation sheets** with transparent backgrounds. Each sheet is loaded through the Higgsfield image proxy as WebP, and the alpha is kept. The art is fictional, unbranded VHS art, with no real studios or logos.

Never use separate image files. Each spine and cover is a **rectangle cut out of one of these sheets** with CSS background cropping, using the exact pixel boxes below.

### Sheets

| Sheet id | Size (px) | Contents | URL |
|---|---|---|---|
| covers | 1744 × 2336 | all 12 covers in a 4 × 3 grid | https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png&w=1744&q=85 |
| spines | 2688 × 1152 | 12 spines in one row (9 are used: all except river, observer and storm) | https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010738_a3e47ead-18f2-4974-9468-06d16a25edc5.png&w=2688&q=85 |
| fix | 1520 × 2688 | re-drawn spines; the first one, RIVER OF SALT, is used | https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010831_3ebb874b-93dc-433e-87ed-6299aba720f0.png&w=1520&q=85 |
| fix2 | 1520 × 2688 | re-drawn spines THE OBSERVER and LIGHT IN THE STORM | https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_092020_f96bc094-db7b-46de-9298-074a24e0a3b8.png&w=1520&q=85 |

### Crop boxes

The boxes are in sheet pixels, as `x, y, w, h`.

| Film id | Spine sheet | Spine box | Cover sheet | Cover box |
|---|---|---|---|---|
| valley | spines | 266, 31, 189, 1089 | covers | 497, 72, 344, 659 |
| bluehour | spines | 492, 31, 189, 1089 | covers | 914, 72, 342, 659 |
| river | fix | 197, 54, 324, 2566 | covers | 1332, 72, 344, 659 |
| summer | spines | 937, 31, 188, 1089 | covers | 74, 813, 344, 676 |
| green | spines | 1157, 31, 185, 1090 | covers | 497, 815, 344, 674 |
| noon | spines | 44, 32, 184, 1088 | covers | 74, 72, 347, 659 |
| observer | fix2 | 371, 15, 349, 2655 | covers | 915, 815, 342, 675 |
| birds | spines | 1573, 31, 183, 1089 | covers | 1331, 815, 345, 675 |
| storm | fix2 | 808, 15, 347, 2656 | covers | 74, 1571, 345, 681 |
| tide | spines | 2012, 31, 188, 1089 | covers | 496, 1577, 343, 678 |
| war | spines | 2236, 31, 189, 1089 | covers | 913, 1579, 343, 676 |
| door | spines | 2462, 31, 188, 1089 | covers | 1331, 1579, 344, 677 |

### How the images are used

Put the two tables into JS as `SHEET[id] = [url, W, H]` and `CROP['spine-<id>' | 'cover-<id>'] = [sheet, x, y, w, h]`.

- Spines and covers: CSS background crop. For box `x,y,w,h` on sheet `W×H`: `background-size: (W/w·100)% (H/h·100)%`, `background-position: (x/(W−w)·100)% (y/(H−h)·100)%`.
- Detail poster: SVG image of cover sheet inside clip-path 474×900.
- Preload the four sheet URLs as Image() on start.

## Fonts

Newsreader 400 (+ italic), Inter Tight 500/600, Noto Sans JP 500, Noto Serif SC 700 (莱昂·瓦萨里). Sans: Inter Tight + Noto Sans JP. Serif: Newsreader.

## Palette

`--paper #EDEBE6`, `--sheet #F4F2ED`, `--ink #141414`, `--muted #6D6A63`, `--cobalt #1F3FB0`, `--rule rgba(20,20,20,.9)`, `--ease cubic-bezier(.2,.8,.2,1)`, `--H min(46vh,31vw)` desktop / `min(60vw,40svh)` mobile. Paper grain SVG turbulence overlay multiply .55.

## Layout

Top bar 84px with BACK/戻る, cobalt logo 莱昂·瓦萨里 / LEON VASARI, CAREER 1958年〜1989年. Decade tabs ALL/1950s–1980s with sliding cobalt indicator. 3D shelf of VHS tapes (perspective 2200px), endless 3×12 copies, active tape rotateY −90°·o with tilt −4.5° Z, translateZ 0.2H. Caption under shelf with mask slides. Play ring, arrows, footer, custom 58px cursor with OPEN/開く state.

## Films (open on noon index 5)

valley 1958, bluehour 1962, river 1964, summer 1966, green 1969, noon 1971, observer 1973, birds 1975, storm 1978, tide 1981, war 1985, door 1989 — with romaji, kanji, genre, minutes, synopsis as in the full brief.

## Motion

Spring `s += (T−s)×(1−e^(−k·dt))` k=5.2 (18 while drag). Wheel, drag, arrows, keyboard, decade jumps. Detail open: paper grows from cover rect 1050ms, text rises 900ms staggered, ink blobs bleed 1250ms. Close 850ms. No opacity fades.

## Responsive ≤767px / reduced motion / a11y

As specified in the full brief. Acceptance: Noon in Ashes open at centre on load; spine clicks glide shelf; cobalt tab slides; cursor OPEN disc; cover click grows paper sheet with ink blot poster.

Categories: Hero, Animations, Portfolio, Creative, Landing Page
