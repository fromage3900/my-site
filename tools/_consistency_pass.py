# -*- coding: utf-8 -*-
"""One-shot consistency pass for my-site-clean/wix pages."""
from __future__ import annotations

import re
from pathlib import Path

WIX = Path(r"G:\EnvironmentPortfolio\BS_GodFile\my-site-clean\wix")

SOFT = {
    "recruiter-one-sheet.html": "starfield,holo,magical",
    "sakura-case-study.html": "starfield,holo,magical",
    "hero-renders.html": "starfield,orrery,holo,magical",
    "commissions.html": "starfield,holo,magical",
    "application-hub.html": "starfield,planetarium,holo,magical",
    "ornament-kitbash.html": "starfield,holo,magical",
    "geometry-nodes.html": "starfield,orrery,holo,magical",
    "surreal-architecture.html": "starfield,holo",
    "melodia-stage-character.html": "starfield,holo,magical",
}

NAV_SCRIPT = '<script src="melodia-site-nav.js"></script>'
REDUNDANT = (
    "melodia-dream-shaders.css",
    "melodia-starfield.css",
    "melodia-magical-girl.css",
    "melodia-tokens.css",
)


def ensure_nav_script(text: str) -> str:
    if "melodia-site-nav.js" in text:
        return text
    if "melodia-editorial.js" in text:
        return text.replace(
            '<script src="melodia-editorial.js"></script>',
            NAV_SCRIPT + "\n<script src=\"melodia-editorial.js\"></script>",
        )
    return text.replace("</body>", NAV_SCRIPT + "\n</body>")


def ensure_fashion_css(text: str) -> str:
    if "melodia-fashion-editorial.css" in text:
        return text
    if "melodia-editorial.css" in text:
        return text.replace(
            '<link rel="stylesheet" href="melodia-editorial.css">',
            '<link rel="stylesheet" href="melodia-editorial.css">\n'
            '<link rel="stylesheet" href="melodia-fashion-editorial.css">',
        )
    return text


def strip_redundant_css(text: str) -> str:
    for href in REDUNDANT:
        text = re.sub(
            rf"\s*<link rel=\"stylesheet\" href=\"{re.escape(href)}\">\s*",
            "\n",
            text,
        )
    return text


def set_effects(text: str, effects: str) -> str:
    if 'data-effects="' in text:
        return re.sub(r'data-effects="[^"]*"', f'data-effects="{effects}"', text, count=1)
    return text


def inject_shell_attrs(text: str, attrs: dict[str, str]) -> str:
    m = re.search(r'<div class="melodia-shell[^"]*"[^>]*>', text)
    if not m:
        return text
    tag = m.group(0)
    for k, v in attrs.items():
        if f'{k}="' in tag:
            tag = re.sub(rf'{k}="[^"]*"', f'{k}="{v}"', tag)
        else:
            tag = tag[:-1] + f' {k}="{v}">'
    return text[: m.start()] + tag + text[m.end() :]


def patch_index() -> None:
    p = WIX / "index.html"
    t = p.read_text(encoding="utf-8")
    t = set_effects(t, "starfield,orrery,planetarium,holo,instruments,magical")
    t = t.replace(
        'data-copy="pages.recruiter-one-sheet.hero.kicker"',
        'data-copy="pages.index.hero.kicker"',
    )
    t = t.replace(
        'data-copy="pages.recruiter-one-sheet.hero.headline"',
        'data-copy="pages.index.hero.headline"',
    )
    t = t.replace(
        'data-copy="pages.recruiter-one-sheet.hero.lede"',
        'data-copy="pages.index.hero.lede"',
    )
    t = re.sub(
        r'(<p class="kicker magazine-kicker premium-kicker"[^>]*>)[^<]*(</p>)',
        r"\1Portfolio\2",
        t,
        count=1,
    )
    t = inject_shell_attrs(
        t,
        {
            "data-nav-cta": "application-hub.html",
            "data-nav-cta-label": "Application hub",
            "data-starfield-intensity": "cosmic",
        },
    )
    # Drop duplicate kitbash portal card (keep shop section)
    t = re.sub(
        r'\s*<a class="portal-card premium-card accent-iris" href="ornament-kitbash.html">[\s\S]*?</a>\s*',
        "\n",
        t,
        count=1,
    )
    t = strip_redundant_css(t)
    t = ensure_nav_script(t)
    p.write_text(t, encoding="utf-8")
    print("index")


def patch_kitbash() -> None:
    p = WIX / "ornament-kitbash.html"
    t = p.read_text(encoding="utf-8")
    t = t.replace("fashion-mode game-mode", "fashion-mode")
    # drop game-ui + portfolio-pages dual stack
    t = re.sub(r"\s*<link rel=\"stylesheet\" href=\"portfolio-pages.css\">\s*", "\n", t)
    t = re.sub(r"\s*<link rel=\"stylesheet\" href=\"melodia-game-ui.css\">\s*", "\n", t)
    t = t.replace(
        ".kitbash-price { font-family: var(--font-mono); font-size: 1.1rem; color: var(--iri-gold, #ffe666); }",
        ".kitbash-price { font-family: var(--font-display); font-size: clamp(1.35rem, 2.4vw, 1.85rem); color: var(--iri-gold, #ffe666); }",
    )
    t = t.replace("game-eyebrow", "eyebrow magazine-kicker")
    t = t.replace("game-lede", "lede")
    t = t.replace("game-surface-band", "paper fashion-band")
    t = t.replace("game-void-band", "astral fashion-band")
    t = inject_shell_attrs(
        t,
        {
            "data-nav-cta": "ornament-kitbash.html#buy",
            "data-nav-cta-label": "View pack",
        },
    )
    t = set_effects(t, SOFT["ornament-kitbash.html"])
    t = ensure_fashion_css(t)
    t = strip_redundant_css(t)
    t = ensure_nav_script(t)
    # soften store_live eng dump if any
    p.write_text(t, encoding="utf-8")
    print("kitbash")


