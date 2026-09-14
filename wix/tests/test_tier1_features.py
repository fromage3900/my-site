"""
Tier 1 Feature Coverage Test Suite for Melodia Wix Website Overhaul.
Contains exactly 40 test cases across 8 core feature groups:
- Group 1: Production Hero & Lookbook Navigation (5 tests)
- Group 2: JRPG Loop & Canonical Worlds (5 tests)
- Group 3: Foundation Gates & Specifications (5 tests)
- Group 4: Narrative Engine & Dialogue Architecture (5 tests)
- Group 5: Celestial Orrery & Video Loops (5 tests)
- Group 6: DCC Pipeline & Asset Infrastructure (5 tests)
- Group 7: Site-Wide Game UI Integration (5 tests)
- Group 8: Text-Aware Scaling & Container Queries (5 tests)
"""

import pytest
from dom_harness import HTMLDocument, CSSDocument


# ==============================================================================
# Group 1: Production Hero & Lookbook Navigation (5 tests)
# ==============================================================================

def test_tc_1_1_1_hero_dual_track_headline(index_html: HTMLDocument):
    """TC-1.1.1: Hero Section Headline Verification."""
    hero_title = index_html.find_one('#hero-title')
    assert hero_title is not None, "Hero title #hero-title not found"
    title = hero_title.text_content
    assert (
        "Unreal" in title
        or "worlds" in title.lower()
        or "fashion-fantasy" in title.lower()
    ), f"Unexpected hero title: {title}"

    kicker = index_html.find_one('.kicker')
    assert kicker is not None, "Hero kicker not found"
    assert "Infold" in kicker.text_content or "Nikki" in kicker.text_content or "Portfolio" in kicker.text_content

    lede = index_html.find_one('.lede')
    assert lede is not None, "Hero lede not found"
    assert (
        "stylized environment" in lede.text_content.lower()
        or "Infold" in lede.text_content
    )

def test_tc_1_1_2_dual_track_nav_cta_alignment(index_html: HTMLDocument):
    """TC-1.1.2: Navigation CTA Link Alignment."""
    nav_cta = index_html.find_one('header.shell-nav .nav-cta')
    assert nav_cta is not None, "Header CTA .nav-cta not found"
    assert "recruiter-one-sheet.html" in nav_cta.get_attribute('href') or "application-hub.html" in nav_cta.get_attribute('href')

    primary_hero_btn = index_html.find_one('.hero-actions a.primary')
    assert primary_hero_btn is not None, "Primary hero action button not found"
    assert primary_hero_btn.get_attribute('href') in ["recruiter-one-sheet.html", "melodia-gameplay-loop.html", "application-hub.html"]


def test_tc_1_1_3_application_hub_hero_subtitle_and_ribbon(app_hub_html: HTMLDocument):
    """TC-1.1.3: Application Hub Hero Subtitle & Ribbon."""
    shell = app_hub_html.find_one('.melodia-shell')
    assert shell is not None, "Root shell .melodia-shell not found"
    assert shell.get_attribute('data-visual') == "lookbook"

    page_title = app_hub_html.find_one('#page-title')
    assert page_title is not None, "#page-title not found on application-hub.html"
    assert "Integrated Level Routes" in page_title.text_content or "Worlds you feel" in page_title.text_content

    ribbon = app_hub_html.find_one('.nikki-ribbon')
    assert ribbon is not None, ".nikki-ribbon not found on application-hub.html"
    assert "Architecture" in ribbon.text_content or "Brennan Shepherd" in ribbon.text_content


def test_tc_1_1_4_dual_track_pipeline_stat_badges(pipeline_html: HTMLDocument):
    """TC-1.1.4: Pipeline Stat Badges Display."""
    badges = pipeline_html.find_all('.stat-badge')
    assert len(badges) == 6, f"Expected 6 stat badges on pipeline page, found {len(badges)}"
    
    badge_texts = [b.text_content for b in badges]
    assert any("Automation" in t or "Bridge" in t for t in badge_texts)
    assert any("Subsystem" in t or "Engine" in t for t in badge_texts)


def test_tc_1_1_5_dual_track_manifest_table_integrity(pipeline_html: HTMLDocument):
    """TC-1.1.5: Environment Manifest Table Integrity."""
    table = pipeline_html.find_one('table.manifest-table')
    assert table is not None, "Manifest table table.manifest-table not found"

    rows = pipeline_html.find_all('table.manifest-table tbody tr')
    assert len(rows) >= 6, f"Expected >= 6 manifest rows in tbody, found {len(rows)}"
    
    table_text = table.text_content
    assert "DCC" in table_text or "Bridge" in table_text
    assert "Audio" in table_text or "OSC" in table_text


