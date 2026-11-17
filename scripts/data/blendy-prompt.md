# Blendy — smoothie flavour slider hero: exact recreation prompt

Build a single-screen landing hero for a fictional smoothie brand called Blendy. It is a full-viewport product slider with four flavours: Berry, Kiwi, Banana and Strawberry. Each flavour floods the whole screen with one flat pastel colour. A huge white flavour word sits behind one centred smoothie bottle, and real fruit pieces float around the bottle at different depths, with two large blurred pieces in the bottom-left and top-right corners. A tiny white nav sits on top, a tracked "SHOP NOW" label at the bottom centre and thin arrows in the bottom corners. Changing flavour plays a measured panel wipe: the current slide is covered from its right edge towards the left while its content drifts left, and the next flavour's word, bottle and fruit slide in from the right with parallax. Everything must match the measurements below exactly. Use one HTML file with inline CSS and vanilla JavaScript, no frameworks and no build step.

## 1. Assets

All product imagery comes from four transparent PNG "cut-out sheets", one per flavour. Each sheet is 2048 × 2048 px with transparency, laid out as an invisible 2 × 2 grid: the top-left cell holds the bottle (with its two green leaves attached), and the other three cells hold three different fruit pieces. Load each sheet through the images.higgs.ai proxy as WebP. The exact URL form is `https://images.higgs.ai/?default=1&output=webp&w=2048&q=85&url=` followed by the URL-encoded original link.

| Flavour | Original sheet URL (transparent PNG, 2048 × 2048) |
|---|---|
| Berry | https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_8803e421-29b1-4c24-8efd-54cae3f479b4.png |
| Kiwi | https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_b5695e60-72da-4b5b-bfb7-a091d528af75.png |
| Banana | https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_6cf14029-4bce-4c9a-b9fc-1c5b185082e3.png |
| Strawberry | https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_055135_cbfb5a8d-c52b-4358-a6ee-d941c6c42285.png |

Berry sheet (Higgs WebP):
https://images.higgs.ai/?default=1&output=webp&w=2048&q=85&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261117_053958_8803e421-29b1-4c24-8efd-54cae3f479b4.png

Never slice the sheets into separate files. Every bottle and fruit piece is a CSS background crop of its sheet. Exact item boxes [x, y, width, height] in sheet pixels:

| Sheet | Item 0: bottle with leaves | Item 1 | Item 2 | Item 3 |
|---|---|---|---|---|
| Berry | 233, 60, 598, 917 | raspberry: 1209, 272, 569, 573 | blueberry: 265, 1230, 579, 572 | blackberry: 1192, 1192, 626, 641 |
| Kiwi | 217, 90, 610, 874 | kiwi round half: 1204, 257, 619, 601 | kiwi wedge: 250, 1197, 619, 522 | kiwi round slice: 1200, 1186, 633, 650 |
| Banana | 194, 76, 579, 873 | banana coin, angled: 1205, 228, 596, 597 | peeled banana chunk: 230, 1181, 624, 648 | banana coin, face-on: 1193, 1182, 646, 659 |
| Strawberry | 226, 88, 594, 887 | whole strawberry: 1190, 216, 561, 653 | strawberry half: 257, 1168, 604, 662 | whole strawberry, tilted: 1240, 1169, 632, 686 |

How to crop: to show item [bx, by, bw, bh] at target width W, scale s = W / bw. Element is W wide and bh×s tall. background-size (2048×s)×(2048×s), background-position (−bx×s, −by×s).

## 2. Fonts

Poppins 500/600/700 and Baloo 2 800 from Google Fonts (latin WOFF2, font-display swap). Body stack: Poppins, system-ui, sans-serif. All text #FFFFFF antialiased.

## 3. Head and colour tokens

Page title: "Blendy — Real fruit smoothies". html/body 100% tall, overflow hidden, body background #C2B0DC, touch-action pan-y.

| Flavour | Backdrop colour | Word |
|---|---|---|
| Berry | #C2B0DC (soft lilac) | Berry |
| Kiwi | #B4D58A (soft mint green) | Kiwi |
| Banana | #F3DA8A (butter yellow) | Banana |
| Strawberry | #F2AFC0 (pastel strawberry pink) | Strawberry |

UI text-shadow: 0 1px 6px rgba(90,70,40,0.18).

## 4. Scaling system

Design frame 1440×900. --u = min(vw/1440, vh/900). Nav uses --n = clamp(0.5px, min(100vw/1440, 100vh/900), 1.3px).

## 5–12. Behaviour (exact recreation)

Desktop measurements for bottles, fruit, shadows, nav, SHOP NOW, arrows as specified in the full Blendy recreation prompt. Idle fruit bob ±7u / ±3°. Flavour wipe 970ms with measured coverage table and parallax factors (word 0.40, shadow 0.30, bottle 0.15, fruit 0.55, corner 0.75). Opening sequence after fonts.ready. Autoplay 2600ms, pause 6s after interaction. Swipe >45px. Mobile ≤820px or portrait. prefers-reduced-motion: instant swaps, no bob.

Categories: Hero, Animations, Ecommerce, Landing Page, Creative
