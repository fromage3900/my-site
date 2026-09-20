#!/usr/bin/env node
/**
 * Melodia Token Linter
 * Validates CSS token discipline and live typography against the Figma-aligned web SSOT
 */

const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..');
const WIX_DIR = path.join(SITE_ROOT, 'wix');
const TOKEN_CANDIDATES = [
  process.env.MELODIA_TOKENS_JSON,
  path.join(SITE_ROOT, 'melodia-design-system', 'tokens.json'),
  path.join(SITE_ROOT, '..', 'melodia-design-system', 'tokens.json'),
].filter(Boolean);
const TOKENS_CSS = path.join(WIX_DIR, 'melodia-tokens.css');

const HARD_ERRORS = [];
const SOFT_WARNINGS = [];

// 1. Load tokens.json primitives
let tokensJson = {};
let tokenSource = null;
for (const candidate of TOKEN_CANDIDATES) {
  try {
    if (!fs.existsSync(candidate)) continue;
    const raw = fs.readFileSync(candidate, 'utf-8');
    tokensJson = JSON.parse(raw);
    tokenSource = candidate;
    break;
  } catch (e) {
    SOFT_WARNINGS.push(`Could not parse token source ${candidate}: ${e.message}`);
  }
}
if (!tokenSource) {
  SOFT_WARNINGS.push(
    'tokens.json not found; using tracked melodia-tokens.css as the local token source'
  );
}

const PRIMITIVE_TOKENS = new Set();
function extractPrimitives(obj, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && value.value && value.type === 'color') {
      PRIMITIVE_TOKENS.add(fullKey);
    } else if (value && typeof value === 'object') {
      extractPrimitives(value, fullKey);
    }
  }
}
extractPrimitives(tokensJson.primitives || {});

// 2. Parse melodia-tokens.css for CSS custom properties
const cssText = fs.readFileSync(TOKENS_CSS, 'utf-8');
const cssTokenRegex = /--([a-z0-9-]+)\s*:/gi;
const cssTokens = new Set();
let match;
while ((match = cssTokenRegex.exec(cssText)) !== null) {
  cssTokens.add(match[1]);
}

// 3. Scan all CSS files for raw hex usage (excluding melodia-tokens.css)
const cssFiles = [];
function findCssFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCssFiles(full);
    } else if (entry.name.endsWith('.css') && entry.name !== 'melodia-tokens.css') {
      cssFiles.push(full);
    }
  }
}
findCssFiles(WIX_DIR);

// Raw hex pattern (3, 4, 6, 8 digit) - exclude CSS custom property references
const RAW_HEX_REGEX = /(^|[^-\w])#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})(?![a-fA-F0-9])/g;
const RAW_RGBA_REGEX = /\b(rgba?\([^)]+\))/g;

for (const cssFile of cssFiles) {
  const relPath = path.relative(WIX_DIR, cssFile);
  const content = fs.readFileSync(cssFile, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    // Skip comments
    if (line.trim().startsWith('/*') || line.trim().startsWith('//')) return;

    // Check raw hex
    let hexMatch;
    while ((hexMatch = RAW_HEX_REGEX.exec(line)) !== null) {
      const fullMatch = hexMatch[0];
      // Allow if it's a var() reference or in a comment
      if (!fullMatch.includes('var(') && !fullMatch.includes('--')) {
        HARD_ERRORS.push(`${relPath}:${i+1} — Raw hex color "${fullMatch.trim()}" — use CSS token instead`);
      }
    }

    // Check raw rgba (but allow in var() references)
    let rgbaMatch;
    while ((rgbaMatch = RAW_RGBA_REGEX.exec(line)) !== null) {
      if (!rgbaMatch[0].includes('var(')) {
        SOFT_WARNINGS.push(`${relPath}:${i+1} — Raw rgba "${rgbaMatch[1]}" — prefer token`);
      }
    }
  });
}


/* Typography guard: the public portfolio migrated to the current Figma UI roles
   (Space Grotesk + Crimson Text + IBM Plex Mono). Accessory Atelier is a separate
   product/campaign subsystem outside wix/ and intentionally keeps Times + Jost. */
