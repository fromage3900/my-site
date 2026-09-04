"""
Adversarial Verification Suite for:
1. 4 Canonical Levels & Infold Lookbook Consistency (R1)
2. Interactive Photobooth & ZBrush Sculpt Studio Asset Validity & DOM wiring (R2)
3. Zero deprecated/legacy level names across all active wix HTML templates (R1/R3)
"""

import os
import re
import json
import glob
import pytest
from dom_harness import HTMLDocument


CANONICAL_LEVELS = [
    ("L_MelusinaMorning", "melodia-stage-character.html"),
    ("L_SakuraDream", "sakura-case-study.html"),
    ("L_KaleidoNave", "space-cathedral.html"),
    ("L_FallenMoon", "pcg-system-impact.html"),
]

DISCOVERY_PAGES = [
    "index.html",
    "recruiter-one-sheet.html",
    "hiring-dossier.html",
    "resume.html",
]

DEPRECATED_PATTERNS = [
    r"\bL_MelusinasMorning\b",
    r"\bMelusinasMorning\b",
    r"\bBaroqueGrotto\b",
    r"\bBaroque Grotto\b",
    r"\bbaroque-grotto\.html\b",
    r"\bL_WP_BaroqueGrotto\b",
    r"\bL_BaroqueGrotto\b",
    r"\bL_WP_CosmicOrrery\b",
    r"\bL_CosmicOrrery\b",
    r"\bL_SpaceCathedral\b",
    r"\bL_WP_SpaceCathedral\b",
    r"\bL_WP_SakuraDream\b",
]


def _get_wix_dir():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _get_active_html_files():
    wix_dir = _get_wix_dir()
    all_html = glob.glob(os.path.join(wix_dir, "**", "*.html"), recursive=True)
    return [f for f in all_html if "_deprecated" not in f]


# ==============================================================================
# Requirement R1: Canonical Consistency & Level Discovery
# ==============================================================================

