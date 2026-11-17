export type BlendySheets = {
  berry: string;
  kiwi: string;
  banana: string;
  strawberry: string;
};

const FLAVOURS = [
  {
    id: "berry",
    word: "Berry",
    color: "#C2B0DC",
    bottle: { x: 518, y: 138, w: 372, box: [233, 60, 598, 917] as const },
    fruit: [
      { item: 2, x: 383, y: 178, w: 104, rot: 0, mirror: false, layer: "fruit", box: [265, 1230, 579, 572] as const },
      { item: 3, x: 960, y: 232, w: 118, rot: 0, mirror: false, layer: "fruit", box: [1192, 1192, 626, 641] as const },
      { item: 1, x: 295, y: 478, w: 129, rot: -8, mirror: false, layer: "fruit", box: [1209, 272, 569, 573] as const },
      { item: 1, x: 1247, y: 455, w: 123, rot: 15, mirror: false, layer: "fruit", box: [1209, 272, 569, 573] as const },
      { item: 2, x: 968, y: 590, w: 110, rot: 30, mirror: false, layer: "fruit", box: [265, 1230, 579, 572] as const },
      { item: 1, x: -15, y: 590, w: 255, rot: 0, mirror: false, layer: "corner", box: [1209, 272, 569, 573] as const },
      { item: 3, x: 1282, y: 40, w: 200, rot: 0, mirror: false, layer: "corner", box: [1192, 1192, 626, 641] as const },
    ],
  },
  {
    id: "kiwi",
    word: "Kiwi",
    color: "#B4D58A",
    bottle: { x: 504, y: 135, w: 403, box: [217, 90, 610, 874] as const },
    fruit: [
      { item: 2, x: 376, y: 170, w: 144, rot: -150, mirror: true, layer: "fruit", box: [250, 1197, 619, 522] as const },
      { item: 3, x: 960, y: 228, w: 152, rot: 0, mirror: false, layer: "fruit", box: [1200, 1186, 633, 650] as const },
      { item: 1, x: 303, y: 460, w: 168, rot: 0, mirror: false, layer: "fruit", box: [1204, 257, 619, 601] as const },
      { item: 2, x: 1187, y: 462, w: 148, rot: -25, mirror: false, layer: "fruit", box: [250, 1197, 619, 522] as const },
      { item: 2, x: 946, y: 606, w: 150, rot: 10, mirror: true, layer: "fruit", box: [250, 1197, 619, 522] as const },
      { item: 1, x: -10, y: 575, w: 260, rot: 0, mirror: false, layer: "corner", box: [1204, 257, 619, 601] as const },
      { item: 3, x: 1285, y: 30, w: 200, rot: 0, mirror: false, layer: "corner", box: [1200, 1186, 633, 650] as const },
    ],
  },
  {
    id: "banana",
    word: "Banana",
    color: "#F3DA8A",
    bottle: { x: 512, y: 135, w: 383, box: [194, 76, 579, 873] as const },
    fruit: [
      { item: 1, x: 387, y: 147, w: 123, rot: 0, mirror: false, layer: "fruit", box: [1205, 228, 596, 597] as const },
      { item: 2, x: 970, y: 223, w: 136, rot: -10, mirror: true, layer: "fruit", box: [230, 1181, 624, 648] as const },
      { item: 3, x: 298, y: 483, w: 132, rot: 15, mirror: false, layer: "fruit", box: [1193, 1182, 646, 659] as const },
      { item: 2, x: 1245, y: 462, w: 150, rot: 20, mirror: false, layer: "fruit", box: [230, 1181, 624, 648] as const },
      { item: 3, x: 950, y: 582, w: 130, rot: -12, mirror: false, layer: "fruit", box: [1193, 1182, 646, 659] as const },
      { item: 3, x: 0, y: 585, w: 235, rot: 0, mirror: false, layer: "corner", box: [1193, 1182, 646, 659] as const },
      { item: 1, x: 1280, y: 30, w: 190, rot: 0, mirror: false, layer: "corner", box: [1205, 228, 596, 597] as const },
    ],
  },
  {
    id: "strawberry",
    word: "Strawberry",
    color: "#F2AFC0",
    bottle: { x: 512, y: 135, w: 386, box: [226, 88, 594, 887] as const },
    fruit: [
      { item: 1, x: 372, y: 142, w: 128, rot: 0, mirror: false, layer: "fruit", box: [1190, 216, 561, 653] as const },
      { item: 2, x: 955, y: 225, w: 117, rot: 20, mirror: false, layer: "fruit", box: [257, 1168, 604, 662] as const },
      { item: 3, x: 290, y: 455, w: 140, rot: -10, mirror: false, layer: "fruit", box: [1240, 1169, 632, 686] as const },
      { item: 3, x: 1250, y: 432, w: 135, rot: 15, mirror: false, layer: "fruit", box: [1240, 1169, 632, 686] as const },
      { item: 2, x: 962, y: 558, w: 146, rot: -15, mirror: false, layer: "fruit", box: [257, 1168, 604, 662] as const },
      { item: 1, x: -10, y: 555, w: 245, rot: 0, mirror: false, layer: "corner", box: [1190, 216, 561, 653] as const },
      { item: 1, x: 1285, y: 35, w: 200, rot: 20, mirror: false, layer: "corner", box: [1190, 216, 561, 653] as const },
    ],
  },
] as const;