const PUBLIC_ROUTES_PATH = path.join(WIX_DIR, 'public-routes.json');
const publicRoutes = JSON.parse(fs.readFileSync(PUBLIC_ROUTES_PATH, 'utf-8'));
const PUBLIC_HTML = new Set([
  ...(publicRoutes.canonical || []),
  ...(publicRoutes.secondary_case_studies || []),
  ...(publicRoutes.public_supporting || []),
  ...(publicRoutes.targeted_evidence || []),
  ...(publicRoutes.experience_labs || []),
  ...(publicRoutes.component_examples || []),
  'melusina-final-renders.html',
]);
const TYPOGRAPHY_SHARED_FILES = new Set([
  'melodia-luxury-type.css',
  'melodia-tokens.css',
  'melodia-home-hardening.css',
  'melodia-stage-character.css',
  'melodia-stage-character-hardening.css',
  'melodia-game-ui.css',
  'melodia-editorial-polish.css',
]);
const LEGACY_FAMILY_REGEX = /\b(?:Cinzel|Fraunces|Syne|Bricolage Grotesque|Instrument Serif|Azeret Mono)\b/i;
const DIRECT_INTER_REGEX = /(?:["']Inter["']|font-family\s*:\s*Inter\b|family=Inter(?=[:&"']))/i;
const LEGACY_DISPLAY_SWITCH_REGEX = /data-display-font=["']syne["']/i;

for (const rel of PUBLIC_HTML) {
  const full = path.join(WIX_DIR, rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf-8');
  if (LEGACY_FAMILY_REGEX.test(content)) {
    HARD_ERRORS.push(`${rel} — legacy Cinzel/Fraunces reference; use Figma-aligned font roles`);
  }
  if (DIRECT_INTER_REGEX.test(content)) {
    HARD_ERRORS.push(`${rel} — direct Inter font declaration; use --font-body / Space Grotesk`);
  }
  if (LEGACY_DISPLAY_SWITCH_REGEX.test(content)) {
    HARD_ERRORS.push(`${rel} — stale data-display-font="syne" switch; use "interface"`);
  }
}

for (const rel of TYPOGRAPHY_SHARED_FILES) {
  const full = path.join(WIX_DIR, rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf-8');
  if (LEGACY_FAMILY_REGEX.test(content)) {
    HARD_ERRORS.push(`${rel} — legacy Cinzel/Fraunces reference in shared typography CSS`);
  }
  if (DIRECT_INTER_REGEX.test(content)) {
    HARD_ERRORS.push(`${rel} — direct Inter font declaration in shared typography CSS`);
  }
}

// 4. Verify Nikki pillar accents exist in CSS
const REQUIRED_PILLARS = ['sakura', 'cathedral', 'cosmic', 'grotto', 'orrery'];
for (const pillar of REQUIRED_PILLARS) {
  const selector = `[data-pillar="${pillar}"]`;
  if (!cssText.includes(selector) && !cssText.includes(`.accent-${pillar}`)) {
    SOFT_WARNINGS.push(`Missing pillar accent for "${pillar}" in melodia-tokens.css`);
  }
}

// 5. Verify z-index scale tokens
const Z_TOKENS = ['z-starfield', 'z-aurora', 'z-content', 'z-hero-celestial', 'z-nav'];
for (const z of Z_TOKENS) {
  if (!cssTokens.has(z)) {
    SOFT_WARNINGS.push(`Missing z-index token: --${z}`);
  }
}

// 6. Verify spacing scale tokens (8pt base)
const SPACING_TOKENS = ['space-4', 'space-8', 'space-16', 'space-24', 'space-32', 'space-48', 'space-64', 'space-96', 'space-128'];
for (const s of SPACING_TOKENS) {
  if (!cssTokens.has(s)) {
    SOFT_WARNINGS.push(`Missing spacing token: --${s}`);
  }
}

// Report
console.log('=== MELODIA TOKEN LINT REPORT ===\n');

if (HARD_ERRORS.length === 0 && SOFT_WARNINGS.length === 0) {
  console.log('✅ ALL CHECKS PASSED');
  process.exit(0);
}

if (HARD_ERRORS.length > 0) {
  console.log(`🔴 HARD ERRORS (${HARD_ERRORS.length}):`);
  HARD_ERRORS.forEach(e => console.log(`  - ${e}`));
  console.log('');
}

if (SOFT_WARNINGS.length > 0) {
  console.log(`🟡 SOFT WARNINGS (${SOFT_WARNINGS.length}):`);
  SOFT_WARNINGS.forEach(w => console.log(`  - ${w}`));
  console.log('');
}

console.log(`Summary: ${HARD_ERRORS.length} errors, ${SOFT_WARNINGS.length} warnings`);
process.exit(HARD_ERRORS.length > 0 ? 1 : 0);