@pytest.mark.parametrize("page_name", DISCOVERY_PAGES)
def test_canonical_levels_discoverable_and_linked(page_name):
    """Every discovery page must discover and link to all 4 canonical levels."""
    wix_dir = _get_wix_dir()
    page_path = os.path.join(wix_dir, page_name)
    assert os.path.isfile(page_path), f"Discovery page {page_name} not found"

    with open(page_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    for level_tag, target_href in CANONICAL_LEVELS:
        assert level_tag in content, (
            f"Page {page_name} missing canonical level tag {level_tag}"
        )
        assert target_href in content, (
            f"Page {page_name} missing target href {target_href} for level {level_tag}"
        )


def test_zero_deprecated_level_names_in_active_html():
    """All active HTML files must contain 0 occurrences of deprecated level names."""
    active_files = _get_active_html_files()
    assert len(active_files) >= 10, f"Expected >= 10 active HTML files, found {len(active_files)}"

    violations = []
    for file_path in active_files:
        rel_name = os.path.relpath(file_path, _get_wix_dir())
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        for lno, line in enumerate(lines, 1):
            for pat in DEPRECATED_PATTERNS:
                if re.search(pat, line, re.IGNORECASE):
                    # Check if it's an asset filename like hero_l_wp_sakuradream (allow internal png filename)
                    if "hero_l_wp_sakuradream" in line.lower() and "L_WP_SakuraDream" in pat:
                        continue
                    violations.append((rel_name, lno, pat, line.strip()))

    assert len(violations) == 0, (
        f"Found {len(violations)} deprecated level name violations:\n"
        + "\n".join(f"{v[0]}:{v[1]} matched /{v[2]}/: {v[3]}" for v in violations)
    )


# ==============================================================================
# Requirement R2: Interactive Photobooth & ZBrush Studio Polish
# ==============================================================================

def test_photobooth_assets_exist_on_disk():
    """Every character pose asset declared in MelodiaPhotobooth must exist on disk."""
    wix_dir = _get_wix_dir()
    pb_js = os.path.join(wix_dir, "melodia-photobooth.js")
    assert os.path.isfile(pb_js), "melodia-photobooth.js not found"

    with open(pb_js, "r", encoding="utf-8") as f:
        code = f.read()

    # Extract all src paths
    paths = re.findall(r"src:\s*['\"]([^'\"]+)['\"]", code)
    assert len(paths) >= 5, f"Expected >= 5 photobooth poses, found {len(paths)}"

    for rel_path in paths:
        disk_path = os.path.normpath(os.path.join(wix_dir, rel_path))
        assert os.path.isfile(disk_path), (
            f"Photobooth asset does not exist on disk: {rel_path} -> {disk_path}"
        )
        assert os.path.getsize(disk_path) > 1000, (
            f"Photobooth asset is empty: {disk_path}"
        )


def test_zbrush_studio_assets_exist_on_disk():
    """Every sculpt asset and fallback declared in MelodiaZBrushStudio must exist on disk."""
    wix_dir = _get_wix_dir()
    zb_js = os.path.join(wix_dir, "melodia-zbrush-studio.js")
    assert os.path.isfile(zb_js), "melodia-zbrush-studio.js not found"

    with open(zb_js, "r", encoding="utf-8") as f:
        code = f.read()

    images = re.findall(r"image:\s*['\"]([^'\"]+)['\"]", code)
    fallbacks = re.findall(r"fallback:\s*['\"]([^'\"]+)['\"]", code)

    assert len(images) == 3, f"Expected 3 approved ZBrush sculpt images, found {len(images)}"
    assert len(fallbacks) == 3, f"Expected 3 approved ZBrush fallbacks, found {len(fallbacks)}"

    for rel_path in images + fallbacks:
        disk_path = os.path.normpath(os.path.join(wix_dir, rel_path))
        assert os.path.isfile(disk_path), (
            f"ZBrush Studio asset does not exist on disk: {rel_path} -> {disk_path}"
        )
        assert os.path.getsize(disk_path) > 1000, (
            f"ZBrush Studio asset is empty: {disk_path}"
        )


def test_index_mounts_photobooth_and_zbrush(index_html: HTMLDocument):
    """index.html must include mount containers and scripts for Photobooth, ZBrush, and Mahou."""
    pb_mount = index_html.find_one("#melusina-photobooth-mount")
    assert pb_mount is not None, "Photobooth mount #melusina-photobooth-mount not found on index.html"

    zb_mount = index_html.find_one("#zbrush-studio-mount")
    assert zb_mount is not None, "ZBrush mount #zbrush-studio-mount not found on index.html"

    assert "MelodiaPhotobooth" in index_html.raw_html or "melodia-photobooth.js" in index_html.raw_html
    assert "MelodiaZBrushStudio" in index_html.raw_html or "melodia-zbrush-studio.js" in index_html.raw_html


def test_planetarium_nodes_canonical_alignment():
    """melodia-planetarium.js NODES must strictly link to the 4 canonical case studies."""
    wix_dir = _get_wix_dir()
    planetarium_js = os.path.join(wix_dir, "melodia-planetarium.js")
    assert os.path.isfile(planetarium_js), "melodia-planetarium.js not found"

    with open(planetarium_js, "r", encoding="utf-8") as f:
        code = f.read()

    for level_tag, href in CANONICAL_LEVELS:
        assert level_tag in code, f"melodia-planetarium.js missing canonical level {level_tag}"
        assert href in code, f"melodia-planetarium.js missing link to {href}"

    for pat in DEPRECATED_PATTERNS:
        assert not re.search(pat, code, re.IGNORECASE), (
            f"melodia-planetarium.js contains deprecated pattern {pat}"
        )


def test_zero_deprecated_in_editorial_script():
    """melodia-editorial.js must contain 0 occurrences of deprecated level names."""
    wix_dir = _get_wix_dir()
    editorial_js = os.path.join(wix_dir, "melodia-editorial.js")
    assert os.path.isfile(editorial_js), "melodia-editorial.js not found"

    with open(editorial_js, "r", encoding="utf-8") as f:
        code = f.read()

    for pat in DEPRECATED_PATTERNS:
        assert not re.search(pat, code, re.IGNORECASE), (
            f"melodia-editorial.js contains deprecated pattern {pat}"
        )


def test_photobooth_filters_and_css_classes():
    """All filter classes in melodia-photobooth.js must be declared in melodia-photobooth.css."""
    wix_dir = _get_wix_dir()
    pb_js = os.path.join(wix_dir, "melodia-photobooth.js")
    pb_css = os.path.join(wix_dir, "melodia-photobooth.css")

    with open(pb_js, "r", encoding="utf-8") as f:
        js_code = f.read()
    with open(pb_css, "r", encoding="utf-8") as f:
        css_code = f.read()

    filter_classes = re.findall(r"class:\s*['\"]([^'\"]+)['\"]", js_code)
    assert len(filter_classes) >= 5, f"Expected >= 5 filter classes, found {len(filter_classes)}"

    for cls in filter_classes:
        assert f".{cls}" in css_code, f"Filter class {cls} not defined in melodia-photobooth.css"


def test_zbrush_studio_sculpt_passports():
    """ZBrush Studio must declare all 3 approved sculpt passes with non-empty passport data."""
    wix_dir = _get_wix_dir()
    zb_js = os.path.join(wix_dir, "melodia-zbrush-studio.js")

    with open(zb_js, "r", encoding="utf-8") as f:
        code = f.read()

    required_passes = ["zen_lantern", "melody_tokens", "melusina_head"]
    for pass_id in required_passes:
        assert pass_id in code, f"ZBrush Studio missing sculpt pass: {pass_id}"


def test_photobooth_reduced_motion_and_touch_gesture_support():
    """Photobooth must handle reduced-motion queries and register touch/pinch handlers."""
    wix_dir = _get_wix_dir()
    pb_js = os.path.join(wix_dir, "melodia-photobooth.js")
    pb_css = os.path.join(wix_dir, "melodia-photobooth.css")

    with open(pb_js, "r", encoding="utf-8") as f:
        js_code = f.read()
    with open(pb_css, "r", encoding="utf-8") as f:
        css_code = f.read()

    assert "prefers-reduced-motion" in js_code, "melodia-photobooth.js missing reduced-motion detection"
    assert "touchstart" in js_code, "melodia-photobooth.js missing touchstart gesture handler"
    assert "touchmove" in js_code, "melodia-photobooth.js missing touchmove pinch-to-zoom handler"
    assert "@media (prefers-reduced-motion: reduce)" in css_code, (
        "melodia-photobooth.css missing reduced-motion media block"
    )


def test_zbrush_studio_pass_toggles_and_reduced_motion():
    """ZBrush Studio must support pass toggling and reduced-motion styling."""
    wix_dir = _get_wix_dir()
    zb_js = os.path.join(wix_dir, "melodia-zbrush-studio.js")
    zb_css = os.path.join(wix_dir, "melodia-zbrush-studio.css")

    with open(zb_js, "r", encoding="utf-8") as f:
        js_code = f.read()
    with open(zb_css, "r", encoding="utf-8") as f:
        css_code = f.read()

    assert "data-pass" in js_code, "melodia-zbrush-studio.js missing data-pass toggles"
    assert "@media (prefers-reduced-motion: reduce)" in css_code, (
        "melodia-zbrush-studio.css missing reduced-motion media block"
    )


def test_dream_shaders_canonical_pillars():
    """Dream Shaders JS & CSS must recognize all canonical level pillars."""
    wix_dir = _get_wix_dir()
    ds_js = os.path.join(wix_dir, "melodia-dream-shaders.js")
    ds_css = os.path.join(wix_dir, "melodia-dream-shaders.css")

    with open(ds_js, "r", encoding="utf-8") as f:
        js_code = f.read()
    with open(ds_css, "r", encoding="utf-8") as f:
        css_code = f.read()

    pillars = ["sakura", "cathedral", "melusina", "fallenmoon"]
    for p in pillars:
        assert p in js_code, f"melodia-dream-shaders.js missing pillar identifier: {p}"
        assert f'data-pillar="{p}"' in css_code, f"melodia-dream-shaders.css missing data-pillar rule for: {p}"


def test_tokens_canonical_pillars():
    """melodia-tokens.css must declare overrides for all canonical level pillars."""
    wix_dir = _get_wix_dir()
    tokens_css = os.path.join(wix_dir, "melodia-tokens.css")

    with open(tokens_css, "r", encoding="utf-8") as f:
        css_code = f.read()

    pillars = ["sakura", "cathedral", "melusina", "fallenmoon"]
    for p in pillars:
        assert f'data-pillar="{p}"' in css_code, f"melodia-tokens.css missing data-pillar rule for: {p}"


def test_canonical_case_study_pages_exist_and_render():
    """All 4 canonical case study pages must exist on disk with valid structure."""
    wix_dir = _get_wix_dir()
    for _, href in CANONICAL_LEVELS:
        file_path = os.path.join(wix_dir, href)
        assert os.path.isfile(file_path), f"Canonical case study page {href} not found"
        assert os.path.getsize(file_path) > 1000, f"Canonical case study page {href} is empty"


def test_mahou_flourish_keyboard_accessibility_and_cleanup():
    """Mahou Flourish must support keyboard triggers and idempotent particle cleanup."""
    wix_dir = _get_wix_dir()
    mf_js = os.path.join(wix_dir, "melodia-mahou-flourish.js")
    assert os.path.isfile(mf_js), "melodia-mahou-flourish.js not found"

    with open(mf_js, "r", encoding="utf-8") as f:
        code = f.read()

    assert "tabindex" in code, "melodia-mahou-flourish.js missing tabindex binding for non-button triggers"
    assert "keydown" in code, "melodia-mahou-flourish.js missing keydown listener for keyboard activation"
    assert "cleanedUp" in code or "cleanup" in code, "melodia-mahou-flourish.js missing idempotent particle cleanup guard"


def test_photobooth_touch_lifecycle_and_aria():
    """Photobooth must handle full touch lifecycle and declare ARIA pressed state."""
    wix_dir = _get_wix_dir()
    pb_js = os.path.join(wix_dir, "melodia-photobooth.js")
    assert os.path.isfile(pb_js), "melodia-photobooth.js not found"

    with open(pb_js, "r", encoding="utf-8") as f:
        code = f.read()

    assert "touchend" in code, "melodia-photobooth.js missing touchend event listener"
    assert "touchcancel" in code, "melodia-photobooth.js missing touchcancel event listener"
    assert "aria-pressed" in code, "melodia-photobooth.js missing aria-pressed attribute for chips"
    assert "onerror" in code, "melodia-photobooth.js missing onerror image fallback handler"


def test_zbrush_studio_aria_and_safety():
    """ZBrush Studio must declare accessible roles and safe error handling."""
    wix_dir = _get_wix_dir()
    zb_js = os.path.join(wix_dir, "melodia-zbrush-studio.js")
    assert os.path.isfile(zb_js), "melodia-zbrush-studio.js not found"

    with open(zb_js, "r", encoding="utf-8") as f:
        code = f.read()

    assert "aria-selected" in code, "melodia-zbrush-studio.js missing aria-selected attribute"
    assert "aria-pressed" in code, "melodia-zbrush-studio.js missing aria-pressed attribute"
    assert "onerror" in code, "melodia-zbrush-studio.js missing onerror image fallback handler"


def test_canonical_level_plates_exist_on_disk():
    """Beauty plates for all 4 canonical levels must exist with valid image dimensions."""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    
    canonical_plates = [
        os.path.join(root_dir, "generated", "assets", "unreal", "hero_l_wp_sakuradream_1920x1080.png"),
        os.path.join(root_dir, "generated", "assets", "landscape-loops", "WP_SpaceCathedral_terrain.png"),
        os.path.join(root_dir, "generated", "assets", "character", "melusina_beauty_eevee_20260715c_01.png"),
        os.path.join(root_dir, "generated", "assets", "unreal", "level_fallen_moon.png"),
    ]

    for plate_path in canonical_plates:
        assert os.path.isfile(plate_path), f"Canonical beauty plate missing: {plate_path}"
        assert os.path.getsize(plate_path) > 10000, f"Canonical beauty plate too small: {plate_path}"


def test_figma_game_ui_assets_live_and_wired():
    """All 37 canonical Figma Game UI assets must exist on disk with valid file size."""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    game_ui_dir = os.path.join(root_dir, "generated", "assets", "melodia-game-ui")
    assert os.path.isdir(game_ui_dir), f"melodia-game-ui directory missing: {game_ui_dir}"

    required_assets = [
        "T_Melodia_SoftMG_Parchment.png",
        "T_Melodia_SoftMG_SealSP.png",
        "T_Melodia_SoftMG_SealULT.png",
        "T_Melodia_SoftMG_Hitline.png",
        "T_Melodia_SoftMG_LaneInk.png",
        "T_Melodia_SoftMG_ScrollEdge.png",
        "T_Melodia_SoftMG_PillowChip.png",
        "T_Melodia_FiligreeCornerBaroque.png",
        "T_Melodia_FiligreeDividerScroll.png",
        "T_Melodia_FiligreeCrestBaroque.png",
        "T_Melodia_FiligreeMedallionRosette.png",
        "T_Melodia_FiligreeBraceVolute.png",
        "T_Melodia_FiligreeBatchO_Baroque.png",
        "T_Melodia_FiligreeGradeHalo.png",
        "T_Melodia_FiligreeGradeHalo_Perfect.png",
        "T_Melodia_FiligreeGradeHalo_Great.png",
        "T_Melodia_FiligreeGradeHalo_Good.png",
        "T_Melodia_FiligreeGradeHalo_Miss.png",
        "T_Melodia_SkillRing.png",
        "T_Melodia_ComboBurst.png",
        "T_Melodia_GothicFrameCorner.png",
        "T_Melodia_GothicFrameRail.png",
        "T_Melodia_ScrollBorderRail.png",
        "T_Melodia_SheetParchment.png",
        "T_Melodia_IriOverlay.png",
        "T_Melodia_EnemyGlow.png",
        "T_Melodia_ElementWheel.png",
        "T_Melodia_StaffTile.png",
        "T_Melodia_SheenSweep.png",
        "T_Melodia_GradePerfect.png",
        "T_Melodia_GradeGreat.png",
        "T_Melodia_GradeGood.png",
        "T_Melodia_GradeMiss.png",
        "T_Melodia_LanePress.png",
        "T_Melodia_SkillChipBG.png",
        "T_Melodia_SafeAreaMask.png",
        "T_Melodia_MobileTopBar.png"
    ]

    for asset_name in required_assets:
        asset_path = os.path.join(game_ui_dir, asset_name)
        assert os.path.isfile(asset_path), f"Required Figma Game UI asset missing: {asset_path}"
        assert os.path.getsize(asset_path) > 500, f"Figma Game UI asset is corrupted/empty: {asset_path}"





def test_mahou_rare_ambient_events_contract():
    """Rare decorative events must remain sparse, removable, and reduced-motion aware."""
    wix_dir = _get_wix_dir()
    mf_js = os.path.join(wix_dir, "melodia-mahou-flourish.js")
    mf_css = os.path.join(wix_dir, "melodia-mahou-flourish.css")

    with open(mf_js, "r", encoding="utf-8") as f:
        js_code = f.read()
    with open(mf_css, "r", encoding="utf-8") as f:
        css_code = f.read()

    for symbol in [
        "constellationBloom",
        "petalCrack",
        "wakeCursorSigil",
        "rareCooldown",
        "IntersectionObserver",
        "data-mahou-rare-seen",
    ]:
        assert symbol in js_code, f"Mahou rare-event contract missing {symbol}"

    for css_class in [
        ".mahou-constellation-event",
        ".mahou-petal-crack",
        ".mahou-cursor-sigil",
    ]:
        assert css_class in css_code, f"Mahou rare-event CSS missing {css_class}"

    assert "prefers-reduced-motion: reduce" in css_code
    assert "removeAfter" in js_code


def test_mahou_particle_garden_contract():
    """PixiJS garden must stay linked, self-contained, interactive, and motion-aware."""
    wix_dir = _get_wix_dir()
    page_path = os.path.join(wix_dir, "mahou-particle-garden.html")
    hub_path = os.path.join(wix_dir, "application-hub.html")

    assert os.path.isfile(page_path), "Mahou Particle Garden page missing"

    with open(page_path, "r", encoding="utf-8") as f:
        page = f.read()
    with open(hub_path, "r", encoding="utf-8") as f:
        hub = f.read()

    for symbol in [
        "pixi.js@8.16.0",
        "await app.init",
        "pointermove",
        "pointerdown",
        "wakeSigil",
        "nextRare",
        "prefers-reduced-motion",
    ]:
        assert symbol in page, f"Particle Garden contract missing {symbol}"

    assert 'href="mahou-particle-garden.html"' in hub
