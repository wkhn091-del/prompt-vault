# VirtualFit: Spatial Try-On Arc (exact recreation prompt)

Build a single-screen, visionOS-style virtual try-on hero called **VirtualFit**.

- **Scene:** a softly blurred bright living room fills the screen. A man stands in the centre, cut off at mid-thigh, in front of a huge ghosted `FIT` word.
- **Garment arc:** frosted-glass garment cards curve around him in a 3D arc. They recede, shrink, tilt and blur toward the edges and bob gently. You can drag, flick, scroll, use the arrow keys or buttons, or click a card.
- **Try-on:** when the arc settles on a garment, a glowing horizontal scan line sweeps down the model with a faint scan-line grid and reveals him wearing that garment.
- **Controls:** a glass pill tab bar sits at the top, a glass tool rail on the left, and a glass buy card at the bottom (thumbnail, rolling name and price, size chips and colour dots).
- **Cursor:** a 58px glass cursor reads `TRY ON` over cards and `DRAG` over empty space.

Use plain HTML, CSS and vanilla JS in one file, with no libraries. Reproduce every value, string, timing and URL exactly.

---

## 1. Page basics

- `<html lang="en">`, title `VirtualFit: Spatial Try-On`, viewport `width=device-width,initial-scale=1`.
- **Font:** Inter 400–900 from Google Fonts (or embedded base64 woff2).
- **Reset / body:** `#e9e4dc` background, white text, Inter, overflow hidden, antialiased, user-select none. On `(pointer:fine)`, cursor none.
- **CSS variables:** `--ease:cubic-bezier(.2,.8,.2,1)`, `--sans:"Inter",system-ui,-apple-system,sans-serif`, `--MH:min(78vh,62vw)` (`min(62vh,128vw)` below 768px), `--CW` set by JS, plus `--room`, `--model`, `--garm`.

## 2. Assets (exact URLs)

| Variable | URL |
|---|---|
| `--room` | `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261104_080623_c94c85a3-23d5-4a0c-afff-41be1b5b8191.png&w=2400&q=85` |
| `--model` | `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261104_080717_e02cb856-b812-4c9b-9b86-8a741c7f65eb.png&w=2688&q=85` |
| `--garm` | `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261104_080719_f5a4cca2-cf42-4957-ab3b-ddec34d2b71a.png&w=2048&q=85` |

**Crops:** Model each figure 524×1360 → `background-size:513% 111.76%`, `background-position-y:100%`. Garments each 640×640 → `background-size:320% 212.5%`.

## 3. Data

```js
const ITEMS=[
  {n:"Basic T-shirt", p:45,  g:[1.14,3.06],  m:.37,   c:[["White","#f4f2ee"],["Ash","#c9c7c2"],["Charcoal","#3b3c3f"],["Navy","#27324d"]]},
  {n:"Basic Sweater", p:105, g:[49.7,1.39],  m:25.0,  c:[["White","#f6f4ef"],["Oat","#ddd3c2"],["Sage","#b9c2ae"],["Black","#1f1f21"]]},
  {n:"Linen Shirt",   p:95,  g:[98.2,3.33],  m:49.86, c:[["White","#f7f6f1"],["Sand","#d9ccb4"],["Sky","#bcd0e2"],["Olive","#717556"]]},
  {n:"Grey Hoodie",   p:110, g:[1.14,93.3],  m:74.77, c:[["Heather","#a9a9a8"],["Bone","#e6e1d6"],["Forest","#33463a"],["Black","#1f1f21"]]},
  {n:"Ringer Tee",    p:55,  g:[49.7,95.3],  m:99.35, c:[["White / Black","#f4f2ee"],["Cream / Navy","#efe6d3"],["Grey / Red","#c9c7c2"],["White / Green","#e9efe8"]]},
];
```

10 cards (two copies of 5 items) for seamless loop.

## 4. Layers

1. `.room` fixed inset -3%, blur 2.5px saturate 1.05, scale 1.08, warm radial overlay.
2. `.ghost` FIT letters Inter 900 at MH×.42, rgba white .3 with stroke.
3. `.glass` frosted material: gradient fill, blur 22px saturate 1.5, white border, inset/outer shadows.
4. Tabs: Tops/Bottoms/Outerwear/Shoes/Accessories with sliding white pill.
5. Rail: 4 round buttons (tee active, cart, calendar, profile).
6. Stage arc cards CW × CW×1.42, garment + name + price + sheen.
7. Model: #mCur, #mNext clip wipe, .grid scan lines, .scan glowing line.
8. Arrows 46px glass (hidden on phones).
9. Buy card: thumb, rolling name/price, size chips S–XL, colour dots.
10. Cursor 58px: TRY ON / DRAG / btn states.

CW = min(14.8vw, 33vh) or min(30vw, 170px) below 768px.

## 5. Arc maths

pos/target spring ×.11. Offset u = mod(i−pos+5,10)−5. XS table for horizontal. Behind model a<1 shrink/opacity; else scale/blur/rotateY. Bob sin. Intro ease cubic. Parallax on room and ghost. Settle triggers try-on.

## 6. Try-on scan 950ms cubic-bezier(.65,0,.35,1)

Clip #mNext top-to-bottom, grid sweep, scan line, settle scale. On end copy to #mCur.

## 7–9. Buy rolls, input (drag/flick/wheel/keys/tabs), phones ≤767px, reduced motion

As specified: drag velocity flick ×3.2, wheel step ±1, tabs lap +5, phone rail bottom-left, reduced motion snaps.

Categories: Hero, Ecommerce, Animations, Creative, Landing Page
