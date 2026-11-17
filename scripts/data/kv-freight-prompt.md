# Prompt: KV freight landing page (rotating globe hero, horizon glow, pinned stats, services scroll scene)

Build a single-file landing page for a fictional freight group called **KV**, in plain HTML, CSS and vanilla JavaScript, with no framework and no build step. The page is white and calm, with ink-black type and one accent colour, cobalt. It has three sections, in this order:

1. **Globe hero.** A real 3D dotted globe turns slowly on the right, drawn live on a canvas, with three port pins and raised route arcs. On the left is a vertical mono nav, a cobalt overline, a huge three-line condensed headline, a paragraph and two pill buttons. The headline arrives with a glitchy double-exposure reveal.
2. **Horizon glow transition, then stats.** On scroll, the hero holds still while a curved cobalt "planet edge" glow rises over it from the bottom. The glow decelerates, stops near the top and fades as the white stats section scrolls up beneath it. In the stats section, a port photo and a four-line headline stay pinned on the left while a right-hand column of intro copy and five counting stats scrolls past.
3. **Services scroll scene.** One scrubbed video: a teal reach-stacker loads a navy container onto a black truck, the camera pulls back onto a black band, giant "OUR SERVICES" letters slide behind the truck, and a dark strip of five service cards slides in from the right.

Everything after the load sequence is driven by scroll. Nothing autoplays except the globe's slow spin.

---

## 1. Media (exact URLs)

| What | URL |
|---|---|
| Services clip 1080p | https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/409763c0-95f4-49d3-a601-dc564d55072b.mp4 |
| Services clip 720p | https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b3718419-7a0a-478d-bfb0-0ff8bef7f3f7.mp4 |
| Poster | https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/2307e4bf-be39-42b4-b579-e168aeccabf0.jpg |
| Port aerial photo | https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261116_131941_31d10ef7-4bff-4a6b-94a7-27e15c950f26.png&w=1200&q=85 |
| World land polygons | https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json |

Services clip: 4.04 s, 24 fps, 97 frames, muted, scrub only never play. Band top 82.9% → 44.8% by 3.75s. Port photo: top-down container port; box behind `#1d3b44`.

## 2. Fonts

Anton 400 (headlines), Archivo 400–800 (body/overline), JetBrains Mono 400–500 (nav/buttons/labels). Self-host latin WOFF2 or Google Fonts with swap.

## 3. Tokens

ink `#111`, white `#fff`, cobalt `#2f63ff` / hover `#1f4fe0`, muted `#5d6270` / `#6b6f78`, wash `#eef2ff`, periwinkle `#a9bcff`, giant `#e9e9e9`, hairline `#d9dbe0`. Title `KV Freight`. Units `--uc/--uv/--us/--u` as specified. Classes `m-port`, `m-land`, `m-hp`, `sticky`.

## 4–5. Globe hero

1440×900 frame. Logo KV SVG, vertical ABOUT/SERVICES nav, overline ONE NETWORK, headline EVERY LEG / OF THE / ROUTE (Anton 114.3uc), lede, GET A QUOTE + OUR SERVICES pills. Canvas globe: ~3760 land dots from land-50m, orthographic tilt 9°, spin 2.4°/s from lon −10°, centre (1166,530) r=400, haze/rim/arcs Rotterdam–Santos–Lagos, pins fade in.

## 6. Horizon glow

Fixed `.hz` radial cobalt planet-edge; `e = (wrapperH − scrollY)/vh − 0.47`; decelerate near top; hero sticky 165vh; headline glitch-out wipe; copy fades.

## 7. Stats `#about`

Pinned photo + WE MOVE / FREIGHT. / WE OWN / THE OUTCOME. Scrolling intro + five stats (2500+, 98.2%, 8+, 60+, 24/7) with glitch reveal and count-up. Hairlines via CSS.registerProperty `--hl`.

## 8. Services `#services`

Sticky scene scrubbing video over A=2.4 screens then strip B. Giant OUR SERVICES behind truck (mix-blend darken). Five cards: Air, Ocean, Customs, Warehousing, Project. KM/H readout. Card text blue→white sweep.

## 9–12. Load glitch, phones, reduced motion, acceptance

Hero load timeline with glitch reveal steps(14). Portrait/land/hp layouts. Reduced motion: no entrances, globe static, final numbers. Recorder `?rec=1`. Acceptance at 1440×900 as specified.

Categories: Hero, Landing Page, 3D / WebGL, Animations, SaaS
