# Try the Look. — Runway: exact recreation prompt

Build a single page that recreates the user's own static export of a Shopify "runway" section called "Try the Look." exactly as it is. It is a Nike-branded streetwear outfit carousel. Six full-body models stand on a white stage, arranged in depth on a turning 3D ring with blurred outer figures. The carousel advances every 5 seconds, with a 01–06 progress bar, arrows and a pause button. It has a custom "Drag / View" cursor and a "View look" popup with numbered product pins. A right-hand "In this look" panel lists the pieces with plus buttons and size pickers, and ends with a "Complete the look" bundle price and an "Add full look to bag" button. A local "styling bag" dialog keeps the shortlist. Keep every Nike name, product name, price and shop link exactly as listed below.

Write plain HTML, CSS and vanilla JavaScript with no frameworks. The section is a custom element `<runway-section>` defined with `customElements.define`. Every number in this brief comes from the final source and must be used as given.

Live reference (exact demo):
https://reel-ref-try-the-look.vercel.app/

## Assets (absolute URLs — do not re-host)

Logo: https://reel-ref-try-the-look.vercel.app/assets/nike-logo.svg

Models (640 + 1080):
- The City Edit: https://reel-ref-try-the-look.vercel.app/assets/model-1-640.webp | https://reel-ref-try-the-look.vercel.app/assets/original-look-1.webp
- Gallery Opening: https://reel-ref-try-the-look.vercel.app/assets/model-5-640.webp | https://reel-ref-try-the-look.vercel.app/assets/original-look-5.webp
- Gallery Opening: https://reel-ref-try-the-look.vercel.app/assets/model-4-640.webp | https://reel-ref-try-the-look.vercel.app/assets/original-look-4.webp
- Studio Day: https://reel-ref-try-the-look.vercel.app/assets/model-6-640.webp | https://reel-ref-try-the-look.vercel.app/assets/original-look-6.webp
- Studio Day: https://reel-ref-try-the-look.vercel.app/assets/model-3-640.webp | https://reel-ref-try-the-look.vercel.app/assets/original-look-3.webp
- Studio Day: https://reel-ref-try-the-look.vercel.app/assets/model-2-640.webp | https://reel-ref-try-the-look.vercel.app/assets/original-look-2.webp

Products:
- https://reel-ref-try-the-look.vercel.app/assets/source-tatum-5-orbit-copy.webp (Air Jordan 12 Retro, $149.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-tatum-5-orbit.webp (Tatum 5 Orbit, $149.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-air-jordan-12-retro-copy.webp (Luka 5, $149.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-tshirt.webp (Tshirt, $199.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-sweatshirt.webp (Sweatshirt, $199.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-sweatshirt-plus.webp (Sweatshirt Plus, $199.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-hoodie.webp (Hoodie, $199.00)
- https://reel-ref-try-the-look.vercel.app/assets/source-hoodie-black.webp (Hoodie Black, $199.00)

Catalog: https://reel-ref-try-the-look.vercel.app/native-catalog.json
Font: https://reel-ref-try-the-look.vercel.app/assets/inter-600.woff2

## Behaviour (summary — follow full brief measurements)

- Desktop ring: 3D carousel, data-style=ring, autoplay 5000ms, header 88px, panel 380px
- Phone classic diagonal line, data-mheight-vh=109
- Bundle: ~~$547.00~~ **$492.30** (10% off 3 pieces)
- Pins, View look popup, styling bag localStorage `runway-styling-bag-v3`
- Custom Drag/View cursor on fine pointers

## Looks

01 The City Edit — Air Jordan 12 Retro · Tshirt · Sweatshirt
02 Gallery Opening — Tatum 5 Orbit · Hoodie Black (New) · Tshirt
03 Gallery Opening — Sweatshirt Plus · Tatum 5 Orbit (New) · Tshirt
04 Studio Day — Hoodie Black · Air Jordan 12 Retro · Tshirt
05 Studio Day — Sweatshirt · Tatum 5 Orbit · Tshirt
06 Studio Day — Hoodie · Luka 5 · Tshirt

Shop source: https://nike-makknzjs.myshopify.com/pages/runway

Categories: Ecommerce, Hero, Animations, Landing Page, Creative