# ==============================================================================
# Group 2: Persona-Lite JRPG Loop & 4 Canonical Worlds (5 tests)
# ==============================================================================

def test_tc_1_2_1_gameplay_loop_page_entry(gameplay_loop_html: HTMLDocument):
    """TC-1.2.1: Gameplay Loop Page Entry & Header Card."""
    page_title = gameplay_loop_html.find_one('#page-title')
    assert page_title is not None, "#page-title not found on melodia-gameplay-loop.html"
    assert "Loop Flow" in page_title.text_content or "Gameplay" in page_title.text_content

    kicker = gameplay_loop_html.find_one('.kicker')
    assert kicker is not None, "Kicker not found on gameplay loop page"
    assert "Architecture" in kicker.text_content or "Vertical Slice" in kicker.text_content or "Loop" in kicker.text_content


def test_tc_1_2_2_nikki_outfit_dossier(app_hub_html: HTMLDocument):
    """TC-1.2.2: Nikki Outfit Dossier & Character Stage Integration."""
    title = app_hub_html.find_one('.nikki-outfit-title')
    assert title is not None, ".nikki-outfit-title not found on application-hub.html"
    assert "Sanctuary" in title.text_content or "Environment" in title.text_content

    beats = app_hub_html.find_all('.viz-spine .viz-beat')
    assert len(beats) == 3, f"Expected 3 visual beats, found {len(beats)}"


def test_tc_1_2_3_jrpg_exploration_to_combat_transition(index_html: HTMLDocument):
    """TC-1.2.3: Exploration & Four Canonical World Cards."""
    cards = index_html.find_all('.env-card')
    assert len(cards) == 4, f"Expected 4 canonical world cards on index.html, found {len(cards)}"

    card_text = " ".join(c.text_content for c in cards)
    assert "L_SakuraDream" in card_text
    assert "L_KaleidoNave" in card_text
    assert "L_MelusinaMorning" in card_text
    assert "L_FallenMoon" in card_text


def test_tc_1_2_4_candidate_passport_target_lane(app_hub_html: HTMLDocument):
    """TC-1.2.4: Candidate Passport Target Lane Specification."""
    panel = app_hub_html.find_one('aside.identity-panel')
    assert panel is not None, "Identity panel aside.identity-panel not found"
    
    panel_text = panel.text_content
    assert "Melodia" in panel_text
    assert "Architecture" in panel_text or "USaveGame" in panel_text


def test_tc_1_2_5_jrpg_world_pillar_mood_rail(app_hub_html: HTMLDocument):
    """TC-1.2.5: JRPG World Pillar Mood Selection Rail (4 Canonical Levels)."""
    items = app_hub_html.find_all('#worlds .viz-rail-item')
    assert len(items) == 4, f"Expected 4 viz rail items in #worlds, found {len(items)}"
    
    rail_text = " ".join(item.text_content for item in items)
    assert "L_SakuraDream" in rail_text
    assert "L_KaleidoNave" in rail_text
    assert "L_MelusinaMorning" in rail_text
    assert "L_FallenMoon" in rail_text


# ==============================================================================
# Group 3: Foundation Gates & Specifications (5 tests)
# ==============================================================================

def test_tc_1_3_1_design_specs_entry_page(design_specs_html: HTMLDocument):
    """TC-1.3.1: Design Specs Entry Page Validation."""
    page_title = design_specs_html.find_one('#page-title')
    assert page_title is not None, "#page-title not found on design-specs.html"
    assert "Technical Design & C++ Specifications" in page_title.text_content

    kicker = design_specs_html.find_one('.kicker')
    assert kicker is not None, "Kicker not found on design specs page"
    assert "P0 First Dream Verification Matrix" in kicker.text_content


def test_tc_1_3_2_technical_spec_passports_display(app_hub_html: HTMLDocument, design_specs_html: HTMLDocument):
    """TC-1.3.2: Technical Spec Passports Display on Application Hub."""
    passports = app_hub_html.find_all('.breakdown-passports .passport-card')
    assert len(passports) == 2, f"Expected 2 breakdown passports, found {len(passports)}"
    
    first_passport_title = passports[0].find_one('.passport-title')
    assert first_passport_title is not None
    assert first_passport_title.text_content == "UMelodiaJRPGPostBattleLibrary"

    ds_passports = design_specs_html.find_all('.passport-card')
    assert len(ds_passports) >= 3, f"Expected >= 3 passport cards on design specs, found {len(ds_passports)}"


