# HERO PROMPT — "VELL" character creator / virtual styling studio (exact recreation)

Build one self-contained `index.html` with inline `<style>` and `<script>`, no framework and no build step. It must recreate the "VELL — Create a Character" interactive hero exactly as specified.

**What it is:** a full-screen virtual-character styling studio.
- A photoreal young Korean woman stands full-body in the centre of an almost empty, cool-daylight city loft.
- Frosted dark-glass UI panels float around her: top step-tab bar (DNA / BODY / STYLE / PERSONALITY / STORY), profile card, vertical style menu, OUTFITS panel, Undo / Redo / Pose / Reset bar, Realism slider, Filter dropdown, SAVE TO LIBRARY button.

**Interaction:** outfit swap with top-to-bottom reveal wipe + glowing scan line; filters; realism; tabs; undo/redo history.

## Assets

CDN = `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/`
Helper: `https://images.higgs.ai/?default=1&output=webp&url=` + encodeURIComponent(CDN+file) + `&w=` + w + `&q=85`

Background loft (w=2400):
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034551_6394b127-5366-40a8-9c82-3c416f1161f1.png&w=2400&q=85

Model cut-outs (w=1000), looks 0–7:
1. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034542_a6430ecf-9862-412c-8ef6-5745115bd78c.png&w=1000&q=85 — Denim Maxi
2. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034738_73282737-acc8-41e9-a822-96c663e27b6c.png&w=1000&q=85 — Cloud Set
3. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034742_9a8a92fd-79ae-4163-9ffa-14ae2a68717f.png&w=1000&q=85 — Library Knit
4. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034735_4e352e03-ad2b-44d1-9fcf-4b5b9454dc55.png&w=1000&q=85 — Lilac Run
5. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034738_aeb8ea57-6399-4f3c-b54a-4a57d0bd971e.png&w=1000&q=85 — Satin Night
6. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034736_aace5c5f-8c14-4b00-83ba-744dbad2e337.png&w=1000&q=85 — Night Suit
7. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034735_3d9fb69e-b4e0-49f7-a2d4-e592bd616c27.png&w=1000&q=85 — Sage Slip
8. https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261112_034740_3e3c5ad7-689b-46a2-8e09-c7d36a569b9c.png&w=1000&q=85 — Bomber Cargo

## Fonts / tokens

Figtree 300–600, Syne 700–800. Glass panels `rgba(38,36,40,.30)`, stage 1600×900 scaled to viewport. Outfit wipe 1.05s top-to-bottom with scan line.

Categories: Hero, Animations, Creative, Landing Page, AI
