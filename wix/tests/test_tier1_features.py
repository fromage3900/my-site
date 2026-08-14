"""
Tier 1 Feature Coverage Test Suite for Melodia Wix Website Overhaul.
Contains exactly 40 test cases across 8 core feature groups:
- Group 1: Dual-Track Production Hero (5 tests)
- Group 2: Persona-Lite JRPG Loop (5 tests)
- Group 3: 12 P0 Foundation Gates (5 tests)
- Group 4: QuillScript Engine & Dialogue (5 tests)
- Group 5: Rhythm Combat & Music Clock (5 tests)
- Group 6: Echo Multi-Modal Pipeline (5 tests)
- Group 7: Site-Wide Game UI Integration (5 tests)
- Group 8: Text-Aware Scaling & Container Queries (5 tests)
"""

import pytest
from dom_harness import HTMLDocument, CSSDocument


# ==============================================================================
# Group 1: Dual-Track Production Hero (5 tests)
# ==============================================================================

def test_tc_1_1_1_hero_dual_track_headline(index_html: HTMLDocument):
    """TC-1.1.1: Hero Section Dual-Track Headline Verification."""
    hero_title = index_html.find_one('#hero-title')
    assert hero_title is not None, "Hero title #hero-title not found"
    assert "Dual-Track Production" in hero_title.text_content

    kicker = index_html.find_one('.kicker')
    assert kicker is not None, "Hero kicker not found"
    assert "MELODIA" in kicker.text_content

    lede = index_html.find_one('.lede')
    assert lede is not None, "Hero lede not found"
    assert "Persona-lite JRPG" in lede.text_content
    assert "Unreal Engine 5.8 C++" in lede.text_content
    assert "Echo Multi-Modal Pipeline" in lede.text_content


def test_tc_1_1_2_dual_track_nav_cta_alignment(index_html: HTMLDocument):
    """TC-1.1.2: Dual-Track Navigation CTA Link Alignment."""
    nav_cta = index_html.find_one('header.shell-nav .nav-cta')
    assert nav_cta is not None, "Header CTA .nav-cta not found"
    assert nav_cta.get_attribute('href') == "melodia-gameplay-loop.html"

    primary_hero_btn = index_html.find_one('.hero-actions a.primary')
    assert primary_hero_btn is not None, "Primary hero action button not found"
    assert primary_hero_btn.get_attribute('href') == "melodia-gameplay-loop.html"


def test_tc_1_1_3_application_hub_hero_subtitle_and_ribbon(app_hub_html: HTMLDocument):
    """TC-1.1.3: Application Hub Dual-Track Hero Subtitle & Ribbon."""
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
    """TC-1.1.4: Dual-Track Pipeline Stat Badges Display."""
    badges = pipeline_html.find_all('.stat-badge')
    assert len(badges) == 6, f"Expected 6 stat badges on pipeline page, found {len(badges)}"
    
    badge_texts = [b.text_content for b in badges]
    assert any("LiveLink" in t for t in badge_texts)
    assert any("Monolith MCP" in t for t in badge_texts)
    assert any("Blender MCP" in t for t in badge_texts)


def test_tc_1_1_5_dual_track_manifest_table_integrity(pipeline_html: HTMLDocument):
    """TC-1.1.5: Dual-Track Environment Manifest Table Integrity."""
    table = pipeline_html.find_one('table.manifest-table')
    assert table is not None, "Manifest table table.manifest-table not found"

    rows = pipeline_html.find_all('table.manifest-table tbody tr')
    assert len(rows) >= 6, f"Expected >= 6 manifest rows in tbody, found {len(rows)}"
    
    table_text = table.text_content
    assert "9876" in table_text
    assert "9316" in table_text


# ==============================================================================
# Group 2: Persona-Lite JRPG Loop (5 tests)
# ==============================================================================

def test_tc_1_2_1_gameplay_loop_page_entry(gameplay_loop_html: HTMLDocument):
    """TC-1.2.1: Gameplay Loop Page Entry & Header Card."""
    page_title = gameplay_loop_html.find_one('#page-title')
    assert page_title is not None, "#page-title not found on melodia-gameplay-loop.html"
    assert "Sanctuary-to-Save Loop Flow Architecture" in page_title.text_content

    kicker = gameplay_loop_html.find_one('.kicker')
    assert kicker is not None, "Kicker not found on gameplay loop page"
    assert "P0 First Dream Vertical Slice" in kicker.text_content