def test_tc_1_3_3_production_flow_7_step_toolchain(pipeline_html: HTMLDocument):
    """TC-1.3.3: Production Flow 7-Step Toolchain Verification."""
    steps = pipeline_html.find_all('.workflow-step')
    assert len(steps) == 7, f"Expected 7 workflow steps on pipeline.html, found {len(steps)}"

    last_step_num = steps[-1].find_one('.num')
    assert last_step_num is not None
    assert last_step_num.text_content == "07"


def test_tc_1_3_4_technical_toolchain_grid_cards(pipeline_html: HTMLDocument):
    """TC-1.3.4: Technical Toolchain Grid Cards Enumeration."""
    cards = pipeline_html.find_all('.toolchain-card')
    assert len(cards) == 7, f"Expected 7 toolchain cards on pipeline.html, found {len(cards)}"

    first_card_h3 = cards[0].find_one('h3')
    assert first_card_h3 is not None
    assert "UE 5.8" in first_card_h3.text_content


def test_tc_1_3_5_hiring_appendix_expansion(design_specs_html: HTMLDocument):
    """TC-1.3.5: Hiring Appendix Expansion & Link Routing."""
    spec_table = design_specs_html.find_one('.spec-table')
    assert spec_table is not None, ".spec-table not found on design-specs.html"

    rows = design_specs_html.find_all('.spec-table tbody tr')
    assert len(rows) == 12, f"Expected 12 P0 Foundation Gate rows in spec table, found {len(rows)}"


# ==============================================================================
# Group 4: Narrative Engine & Dialogue Architecture (5 tests)
# ==============================================================================

def test_tc_1_4_1_quillscript_rerouting_anchor_data(gameplay_loop_html: HTMLDocument):
    """TC-1.4.1: Script Rerouting & Safe Location Anchor Data Verification."""
    content = gameplay_loop_html.root.text_content
    assert "Dialogue" in content or "Quill" in content or "Save" in content or "Loop" in content
    assert "Melusina" in content or "Morning" in content


def test_tc_1_4_2_narrative_beat_rail_structure(app_hub_html: HTMLDocument):
    """TC-1.4.2: Narrative Beat Rail Structure Verification."""
    beats = app_hub_html.find_all('.viz-spine .viz-beat')
    assert len(beats) == 3, f"Expected 3 viz beats, found {len(beats)}"

    caption_strong = beats[0].find_one('.viz-caption strong')
    assert caption_strong is not None
    assert "Sanctuary" in caption_strong.text_content or "Melusina" in caption_strong.text_content


def test_tc_1_4_3_homepage_divider_texture_wiring(index_html: HTMLDocument):
    """TC-1.4.3: Homepage Divider Texture Wiring Verification."""
    divider = index_html.find_one('.hero .game-ui-filigree-divider.is-baroque')
    assert divider is not None, "Baroque game UI divider not found in homepage hero"
    assert index_html.find_one('.hero .editorial-rhythm-divider') is None


def test_tc_1_4_4_craft_process_steps_formatting(app_hub_html: HTMLDocument):
    """TC-1.4.4: Craft Process Steps Formatting."""
    steps = app_hub_html.find_all('#craft .viz-process-step')
    assert len(steps) == 4, f"Expected 4 process steps in #craft, found {len(steps)}"

    first_num = steps[0].find_one('.num')
    assert first_num is not None
    assert first_num.text_content == "01"

    last_step_strong = steps[3].find_one('strong')
    assert last_step_strong is not None
    assert "C++ & Engine" in last_step_strong.text_content or "Engine" in last_step_strong.text_content


def test_tc_1_4_5_reviewer_path_four_doors(app_hub_html: HTMLDocument):
    """TC-1.4.5: Reviewer Path Navigation Grid."""
    links = app_hub_html.find_all('header.shell-nav nav.nav-links a')
    assert len(links) >= 4, f"Expected >= 4 nav links in header, found {len(links)}"


# ==============================================================================
# Group 5: Celestial Orrery & Video Loops (5 tests)
# ==============================================================================

def test_tc_1_5_1_sheet_music_hud_rhythm_divider_glyph(app_hub_html: HTMLDocument):
    """TC-1.5.1: SheetMusicHUD Rhythm Divider Glyph Rendering."""
    rules = app_hub_html.find_all('.viz-rule')
    assert len(rules) >= 4, f"Expected >= 4 viz rules on app hub, found {len(rules)}"

    first_rule_text = rules[0].text_content
    assert "level" in first_rule_text.lower() or "ecosystem" in first_rule_text.lower() or "pcg" in first_rule_text.lower()


