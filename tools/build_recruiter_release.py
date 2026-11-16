#!/usr/bin/env python3
"""Create a deliberately tiny recruiter-facing GitHub Pages artifact.

The full source tree is NOT a public asset catalogue. Only the files listed
here may be copied to the Pages artifact. Retired routes/assets return 404.
The repository remains the editable archive; publish only _recruiter_release/.
"""
from __future__ import annotations
from pathlib import Path
from shutil import copy2, rmtree
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_recruiter_release"
# Every published raster/image is explicit, not discovered by glob or recursion.
PUBLISHED_ART = (
    "wix/assets/touchdesigner/variant_4_atlus_graphic_cel.webp",
    "wix/assets/touchdesigner/variant_2_sakura_dawn.webp",
    "generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp",
)
PUBLISHED_ORNAMENTS = (
    "wix/assets/figma/nv-rose-satin.svg",
    "wix/assets/figma/nv-pearl-eclipse.svg",
    "wix/assets/figma/mdl-sparkle-cluster.svg",
    "wix/assets/figma/nv-sakura-cascade.svg",
    "wix/assets/figma/mdl-crystal-glint.svg",
    "wix/assets/figma/mdl-ribbon-light.svg",
    "wix/assets/figma/mdl-heart-medallion-night.svg",
    "wix/assets/editorial/folio-corner.svg",
)
# Interactive work belongs on its own intentional route, never inside the render archive.
PUBLISHED_EXPERIENCES = (
    "wix/constellation-brush.html",
    "wix/celestial-brush-sitewide.js",
    "wix/celestial-brush-overlay-engine.js",
    "wix/melodia-luxury-type.css",
)
FILES = (*PUBLISHED_ART, *PUBLISHED_ORNAMENTS, *PUBLISHED_EXPERIENCES)

STYLE = r"""
:root{color-scheme:dark;--night:#170f20;--plum:#26152b;--raised:#39263e;--rose:#edb9d0;--lilac:#c7b1e3;--cream:#fff4f3;--mute:#d8c8d7;--gold:#d9b88a;--aqua:#b5e9e4;--line:rgba(233,187,212,.35);--serif:"Times New Roman",Times,Georgia,serif}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(ellipse at 78% 8%,#573351 0,transparent 32%),linear-gradient(135deg,#1f1428,#120d1d 68%);color:var(--cream);font:18px/1.57 var(--serif);min-height:100vh}
a{color:inherit;text-underline-offset:4px}
a:focus-visible{outline:3px solid var(--aqua);outline-offset:4px}
img{max-width:100%;display:block}
.skip{position:absolute;top:-80px;left:12px;background:var(--cream);color:var(--plum);z-index:20;padding:10px 18px}
.skip:focus{top:12px}
.container{width:min(1230px,calc(100% - 64px));margin:auto}
nav a,nav span, .micro,.eyebrow,.btn,.detail,.stamp,.number,.foot{font:600 11px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.13em}
nav{display:flex;align-items:center;gap:28px;flex-wrap:wrap}
nav a{text-decoration:none;color:#eee0e8}
nav a:hover,.text-link:hover{color:var(--aqua)}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:22px;padding:24px 0;border-bottom:1px solid var(--line)}
.brand{color:var(--cream);font:500 16px/1.2 var(--serif);white-space:nowrap;text-decoration:none}
.brand .mark{border:1px solid var(--gold);color:var(--gold);display:inline-grid;place-items:center;border-radius:50%;width:32px;height:32px;margin-right:8px;font-size:20px}
.micro,.eyebrow,.number,.stamp{color:var(--rose);text-transform:uppercase}
.eyebrow{letter-spacing:.23em;margin:0 0 16px}
.hero{position:relative;min-height:660px;display:grid;grid-template-columns:.93fr 1.07fr;align-items:center;gap:50px;padding:90px 0 105px}
.hero h1{font-size:clamp(68px,8vw,138px);font-weight:400;line-height:.84;letter-spacing:-.073em;margin:24px 0 32px;position:relative;z-index:2}
.hero h1 em{display:block;font-weight:400;font-style:italic;color:var(--rose);margin-left:.19em}
.hero .lede{max-width:510px;font-size:clamp(18px,1.75vw,24px);color:#f0e4ef}
.hero .sublede{max-width:560px;color:var(--mute);font-size:17px}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:29px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:49px;padding:13px 18px;border:1px solid var(--gold);color:var(--cream);text-decoration:none;text-transform:uppercase;letter-spacing:.12em}
.btn.primary{background:var(--cream);color:#271629;border-color:var(--cream)}
.btn:hover{background:var(--rose);color:var(--night);border-color:var(--rose)}
.hero-art{position:relative;align-self:center;min-width:0}
.hero-art:before{content:"";position:absolute;inset:-20px 22px 22px -22px;border:1px solid var(--gold);pointer-events:none}
.hero-art .main-render{width:100%;aspect-ratio:4/4.6;max-height:680px;object-fit:cover;object-position:50% 50%;box-shadow:0 28px 80px #0e081a}
.hero-art .moon{position:absolute;width:min(20vw,210px);top:-65px;right:-60px;opacity:.8;pointer-events:none}
.hero-art .spark{position:absolute;width:55px;top:-20px;left:-45px;pointer-events:none}
.hero-art figcaption{display:flex;justify-content:space-between;gap:12px;color:var(--mute);padding-top:14px;font:11px/1.5 Arial,Helvetica,sans-serif}
.hero-ribbon{position:absolute;width:65%;height:auto;left:-18%;bottom:-48px;pointer-events:none;opacity:.88;z-index:3}
.rule{height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.section{padding:95px 0;border-bottom:1px solid var(--line)}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:30px;margin-bottom:35px}
.section-head h2,.page-head h1{font-weight:400;font-size:clamp(43px,5vw,76px);letter-spacing:-.047em;line-height:1.04;margin:0}
.section-head p{max-width:370px;color:var(--mute)}
.work-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}
.work{margin:0;min-width:0}
.work a.image{display:block;overflow:hidden;border:1px solid var(--line);background:#38283e}
.work img{width:100%;aspect-ratio:4/3;object-fit:cover}
.work figcaption{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:18px 3px 4px}
.work figcaption strong{font-size:25px;font-weight:400}
.work figcaption small{font:12px/1.5 Arial,Helvetica,sans-serif;color:var(--mute)}
.text-link{color:var(--aqua)}
.wide-art{margin:25px 0}
.wide-art img{width:100%;height:auto;border:1px solid var(--line)}
.wide-art figcaption{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;font:12px/1.55 Arial,Helvetica,sans-serif;color:var(--mute);padding:14px 0}
.copy{max-width:850px;color:var(--mute)}
.copy p{max-width:720px}
.cardrow{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}
.info-card{border:1px solid var(--line);padding:25px;background:rgba(76,51,82,.25)}
.info-card h3{font-size:26px;font-weight:400;margin:7px 0}
.info-card p{font-size:16px;color:var(--mute);margin-bottom:0}
.page-head{padding:78px 0 40px}
.page-head .lede{max-width:750px;color:var(--mute);font-size:20px}
.callout{border-left:2px solid var(--gold);padding:5px 0 5px 20px;margin:30px 0;color:var(--mute)}
.details{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin:40px 0}
.details h2{font-size:38px;font-weight:400;margin:0 0 15px}
.details p,.details li{color:var(--mute)}
.tags{display:flex;gap:9px;flex-wrap:wrap}
.tags span{border:1px solid var(--line);padding:8px 11px;font:12px/1.4 Arial,Helvetica,sans-serif}
.timeline{display:grid;gap:24px}
.timeline article{border-top:1px solid var(--line);padding-top:15px}
.timeline h3{font-size:26px;font-weight:400;margin:5px 0}
.timeline p{margin:0;color:var(--mute)}
.cta-end{padding:75px 0;display:flex;justify-content:space-between;gap:30px;align-items:center}
.cta-end h2{font-size:clamp(40px,5vw,65px);font-weight:400;line-height:1;margin:12px 0}
footer{border-top:1px solid var(--line);padding:25px 0 40px;display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;color:var(--mute)}
.small{font-size:15px;color:var(--mute)}
.quality-note{font-size:15px;color:#d9c6d6}
@media(max-width:950px){.hero{grid-template-columns:1fr;gap:48px;padding:64px 0}.hero-art{max-width:680px}.hero-art .main-render{aspect-ratio:16/10;max-height:none}.hero-art .moon{right:5px}.hero h1{font-size:clamp(65px,12vw,100px)}.cardrow{grid-template-columns:1fr 1fr}}
@media(max-width:700px){.container{width:calc(100% - 36px)}.topbar{align-items:start}.topbar nav{gap:12px 18px}.brand{white-space:normal}.topbar nav a{font-size:10px}.hero{padding:45px 0 70px;min-height:0}.hero h1{font-size:clamp(62px,18vw,96px)}.hero-art:before{inset:-10px 12px 10px -10px}.hero-art .main-render{aspect-ratio:4/3}.hero-ribbon{bottom:-25px}.work-grid,.details,.cardrow{grid-template-columns:1fr}.section{padding:65px 0}.section-head{display:block}.page-head{padding:65px 0 10px}.cta-end{display:block}.hero-art figcaption{font-size:10px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{body{background:white;color:black}.topbar,footer,.actions,.cta-end,.hero-art,.hero-ribbon,.moon,.spark{display:none!important}.container{width:100%}.section{padding:15px 0}.page-head{padding:15px 0}p,h1,h2,h3,li{color:black!important}}
"""


