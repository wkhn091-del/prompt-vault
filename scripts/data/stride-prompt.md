# Stride — plant protein bar site with one travelling 3D bar

Build a single-file, four-section landing page for a fictional plant protein bar brand called **Stride**. The page sells five bar flavours. Its centrepiece is a real-time 3D bar wrapper (Three.js / WebGL). Every bar on the hero arc is 3D. The bar you pick in the hero then travels down the page as one object:
- It flies into a pinned "what's inside" section and flips 180° at every step.
- It spins through a storm of its own ingredients.
- It lands exactly on its own card in the shop grid.

The background of the hero and section 2 always takes the active flavour's colour. When the flavour changes, the new colour grows out as a circle from behind the centre bar.

## Assets

| Asset | URL |
|---|---|
| Wrapper + ingredient sheet (2688×1520) | https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261116_132032_30242d8c-5062-4d60-8a3d-238f0a2ff788.png&w=2200&q=85 |
| Raw sheet PNG | https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261116_132032_30242d8c-5062-4d60-8a3d-238f0a2ff788.png |
| Intro clip (MP4) | https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261116_131908_b6239896-c077-450c-ad91-575153973fcf.mp4 |
| Three.js 0.160.0 | https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js |
| RoomEnvironment | https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js |

### Flavours (wrapper box `[x,y,w,h]`, colour)

0 Peanut Cocoa — 98,145,403,849 — `#b79474` — bit 1
1 Berry Oat — 620,145,402,849 — `#ab9ac4` — bit 0
2 Salted Caramel — 1137,145,402,849 — `#d1ad6c` — bit 2
3 Mint Chip — 1661,145,402,849 — `#94bdb4` — bit 3
4 Strawberry — 2184,145,403,849 — `#d396a7` — bit 4

Ingredient bits: 0 blueberries/raspberry 650,1090,340,305 · 1 chocolate/peanuts 110,1125,280,255 · 2 caramel 1175,1110,320,285 · 3 mint/chocolate 1680,1085,380,305 · 4 strawberry 2280,1095,250,295

## Fonts

Archivo Black 400 (display), Inter variable (UI), DM Mono 400/500 (captions). Self-host latin WOFF2 as base64. Await fonts.load before canvas backs.

## Tokens

`--ink #1c1a1f`, `--cream #f0e8e0`, `--dark #191a1e`, `--flav` live flavour colour (default `#ab9ac4`), `--ease cubic-bezier(.22,.8,.24,1)`. Hero `--u = min(100vw/1440, 100vh/900)`.

## Structure

1. **Hero `#flavors`** — 100svh, 3D arc of bars, colour circle reveal, title letter-rise, counter 01–05, next button, autoplay 3200ms. Start on Berry Oat (index 1).
2. **Inside `#inside`** — 500vh pinned sticky, bar flips 180° per step (720ms sine), storm of 20 ingredient pieces, outline numbers 01–04.
3. **Shop `#shop`** — cream, 5 flavour cards, tilt, poke, + flies to cart.
4. **Builder `#range`** — dark, build 3-pack, fly-to-cart, badge count.

One fixed `<canvas id="gl">` z-index 2 draws every 3D bar. Traveller bar lerps hero → section 2 → its shop card.

## Intro

MP4 full-bleed lilac burst 0.55s→4.6s, then logo stamp, then hero entrance. Skip pill. Failsafe 9s.

## Categories

3D / WebGL, Hero, Ecommerce, Landing Page, Animations, Creative