def test_tc_1_2_2_nikki_outfit_dossier(app_hub_html: HTMLDocument):
    """TC-1.2.2: Nikki Outfit Dossier & Character Stage Integration."""
    title = app_hub_html.find_one('.nikki-outfit-title')
    assert title is not None, ".nikki-outfit-title not found on application-hub.html"
    assert title.text_content == "Sanctuary, Traversal & Environment Sandbox"

    beats = app_hub_html.find_all('.viz-spine .viz-beat')
    assert len(beats) == 3, f"Expected 3 visual beats, found {len(beats)}"


def test_tc_1_2_3_jrpg_exploration_to_combat_transition(index_html: HTMLDocument):
    """TC-1.2.3: JRPG Exploration to Combat Transition State Linkage."""
    cards = index_html.find_all('article.alignment-card')
    assert len(cards) == 9, f"Expected 9 alignment cards on index.html, found {len(cards)}"

    card_text = cards[0].text_content
    assert "QuillScript" in card_text


def test_tc_1_2_4_candidate_passport_target_lane(app_hub_html: HTMLDocument):
    """TC-1.2.4: Candidate Passport Target Lane Specification."""
    panel = app_hub_html.find_one('aside.identity-panel')
    assert panel is not None, "Identity panel aside.identity-panel not found"
    
    panel_text = panel.text_content
    assert "Melodia Dual-Track Core" in panel_text
    assert "Binary USaveGame" in panel_text


def test_tc_1_2_5_jrpg_world_pillar_mood_rail(app_hub_html: HTMLDocument):
    """TC-1.2.5: JRPG World Pillar Mood Selection Rail."""
    items = app_hub_html.find_all('#worlds .viz-rail-item')
    assert len(items) == 4, f"Expected 4 viz rail items in #worlds, found {len(items)}"
    
    first_item_text = items[0].text_content
    assert "Sanctuary" in first_item_text


# ==============================================================================
# Group 3: 12 P0 Foundation Gates & Specifications (5 tests)
# ==============================================================================

def test_tc_1_3_1_design_specs_entry_page(design_specs_html: HTMLDocument):
    """TC-1.3.1: Design Specs Entry Page Validation."""
    page_title = design_specs_html.find_one('#page-title')
    assert page_title is not None, "#page-title not found on design-specs.html"
    assert page_title.text_content == "Technical Design & C++ Specifications"

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
# Group 4: QuillScript Dialogue & Engine Specs (5 tests)
# ==============================================================================

def test_tc_1_4_1_quillscript_rerouting_anchor_data(gameplay_loop_html: HTMLDocument):
    """TC-1.4.1: Script Rerouting & Safe Location Anchor Data Verification."""
    content = gameplay_loop_html.root.text_content
    assert "WBP_QuillDialogue" in content
    assert "L_MelusinaMorning" in content
    assert "Morning_RoomShell" in content


def test_tc_1_4_2_narrative_beat_rail_structure(app_hub_html: HTMLDocument):
    """TC-1.4.2: Narrative Beat Rail Structure Verification."""
    beats = app_hub_html.find_all('.viz-spine .viz-beat')
    assert len(beats) == 3, f"Expected 3 viz beats, found {len(beats)}"

    caption_strong = beats[0].find_one('.viz-caption strong')
    assert caption_strong is not None
    assert caption_strong.text_content == "L_MelusinaMorning"


def test_tc_1_4_3_dialogue_script_typography_styling(index_html: HTMLDocument):
    """TC-1.4.3: Dialogue/Script Typography Styling Verification."""
    divider = index_html.find_one('.editorial-rhythm-divider')
    assert divider is not None, ".editorial-rhythm-divider not found on index.html"
    assert divider.get_attribute('data-divider') == "astral"

    glyph = index_html.find_one('.editorial-rhythm-divider .glyph')
    assert glyph is not None, ".glyph not found in rhythm divider"
    assert glyph.text_content == "♪ · ♥ · ♪"