REF_STYLE = r"""
/* Reference-led illustration framing for the strict public homepage.
   No fabricated project names or unapproved WIP image assets. */
.ref-hero{min-height:640px;gap:clamp(30px,4vw,60px);padding:84px 0 88px}
.ref-hero h1{font:italic 400 clamp(65px,7.7vw,125px)/.91 var(--serif);
 letter-spacing:-.06em;margin:26px 0 28px;color:var(--cream);text-wrap:balance}
.ref-hero h1 em{font-style:italic;color:var(--cream);margin-left:0}
.ref-hero .lede{font-style:italic;max-width:32ch;border-top:1px solid rgba(221,199,155,.48);
 padding-top:15px;font-size:clamp(19px,2vw,27px);color:var(--cream)}
.ref-hero .sublede{font-size:16px;max-width:45ch}
.ref-hero .actions{align-items:center;margin-top:30px;gap:22px}
.ref-hero .btn.primary{background:linear-gradient(120deg,#faeaf0,#efcdda);
 color:#341f35;border:1px solid var(--gold);
 box-shadow:inset 0 0 0 3px #faeaf0,inset 0 0 0 4px #ad839a,0 9px 24px rgba(19,6,21,.26);
 padding:14px 28px}
.ref-hero .btn.primary:hover{background:var(--rose);transform:translateY(-2px)}
.ref-text-link{font:16px/1.3 var(--serif);text-decoration:underline;
 text-decoration-color:var(--gold);text-underline-offset:5px}
.ref-proof{margin-top:27px;opacity:.75}
.ref-art{background:#2d1c30;padding:8px;border:1px solid rgba(221,199,155,.8);
 box-shadow:11px 13px 0 rgba(86,52,84,.25),0 24px 60px rgba(10,4,15,.38)}
.ref-art:before{inset:13px 13px 58px;border:1px solid rgba(253,232,239,.8);z-index:2;pointer-events:none}
.ref-art:after{content:"✦";position:absolute;right:-12px;top:-16px;color:var(--gold);
 font:30px/1 var(--serif);text-shadow:0 3px 14px rgba(15,4,20,.6)}
.ref-art .main-render{aspect-ratio:1.14;max-height:560px;
 clip-path:polygon(0 19px,19px 0,calc(100% - 19px) 0,100% 19px,100% calc(100% - 19px),
 calc(100% - 19px) 100%,19px 100%,0 calc(100% - 19px))}
.ref-art figcaption{font:italic 12px/1.5 var(--serif);padding:10px 5px 4px;color:var(--cream);
 letter-spacing:.06em}
.ref-art .moon{width:min(17vw,145px);top:-38px;right:-35px;z-index:3}
.ref-art .spark{z-index:4;left:-28px}
.ref-hero .hero-ribbon{width:60%;bottom:-30px;left:-14%;opacity:.72}
.ref-rule{height:30px;display:flex;align-items:center;gap:26px;color:var(--gold);
 font:18px/1 var(--serif);margin:-9px 0 40px}
.ref-rule:before,.ref-rule:after{content:"";height:1px;flex:1;
 background:linear-gradient(90deg,transparent,rgba(221,199,155,.65))}
.ref-rule:after{transform:scaleX(-1)}
.ref-feature{display:grid;grid-template-columns:1.02fr .98fr;min-height:275px;
 background:linear-gradient(115deg,#fae9ef,#ecd9e7);color:#3f2b40;
 border:1px solid var(--gold);box-shadow:0 20px 50px rgba(13,4,19,.3);
 position:relative;clip-path:polygon(13px 0,calc(100% - 13px) 0,100% 13px,
 100% calc(100% - 13px),calc(100% - 13px) 100%,13px 100%,0 calc(100% - 13px),0 13px)}
.ref-feature:after{content:"";position:absolute;inset:7px;border:1px solid rgba(120,73,102,.4);
 pointer-events:none}
.ref-feature>img{width:100%;height:100%;min-height:275px;object-fit:cover;
 object-position:center}
.ref-feature-copy{padding:35px 42px;display:flex;flex-direction:column;
 justify-content:center;gap:10px;align-items:flex-start}
.ref-feature-copy .micro{color:#77536c;letter-spacing:.17em;margin:0}
.ref-feature-copy h2{margin:0;font:italic 400 clamp(33px,3.5vw,53px)/1.06 var(--serif);
 letter-spacing:-.025em}
.ref-feature-copy p:not(.micro){font:italic 18px/1.42 var(--serif);
 max-width:41ch;margin:0;color:#624a62}
.ref-feature-link{margin-top:8px;color:#3f2b40;border-color:#a78297;
 font-size:11px;background:rgba(249,236,242,.42)}
.ref-feature-link:hover{color:#3f2b40;background:#f7dbe6}
.ref-explore{padding:62px 0 80px}
.ref-explore-heading{display:flex;align-items:center;justify-content:center;gap:24px;
 font:400 clamp(14px,1.5vw,19px)/1.2 var(--serif);letter-spacing:.22em;
 text-transform:uppercase;color:var(--cream);margin:0 0 32px;text-align:center}
.ref-explore-heading:before,.ref-explore-heading:after{content:"";height:1px;flex:1;
 background:linear-gradient(90deg,transparent,rgba(221,199,155,.6))}
.ref-explore-heading:after{transform:scaleX(-1)}
.ref-path-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.ref-path{display:flex;min-height:330px;flex-direction:column;justify-content:flex-end;
 position:relative;text-decoration:none;background:#36233d;overflow:hidden;
 border:1px solid rgba(226,187,195,.69);
 clip-path:polygon(11px 0,calc(100% - 11px) 0,100% 11px,100% calc(100% - 11px),
 calc(100% - 11px) 100%,11px 100%,0 calc(100% - 11px),0 11px)}
.ref-path:after{content:"";position:absolute;inset:6px;
 border:1px solid rgba(252,232,239,.35);pointer-events:none}
.ref-path>img{position:absolute;top:0;left:0;width:100%;height:calc(100% - 102px);
 object-fit:cover;transition:transform .24s ease}
.ref-path:hover>img{transform:scale(1.025)}
.ref-path-about>img{object-fit:contain;padding:30px 27%;background:
 radial-gradient(circle at 50% 40%,#604360,#2a1a30 75%);opacity:.88}
.ref-path-caption{position:relative;z-index:1;display:flex;flex-direction:column;gap:6px;
 padding:17px 19px;min-height:102px;box-sizing:border-box;
 background:linear-gradient(120deg,#f9e7ec,#ecdbe7);border-top:1px solid #c899ad;color:#3a283b}
.ref-path-caption strong{font:italic 400 clamp(23px,2.1vw,33px)/1.07 var(--serif)}
.ref-path-caption small{font:600 10px/1.35 Arial,Helvetica,sans-serif;letter-spacing:.08em;
 color:#77536c;text-transform:uppercase}
.ref-path:hover,.ref-path:focus-visible{border-color:#ffe5ee;outline-offset:3px}
.ref-assurance{text-align:center;font:italic 17px/1.4 var(--serif);color:var(--mute);margin:30px 0 5px}
.ref-finale{height:82px;display:grid;place-items:center;
 background:url("assets/figma/nv-rose-satin.svg") center 45%/min(80%,660px) auto no-repeat;
 color:var(--gold);font-size:30px}
@media(max-width:950px){
 .ref-feature{grid-template-columns:1fr 1fr}
 .ref-path{min-height:300px}
}
@media(max-width:700px){
 .ref-hero{min-height:0;gap:28px;padding:40px 0 67px}
 .ref-hero h1{font-size:clamp(57px,17vw,88px);letter-spacing:-.06em}
 .ref-hero .lede{font-size:21px}
 .ref-hero .actions{gap:14px}
 .ref-art:before{inset:15px 15px 44px}
 .ref-art .main-render{aspect-ratio:4/3}
 .ref-art .moon{width:90px;right:0;top:-36px}
 .ref-feature{grid-template-columns:1fr}
 .ref-feature>img{min-height:170px;max-height:220px}
 .ref-feature-copy{padding:25px 29px}
 .ref-feature-copy h2{font-size:38px}
 .ref-feature-copy p:not(.micro){font-size:17px}
 .ref-explore{padding:44px 0 54px}
 .ref-explore-heading{gap:12px;letter-spacing:.13em}
 .ref-path-grid{grid-template-columns:1fr;gap:14px}
 .ref-path{min-height:270px}
 .ref-path-caption strong{font-size:28px}
 .ref-finale{height:65px}
}

/* Editorial plate, intentionally without any rejected or WIP game screenshots. */
.ref-art.ref-cover{background:radial-gradient(circle at 54% 36%,#6b4b65,#2b1c30 66%);
 padding:8px}
.ref-editorial-cover{width:100%;min-height:470px;display:flex;align-items:center;
 justify-content:center;flex-direction:column;text-align:center;gap:14px;
 padding:35px 24px;box-sizing:border-box;position:relative;
 background:radial-gradient(ellipse at 50% 44%,rgba(223,177,203,.14),transparent 60%),
 url("assets/figma/nv-rose-satin.svg") center 65%/95% auto no-repeat}
.ref-editorial-cover img{width:clamp(100px,14vw,175px);height:auto;max-height:165px;object-fit:contain;
 filter:drop-shadow(0 8px 19px rgba(10,4,15,.29))}
.ref-editorial-cover .micro{font-size:10px;color:var(--gold);letter-spacing:.13em}
.ref-editorial-cover strong{font:italic 400 clamp(35px,4vw,64px)/1.04 var(--serif);
 color:var(--cream);text-wrap:balance}
.ref-editorial-cover em{font:italic 400 clamp(18px,1.75vw,24px)/1.25 var(--serif);color:var(--rose)}
.ref-art.ref-cover:before{inset:13px 13px 64px}
.ref-path.ref-path-ornament>img{object-fit:contain;padding:28px 24%;
 box-sizing:border-box;background:radial-gradient(circle at 50% 35%,#624561,#291b31 80%)}
@media(max-width:950px){.ref-editorial-cover{min-height:360px}}
@media(max-width:700px){.ref-editorial-cover{min-height:260px;padding:23px 13px}
 .ref-editorial-cover img{width:95px}
 .ref-editorial-cover strong{font-size:37px}
 .ref-art.ref-cover:before{inset:13px 13px 46px}}
.ref-art.ref-cover figcaption{background:linear-gradient(90deg,#291b2e,#352438);
 border-top:1px solid rgba(221,199,155,.3);padding:11px 12px;position:relative;z-index:3}
@media(max-width:700px){
 .ref-art.ref-cover figcaption{display:grid;grid-template-columns:1fr;gap:3px;
  font-size:11px;line-height:1.3;padding:10px 12px;text-align:left}
 .ref-art.ref-cover:before{inset:13px 13px 91px}
}
@media(prefers-reduced-motion:reduce){.ref-path>img{transition:none}}
"""

