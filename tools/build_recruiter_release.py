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
    "generated/assets/unreal/hero-sakura-dream-ink-shrine.webp",
    "generated/assets/unreal/faraway_hero_heart_gate_1920.webp",
    "wix/assets/touchdesigner/variant_4_atlus_graphic_cel.webp",
    "wix/assets/touchdesigner/variant_2_sakura_dawn.webp",
)
PUBLISHED_ORNAMENTS = (
    "wix/assets/figma/nv-rose-satin.svg",
    "wix/assets/figma/nv-pearl-eclipse.svg",
    "wix/assets/figma/mdl-sparkle-cluster.svg",
)
FILES = (*PUBLISHED_ART, *PUBLISHED_ORNAMENTS)

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

def base(title: str, description: str, body: str, route: str = "index.html") -> str:
    canonical = "https://www.fromageart.xyz/" if route == "index.html" else "https://fromage3900.github.io/my-site/wix/" + route
    hero = "https://fromage3900.github.io/my-site/generated/assets/unreal/hero-sakura-dream-ink-shrine.webp"
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | Brennan Shepherd</title><meta name="description" content="{description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{canonical}"><meta property="og:type" content="website">
<meta property="og:title" content="{title} — Brennan Shepherd"><meta property="og:description" content="{description}">
<meta property="og:image" content="{hero}"><meta property="og:url" content="{canonical}">
<meta name="theme-color" content="#170f20"><style>{STYLE}</style></head>
<body><a class="skip" href="#main">Skip to content</a><div class="container">
<header class="topbar"><a class="brand" href="index.html"><span class="mark" aria-hidden="true">✧</span>Brennan Shepherd</a>
<nav aria-label="Main navigation"><a href="curated-art.html">Selected art</a><a href="technical-art.html">Technical art</a><a href="resume.html">Résumé &amp; contact</a></nav></header>
<main id="main">{body}</main>
<footer class="foot"><span>Brennan Shepherd · Environment &amp; Technical Artist · Toronto</span><span><a href="mailto:brennan.shepherd3900@gmail.com">Email</a> · <a href="https://www.artstation.com/fromage3900" rel="noopener noreferrer">ArtStation</a> · © 2026</span></footer>
</div></body></html>"""

def sakura_image() -> str:
    return "../generated/assets/unreal/hero-sakura-dream-ink-shrine.webp"

def faraway_image() -> str:
    return "../generated/assets/unreal/faraway_hero_heart_gate_1920.webp"

def river_image(variant: int) -> str:
    name = {2:"variant_2_sakura_dawn.webp",4:"variant_4_atlus_graphic_cel.webp"}[variant]
    return "assets/touchdesigner/" + name

def closing() -> str:
    return """<section class="cta-end"><div><p class="eyebrow">Work together</p><h2>A world worth<br>getting lost in.</h2><p class="small">Available to discuss Toronto and remote opportunities in environment art and real-time visuals.</p></div>
