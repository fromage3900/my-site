"""
Pytest configuration and shared fixtures for Wix Portfolio E2E Test Suite.
Provides path resolution and parsed HTMLDocument / CSSDocument instances.
"""

import sys
from pathlib import Path
import pytest

_tests_dir = str(Path(__file__).parent.resolve())
if _tests_dir not in sys.path:
    sys.path.insert(0, _tests_dir)

from dom_harness import HTMLDocument, CSSDocument


@pytest.fixture(scope="session")
def wix_dir() -> Path:
    """Returns absolute path to wix directory."""
    return Path(__file__).parent.parent.resolve()


@pytest.fixture(scope="session")
def index_html(wix_dir: Path) -> HTMLDocument:
    """Parsed HTMLDocument fixture for index.html."""
    html_path = wix_dir / "index.html"
    return HTMLDocument(html_path.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def app_hub_html(wix_dir: Path) -> HTMLDocument:
    """Parsed HTMLDocument fixture for application-hub.html."""
    html_path = wix_dir / "application-hub.html"
    return HTMLDocument(html_path.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def pipeline_html(wix_dir: Path) -> HTMLDocument:
    """Parsed HTMLDocument fixture for pipeline.html."""
    html_path = wix_dir / "pipeline.html"
    return HTMLDocument(html_path.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def gameplay_loop_html(wix_dir: Path) -> HTMLDocument:
    """Parsed HTMLDocument fixture for melodia-gameplay-loop.html."""
    html_path = wix_dir / "melodia-gameplay-loop.html"
    return HTMLDocument(html_path.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def design_specs_html(wix_dir: Path) -> HTMLDocument:
    """Parsed HTMLDocument fixture for design-specs.html."""
    html_path = wix_dir / "design-specs.html"
    return HTMLDocument(html_path.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def tokens_css(wix_dir: Path) -> CSSDocument:
    """Parsed CSSDocument fixture for melodia-tokens.css."""
    css_path = wix_dir / "melodia-tokens.css"
    if css_path.exists():
        return CSSDocument(css_path.read_text(encoding="utf-8"))
    return CSSDocument("")


@pytest.fixture(scope="session")
def components_css(wix_dir: Path) -> CSSDocument:
    """Parsed CSSDocument fixture for melodia-components.css."""
    css_path = wix_dir / "melodia-components.css"
    if css_path.exists():
        return CSSDocument(css_path.read_text(encoding="utf-8"))
    return CSSDocument("")


@pytest.fixture(scope="session")
def editorial_css(wix_dir: Path) -> CSSDocument:
    """Parsed CSSDocument fixture for melodia-editorial.css."""
    css_path = wix_dir / "melodia-editorial.css"
    if css_path.exists():
        return CSSDocument(css_path.read_text(encoding="utf-8"))
    return CSSDocument("")


@pytest.fixture(scope="session")
def game_ui_css(wix_dir: Path) -> CSSDocument:
    """Parsed CSSDocument fixture for melodia-game-ui.css."""
    css_path = wix_dir / "melodia-game-ui.css"
    if css_path.exists():
        return CSSDocument(css_path.read_text(encoding="utf-8"))
    return CSSDocument("")


@pytest.fixture(scope="session")
def mobile_css(wix_dir: Path) -> CSSDocument:
    """Parsed CSSDocument fixture for melodia-mobile.css."""
    css_path = wix_dir / "melodia-mobile.css"
    if css_path.exists():
        return CSSDocument(css_path.read_text(encoding="utf-8"))
    return CSSDocument("")


@pytest.fixture(scope="session")
def hub_css(wix_dir: Path) -> CSSDocument:
    """Parsed CSSDocument fixture for application-hub.css."""
    css_path = wix_dir / "application-hub.css"
    if css_path.exists():
        return CSSDocument(css_path.read_text(encoding="utf-8"))
    return CSSDocument("")