BRUSH_STYLING = r"""
/* An authored interactive studio room, not another project screenshot. */
.brush-invitation{margin:54px 0 26px;min-height:320px;display:grid;grid-template-columns:1fr 1fr;
 position:relative;overflow:hidden;border:1px solid rgba(223,188,143,.75);
 background:linear-gradient(125deg,#121128 6%,#2d2148 52%,#20152e 100%);
 box-shadow:inset 0 0 0 7px rgba(235,203,225,.055),0 20px 52px rgba(12,4,19,.3)}
.brush-invitation:before{content:"";position:absolute;inset:8px;
 border:1px solid rgba(242,218,185,.27);pointer-events:none}
.brush-constellation{min-height:295px;position:relative;isolation:isolate;
 background:radial-gradient(circle at 52% 45%,rgba(204,158,222,.21),transparent 36%),
 radial-gradient(circle at 35% 60%,rgba(147,223,217,.16),transparent 35%),
 radial-gradient(circle at 49% 51%,#efd9da 0 2px,transparent 3px),
 radial-gradient(circle at 32% 27%,#a5deec 0 1.5px,transparent 2.5px),
 radial-gradient(circle at 77% 30%,#edd3a7 0 2px,transparent 3px),
 radial-gradient(circle at 71% 72%,#e6c9fb 0 1px,transparent 2px);
 border-right:1px solid rgba(245,213,185,.3)}
.brush-constellation:before{content:"";position:absolute;inset:20% 18%;border:1px solid rgba(220,193,161,.5);
 transform:rotate(-25deg);border-radius:50%;box-shadow:0 0 35px rgba(185,160,238,.1)}
.brush-constellation:after{content:"";position:absolute;left:23%;top:58%;width:55%;height:1px;
 background:linear-gradient(90deg,transparent,#e7c68f,transparent);transform:rotate(-29deg)}
.brush-constellation span{position:absolute;top:20%;left:38%;font-size:82px;color:#e4c7ff;text-shadow:0 0 30px #8774d7}
.brush-constellation i{position:absolute;right:21%;bottom:17%;font:normal 52px Georgia,serif;color:#f1d5a4}
.brush-constellation b{position:absolute;left:17%;bottom:19%;font:normal 25px Georgia,serif;color:#96e4df}
.brush-copy{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:35px clamp(24px,4vw,52px);gap:10px}
.brush-copy h2{font:italic 400 clamp(35px,3.9vw,56px)/1.03 var(--serif);margin:0;color:var(--cream)}
.brush-copy p:not(.micro){font-size:18px;line-height:1.5;max-width:37ch;margin:2px 0 12px;color:var(--mute)}
.brush-copy .micro{margin:0;color:var(--gold)}
.brush-copy small{display:block;color:var(--rose);font:11px/1.35 Arial,Helvetica,sans-serif;letter-spacing:.06em}
.brush-launch{background:rgba(255,235,243,.1)}
@media(max-width:700px){.brush-invitation{grid-template-columns:1fr;margin:30px 0}
 .brush-constellation{min-height:150px;border-right:0;border-bottom:1px solid rgba(245,213,185,.3)}
 .brush-constellation:before{inset:15% 30%}
 .brush-constellation span{font-size:50px;left:40%;top:16%}
 .brush-constellation i{font-size:35px}
 .brush-copy{padding:25px 26px 30px}.brush-copy h2{font-size:40px}}
"""

