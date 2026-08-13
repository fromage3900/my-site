# E2E Test Infra: Melodia Wix Website Overhaul

## Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests validate user-visible behavior, HTML5 structure, CSS token clamps, container query declarations, and asset link integrity without relying on internal build steps or uninstalled browser dependencies.
- **Zero-Dependency Pytest Harness**: Built natively using Python 3.14 + `pytest 9.1.1` and Python's standard library `html.parser` & `re`. No external `npm` or `pip` package installation required.
- **Methodology**: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|----------------------|:------:|:------:|:------:|:------:|
| 1 | Dual-Track Production Hero | ORIGINAL_REQUEST R1 & PROJECT.md #1 | 5 | ✓ | ✓ | ✓ |
| 2 | P0 First Dream JRPG Loop | ORIGINAL_REQUEST R1 & PROJECT.md #2 | 5 | ✓ | ✓ | ✓ |
| 3 | 12 P0 Foundation Gates | ORIGINAL_REQUEST R1 & PROJECT.md #2 | 5 | ✓ | ✓ | ✓ |
| 4 | QuillScript Engine & Dialogue | ORIGINAL_REQUEST R1 & PROJECT.md #2 | 5 | ✓ | ✓ | ✓ |
| 5 | Rhythm Combat & Music Clock | ORIGINAL_REQUEST R1 & PROJECT.md #2 | 5 | ✓ | ✓ | ✓ |
| 6 | Echo Multi-Modal Pipeline | ORIGINAL_REQUEST R1 & PROJECT.md #2 | 5 | ✓ | ✓ | ✓ |
| 7 | Site-Wide Game UI Integration | ORIGINAL_REQUEST R2 & PROJECT.md #3 | 5 | ✓ | ✓ | ✓ |
| 8 | Text-Aware Scaling & Container Queries | ORIGINAL_REQUEST R3 & PROJECT.md #5,#6 | 5 | ✓ | ✓ | ✓ |
| **Total** | | | **40** | **10** | **5** | **5** |

## Test Architecture
- **Location**: `C:\EnvironmentPortfolio\wix\tests\`
- **Test Runner Engine**: `python -m pytest C:\EnvironmentPortfolio\wix\tests -v`
- **DOM AST Engine**: `wix/tests/dom_harness.py` (Zero-dependency HTML5 parser & CSS AST query engine)
- **Shared Fixtures**: `wix/tests/conftest.py` (Discovers HTML/CSS files, sets up parser fixtures)
- **Suite Components**:
  - `test_tier1_features.py`: 40 Feature coverage test cases across 8 core feature groups
  - `test_tier2_boundaries.py`: Boundary value & edge case test cases (viewports 320px-3840px, text density, missing media fallbacks)
  - `test_tier3_interactions.py`: Cross-feature interaction test cases (theme mode switches, Game UI in editorial cards)
  - `test_tier4_scenarios.py`: Real-world application scenarios (look-book navigation journey, mobile menu, accessibility)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Web Look-Book Journey | Landing -> Application Hub -> Gameplay Loop -> Specs -> Pipeline -> Resume | High |
| 2 | Mobile Responsive Navigation | Viewport 375px hamburger menu toggle & multi-page navigation | Medium |
| 3 | Accessibility Focus & Skip Link | Keyboard Tab navigation, skip-link focus, focus-visible outlines | Medium |
| 4 | Interactive Escher Geometry Drag | Drag widget interaction on Space Cathedral geometry card | Medium |
| 5 | Video Autoplay & Poster Fallback | Media loop playback state and poster image fallback verification | Low |

## Coverage Thresholds
- **Tier 1**: ≥5 test cases per feature (40 test cases total across 8 feature groups)
- **Tier 2**: Viewport extremes (320px to 3840px), text density limits, and missing media fallbacks
- **Tier 3**: Pairwise theme mode switches and nested Game UI components
- **Tier 4**: ≥5 realistic application scenarios
- **Total Suite Target**: ≥60 executable E2E assertions passing with exit code 0
