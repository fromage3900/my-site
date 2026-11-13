/* Subtle desktop parallax only: no canvas, dependencies, or user tracking. */
(() => {
"use strict";
const canMove="(min-width:1081px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)";
function init(){
  const hero=document.querySelector('html[data-page="index"] .hero.recruiter-static-hero');
  if(!hero||!window.matchMedia(canMove).matches)return;
  let raf=0,dx=0,dy=0;
  const set=()=>{
    raf=0;
    const entries={"--nv-moon-x":-dx*5,"--nv-moon-y":-dy*4,
      "--nv-ribbon-x":-dx*9,"--nv-ribbon-y":-dy*6,
      "--nv-flower-x":-dx*14,"--nv-flower-y":-dy*10,
      "--nv-art-x":dx*4,"--nv-art-y":dy*3};
    for(const [key,val] of Object.entries(entries))hero.style.setProperty(key,val.toFixed(2)+"px");
  };
  hero.addEventListener("pointermove",e=>{
    const b=hero.getBoundingClientRect();
    dx=Math.max(-1,Math.min(1,((e.clientX-b.left)/b.width-.5)*2));
    dy=Math.max(-1,Math.min(1,((e.clientY-b.top)/b.height-.5)*2));
    if(!raf)raf=requestAnimationFrame(set);
  },{passive:true});
  const reset=()=>{if(raf)cancelAnimationFrame(raf);raf=0;dx=0;dy=0;set()};
  hero.addEventListener("pointerleave",reset,{passive:true});
  window.matchMedia("(prefers-reduced-motion:reduce)").addEventListener("change",reset);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();