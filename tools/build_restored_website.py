#!/usr/bin/env python3
"""Publish the REAL Melodia interactive portfolio, rather than a generated recruiter stub.

The editable wix/ pages, original CSS, authored Three.js systems, and curated
referenced art are the authority. This builds a bounded public website: it does
not copy the repository, internal dashboards, archived render rejects, or Git
history into Pages.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from shutil import copy2, rmtree
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_recruiter_release"
WIX = ROOT / "wix"

# Explicit public routes. Private dashboards and retired placeholders stay out.
PAGES = (
    "index.html",
    "curated-art.html",
    "world-bible.html",
    "hero-renders.html",
    "shader-breakdowns.html",
    "pipeline.html",
    "resume.html",
    "faraway-mother-couture.html",
    "space-cathedral.html",
    "pcg-system-impact.html",
    "zbrush-breakdown.html",
    "melodia-stage-character.html",
    "melodia-melusina.html",
    "melusina-case-study.html",
    "melusina-model-tooling.html",
    "works-on-paper.html",
    "touchdesigner-showreel.html",
    "touchdesigner-architecture.html",
    "material-loop-gallery.html",
    "sdf-material-gallery.html",
    "melodia-atelier-lab.html",
    "melodia-gameplay-loop.html",
    "ornament-kitbash.html",
    "surreal-architecture.html",
    "geometry-nodes.html",
    "universal-material-impact.html",
    "realtime-3d-viewer.html",
    "melodia-living-worlds.html",
    "cosmic-orrery.html",
    "constellation-brush.html",
    "mahou-particle-garden.html",
    "portfolio-moodboard.html",
    "melusina-photo-studio.html",
    "render-constellation.html",
    "recruiter-one-sheet.html",
    "credits.html",
    "commissions.html",
    "baroque-grotto.html",
    "melodia-gallery-grid.html",
    "melodia-navigation-constellation.html",
)
THREE_DEMOS = (
    "melodia/folio/index.html",
    "melodia/folio/mara.html",
    "melodia/folio/weapons.html",
    "melodia/music-key/index.html",
    "melodia/sanctuary/index.html",
    # Restore only the requested public viewer entry points.
    "tools/fromage-webgl-kit/accessory-viewer/index.html",
    "tools/fromage-webgl-kit/prototypes/procedural-industrial-loop/index.html",
)
# All source JS/CSS for the selected pages is published intact. WebGL models and
# PBR textures are grouped because the workbench chooses files dynamically.
SOURCE_SUFFIXES = {".css", ".js", ".svg", ".json"}
ASSET_SUFFIXES = {
    ".css", ".js", ".svg", ".json", ".png", ".webp", ".jpg", ".jpeg",
    ".gif", ".avif", ".mp4", ".webm", ".mp3", ".wav", ".ogg",
    ".glb", ".gltf", ".fbx", ".obj", ".hdr", ".ktx2",
}
GENERATED_SUFFIXES = {
    ".png", ".webp", ".jpg", ".jpeg", ".svg", ".gif", ".webm",
    ".mp4", ".glb", ".json",
}
REFERENCES = re.compile(
    r"(?:[./]{0,3})?(generated/(?:assets|optimized)/[A-Za-z0-9_.\-/]+"
    r"\.(?:png|webp|jpg|jpeg|svg|gif|mp4|webm|glb|json))",
    re.IGNORECASE,
)
WIX_ASSET_REFERENCES = re.compile(
    r"(?:(?:[./]{0,3})?)(assets/[A-Za-z0-9_.\-/]+"
    r"\.(?:png|webp|jpg|jpeg|svg|gif|mp4|webm|glb|json))",
    re.IGNORECASE,
)
PUBLISHED: set[str] = set()
INSPECT: list[str] = []


def put(path: Path) -> None:
    relative = path.relative_to(ROOT)
    target = OUT / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    copy2(path, target)
    PUBLISHED.add(relative.as_posix())


def emit(path: str, content: str) -> None:
    target = OUT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    PUBLISHED.add(path)


def original_home() -> str:
    """Retain editable Night Velvet HTML, Figma adornments and original typography."""
    source = (WIX / "index.html").read_text(encoding="utf-8-sig")
    # Previously rejected, low-quality Sakura hero was removed from the allowed
    # release. Replace its image URL, caption and metadata with an existing,
    # authored Faraway Mother environment; do not regenerate or change design.
    old = "hero-sakura-dream-ink-shrine.webp"
    new = "faraway_hero_heart_gate.webp"
    assert (ROOT / "generated/assets/unreal" / new).is_file(), "Missing original Faraway Mother hero"
    source = source.replace(old, new)
    source = source.replace(
        "Sakura Dream: a stone bridge beneath floating island gardens, Unreal Engine environment study",
        "Faraway Mother: textile architecture and Heart Gate, Unreal Engine environment study",
    ).replace("Unreal Engine · Sakura Dream", "Unreal Engine · Faraway Mother")
    # The recruiter-focused source previously disabled every magical effect.
    # Restore the authored 2D starfield and dream-shader hooks while retaining
    # the gesture-based sitewide Three.js cursor added by melodia-site-nav.js.
    source = source.replace('data-effects="none"', 'data-effects="starfield,holo,magical,orrery"')
    source = source.replace(
        '<link rel="stylesheet" href="melodia-hero-scene.css?v=20261113a" />',
        '<link rel="stylesheet" href="melodia-hero-scene.css?v=20261113a" />\n'
        '<link rel="stylesheet" href="melodia-starfield.css">\n'
        '<link rel="stylesheet" href="melodia-magical-girl.css">\n'
        '<link rel="stylesheet" href="melodia-dream-shaders.css">\n'
        '<link rel="stylesheet" href="melodia-editorial-ornaments.css">',
    )
    source = source.replace(
        '<script src="melodia-editorial.js?v=20260921p1"></script>',
        '<script src="melodia-starfield.js"></script>\n'
        '<script src="melodia-orrery-system.js"></script>\n'
        '<script src="melodia-magical-girl.js"></script>\n'
        '<script src="melodia-editorial.js?v=20260921p1"></script>',
    )
    # This is another section, not a replacement of the original three-card
    # environment/technical-art/about foyer. Let the original interface breathe.
    atelier = """<section class="band astral" id="interactive-atelier" aria-labelledby="atelier-title">