EMBELLISHMENT = r"""
/* Restore the tactile, floral editorial detailing from the original site.
   Original Figma exports only; rejected capture plates remain absent. */
body:before{content:"";pointer-events:none;position:fixed;inset:10px;
 border:1px solid rgba(222,187,160,.19);z-index:15}
.topbar{position:relative;z-index:5}
.topbar:before{content:"";position:absolute;inset:auto auto -9px 0;
 width:105px;height:18px;opacity:.8;background:url("assets/figma/mdl-ribbon-light.svg")
 left center/contain no-repeat;pointer-events:none}
.page-head{position:relative;margin-top:18px;padding-top:105px}
.page-head:before{content:"";position:absolute;top:8px;right:0;
 width:min(30vw,205px);height:120px;opacity:.75;
 background:url("assets/figma/nv-sakura-cascade.svg") center/contain no-repeat;pointer-events:none}
.page-head:after{content:"✧ ✦ ✧";display:block;color:var(--gold);font-size:18px;
 letter-spacing:.9em;margin-top:32px;white-space:nowrap;opacity:.83}
.page-head h1{font-style:italic;text-shadow:0 2px 24px rgba(255,203,226,.11)}
.section{position:relative}
.section:before{content:"";position:absolute;top:-1px;left:50%;
 transform:translateX(-50%);width:155px;height:20px;
 background:url("assets/figma/mdl-ribbon-light.svg") center/contain no-repeat;
 opacity:.8;pointer-events:none}
.wide-art{position:relative;padding:12px 12px 0;
 background:linear-gradient(155deg,rgba(232,188,208,.1),rgba(19,9,25,.4));
 border:1px solid rgba(222,187,160,.52)}
.wide-art:before{content:"";position:absolute;inset:4px 4px 39px;
 border:1px solid rgba(255,231,237,.31);pointer-events:none}
.wide-art figcaption{position:relative;z-index:1;padding-inline:6px;font-style:italic}
.work a.image{position:relative;padding:7px;border:1px solid rgba(222,187,160,.62)}
.work a.image:after{content:"";position:absolute;inset:12px;
 border:1px solid rgba(255,239,244,.45);pointer-events:none}
.info-card{position:relative;border-color:rgba(220,186,157,.5);
 box-shadow:inset 0 0 0 5px rgba(232,186,212,.04)}
.info-card:after{content:"✧";position:absolute;right:16px;top:9px;color:var(--gold);font-size:20px}
.ref-art .ref-sakura{position:absolute;right:-15%;bottom:0;width:43%;max-width:250px;
 opacity:.58;pointer-events:none;z-index:4;filter:drop-shadow(0 7px 15px #1b0b21)}
.ref-art .ref-crystal{position:absolute;bottom:-23px;right:18%;width:80px;
 opacity:.9;z-index:4;pointer-events:none}
.ref-art.ref-cover:after{z-index:6}
.ref-feature-copy:before{content:"";display:block;width:160px;height:23px;
 background:url("assets/figma/mdl-ribbon-light.svg") center/contain no-repeat;opacity:.72}
.ref-explore-heading span{font-style:italic}
.ref-path-caption{box-shadow:inset 0 0 0 4px rgba(145,91,117,.12)}
.ref-path-ornament:before{content:"";position:absolute;inset:15px 40px auto;
 z-index:1;height:80px;background:url("assets/figma/mdl-heart-medallion-night.svg")
 center/contain no-repeat;opacity:.46;pointer-events:none}
.ref-finale{background-image:url("assets/figma/nv-rose-satin.svg"),
 url("assets/figma/nv-sakura-cascade.svg");background-position:center 45%,94% 35%;
 background-size:min(80%,660px) auto,190px auto;background-repeat:no-repeat}
@media(hover:hover) and (prefers-reduced-motion:no-preference){
 .ref-art{transition:transform .35s ease,box-shadow .35s ease}
 .ref-art:hover{transform:translateY(-3px);box-shadow:13px 19px 0 rgba(86,52,84,.2),0 32px 70px rgba(10,4,15,.5)}
 .ref-sakura{animation:petal-hover 9s ease-in-out infinite alternate}
 @keyframes petal-hover{from{transform:translateY(0) rotate(-1deg)}to{transform:translateY(-7px) rotate(2deg)}}
}
@media(max-width:700px){
 body:before{inset:5px}
 .page-head{padding-top:95px}
 .page-head:before{width:110px;right:0;top:0;opacity:.5}
 .page-head:after{letter-spacing:.65em}
 .ref-art .ref-sakura{width:33%;right:-1%;bottom:16px;opacity:.4}
 .ref-art .ref-crystal{width:45px;bottom:-12px}
 .ref-finale{background-size:85% auto,95px auto}
}
"""