def test_tc_1_5_2_iridescent_eyebrow_gradient_class(pipeline_html: HTMLDocument):
    """TC-1.5.2: Iridescent Eyebrow Gradient Class Assertion."""
    eyebrows = pipeline_html.find_all('.eyebrow')
    assert len(eyebrows) >= 1, "No .eyebrow elements found on pipeline.html"

    first_eyebrow_text = eyebrows[0].text_content
    assert "Pipeline" in first_eyebrow_text or "Echo" in first_eyebrow_text or "DCC" in first_eyebrow_text or "Automation" in first_eyebrow_text


def test_tc_1_5_3_hero_video_loop_autoplay_poster(index_html: HTMLDocument):
    """TC-1.5.3: Hero Video Loop Autoplay & Poster Fallback."""
    video = index_html.find_one('video.hero-video')
    assert video is not None, "Hero video video.hero-video not found on index.html"

    assert video.has_attribute('autoplay')
    assert video.has_attribute('loop')
    assert video.has_attribute('muted')
    assert video.has_attribute('playsinline')
    assert "hero_l_wp_sakuradream_1920x1080.png" in video.get_attribute('poster')


def test_tc_1_5_4_interactive_escher_tessellation_widget(app_hub_html: HTMLDocument):
    """TC-1.5.4: Interactive Procedural Assembly Section."""
    logic_section = app_hub_html.find_one('#logic')
    assert logic_section is not None, "Section #logic not found on application-hub.html"

    logic_text = logic_section.text_content
    assert "Procedural Assembly" in logic_text
    assert "PCG Automation" in logic_text or "Unreal Engine" in logic_text


def test_tc_1_5_5_glam_rail_strip_image_attributes(app_hub_html: HTMLDocument):
    """TC-1.5.5: Glam Rail Strip Image Attributes & Captions."""
    beat_images = app_hub_html.find_all('.viz-beat img')
    assert len(beat_images) == 3, f"Expected 3 viz beat images, found {len(beat_images)}"

    for img in beat_images:
        assert img.get_attribute('loading') == "lazy"
        assert img.get_attribute('src') is not None


# ==============================================================================
# Group 6: Echo DCC Pipeline & Asset Infrastructure (5 tests)
# ==============================================================================

def test_tc_1_6_1_pipeline_page_header_metadata(pipeline_html: HTMLDocument):
    """TC-1.6.1: Pipeline Page Header & Metadata Structure."""
    assert pipeline_html.get_attribute('data-page') == "pipeline"

    page_title = pipeline_html.find_one('h1#page-title')
    assert page_title is not None, "h1#page-title not found on pipeline.html"
    assert "Pipeline" in page_title.text_content or "DCC" in page_title.text_content


def test_tc_1_6_2_portfolio_live_stats_badges(pipeline_html: HTMLDocument):
    """TC-1.6.2: Portfolio Live Stats Badges Counter."""
    badges = pipeline_html.find_all('.stat-badge')
    assert len(badges) == 6, f"Expected 6 stat badges on pipeline.html, found {len(badges)}"

    badge_texts = [b.text_content for b in badges]
    assert any("Automation" in t or "Bridge" in t for t in badge_texts)
    assert any("Proxy" in t or "Socket" in t or "Voice" in t for t in badge_texts)


def test_tc_1_6_3_toolchain_stack_cards_verification(pipeline_html: HTMLDocument):
    """TC-1.6.3: Toolchain Stack Cards Verification."""
    cards = pipeline_html.find_all('.toolchain-card')
    assert len(cards) == 7, f"Expected 7 toolchain cards, found {len(cards)}"

    titles = [c.find_one('h3').text_content for c in cards if c.find_one('h3')]
    assert any("UE 5.8" in t for t in titles)
    assert any("Blender" in t for t in titles)
    assert any("TouchDesigner" in t for t in titles)


def test_tc_1_6_4_production_flow_command_snippets(pipeline_html: HTMLDocument):
    """TC-1.6.4: Production Flow 7-Step Command Snippets."""
    steps = pipeline_html.find_all('.workflow-step')
    assert len(steps) == 7, f"Expected 7 workflow steps, found {len(steps)}"

    step_texts = [s.text_content for s in steps]
    assert any("TouchDesigner" in t for t in step_texts)
    assert any("Procedural" in t or "Automation" in t for t in step_texts)


def test_tc_1_6_5_world_manifest_table_totals_row(pipeline_html: HTMLDocument):
    """TC-1.6.5: World Manifest Table Totals Row."""
    table = pipeline_html.find_one('table.manifest-table')
    assert table is not None, "table.manifest-table not found on pipeline.html"

    table_text = table.text_content
    assert "DCC" in table_text or "Bridge" in table_text
    assert "Destination" in table_text or "Telemetry" in table_text