<div class="inner">
  <div class="section-head">
    <div><p class="eyebrow magazine-kicker">Interactive studio · Little worlds to wander</p>
      <h2 id="atelier-title">An atelier of curiosities.</h2></div>
    <p>Three small interactive rooms: portraits, living light and sculpted objects.</p>
  </div>
  <nav class="home-foyer-grid" aria-label="Three signature interactive experiences">
    <a class="home-foyer-card" href="melusina-photo-studio.html"><img src="../generated/optimized/curated-art/melusina_beauty_eevee_20260715c_01-1280.webp" alt="" loading="lazy"><span class="home-foyer-scrim" aria-hidden="true"></span><span class="home-foyer-copy"><span class="home-foyer-kicker">01 · Portrait atelier</span><strong>Melusina Photo Studio</strong><span>Choose a pose, frame a portrait and tint the atmosphere.</span></span></a>
    <a class="home-foyer-card atelier-particle-card" href="mahou-particle-garden.html"><img src="assets/figma/mdl-sparkle-cluster.svg" alt="" loading="lazy"><span class="home-foyer-scrim" aria-hidden="true"></span><span class="home-foyer-copy"><span class="home-foyer-kicker">02 · Living particles</span><strong>Mahou Particle Garden</strong><span>Touch petals, pearls and musical motes; awaken a sigil.</span></span></a>
    <a class="home-foyer-card" href="realtime-3d-viewer.html?asset=violin&amp;fabric=GildedBrocade"><img src="../generated/assets/props/violin_komikaze_three_quarter.png" alt="" loading="lazy"><span class="home-foyer-scrim" aria-hidden="true"></span><span class="home-foyer-copy"><span class="home-foyer-kicker">03 · Crafted objects</span><strong>The Object Atelier</strong><span>One interactive 3D viewer for instruments, ornaments and materials.</span></span></a>
  </nav>
  <p class="atelier-archive-links">More from the studio: <a href="portfolio-moodboard.html">3D moodboard</a> · <a href="constellation-brush.html">Constellation Brush</a> · <a href="../melodia/folio/index.html">Traveling Folio</a> · <a href="melodia-living-worlds.html">Living Worlds</a></p>