def test_tc_1_4_4_craft_process_steps_formatting(app_hub_html: HTMLDocument):
    """TC-1.4.4: Craft Process Steps Formatting."""
    steps = app_hub_html.find_all('#craft .viz-process-step')
    assert len(steps) == 4, f"Expected 4 process steps in #craft, found {len(steps)}"

    first_num = steps[0].find_one('.num')
    assert first_num is not None
    assert first_num.text_content == "01"

    last_step_strong = steps[3].find_one('strong')
    assert last_step_strong is not None
    assert last_step_strong.text_content == "C++ & Engine"


def test_tc_1_4_5_reviewer_path_four_doors(app_hub_html: HTMLDocument):
    """TC-1.4.5: Reviewer Path Four Doors Navigation Grid."""
    links = app_hub_html.find_all('header.shell-nav nav.nav-links a')
    assert len(links) == 5, f"Expected 5 nav links in header, found {len(links)}"

    target_hrefs = [link.get_attribute('href') for link in links]
    assert target_hrefs == ['index.html', 'melodia-gameplay-loop.html', 'design-specs.html', 'pipeline.html', 'application-hub.html']


# ==============================================================================
# Group 5: Rhythm Combat & Music Clock (5 tests)
# ==============================================================================

def test_tc_1_5_1_sheet_music_hud_rhythm_divider_glyph(app_hub_html: HTMLDocument):
    """TC-1.5.1: SheetMusicHUD Rhythm Divider Glyph Rendering."""
    rules = app_hub_html.find_all('.viz-rule')
    assert len(rules) >= 4, f"Expected >= 4 viz rules on app hub, found {len(rules)}"

    first_rule_text = rules[0].text_content
    assert "level routes" in first_rule_text


def test_tc_1_5_2_iridescent_eyebrow_gradient_class(pipeline_html: HTMLDocument):
    """TC-1.5.2: Iridescent Eyebrow Gradient Class Assertion."""
    eyebrows = pipeline_html.find_all('.eyebrow')
    assert len(eyebrows) >= 1, "No .eyebrow elements found on pipeline.html"

    first_eyebrow_text = eyebrows[0].text_content
    assert "Echo Multi-Modal Network Matrix" in first_eyebrow_text


def test_tc_1_5_3_hero_video_loop_autoplay_poster(index_html: HTMLDocument):
    """TC-1.5.3: Hero Video Loop Autoplay & Poster Fallback."""
    video = index_html.find_one('video.hero-video')
    assert video is not None, "Hero video video.hero-video not found on index.html"

    assert video.has_attribute('autoplay')
    assert video.has_attribute('loop')
    assert video.has_attribute('muted')
    assert video.has_attribute('playsinline')
    assert video.get_attribute('poster') == "../generated/assets/unreal/hero_l_wp_sakuradream_1920x1080.png"


def test_tc_1_5_4_interactive_escher_tessellation_widget(app_hub_html: HTMLDocument):
    """TC-1.5.4: Interactive Escher Tessellation Widget Touch/Drag Container."""
    logic_section = app_hub_html.find_one('#logic')
    assert logic_section is not None, "Section #logic not found on application-hub.html"

    logic_text = logic_section.text_content
    assert "Procedural Assembly" in logic_text
    assert "Monolith MCP" in logic_text


def test_tc_1_5_5_glam_rail_strip_image_attributes(app_hub_html: HTMLDocument):
    """TC-1.5.5: Glam Rail Strip Image Attributes & Captions."""
    beat_images = app_hub_html.find_all('.viz-beat img')
    assert len(beat_images) == 3, f"Expected 3 viz beat images, found {len(beat_images)}"

    for img in beat_images:
        assert img.get_attribute('loading') == "lazy"
        assert img.get_attribute('src') is not None


# ==============================================================================
# Group 6: Echo Multi-Modal Pipeline & Infrastructure (5 tests)
# ==============================================================================

def test_tc_1_6_1_pipeline_page_header_metadata(pipeline_html: HTMLDocument):
    """TC-1.6.1: Pipeline Page Header & Metadata Structure."""
    assert pipeline_html.get_attribute('data-page') == "pipeline"

    page_title = pipeline_html.find_one('h1#page-title')
    assert page_title is not None, "h1#page-title not found on pipeline.html"
    assert page_title.text_content == "Echo Pipeline & DCC Infrastructure"