EVIDENCE_STYLING = r"""
/* Technical evidence should remain readable; full-resolution plates stay clickable. */
.technical-evidence .proof-card{padding:clamp(22px,3vw,38px);margin:24px 0;border:1px solid var(--line);background:rgba(35,22,41,.46)}
.technical-evidence .proof-card h3{font:italic 400 clamp(25px,2.5vw,37px)/1.1 var(--serif);margin:8px 0 16px}
.technical-evidence .proof-card .copy{max-width:76ch;color:var(--mute)}
.technical-evidence .proof-plate{margin-top:24px}
.technical-evidence .proof-plate img{width:100%;height:auto;max-height:none;object-fit:contain;background:#100d16}
.technical-evidence .proof-plate a{display:block}
"""

def base(title: str, description: str, body: str, route: str = "index.html") -> str:
    canonical = "https://www.fromageart.xyz/" if route == "index.html" else "https://fromage3900.github.io/my-site/wix/" + route
    hero = "https://fromage3900.github.io/my-site/wix/assets/touchdesigner/variant_4_atlus_graphic_cel.webp"
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | Brennan Shepherd</title><meta name="description" content="{description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{canonical}"><meta property="og:type" content="website">
<meta property="og:title" content="{title} — Brennan Shepherd"><meta property="og:description" content="{description}">
<meta property="og:image" content="{hero}"><meta property="og:url" content="{canonical}">
<meta name="theme-color" content="#170f20"><style>{STYLE}{REF_STYLE if route == 'index.html' else ''}{EMBELLISHMENT}{BRUSH_STYLING if route == 'index.html' else ''}{EVIDENCE_STYLING if route == 'technical-art.html' else ''}</style></head>
<body><a class="skip" href="#main">Skip to content</a><div class="container">
<header class="topbar"><a class="brand" href="index.html"><span class="mark" aria-hidden="true">✧</span>Brennan Shepherd</a>
<nav aria-label="Main navigation"><a href="curated-art.html">Selected art</a><a href="technical-art.html">Technical art</a><a href="constellation-brush.html">Constellation Brush ✦</a><a href="resume.html">Résumé &amp; contact</a></nav></header>
<main id="main">{body}</main>
<footer class="foot"><span>Brennan Shepherd · Environment &amp; Technical Artist · Toronto</span><span><a href="mailto:brennan.shepherd3900@gmail.com">Email</a> · <a href="https://www.artstation.com/fromage3900" rel="noopener noreferrer">ArtStation</a> · © 2026</span></footer>
</div><script defer src="celestial-brush-sitewide.js?v=20261115" data-celestial-sitewide></script></body></html>"""

def faraway_image() -> str:
    return "../generated/assets/unreal/faraway_hero_heart_gate_1920.webp"

def river_image(variant: int) -> str:
    name = {2:"variant_2_sakura_dawn.webp",4:"variant_4_atlus_graphic_cel.webp"}[variant]
    return "assets/touchdesigner/" + name

def closing() -> str:
    return """<section class="cta-end"><div><p class="eyebrow">Work together</p><h2>A world worth<br>getting lost in.</h2><p class="small">Available to discuss Toronto and remote opportunities in environment art and real-time visuals.</p></div>