</div></section>
"""
    assert '</main>' in source
    source = source.replace('</main>', atelier + '\n</main>', 1)
    # The previous source styling explicitly fixes the first three-card grid.
    # Scope the three featured rooms without changing the original foyer.
    source = source.replace(
        '</head>',
        '<style id="atelier-home-layout">'
        '#interactive-atelier{padding-block:clamp(46px,6vw,90px);}'
        '#interactive-atelier .home-foyer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}'
        '#interactive-atelier .home-foyer-card{grid-column:auto!important;min-height:280px!important}'
        '#interactive-atelier .home-foyer-card img{width:100%;height:100%;object-fit:cover}'
        '#interactive-atelier .atelier-particle-card img{object-fit:contain;padding:clamp(22px,5vw,66px)}'
        '#interactive-atelier .atelier-archive-links{margin-top:24px;text-align:center;line-height:1.8}'
        '#interactive-atelier .atelier-archive-links a{text-underline-offset:4px}'
        '@media(max-width:780px){#interactive-atelier .home-foyer-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}'
        '@media(max-width:560px){#interactive-atelier .home-foyer-grid{grid-template-columns:1fr}}'
        '</style></head>', 1,
    )
    assert "celestial-brush-sitewide.js" in (WIX / "melodia-site-nav.js").read_text(encoding="utf-8")
    return source


def restore_archive_page(page: str, text: str) -> str:
    """These recovered originals are public now, not 'unpublished' review previews."""
    if page in ("portfolio-moodboard.html", "melusina-photo-studio.html"):
        text = text.replace('content="noindex,nofollow"', 'content="index,follow"')
        text = text.replace(
            "This page and its image paths are not yet in the strict public GitHub Pages release.",
            "These original EEVEE stills are preserved as a historical look-development gallery.",
        )
    return text


def collect_generated(text: str) -> None:
    for m in REFERENCES.finditer(text):
        relative = m.group(1).split("?")[0]
        path = ROOT / relative
        if path.is_file() and path.suffix.lower() in GENERATED_SUFFIXES:
            put(path)
        elif relative not in INSPECT:
            INSPECT.append(relative)


def collect_touchdesigner(text: str) -> None:
    for m in WIX_ASSET_REFERENCES.finditer(text):
        relative = m.group(1)
        if not relative.startswith("assets/touchdesigner/"):
            continue
        path = WIX / relative
        if path.is_file() and path.suffix.lower() in ASSET_SUFFIXES:
            put(path)


def main() -> None:
    if OUT.exists():
        rmtree(OUT)
    OUT.mkdir(parents=True)

    for page in PAGES:
        source = WIX / page
        if not source.is_file():
            raise FileNotFoundError(f"Missing original portfolio page: {page}")
        text = original_home() if page == "index.html" else restore_archive_page(
            page, source.read_text(encoding="utf-8-sig")
        )
        emit("wix/" + page, text)
        collect_generated(text)
        collect_touchdesigner(text)

    # All original web systems and styles remain available to their authored
    # pages. Heavy media is copied selectively below.
    for file in WIX.iterdir():
        if file.is_file() and file.suffix.lower() in SOURCE_SUFFIXES:
            put(file)
            if file.suffix.lower() in {".css", ".js"}:
                content = file.read_text(encoding="utf-8-sig")
                collect_generated(content)
                collect_touchdesigner(content)

    for relative_dir in ("assets/figma", "assets/editorial", "models", "textures"):
        directory = WIX / relative_dir
        if directory.exists():
            for f in directory.rglob("*"):
                if f.is_file() and f.suffix.lower() in ASSET_SUFFIXES:
                    put(f)

    # Other small ornamental art referenced by source pages, excluding the
    # sprawling unreviewed TouchDesigner capture archive.
    images = WIX / "assets"
    for f in images.rglob("*"):
        if not f.is_file() or f.suffix.lower() not in ASSET_SUFFIXES:
            continue
        relative = f.relative_to(WIX).as_posix()
        if relative.startswith(("assets/touchdesigner/", "assets/figma/", "assets/editorial/")):
            continue
        put(f)

    # Publishing original interactive demos doesn't require exposing the full
    # private production tree. These are existing authored standalone pages.
    for name in THREE_DEMOS:
        path = ROOT / name
        if path.is_file():
            put(path)

    # Restore existing browser game and authored WebGL toolkit as optional
    # experiences, kept off the homepage startup path.
    for directory_name in ("resonant-wilds", "resonant-wilds-glass", "tools/fromage-webgl-kit"):
        directory = ROOT / directory_name
        for f in directory.rglob("*"):
            if f.is_file() and f.suffix.lower() in ASSET_SUFFIXES:
                put(f)

    # The old original photobooth, technical sheets and lookdev work use
    # generated image sequences and optimized derivatives.
    for prefix in ("generated/optimized", "generated/assets/character-loops",
                   "generated/assets/material-loops", "generated/assets/nightshift"):
        directory = ROOT / prefix
        if directory.exists():
            for f in directory.rglob("*"):
                if f.is_file() and f.suffix.lower() in GENERATED_SUFFIXES:
                    put(f)

    # Runtime data feeds used by melodia-editorial.js (never internal dashboard JSON).
    for name in (
        "content/site-copy.json", "content/site-plates.json",
        "generated/unreal_portfolio_intake.json",
        "generated/blender_portfolio_intake.json",
        "generated/nightshift_manifest.json",
    ):
        p = ROOT / name
        if p.is_file():
            put(p)

    gateway = ROOT / "index.html"
    if gateway.exists():
        put(gateway)
    else:
        emit("index.html", '<meta http-equiv="refresh" content="0;url=wix/index.html">')
    emit(".nojekyll", "")
    emit("404.html", '<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title>'
         '<body><p>That room is not open. <a href="/my-site/wix/index.html">Back to the atelier</a>.</p></body></html>')
    emit("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://fromage3900.github.io/my-site/sitemap.xml\n")
    emit("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>'
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
         + ''.join('<url><loc>https://fromage3900.github.io/my-site/wix/' + p
                   + '</loc></url>' for p in PAGES)
         + '</urlset>')

    must = (
        "wix/index.html", "wix/constellation-brush.html",
        "wix/celestial-brush-sitewide.js", "wix/celestial-brush-overlay-engine.js",
        "wix/melodia-starfield.js", "wix/melodia-dream-shaders.js",
        "wix/melodia-living-worlds.js", "wix/melodia-3d-viewport.js",
        "wix/portfolio-moodboard.html", "wix/melusina-photo-studio.html",
        "wix/assets/figma/nv-rose-satin.svg", "melodia/folio/index.html",
    )
    # Gate the actual Pages artifact, not merely the editable source tree.
    viewer_root = "tools/fromage-webgl-kit/"
    viewer_required = (
        viewer_root + "accessory-viewer/index.html",
        viewer_root + "accessory-viewer/app.js",
        viewer_root + "prototypes/procedural-industrial-loop/index.html",
        viewer_root + "prototypes/procedural-industrial-loop/app.js",
        viewer_root + "src/core/createRuntime.js",
        viewer_root + "src/assets/createGLBLoader.js",
        viewer_root + "src/animation/createDeterministicTimeline.js",
        "wix/melodia-tokens.css",
        "wix/melodia-luxury-type.css",
    ) + tuple(
        f"wix/models/eyewear-heroes/{shape}-{finish}.glb"
        for shape in ("rect", "panto", "cateye", "aviator")
        for finish in ("tortoise", "metal")
    ) + tuple(
        f"wix/models/melusina-fx/{name}.glb"
        for name in ("FX_AngelWings_Carrier", "FX_ClockworkRing_Outer",
                     "FX_ClockworkRing_Mid", "FX_ClockworkRing_Inner")
    )
    for key in must + viewer_required:
        if key not in PUBLISHED:
            raise RuntimeError(f"Original website dependency not published: {key}")
    for entry in viewer_required:
        asset = OUT / entry
        if not asset.is_file() or asset.stat().st_size == 0:
            raise RuntimeError(f"Missing or empty viewer artifact: {entry}")
        if entry.endswith(".glb"):
            with asset.open("rb") as stream:
                if stream.read(4) != b"glTF":
                    raise RuntimeError(f"Invalid viewer GLB (possibly LFS pointer): {entry}")
    for entry in (viewer_required[0], viewer_required[2]):
        page = (OUT / entry).read_text(encoding="utf-8")
        if 'src="./app.js"' not in page or 'id="stage"' not in page:
            raise RuntimeError(f"Viewer entry point lost its WebGL stage or module: {entry}")
    home = (OUT / "wix/index.html").read_text(encoding="utf-8")
    assert 'data-effects="starfield,holo,magical,orrery"' in home
    assert "An atelier of curiosities." in home
    assert "hero-sakura-dream-ink-shrine.webp" not in home
    assert "melodia-starfield.js" in home
    assert "melodia-hero-scene.css" in home
    assert "constellation-brush.html" in home
    assert "melusina-photo-studio.html" in home
    featured = re.search(r'<nav class="home-foyer-grid" aria-label="Three signature interactive experiences">([\s\S]*?)</nav>', home)
    assert featured, "Curated interactive atelier is missing"
    featured_links = re.findall(r'href="([^"]+)"', featured.group(1))
    assert [link.split("?")[0] for link in featured_links] == [
        "melusina-photo-studio.html", "mahou-particle-garden.html", "realtime-3d-viewer.html"
    ], "Feature one object viewer alongside portraits and particles"
    for key in ("wix/melodia-photobooth.js", "wix/melodia-photobooth.css",
                "wix/mahou-particle-garden.html", "wix/realtime-3d-viewer.html",
                "generated/assets/props/violin_komikaze_three_quarter.png",
                "wix/assets/figma/mdl-sparkle-cluster.svg"):
        if key not in PUBLISHED:
            raise RuntimeError(f"Missing curated atelier dependency: {key}")
    pose_source = (WIX / "melodia-photobooth.js").read_text(encoding="utf-8")
    for match in REFERENCES.finditer(pose_source):
        if match.group(1) not in PUBLISHED:
            raise RuntimeError(f"Missing original portrait: {match.group(1)}")

    total = sum((OUT / p).stat().st_size for p in PUBLISHED)
    if total > 750_000_000:
        raise RuntimeError(f"Restored Pages artifact is too large: {total / 1_000_000:.1f} MB")
    manifest = {
        "release_contract": "original-interactive-website/v2",
        "homepage": "wix/index.html",
        "public_pages": list(PAGES),
        "three_demos": list(THREE_DEMOS),
        "sitewide_constellation_brush": True,
        "original_ornaments": True,
        "file_count": len(PUBLISHED),
        "total_bytes": total,
        "missing_optional_references": INSPECT[:100],
    }
    emit("published-manifest.json", json.dumps(manifest, indent=2) + "\n")
    print(f"[OK] Restored original website: {len(PAGES)} original pages, "
          f"{len(PUBLISHED)} files, {total / 1_000_000:.1f} MB; "
          f"{len(INSPECT)} unresolved optional media references.")


if __name__ == "__main__":
    main()