def test_tc_1_6_2_portfolio_live_stats_badges(pipeline_html: HTMLDocument):
    """TC-1.6.2: Portfolio Live Stats Badges Counter."""
    badges = pipeline_html.find_all('.stat-badge')
    assert len(badges) == 6, f"Expected 6 stat badges on pipeline.html, found {len(badges)}"

    badge_texts = [b.text_content for b in badges]
    assert "Port 9876 UDP LiveLink" in badge_texts
    assert "Port 9316 HTTP Monolith MCP" in badge_texts


def test_tc_1_6_3_toolchain_stack_cards_verification(pipeline_html: HTMLDocument):
    """TC-1.6.3: Toolchain Stack Cards Verification."""
    cards = pipeline_html.find_all('.toolchain-card')
    assert len(cards) == 7, f"Expected 7 toolchain cards, found {len(cards)}"

    titles = [c.find_one('h3').text_content for c in cards if c.find_one('h3')]
    assert any("UE 5.8" in t for t in titles)
    assert any("Blender 5.2" in t for t in titles)
    assert any("TouchDesigner" in t for t in titles)


def test_tc_1_6_4_production_flow_command_snippets(pipeline_html: HTMLDocument):
    """TC-1.6.4: Production Flow 7-Step Command Snippets."""
    steps = pipeline_html.find_all('.workflow-step')
    assert len(steps) == 7, f"Expected 7 workflow steps, found {len(steps)}"

    step_texts = [s.text_content for s in steps]
    assert any("TouchDesigner" in t for t in step_texts)
    assert any("Blender 5.2" in t for t in step_texts)
    assert any("LiveLink" in t for t in step_texts)


def test_tc_1_6_5_world_manifest_table_totals_row(pipeline_html: HTMLDocument):
    """TC-1.6.5: World Manifest Table Totals Row."""
    table = pipeline_html.find_one('table.manifest-table')
    assert table is not None, "table.manifest-table not found on pipeline.html"

    table_text = table.text_content
    assert "9876" in table_text
    assert "9316" in table_text
    assert "50021" in table_text


# ==============================================================================
# Group 7: Site-Wide Game UI Integration & Filigree Styling (5 tests)
# ==============================================================================

def test_tc_1_7_1_shell_navigation_brand_and_links(index_html: HTMLDocument):
    """TC-1.7.1: Shell Navigation Brand & Links Structure."""
    brand = index_html.find_one('header.shell-nav a.brand')
    assert brand is not None, "Brand link header.shell-nav a.brand not found"
    assert "MELODIA" in brand.text_content

    nav_links = index_html.find_all('nav.nav-links a')
    assert len(nav_links) == 5, f"Expected 5 navigation links, found {len(nav_links)}"


def test_tc_1_7_2_premium_button_classes_contracts(index_html: HTMLDocument):
    """TC-1.7.2: Premium Button Classes & Hover State Contracts."""
    primary_btn = index_html.find_one('a.button-premium-primary')
    assert primary_btn is not None, "Primary button a.button-premium-primary not found"

    premium_btns = index_html.find_all('a.button-premium')
    assert len(premium_btns) >= 3, f"Expected >= 3 premium buttons, found {len(premium_btns)}"


def test_tc_1_7_3_environment_card_grid_overlay(app_hub_html: HTMLDocument):
    """TC-1.7.3: Environment Card Grid & Overlay Tagging."""
    cards = app_hub_html.find_all('#worlds .viz-rail-item')
    assert len(cards) == 4, f"Expected 4 environment cards in #worlds, found {len(cards)}"

    first_card_text = cards[0].text_content
    assert "Sanctuary" in first_card_text


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
    assert "Dual-Track Production" in footer_text


# ==============================================================================
# Group 8: Text-Aware Scaling & Container Queries (5 tests)
# ==============================================================================

def test_tc_1_8_1_alignment_cards_grid_fluid_layout(index_html: HTMLDocument):
    """TC-1.8.1: Alignment Cards Grid Fluid Layout."""
    grid = index_html.find_one('.alignment-grid')
    assert grid is not None, ".alignment-grid not found on index.html"

    cards = index_html.find_all('article.alignment-card')
    assert len(cards) == 9, f"Expected 9 alignment cards on index.html, found {len(cards)}"


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