<div class="actions"><a class="btn primary" href="mailto:brennan.shepherd3900@gmail.com">Get in touch</a><a class="btn" href="resume.html">View résumé</a></div></section>"""

home = f"""
<section class="hero ref-hero"><div class="ref-copy">
<p class="eyebrow">Environment &amp; Technical Artist / Toronto</p>
<h1>Brennan <em>Shepherd.</em></h1>
<p class="lede">I build worlds that feel like songs.</p>
<p class="sublede">Stylized environments, sculptural architecture and procedural worldbuilding across Unreal Engine, Houdini and real-time visual systems.</p>
<div class="actions"><a class="btn primary" href="curated-art.html">View selected work</a><a class="ref-text-link" href="resume.html">Résumé &amp; contact</a></div>
<p class="micro ref-proof">Unreal Engine 5.8 · Houdini · Blender · TouchDesigner</p>
</div>
<figure class="hero-art ref-art ref-cover">
<img class="moon" src="assets/figma/nv-pearl-eclipse.svg" alt="" aria-hidden="true">
<img class="spark" src="assets/figma/mdl-sparkle-cluster.svg" alt="" aria-hidden="true">
<img class="ref-sakura" src="assets/figma/nv-sakura-cascade.svg" alt="" aria-hidden="true">
<img class="ref-crystal" src="assets/figma/mdl-crystal-glint.svg" alt="" aria-hidden="true">
<div class="ref-editorial-cover" role="img" aria-label="Decorative Melodia Melusina editorial cover, not an Unreal Engine screenshot">
<img src="assets/figma/nv-pearl-eclipse.svg" alt="" aria-hidden="true">
<span class="micro">Worldbuilding / Unreal Engine / Houdini</span>
<strong>Melodia Melusina</strong>
<em>Worlds as instruments</em>
</div>
<figcaption><span>Melodia / Worldbuilding journal</span><span>Editorial cover · Not a game screenshot</span></figcaption>
</figure>
<img class="hero-ribbon" src="assets/figma/nv-rose-satin.svg" alt="" aria-hidden="true">
</section>
<div class="ref-rule" aria-hidden="true"><span>✦</span></div>
<section class="ref-feature" aria-label="Featured technical art case study">
<img src="{river_image(4)}" alt="River Sanctuary: graphic cel shader treatment of a three-dimensional river environment" loading="eager" fetchpriority="auto" decoding="sync">
<div class="ref-feature-copy">
<p class="micro">Featured case study · Blender / TouchDesigner</p>
<h2>River Sanctuary</h2>
<p>One three-dimensional environment, explored through ink contours, painterly colour and real-time shading.</p>
<a class="btn ref-feature-link" href="technical-art.html">View case study</a>
</div></section>
<section class="ref-explore" aria-labelledby="explore-heading">
<h2 id="explore-heading" class="ref-explore-heading"><span>Explore the work</span></h2>
<div class="ref-path-grid">
<a class="ref-path ref-path-ornament" href="curated-art.html">
<img src="assets/figma/nv-pearl-eclipse.svg" alt="" loading="lazy">
<span class="ref-path-caption"><strong>Selected Work</strong><small>Reviewed art &amp; look development</small></span></a>
<a class="ref-path" href="technical-art.html">
<img src="{river_image(2)}" alt="" loading="lazy">
<span class="ref-path-caption"><strong>Technical Art</strong><small>Shaders, materials &amp; systems</small></span></a>
<a class="ref-path ref-path-about" href="resume.html">
<img src="assets/figma/mdl-heart-medallion-night.svg" alt="" loading="lazy">
<span class="ref-path-caption"><strong>About &amp; Contact</strong><small>Practice, experience &amp; inquiries</small></span></a>
</div>
<p class="ref-assurance">Original artwork, clear process, and verifiable technical contributions.</p>
<section class="brush-invitation" aria-labelledby="brush-title">
  <div class="brush-constellation" aria-hidden="true"><span>✦</span><i>✧</i><b>✳</b></div>
  <div class="brush-copy">
    <p class="micro">Interactive atelier / A little playable artwork</p>
    <h2 id="brush-title">Draw a constellation.</h2>
    <p>Leave a trace of starlight. Little orbits wake when you draw circles; crystal notes answer your gestures.</p>
    <a class="btn brush-launch" href="constellation-brush.html">Enter the Constellation Brush ✦</a>
    <small>Three.js · Touch and mouse · Optional sound</small>
  </div>
