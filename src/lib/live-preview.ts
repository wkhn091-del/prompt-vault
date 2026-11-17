/** Extract first hex color mentioned as a backdrop / brand color. */
export function extractBackdropColor(promptText: string): string | null {
  const labeled = promptText.match(
    /(?:backdrop|background|body background|lilac|mint|pastel)[^\n#]{0,40}(#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3}))/i,
  );
  if (labeled?.[1]) return labeled[1].toUpperCase();

  const tableBerry = promptText.match(/Berry\s*\|\s*(#[0-9A-Fa-f]{6})/i);
  if (tableBerry?.[1]) return tableBerry[1].toUpperCase();

  const any = promptText.match(/#([0-9A-Fa-f]{6})\b/);
  return any ? `#${any[1].toUpperCase()}` : null;
}

export function buildBlendyLivePreviewHtml(sheetUrl: string): string {
  // Berry sheet 2048² crops from the Blendy prompt
  const bottle = { bx: 233, by: 60, bw: 598, bh: 917, w: 120 };
  const fruit = [
    { bx: 265, by: 1230, bw: 579, bh: 572, w: 42, x: 18, y: 22, rot: 0, d: 3.6 },
    { bx: 1209, by: 272, bw: 569, bh: 573, w: 48, x: 12, y: 52, rot: -8, d: 4.2 },
    { bx: 1192, by: 1192, bw: 626, bh: 641, w: 44, x: 72, y: 28, rot: 8, d: 3.9 },
  ];

  const crop = (bx: number, by: number, bw: number, bh: number, w: number) => {
    const s = w / bw;
    return {
      width: `${w}px`,
      height: `${Math.round(bh * s)}px`,
      backgroundSize: `${Math.round(2048 * s)}px ${Math.round(2048 * s)}px`,
      backgroundPosition: `${Math.round(-bx * s)}px ${Math.round(-by * s)}px`,
    };
  };

  const b = crop(bottle.bx, bottle.by, bottle.bw, bottle.bh, bottle.w);
  const fruits = fruit
    .map((f, i) => {
      const c = crop(f.bx, f.by, f.bw, f.bh, f.w);
      return `<div class="fruit f${i}" style="left:${f.x}%;top:${f.y}%;width:${c.width};height:${c.height};--rot:${f.rot}deg;--dur:${f.d}s;background-image:url('${sheetUrl}');background-size:${c.backgroundSize};background-position:${c.backgroundPosition};background-repeat:no-repeat"></div>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#C2B0DC}
.stage{position:relative;width:100%;height:100%;display:grid;place-items:center;overflow:hidden}
.word{position:absolute;inset:0;display:grid;place-items:center;font:700 clamp(48px,18vw,96px)/1 Poppins,system-ui,sans-serif;color:#fff;letter-spacing:.005em;user-select:none;pointer-events:none;text-shadow:0 1px 6px rgba(90,70,40,.18)}
.bottle{position:relative;z-index:2;width:${b.width};height:${b.height};background-image:url('${sheetUrl}');background-size:${b.backgroundSize};background-position:${b.backgroundPosition};background-repeat:no-repeat;filter:drop-shadow(0 10px 18px rgba(60,40,80,.25))}
.fruit{position:absolute;z-index:3;transform-origin:center;animation:bob var(--dur) ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(-6px) rotate(calc(var(--rot) - 3deg))}to{transform:translateY(6px) rotate(calc(var(--rot) + 3deg))}}
@media (prefers-reduced-motion:reduce){.fruit{animation:none}}
</style></head><body><div class="stage"><div class="word">Berry</div><div class="bottle"></div>${fruits}</div></body></html>`;
}

/** Generic animated card when we only have an image + backdrop. */
export function buildGenericLivePreviewHtml(opts: {
  imageUrl: string;
  backdrop: string;
  label?: string;
}): string {
  const label = (opts.label ?? "").replace(/[<>&"]/g, "");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:${opts.backdrop}}
.stage{position:relative;width:100%;height:100%;display:grid;place-items:center}
.glow{position:absolute;inset:18% 22%;border-radius:40%;background:radial-gradient(circle,rgba(255,255,255,.22),transparent 70%);filter:blur(12px)}
.img{position:relative;z-index:2;width:min(46%,180px);height:auto;object-fit:contain;filter:drop-shadow(0 12px 24px rgba(0,0,0,.28));animation:float 4s ease-in-out infinite alternate}
.label{position:absolute;inset:0;display:grid;place-items:center;font:700 clamp(40px,16vw,84px)/1 system-ui,sans-serif;color:rgba(255,255,255,.92);letter-spacing:.02em;pointer-events:none;user-select:none}
@keyframes float{from{transform:translateY(-8px) scale(1)}to{transform:translateY(8px) scale(1.03)}}
@media (prefers-reduced-motion:reduce){.img{animation:none}}
</style></head><body><div class="stage"><div class="glow"></div>${label ? `<div class="label">${label}</div>` : ""}<img class="img" src="${opts.imageUrl}" alt=""/></div></body></html>`;
}