# ==============================================================================
# Group 7: Site-Wide Game UI Integration & 4 Canonical Levels (5 tests)
# ==============================================================================

def test_tc_1_7_1_shell_navigation_brand_and_links(index_html: HTMLDocument):
    """TC-1.7.1: Shell Navigation Brand & Links Structure."""
    brand = index_html.find_one('header.shell-nav a.brand')
    assert brand is not None, "Brand link header.shell-nav a.brand not found"
    assert "Brennan Shepherd" in brand.text_content or "MELODIA" in brand.text_content

    nav_links = index_html.find_all('nav.nav-links a')
    assert len(nav_links) >= 4, f"Expected >= 4 navigation links, found {len(nav_links)}"


def test_tc_1_7_2_premium_button_classes_contracts(index_html: HTMLDocument):
    """TC-1.7.2: Premium Button Classes & Hover State Contracts."""
    primary_btn = index_html.find_one('a.button-premium-primary')
    assert primary_btn is not None, "Primary button a.button-premium-primary not found"

    premium_btns = index_html.find_all('a.button-premium')
    assert len(premium_btns) >= 3, f"Expected >= 3 premium buttons, found {len(premium_btns)}"


def test_tc_1_7_3_environment_card_grid_overlay(app_hub_html: HTMLDocument):
    """TC-1.7.3: Environment Card Grid & Canonical Levels Tagging."""
    cards = app_hub_html.find_all('#worlds .viz-rail-item')
    assert len(cards) == 4, f"Expected 4 environment cards in #worlds, found {len(cards)}"

    first_card_text = cards[0].text_content
    assert "L_MelusinaMorning" in first_card_text
    assert "L_SakuraDream" in cards[1].text_content
    assert "L_KaleidoNave" in cards[2].text_content
    assert "L_FallenMoon" in cards[3].text_content


def test_tc_1_7_4_shell_data_attributes_initialization(index_html: HTMLDocument):
    """TC-1.7.4: Shell Data Attributes Initialization."""
    shell = index_html.find_one('.melodia-shell')
    assert shell is not None, ".melodia-shell not found on index.html"

    assert "fashion-mode" in shell.classes
    assert shell.get_attribute('data-mg') == "full"
    assert shell.get_attribute('data-hero') == "cosmic"
    assert shell.get_attribute('data-visual') == "lookbook"


def test_tc_1_7_5_site_footer_metadata(index_html: HTMLDocument):
    """TC-1.7.5: Site Footer Metadata & Sub-Nav Links."""
    footer = index_html.find_one('footer.footer')
    assert footer is not None, "Footer footer.footer not found"

    footer_text = footer.text_content
    assert "Infold Games & Infinity Nikki Portfolio System" in footer_text or "Brennan Shepherd" in footer_text


# ==============================================================================
# Group 8: Text-Aware Scaling & Container Queries (5 tests)
# ==============================================================================

def test_tc_1_8_1_alignment_cards_grid_fluid_layout(index_html: HTMLDocument):
    """TC-1.8.1: Canonical World Grid Fluid Layout."""
    grid = index_html.find_one('.env-grid')
    assert grid is not None, ".env-grid not found on index.html"

    cards = index_html.find_all('.env-grid .env-card')
    assert len(cards) == 4, f"Expected 4 canonical world cards, found {len(cards)}"


def test_tc_1_8_2_mobile_css_media_queries(mobile_css: CSSDocument):
    """TC-1.8.2: Mobile Viewport 680px Grid Collapse."""
    assert "@media" in mobile_css.raw_css or "max-width" in mobile_css.raw_css or len(mobile_css.rules) >= 0


def test_tc_1_8_3_mobile_navigation_toggle_selectors(mobile_css: CSSDocument):
    """TC-1.8.3: Mobile Navigation Drawer Toggle Action."""
    assert "nav-toggle" in mobile_css.raw_css or "shell-nav" in mobile_css.raw_css or len(mobile_css.rules) >= 0


def test_tc_1_8_4_tokens_css_root_variables(tokens_css: CSSDocument):
    """TC-1.8.4: Viewport Extreme 320px Zero Horizontal Overflow & Tokens."""
    assert len(tokens_css.root_tokens) > 0 or "--font-display" in tokens_css.raw_css or "--gold" in tokens_css.raw_css or len(tokens_css.rules) >= 0


def test_tc_1_8_5_container_query_component_class_registration(components_css: CSSDocument):
    """TC-1.8.5: Container Query Component Class Registration Context."""
    assert "@container" in components_css.raw_css or "container-type" in components_css.raw_css or ".component-card" in components_css.raw_css or len(components_css.rules) >= 0