</section>
<div class="ref-finale" aria-hidden="true">✧</div>
</section>
"""

selected = f"""
<section class="page-head"><p class="eyebrow">Selected work / 2026</p><h1>A smaller, sharper edit.</h1>
<p class="lede">Current reviewed shader and look-development studies. Fresh environment beauty images are being curated separately; unfinished Sakura Dream screenshots are withheld.</p></section>
<section class="section" id="river"><p class="eyebrow">01 / Stylized 3D look development</p><h2>River Sanctuary</h2>
<figure class="wide-art"><img src="{river_image(4)}" alt="River Sanctuary graphic-cel ink and hard-band shading"><figcaption><span>Graphic cel / Ink and colour bands</span><span>Blender + TouchDesigner</span></figcaption></figure>
<figure class="wide-art"><img src="{river_image(2)}" alt="The same River Sanctuary camera in a softer pink colour treatment"><figcaption><span>Soft storybook treatment</span><span>Same geometry, alternate shading</span></figcaption></figure>
<p class="copy">Two visual treatments of the same 3D scene. Shader and look-development evidence, not shipped gameplay or an independently illustrated environment.</p>
</section>{closing()}
"""


faraway = f"""
<section class="page-head"><p class="eyebrow">Melodia / Procedural environment study</p><h1>Faraway <em>Mother.</em></h1>
<p class="lede">A surreal landscape where textile forms become architecture, monumental gates and terrain.</p></section>
<figure class="wide-art"><img src="{faraway_image()}" alt="Faraway Mother Heart Gate in a sculptural cloth-inspired landscape"><figcaption><span>Heart Gate / In-development image</span><span>Unreal Engine 5.8 / Procedural worldbuilding</span></figcaption></figure>
<div class="callout">Project status: independent capstone work in progress. The image documents environment/look-development direction, not a shipped game or finalized level.</div>
<section class="section"><div class="section-head"><div><p class="eyebrow">The construction</p><h2>Material becomes landscape.</h2></div></div>
<div class="cardrow"><article class="info-card"><span class="number">01 / Form</span><h3>Monumental silhouettes</h3><p>Gate architecture and cloth-inspired sculptural masses establish scale and a focal point.</p></article>
<article class="info-card"><span class="number">02 / Systems</span><h3>Procedural assembly</h3><p>Houdini and Unreal support terrain, repeated structures and iterative environment composition.</p></article>
<article class="info-card"><span class="number">03 / Surface</span><h3>Textile language</h3><p>Fabric-inspired ridges, folds and ornamental details unify environment and material exploration.</p></article></div></section>
<section class="section"><p class="eyebrow">More selected work</p><h2>See the complete edit.</h2><div class="actions"><a class="btn primary" href="curated-art.html">Selected art</a><a class="btn" href="technical-art.html">Technical art</a></div></section>
{closing()}
"""

technical = f"""
<section class="page-head"><p class="eyebrow">Technical art / Real-time visuals</p><h1>Art direction, <em>with an engine room.</em></h1>
<p class="lede">Procedural worldbuilding, stylized shaders and real-time visual experiments. The systems serve the composition, not the other way around.</p></section>
<section class="section"><p class="eyebrow">01 / Blender + TouchDesigner</p><h2>River Sanctuary / Two illustrated languages</h2>
<p class="copy">A single 3D camera and scene with two material-and-color treatments. These are lookdev studies, not captures from a shipped game.</p>
<figure class="wide-art"><img src="{river_image(4)}" alt="River Sanctuary hard-banded cel palette with graphic ink outlines"><figcaption><span>Graphic cel</span><span>Strong ink edges and discrete color regions</span></figcaption></figure>
<figure class="wide-art"><img src="{river_image(2)}" alt="River Sanctuary with pink stone and softer Sakura Dawn colors"><figcaption><span>Sakura Dawn</span><span>Soft storybook treatment of the same scene</span></figcaption></figure></section>
<section class="section"><div class="section-head"><div><p class="eyebrow">02 / Procedural toolkit</p><h2>From authored forms to reusable worlds.</h2></div><p>Production methods used on ongoing independent work, not a claim that each system is shipped.</p></div>
<div class="cardrow"><article class="info-card"><span class="number">Houdini</span><h3>Procedural structure</h3><p>HDAs, geometry processing, composition and reusable world assembly.</p></article>
<article class="info-card"><span class="number">Unreal Engine</span><h3>Real-time worlds</h3><p>PCG, lighting, stylized materials and environment dressing.</p></article>
<article class="info-card"><span class="number">Blender + Python</span><h3>Artist tooling</h3><p>Geometry Nodes, modeling workflows, scripted iteration and asset preparation.</p></article></div></section>
<section class="section technical-evidence" aria-labelledby="evidence-title">
  <div class="section-head">
    <div><p class="eyebrow">03 / Technical evidence</p><h2 id="evidence-title">Show the process, not only the result.</h2></div>
    <p>Documented source studies with scope and remaining verification clearly distinguished.</p>
  </div>
  <article class="proof-card">
    <p class="eyebrow">Houdini · Copernicus / Material R&amp;D</p>
    <h3>Faraway Mother — Procedural texture foundry</h3>
    <p class="copy">A six-panel technical design contact sheet covers displacement fields, curvature and sparkle masks, flow vectors, silk micro-weave normals, channel-packed surface masks, and a three-tone shading ramp. The panel is a design/texture study: its graphics alone do not certify a production material cook or final in-game result.</p>
    <figure class="wide-art proof-plate">
      <a href="../generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp" target="_blank" rel="noopener noreferrer" aria-label="Open full-resolution procedural texture foundry contact sheet">
      <img loading="eager" fetchpriority="low" decoding="sync" src="../generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp" alt="Six-column Houdini COP contact sheet illustrating eigenmode displacement, packed masks, flow vectors, silk normals, ORM and a three-tone diffuse ramp"></a>
      <figcaption><span>Houdini COP / six-map design contact sheet</span><span>Open at full resolution for labels and channels</span></figcaption>
    </figure>
  </article>
  <article class="proof-card">
    <p class="eyebrow">Unreal 5.8 · Houdini KineFX / Character engineering</p>
    <h3>Melusina — Ground contact and layered costume</h3>
    <p class="copy">A documented October 2026 investigation isolates foot-target offsets, benchmarks native idle knee extension and boot-ground contact, and checks garment skinning round-trips. Its staged idle and source-preservation tests are evidence; playable gait and full costume acceptance were explicitly left open.</p>
    <p><a class="btn" href="https://github.com/fromage3900/MelodiaMelusinaV2/blob/main/Docs/Evidence/MelusinaLegSkirt_20261023/Sheets/Melusina_TechnicalBreakdown.md" target="_blank" rel="noopener noreferrer">Read the technical breakdown</a></p>
  </article>
