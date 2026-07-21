#!/usr/bin/env node
/**
 * Melodia Token Linter
 * Validates CSS token discipline against tokens.json SSOT
 */

const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..');
const WIX_DIR = path.join(SITE_ROOT, 'wix');
const TOKENS_JSON = path.join(SITE_ROOT, '..', 'melodia-design-system', 'tokens.json');
const TOKENS_CSS = path.join(WIX_DIR, 'melodia-tokens.css');

const HARD_ERRORS = [];
const SOFT_WARNINGS = [];

// 1. Load tokens.json primitives
let tokensJson = {};
try {
  const raw = fs.readFileSync(TOKENS_JSON, 'utf-8');
  tokensJson = JSON.parse(raw);
} catch (e) {
  HARD_ERRORS.push(`Cannot load tokens.json: ${e.message}`);
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
const cssTokenRegex = /--([a-z-]+):\s*#?([a-fA-F0-9]+|rgba?\([^)]+\))/g;
const cssTokens = new Map();
let match;
while ((match = cssTokenRegex.exec(cssText)) !== null) {
  cssTokens.set(match[1], match[2]);
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