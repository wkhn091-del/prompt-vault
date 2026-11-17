const BASE = "https://reel-ref-try-the-look.vercel.app/assets";

const LOOKS = [
  { name: "The City Edit", src: `${BASE}/model-1-640.webp` },
  { name: "Gallery Opening", src: `${BASE}/model-5-640.webp` },
  { name: "Gallery Opening", src: `${BASE}/model-4-640.webp` },
  { name: "Studio Day", src: `${BASE}/model-6-640.webp` },
  { name: "Studio Day", src: `${BASE}/model-3-640.webp` },
  { name: "Studio Day", src: `${BASE}/model-2-640.webp` },
] as const;

/** Lightweight 1440×900 runway card preview (real cut-outs, ring autoplay). */
export function buildRunwayLivePreviewHtml(): string {
  const figures = LOOKS.map(
    (l, i) =>
      `<div class="fig" data-i="${i}"><img src="${l.src}" alt="${l.name}" draggable="false" decoding="async"/></div>`,
  ).join("");

  const ticks = LOOKS.map(
    (l, i) =>
      `<button type="button" class="tick" data-i="${i}" aria-current="${i === 0 ? "true" : "false"}"><i></i><span>0${i + 1}</span></button>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Try the Look — Runway</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1440px;height:900px;overflow:hidden;background:#fff;color:#151413;font-family:Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;user-select:none}
.stage{position:relative;width:1440px;height:900px;background:#fff;overflow:hidden}
.head{position:absolute;left:56px;top:44px;z-index:5;max-width:640px}
.head h1{font-weight:400;font-size:46px;letter-spacing:-.02em;line-height:1}
.head p{margin-top:12px;font-size:12px;line-height:1.55;color:#66625c;max-width:46ch}
.ring{position:absolute;inset:0;perspective:1650px}
.fig{position:absolute;left:50%;bottom:34px;width:auto;height:var(--mh,720px);transform-origin:50% 100%;will-change:transform,opacity,filter;opacity:0;pointer-events:none}
.fig img{display:block;height:100%;width:auto;object-fit:contain;object-position:50% 100%}
.fig.is-front{opacity:1;z-index:20}
.controls{position:absolute;left:44px;right:44px;bottom:30px;display:flex;align-items:center;gap:20px;z-index:6}
.icon{width:44px;height:44px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:#151413}
.icon svg{width:26px;height:14px;stroke:currentColor;fill:none;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}
.ticks{flex:1;display:flex;gap:6px;min-width:0}
.tick{flex:0 1 44px;min-width:14px;height:44px;border:0;background:none;display:flex;flex-direction:column;justify-content:center;gap:9px;color:#66625c;cursor:pointer;text-align:left;padding:0;transition:flex-basis .8s cubic-bezier(.2,1.25,.3,1),color .3s}
.tick[aria-current="true"]{flex:0 0 190px;color:#151413}
.tick i{display:block;height:2px;width:100%;background:color-mix(in srgb,#151413 14%,transparent);position:relative;overflow:hidden}
.tick i::after{content:"";position:absolute;inset:0;background:#151413;transform:scaleX(0);transform-origin:left;transition:transform 1s cubic-bezier(.16,1,.3,1)}
.tick.is-past i::after{transform:scaleX(1);opacity:.35}
.tick[aria-current="true"] i::after{transform:scaleX(1);opacity:1}
.tick[aria-current="true"].is-run i::after{animation:fill 5s linear forwards}
.tick span{font-size:10px;letter-spacing:.12em;font-variant-numeric:tabular-nums;white-space:nowrap}
@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.badge{position:absolute;right:56px;top:48px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#66625c;z-index:5}
@media (prefers-reduced-motion:reduce){.tick[aria-current="true"].is-run i::after{animation:none;transform:scaleX(1)}}
</style>
</head><body>
<div class="stage" id="stage">
  <div class="head"><h1>Try the Look.</h1><p>Six looks, styled head to toe. Tap a pin to see the piece.</p></div>
  <div class="badge" id="label">01&nbsp;&nbsp;The City Edit</div>
  <div class="ring" id="ring">${figures}</div>
  <div class="controls">
    <button class="icon" type="button" id="prev" aria-label="Previous look"><svg viewBox="0 0 26 14"><path d="M25 7H1M7 1L1 7l6 6"/></svg></button>
    <div class="ticks" id="ticks">${ticks}</div>
    <button class="icon" type="button" id="next" aria-label="Next look"><svg viewBox="0 0 26 14"><path d="M1 7h24M19 1l6 6-6 6"/></svg></button>
  </div>
</div>
<script>
(function(){
  const LOOKS=${JSON.stringify(LOOKS.map((l) => l.name))};
  const figs=[...document.querySelectorAll('.fig')];
  const ticks=[...document.querySelectorAll('.tick')];
  const label=document.getElementById('label');
  const W=1440, H=900, N=6;
  const cx=W*0.5, R=W*0.62, P=W*1.65, floor=H-34, horizon=H*0.36, fs=1.08;
  const modelH=Math.max(200, Math.round((H-34-18)/fs));
  document.documentElement.style.setProperty('--mh', modelH+'px');
  let index=0, target=0, cur=-1.15, vel=0, playing=true, timer=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) cur=0;

  function put(el, x, bottom, scale, opacity, blur, z){
    el.style.transform='translate3d('+x+'px,'+(-bottom)+'px,0) translateX(-50%) scale('+scale+')';
    el.style.opacity=opacity.toFixed(3);
    el.style.zIndex=String(z);
    el.style.filter=blur>0.05?'blur('+blur.toFixed(1)+'px)':'';
    el.style.visibility=opacity<0.01?'hidden':'visible';
    el.classList.toggle('is-front', opacity>0.85 && scale>1.02);
  }

  function render(){
    const unit=Math.max(120, 0.3*W);
    const step=Math.PI*2/12;
    for(let a=0;a<N;a++){
      const el=figs[a];
      let phi=((a-cur)*step)%(Math.PI*2);
      if(phi>Math.PI) phi-=Math.PI*2;
      if(phi<-Math.PI) phi+=Math.PI*2;
      const z=R*(1-Math.cos(phi));
      const persp=P/(P+z);
      const sl=Math.abs(phi)/step;
      const scale=persp*(1+(fs-1)*Math.max(0,Math.min(1,1-sl)));
      const x=cx+R*Math.sin(phi)*persp;
      const feet=horizon+(floor-horizon)*persp;
      const bottom=H-feet;
      const blur=sl<=1?1.8*sl:Math.min(1.8+(sl-1)*2,6.5);
      let opacity=Math.max(0,Math.min(1,(Math.cos(phi)+0.55)/0.3));
      if(Math.abs(cur-target)<0.001 && sl<0.02) opacity=1;
      put(el,x,bottom,scale,opacity,blur,Math.round(scale*1000));
    }
  }

  function settle(dt){
    const K=95, C=2*Math.sqrt(K), h=Math.min(0.034,dt);
    for(let i=0;i<3;i++){
      const acc=-K*(cur-target)-C*vel;
      vel+=acc*h; cur+=vel*h;
    }
    if(Math.abs(cur-target)<=0.0005 && Math.abs(vel)<=0.0005){ cur=target; vel=0; }
  }

  let last=performance.now();
  function frame(now){
    const dt=(now-last)/1000; last=now;
    if(!reduced) settle(dt||1/60);
    else cur=target;
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function setIndex(i){
    index=((i%N)+N)%N;
    label.textContent=String(index+1).padStart(2,'0')+'\\u00a0\\u00a0'+LOOKS[index];
    ticks.forEach((t,ti)=>{
      t.setAttribute('aria-current', ti===index?'true':'false');
      t.classList.toggle('is-past', ti<index);
      t.classList.remove('is-run');
    });
    void ticks[index].offsetWidth;
    if(playing && !reduced) ticks[index].classList.add('is-run');
    restart();
  }

  function moveTo(T){
    target=T;
    setIndex(Math.round(T));
  }
  function next(){ moveTo(Math.round(target)+1); }
  function prev(){ moveTo(Math.round(target)-1); }

  function restart(){
    clearTimeout(timer);
    if(!playing || reduced) return;
    timer=setTimeout(()=>{ if(playing) next(); }, 5000);
  }

  document.getElementById('next').onclick=()=>next();
  document.getElementById('prev').onclick=()=>prev();
  ticks.forEach(t=>t.addEventListener('click',()=>{
    const i=+t.dataset.i;
    let d=((i-index)%N+N)%N;
    if(d>3) d-=N;
    moveTo(Math.round(target)+d);
  }));

  setIndex(0);
})();
</script>
</body></html>`;
}