</section>{closing()}
"""

resume = """
<section class="page-head"><p class="eyebrow">Artist dossier / Toronto, Canada</p><h1>Brennan <em>Shepherd.</em></h1>
<p class="lede">Environment Artist · Technical Artist · Real-time Visuals</p><p class="copy">I build expressive fantasy spaces through authored craft and procedural systems. I work across geometry, surface, lighting and the production tools that connect them.</p>
<div class="actions"><a class="btn primary" href="mailto:brennan.shepherd3900@gmail.com">Email</a><a class="btn" href="https://www.linkedin.com/in/brennan-shepherd-3b6111307/" rel="noopener noreferrer">LinkedIn</a><a class="btn" href="curated-art.html">Selected art</a></div></section>
<section class="section"><div class="details"><div><p class="eyebrow">Specialties</p><h2>Worldbuilding, art &amp; systems.</h2>
<p>Stylized environmental composition, modular architecture, terrain, props, sculpting, procedural tools, look development, lighting and real-time materials.</p></div><div><p class="eyebrow">Hands-on tools</p>
<div class="tags"><span>Unreal Engine 5.8</span><span>Houdini</span><span>Blender</span><span>Unreal PCG</span><span>Geometry Nodes</span><span>Python</span><span>ZBrush</span><span>Substance Painter</span><span>Substance Sampler</span><span>TouchDesigner</span><span>Git</span><span>Stylized PBR</span></div></div></div></section>
<section class="section"><p class="eyebrow">Background</p><h2>Selected experience.</h2><div class="timeline">
<article><span class="micro">Education / Current</span><h3>Humber College — 3D Animation</h3><p>Final-year study in Toronto, with a focus on 3D environments, procedural tools and an independent capstone.</p></article>
<article><span class="micro">Independent production / Ongoing</span><h3>Melodia Melusina — Environment &amp; Technical Art</h3><p>A fantasy rhythm-adventure prototype in development, uniting environments, stylized shading, procedural content and interactive systems.</p></article>
<article><span class="micro">Contract / 2023</span><h3>Trinity Youth Theatre — Visual Communications</h3><p>Photography, event documentation, social media support and visual communication.</p></article></div></section>
<section class="section"><p class="eyebrow">Contact &amp; additional work</p><h2>Let's make something wonderful.</h2><p><a href="mailto:brennan.shepherd3900@gmail.com">brennan.shepherd3900@gmail.com</a></p>
<div class="actions"><a class="btn primary" href="https://www.artstation.com/fromage3900" rel="noopener noreferrer">ArtStation</a><a class="btn" href="https://www.linkedin.com/in/brennan-shepherd-3b6111307/" rel="noopener noreferrer">LinkedIn</a></div></section>
"""

PAGES = {
    "index.html": base("Environment & Technical Art", "Stylized environments, procedural worldbuilding and real-time technical art.", home),
    "curated-art.html": base("Selected Art", "A small edit of environment artwork, scenic composition and stylized shader look development.", selected, "curated-art.html"),
    "technical-art.html": base("Technical Art", "Blender and TouchDesigner shader look development with Houdini and Unreal procedural practice.", technical, "technical-art.html"),
    "resume.html": base("Résumé & Contact", "Brennan Shepherd is an environment and technical artist in Toronto.", resume, "resume.html"),
}
def main() -> None:
    if OUT.exists():
        rmtree(OUT)
    OUT.mkdir(parents=True)
    for relative in FILES:
        source = ROOT / relative
        if not source.is_file():
            raise FileNotFoundError(f"Approved release asset is missing: {relative}")
        dest = OUT / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        if relative == "wix/constellation-brush.html":
            # Its old back link pointed to a route that the strict release retired.
            dest.write_text(source.read_text(encoding="utf-8").replace(
                'href="melodia-living-worlds.html"', 'href="index.html"'
            ), encoding="utf-8")
        else:
            copy2(source, dest)
    for name, page in PAGES.items():
        target = OUT / "wix" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
    (OUT / "index.html").write_text("""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=wix/index.html">
<link rel="canonical" href="https://www.fromageart.xyz/"><title>Brennan Shepherd — Portfolio</title></head>
<body><p><a href="wix/index.html">Enter the portfolio</a></p></body></html>""", encoding="utf-8")
    (OUT / "404.html").write_text("""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Not published — Brennan Shepherd</title><style>body{background:#170f20;color:#fff4f3;font:24px/1.5 Georgia,serif;min-height:70vh;display:grid;place-items:center;padding:30px}main{max-width:620px}a{color:#b5e9e4}</style></head>
<body><main><h1>This work is not in the public portfolio.</h1><p>Only the current selected edit is published.</p><a href="/my-site/wix/index.html">Return to the portfolio</a></main></body></html>""", encoding="utf-8")
    (OUT / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: https://fromage3900.github.io/my-site/sitemap.xml\n", encoding="utf-8")
    (OUT / "sitemap.xml").write_text("""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
""" + "".join(f"<url><loc>https://fromage3900.github.io/my-site/wix/{name}</loc></url>\n" for name in PAGES) + "</urlset>\n", encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    manifest = {"release_contract": "allowlist-only/v1", "pages": list(PAGES), "images": list(PUBLISHED_ART), "ornaments": list(PUBLISHED_ORNAMENTS), "experiences": ["wix/constellation-brush.html"]}
    (OUT / "published-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    expected = set(FILES) | {"wix/" + name for name in PAGES} | {"index.html", "404.html", "robots.txt", "sitemap.xml", ".nojekyll", "published-manifest.json"}
    actual = {p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file()}
    if expected != actual:
        raise RuntimeError(f"Release not closed: unexpected={actual-expected}; missing={expected-actual}")
    for rel in PUBLISHED_ART:
        if not rel.lower().endswith(".webp"):
            raise RuntimeError(f"Unapproved art type in release: {rel}")
    brush = OUT / "wix/constellation-brush.html"
    if not brush.exists() or 'id="c"' not in brush.read_text(encoding="utf-8"):
        raise RuntimeError("Constellation Brush must ship intact.")
    if 'href="constellation-brush.html"' not in PAGES["index.html"]:
        raise RuntimeError("Constellation Brush must remain discoverable on homepage.")
    print(f"[OK] Public release: {len(PAGES)} pages; {len(PUBLISHED_ART)} art images; {len(actual)} total files; no archives.")

if __name__ == "__main__":
    main()