def patch_geometry() -> None:
    p = WIX / "geometry-nodes.html"
    t = p.read_text(encoding="utf-8")
    t = t.replace(
        "Catalog stays <code>store_live: false</code> until store shots ship.",
        "Not for sale until store screenshots and Gumroad ship.",
    )
    t = t.replace("v2.134", "v2.134.0")
    t = inject_shell_attrs(
        t,
        {
            "data-nav-cta": "surreal-architecture.html",
            "data-nav-cta-label": "SurrealArch dossier",
        },
    )
    # CTA in header was JSON — nav JS overrides; also fix top nav-cta in HTML if present
    t = re.sub(
        r'<a class="nav-cta button-premium" href="\.\./generated/geometry_nodes_pipelines\.json">Pipeline JSON</a>',
        '<a class="nav-cta button-premium" href="surreal-architecture.html">SurrealArch dossier</a>',
        t,
    )
    t = set_effects(t, SOFT["geometry-nodes.html"])
    t = ensure_fashion_css(t)
    t = strip_redundant_css(t)
    t = ensure_nav_script(t)
    p.write_text(t, encoding="utf-8")
    print("geometry")


def patch_surreal() -> None:
    p = WIX / "surreal-architecture.html"
    t = p.read_text(encoding="utf-8")
    t = re.sub(r"\s*<link rel=\"stylesheet\" href=\"portfolio-pages.css\">\s*", "\n", t)
    t = t.replace(
        ".sx-family strong { display: block; font-family: var(--font-mono);",
        ".sx-family strong { display: block; font-family: var(--font-display);",
    )
    t = t.replace("v2.134", "v2.134.0")
    t = inject_shell_attrs(
        t,
        {
            "data-nav-cta": "geometry-nodes.html",
            "data-nav-cta-label": "Geometry pipelines",
        },
    )
    t = re.sub(
        r'<a class="nav-cta button-premium" href="\.\./generated/surreal_architecture_catalog\.json">[^<]*</a>',
        '<a class="nav-cta button-premium" href="geometry-nodes.html">Geometry pipelines</a>',
        t,
    )
    t = set_effects(t, SOFT["surreal-architecture.html"])
    t = ensure_fashion_css(t)
    t = strip_redundant_css(t)
    t = ensure_nav_script(t)
    p.write_text(t, encoding="utf-8")
    print("surreal")


def patch_soft(name: str, effects: str) -> None:
    p = WIX / name
    if not p.exists():
        print("missing", name)
        return
    t = p.read_text(encoding="utf-8")
    t = set_effects(t, effects)
    attrs = {
        "data-nav-cta": "application-hub.html",
        "data-nav-cta-label": "Application hub",
    }
    if name == "recruiter-one-sheet.html":
        attrs = {"data-nav-cta": "resume.html", "data-nav-cta-label": "Open resume"}
        # Melusina beauty for consistency on one-sheet too? Use sakura terrain nightshift or melusina
        t = t.replace(
            'src="../generated/assets/latest-hero.png"',
            'src="../generated/assets/character/hero_20260712/melusina_hero_beauty_nikki.png"',
        )
        t = t.replace(
            'alt="Stylized environment portfolio render"',
            'alt="Melusina — Melodia Portfolio Stage beauty plate"',
        )
    if name == "sakura-case-study.html":
        # keep sakura env plate if present; ensure fashion + soft effects only
        pass
    if name == "application-hub.html":
        attrs = {"data-nav-cta": "resume.html", "data-nav-cta-label": "Open resume"}
        if 'data-page="' not in t[:200]:
            t = t.replace("<html lang=\"en\">", '<html lang="en" data-page="application-hub">', 1)
        # button premium on hero actions
        t = t.replace('class="button primary"', 'class="button primary button-premium-primary"')
        t = t.replace('class="button" href="sakura-case-study.html"', 'class="button button-premium" href="sakura-case-study.html"')
    if name == "hero-renders.html":
        t = t.replace('class="button primary"', 'class="button primary button-premium-primary"')
        t = t.replace('class="button" href="sakura-case-study.html"', 'class="button button-premium" href="sakura-case-study.html"')
    t = inject_shell_attrs(t, attrs)
    t = ensure_fashion_css(t)
    t = strip_redundant_css(t)
    t = ensure_nav_script(t)
    p.write_text(t, encoding="utf-8")
    print("soft", name)


def main() -> None:
    patch_index()
    for name, effects in SOFT.items():
        if name in ("ornament-kitbash.html", "geometry-nodes.html", "surreal-architecture.html"):
            continue
        patch_soft(name, effects)
    patch_kitbash()
    patch_geometry()
    patch_surreal()
    # stage character
    stage = WIX / "melodia-stage-character.html"
    if stage.exists():
        t = stage.read_text(encoding="utf-8")
        t = re.sub(r"\s*<link rel=\"stylesheet\" href=\"portfolio-pages.css\">\s*", "\n", t)
        t = ensure_fashion_css(t)
        t = strip_redundant_css(t)
        t = ensure_nav_script(t)
        t = set_effects(t, "starfield,holo,magical")
        t = inject_shell_attrs(
            t,
            {"data-nav-cta": "hero-renders.html", "data-nav-cta-label": "Hero renders"},
        )
        stage.write_text(t, encoding="utf-8")
        print("stage")


if __name__ == "__main__":
    main()