function cropStyle(box: readonly [number, number, number, number], w: number, sheet: string) {
  const [bx, by, bw, bh] = box;
  const s = w / bw;
  return `width:${w}px;height:${bh * s}px;background-image:url('${sheet}');background-repeat:no-repeat;background-size:${2048 * s}px ${2048 * s}px;background-position:${-bx * s}px ${-by * s}px`;
}

/** Full-fidelity Blendy hero as a self-contained HTML document (1440×900 design). */
export function buildBlendyFullPreviewHtml(sheets: BlendySheets): string {
  const slides = FLAVOURS.map((f, i) => {
    const sheet = sheets[f.id as keyof BlendySheets];
    const bottle = cropStyle(f.bottle.box, f.bottle.w, sheet);
    const piece = (p: (typeof f.fruit)[number], pi: number) => {
      const style = cropStyle(p.box, p.w, sheet);
      const mirror = p.mirror ? "scaleX(-1)" : "none";
      return `<div class="piece" style="left:${p.x}px;top:${p.y}px;transform:${mirror}"><div class="bob" data-rot="${p.rot}" style="${style};animation-duration:${(3.2 + (pi % 5) * 0.35).toFixed(2)}s;animation-delay:-${(pi * 0.7).toFixed(2)}s"></div></div>`;
    };
    const fruitHtml = f.fruit
      .filter((p) => p.layer === "fruit")
      .map((p, pi) => piece(p, pi))
      .join("");
    const cornerHtml = f.fruit
      .filter((p) => p.layer === "corner")
      .map((p, pi) => piece(p, pi + 5))
      .join("");

    return `<section class="slide" data-i="${i}" style="background:${f.color};${i === 0 ? "" : "visibility:hidden"}">
  <div class="frame">
    <div class="layer word"><div class="word-el" data-word="${f.word}">${f.word}</div></div>
    <div class="layer shadow">
      <i style="left:345px;top:650px;width:170px;height:24px"></i>
      <i style="left:720px;top:708px;width:320px;height:30px"></i>
      <i style="left:1318px;top:638px;width:160px;height:22px"></i>
      <i style="left:1045px;top:760px;width:150px;height:22px"></i>
    </div>
    <div class="layer bottle"><div class="bot" style="left:${f.bottle.x}px;top:${f.bottle.y}px;${bottle}"></div></div>
    <div class="layer fruit">${fruitHtml}</div>
    <div class="layer corner">${cornerHtml}</div>
  </div>
</section>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Blendy — Real fruit smoothies</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1440px;height:900px;overflow:hidden;background:#C2B0DC;font-family:Poppins,system-ui,sans-serif;color:#fff;-webkit-font-smoothing:antialiased;user-select:none}
.stage{position:relative;width:1440px;height:900px;overflow:hidden}
.slide{position:absolute;inset:0;overflow:hidden}
.frame{position:absolute;left:0;top:0;width:1440px;height:900px}
.layer{position:absolute;inset:0;will-change:transform}
.word{display:grid;place-items:center;pointer-events:none}
.word-el{font-weight:700;line-height:1;white-space:nowrap;letter-spacing:.005em;font-size:445px;position:absolute;left:50%;transform:translateX(-50%);top:181px}
.shadow i{position:absolute;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(closest-side,rgba(60,40,80,.22),transparent);filter:blur(4px)}
.bot{position:absolute}
.piece{position:absolute}
.layer.corner .bob{filter:blur(9px)}
.bob{transform-origin:center;animation:bob ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(-7px) rotate(calc(var(--r,0deg) - 3deg))}to{transform:translateY(7px) rotate(calc(var(--r,0deg) + 3deg))}}
.ui{position:absolute;inset:0;z-index:10;pointer-events:none}
.ui a,.ui button{pointer-events:auto;background:none;border:0;color:#fff;font:inherit;cursor:pointer;text-shadow:0 1px 6px rgba(90,70,40,.18)}
.header{position:absolute;left:50px;right:50px;top:26px;height:50px;display:flex;align-items:center}
.logo{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:51px;letter-spacing:-.02em;line-height:1;text-decoration:none}
.tabs{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:88px}
.tabs button{font-weight:500;font-size:21px;padding:6px 0;position:relative}
.underline{position:absolute;height:2px;border-radius:2px;background:#fff;bottom:-2px;left:0;width:40px;transition:transform .6s cubic-bezier(.65,0,.35,1),width .6s cubic-bezier(.65,0,.35,1)}
.account{margin-left:auto;display:flex;gap:22px;font-weight:500;font-size:21px}
.account span{opacity:.9}
.shop{position:absolute;left:50%;bottom:36px;transform:translateX(-50%);font-weight:600;font-size:21px;letter-spacing:.2em;padding:10px 16px;text-decoration:none}
.arrow{position:absolute;bottom:30px;width:52px;height:52px;display:grid;place-items:center}
.arrow.prev{left:36px}.arrow.next{right:36px}
.arrow svg{width:28px;height:28px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
@media (prefers-reduced-motion:reduce){.bob{animation:none!important}}
</style>
</head><body>
<div class="stage" id="stage">${slides}
  <div class="ui">
    <div class="header">
      <a class="logo" href="#">Blendy</a>
      <div class="tabs" id="tabs">
        <button type="button" data-i="0" aria-current="true">Berry</button>
        <button type="button" data-i="1">Kiwi</button>
        <button type="button" data-i="2">Banana</button>
        <button type="button" data-i="3">Strawberry</button>
        <div class="underline" id="underline"></div>
      </div>
      <div class="account"><a href="#">Cart</a><span>|</span><a href="#">Register</a></div>
    </div>
    <a class="shop" href="#">SHOP NOW</a>
    <button class="arrow prev" type="button" aria-label="Previous flavour" id="prev"><svg viewBox="0 0 28 28"><path d="M24 14H4M12 6l-8 8 8 8"/></svg></button>
    <button class="arrow next" type="button" aria-label="Next flavour" id="next"><svg viewBox="0 0 28 28"><path d="M4 14h20M16 6l8 8-8 8"/></svg></button>
  </div>
</div>
<script>
(function(){
  const COVER=[0,0.006,0.012,0.023,0.047,0.07,0.105,0.158,0.246,0.55,0.825,0.9,0.94,0.956,0.975,1];
  const CT=[0,0.031,0.134,0.206,0.278,0.34,0.412,0.485,0.546,0.583,0.62,0.69,0.79,0.85,0.93,1];
  const FACTORS={word:0.40,shadow:0.30,bottle:0.15,fruit:0.55,corner:0.75};
  const slides=[...document.querySelectorAll('.slide')];
  const tabs=[...document.querySelectorAll('#tabs button')];
  const underline=document.getElementById('underline');
  let cur=0, busy=false, lastInteract=0, autoTimer=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.bob').forEach(el=>{
    const r=el.getAttribute('data-rot')||'0';
    el.style.setProperty('--r', r+'deg');
  });

  function fitWords(){
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d');
    slides.forEach(slide=>{
      const el=slide.querySelector('.word-el');
      if(!el||!ctx) return;
      const word=el.dataset.word;
      ctx.font='700 100px Poppins';
      const m=ctx.measureText(word);
      const ink=((m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||m.width));
      let F=445, ls=0.005;
      const inkAt445=ink*(445/100);
      if(inkAt445>1330){
        ls=-0.035;
        ctx.font='700 100px Poppins';
        // approximate with tighter spacing by targeting 1400
        F=Math.min(445, 1400/(ink/100));
      }
      const baseline=403.5+0.698*F/2;
      el.style.fontSize=F+'px';
      el.style.letterSpacing=ls+'em';
      el.style.top=(baseline-0.85*F)+'px';
    });
  }

  function moveUnderline(i){
    const btn=tabs[i];
    underline.style.width=btn.offsetWidth+'px';
    underline.style.transform='translateX('+btn.offsetLeft+'px)';
    tabs.forEach((t,ti)=>t.setAttribute('aria-current', ti===i?'true':'false'));
  }

  function coverAt(t){
    if(t<=0) return 0; if(t>=1) return 1;
    let i=0; while(i<CT.length-1 && CT[i+1]<t) i++;
    const t0=CT[i], t1=CT[i+1], c0=COVER[i], c1=COVER[i+1];
    const k=(t-t0)/Math.max(1e-6,t1-t0);
    const s=k*k*(3-2*k);
    return c0+(c1-c0)*s;
  }
  function easeOutQuad(x){return 1-(1-x)*(1-x)}

  function go(to, dir){
    if(busy||to===cur) return;
    if(reduced){
      slides[cur].style.visibility='hidden';
      slides[to].style.visibility='visible';
      slides[to].style.zIndex=2;
      cur=to; moveUnderline(cur); return;
    }
    busy=true;
    const A=slides[cur], B=slides[to];
    const fw=1440;
    B.style.visibility='visible'; B.style.zIndex=1; A.style.zIndex=2;
    const layersA=[...A.querySelectorAll('.layer')];
    const layersB=[...B.querySelectorAll('.layer')];
    const t0=performance.now();
    function frame(now){
      const t=Math.min(1,(now-t0)/970);
      const c=coverAt(t);
      if(dir>0) A.style.clipPath='inset(0 '+(c*100)+'% 0 0)';
      else A.style.clipPath='inset(0 0 0 '+(c*100)+'%)';
      layersA.forEach(L=>{ L.style.transform='translateX('+(-dir*c*0.14*fw)+'px)'; });
      const k=Math.max(0, Math.min(1, easeOutQuad((t-0.5)/0.42)));
      layersB.forEach(L=>{
        const name=[...L.classList].find(n=>FACTORS[n])||'fruit';
        const f=FACTORS[name]||0.4;
        L.style.transform='translateX('+(dir*(1-k)*f*fw)+'px)';
      });
      if(t<1 || k<1){
        if(t>=1){
          // keep animating B settle a bit past 970ms
          const t2=Math.min(1.4,(now-t0)/970);
          const k2=Math.max(0, Math.min(1, easeOutQuad((t2-0.5)/0.42)));
          layersB.forEach(L=>{
            const name=[...L.classList].find(n=>FACTORS[n])||'fruit';
            const f=FACTORS[name]||0.4;
            L.style.transform='translateX('+(dir*(1-k2)*f*fw)+'px)';
          });
          if(k2<1){ requestAnimationFrame(frame); return; }
        } else { requestAnimationFrame(frame); return; }
      }
      A.style.visibility='hidden'; A.style.clipPath=''; A.style.zIndex='';
      layersA.forEach(L=>L.style.transform='');
      layersB.forEach(L=>L.style.transform='');
      B.style.zIndex=2;
      cur=to; busy=false; moveUnderline(cur);
    }
    requestAnimationFrame(frame);
    moveUnderline(to);
  }

  function next(){ go((cur+1)%4, +1); }
  function prev(){ go((cur+3)%4, -1); }
  function interact(){ lastInteract=Date.now(); }

  tabs.forEach(btn=>{
    btn.addEventListener('click',()=>{
      interact();
      const i=+btn.dataset.i;
      go(i, i>cur?+1:-1);
    });
  });
  document.getElementById('next').onclick=()=>{interact();next()};
  document.getElementById('prev').onclick=()=>{interact();prev()};
  window.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){interact();next()}
    if(e.key==='ArrowLeft'){interact();prev()}
  });

  let px=0,py=0;
  const stage=document.getElementById('stage');
  stage.addEventListener('pointerdown',e=>{px=e.clientX;py=e.clientY});
  window.addEventListener('pointerup',e=>{
    const dx=e.clientX-px, dy=e.clientY-py;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)){
      interact();
      if(dx<0) next(); else prev();
    }
  });

  function tick(){
    if(document.visibilityState==='visible' && Date.now()-lastInteract>6000 && !busy) next();
  }
  autoTimer=setInterval(tick,2600);

  document.fonts.ready.then(()=>{
    fitWords();
    moveUnderline(0);
    if(!reduced){
      const berry=slides[0];
      ['word','shadow','bottle','fruit','corner'].forEach((name)=>{
        const L=berry.querySelector('.layer.'+name);
        if(!L) return;
        const f=FACTORS[name]||0.4;
        L.animate(
          [{transform:'translateX('+(f*1440)+'px)'},{transform:'translateX(0)'}],
          {duration:900, easing:'cubic-bezier(0.22, 0.8, 0.3, 1)', fill:'forwards'}
        );
      });
    }
  });
})();
</script>
</body></html>`;
}