<div class="actions"><a class="btn primary" href="mailto:brennan.shepherd3900@gmail.com">Get in touch</a><a class="btn" href="resume.html">View résumé</a></div></section>"""

home = f"""
<section class="hero"><div><p class="eyebrow">Environment &amp; Technical Artist / Toronto</p><h1>Brennan <em>Shepherd.</em></h1>
<p class="lede">I build worlds that feel like songs.</p>
<p class="sublede">Stylized environments, sculptural architecture and procedural worldbuilding across Unreal Engine, Houdini and real-time visual systems.</p>
<div class="actions"><a class="btn primary" href="curated-art.html">Selected work</a><a class="btn" href="resume.html">About &amp; contact</a></div>
<p class="micro" style="margin-top:28px">Unreal Engine 5.8 · Houdini · Blender · TouchDesigner</p></div>
<figure class="hero-art"><img class="moon" src="assets/figma/nv-pearl-eclipse.svg" alt=""><img class="spark" src="assets/figma/mdl-sparkle-cluster.svg" alt="">
<img class="main-render" src="{sakura_image()}" alt="Sakura Dream environment study: stone bridge, floating gardens and soft pink dusk lighting" fetchpriority="high" width="1600" height="1100">
<figcaption><span>Melodia / Sakura Dream</span><span>Unreal environment study</span></figcaption></figure>
<img class="hero-ribbon" src="assets/figma/nv-rose-satin.svg" alt="" aria-hidden="true"></section>
<div class="rule"></div>
<section class="section"><div class="section-head"><div><p class="eyebrow">01 / Selected work</p><h2>Worlds, carefully composed.</h2></div><p>Two environment directions from an independently developed musical fantasy world. Captures are presented as development studies, not finished-game screenshots.</p></div>
<div class="work-grid">
<figure class="work"><a class="image" href="faraway-mother-couture.html"><img src="{faraway_image()}" alt="Faraway Mother Heart Gate, monumental textile-inspired landscape and architecture" loading="lazy"></a><figcaption><strong>Faraway Mother — Heart Gate</strong><small>Procedural architecture / Work in progress</small></figcaption></figure>
<figure class="work"><a class="image" href="curated-art.html#sakura"><img src="{sakura_image()}" alt="Sakura Dream, stone bridge and dreamlike floating gardens" loading="lazy"></a><figcaption><strong>Sakura Dream — Floating Isles</strong><small>Environment composition / Unreal Engine</small></figcaption></figure>
</div><div class="actions"><a class="btn" href="curated-art.html">View selected work</a></div></section>
<section class="section"><div class="section-head"><div><p class="eyebrow">02 / Technical expression</p><h2>One place, two visual languages.</h2></div><p>River Sanctuary demonstrates art direction through non-photorealistic material and color treatments on a single 3D composition.</p></div>
<figure class="wide-art"><a href="technical-art.html"><img src="{river_image(4)}" alt="River Sanctuary graphic cel render with strong ink contours, flowers and pale river" loading="lazy"></a><figcaption><span>River Sanctuary / Graphic cel</span><span>Blender + TouchDesigner / Look development</span></figcaption></figure>
<div class="actions"><a class="btn" href="technical-art.html">Explore technical art</a></div></section>{closing()}
"""

selected = f"""
<section class="page-head"><p class="eyebrow">Selected art / 2026</p><h1>The things I want<br>you to remember.</h1>
<p class="lede">A deliberately small selection. Environment composition first, then the graphic language behind the worlds.</p></section>
<section class="section" id="faraway"><p class="eyebrow">01 / Monumental environment</p><h2>Faraway Mother</h2>
<figure class="wide-art"><a href="faraway-mother-couture.html"><img src="{faraway_image()}" alt="Faraway Mother Heart Gate surrounded by stylized textile terrain"></a><figcaption><span>The Heart Gate / Unreal Engine 5.8</span><span>In-development environment study</span></figcaption></figure>
<p class="copy">A surreal landscape shaped by cloth-inspired architecture, terrain and procedural assembly. This is a selected production study, not a claim of a finished playable level.</p><p><a class="text-link" href="faraway-mother-couture.html">Read the project notes →</a></p></section>
<section class="section" id="sakura"><p class="eyebrow">02 / Scenic composition</p><h2>Sakura Dream</h2>
<figure class="wide-art"><img src="{sakura_image()}" alt="Sakura Dream stone bridge and floating gardens"></figure><p class="copy">A stylized fantasy environment study focused on the image: silhouette, scene depth, framing and luminous color.</p></section>
<section class="section" id="river"><p class="eyebrow">03 / Stylized 3D look development</p><h2>River Sanctuary</h2>
<figure class="wide-art"><img src="{river_image(4)}" alt="River Sanctuary graphic-cel ink and hard-band shading"><figcaption><span>Graphic cel / Ink and color bands</span><span>Blender + TouchDesigner</span></figcaption></figure>
<figure class="wide-art"><img src="{river_image(2)}" alt="The same River Sanctuary camera in a softer Sakura Dawn palette"><figcaption><span>Sakura Dawn / Storybook color treatment</span><span>Same geometry, alternate treatment</span></figcaption></figure>
<p class="copy">Two visual treatments of the same 3D scene. These are shader/look-development examples, not separately illustrated sprites or shipped Unreal gameplay.</p></section>{closing()}
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
<article class="info-card"><span class="number">Blender + Python</span><h3>Artist tooling</h3><p>Geometry Nodes, modeling workflows, scripted iteration and asset preparation.</p></article></div></section>{closing()}
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
    "faraway-mother-couture.html": base("Faraway Mother", "A procedural environment study exploring textile architecture and monumental landscapes.", faraway, "faraway-mother-couture.html"),
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
    manifest = {"release_contract": "allowlist-only/v1", "pages": list(PAGES), "images": list(PUBLISHED_ART), "ornaments": list(PUBLISHED_ORNAMENTS)}
    (OUT / "published-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    expected = set(FILES) | {"wix/" + name for name in PAGES} | {"index.html", "404.html", "robots.txt", "sitemap.xml", ".nojekyll", "published-manifest.json"}
    actual = {p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file()}
    if expected != actual:
        raise RuntimeError(f"Release not closed: unexpected={actual-expected}; missing={expected-actual}")
    for rel in PUBLISHED_ART:
        if not rel.lower().endswith(".webp"):
            raise RuntimeError(f"Unapproved art type in release: {rel}")
    print(f"[OK] Public release: {len(PAGES)} pages; {len(PUBLISHED_ART)} art images; {len(actual)} total files; no archives.")

if __name__ == "__main__":
    main()
