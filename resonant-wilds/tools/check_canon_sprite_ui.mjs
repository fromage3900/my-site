// Canon Melusina four-frame sprite intake; physical Safari QA is a separate gate.
import { readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, 'assets/sprites/melusina-canon-front-4.png');
const png = readFileSync(file);
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'PNG signature');
assert.equal(png.readUInt32BE(16), 288, 'four 72px-wide front frames');
assert.equal(png.readUInt32BE(20), 72, '72px height');
assert.ok(statSync(file).size < 20000, 'atlas must stay under 20KB');
const read = (p) => readFileSync(join(root, p), 'utf8');
const html = read('index.html'), css = read('style.css'), ui = read('js/ui.js'), sw = read('sw.js');
assert.ok(html.includes('id="portrait"') && html.includes('melusina-sprite-track'), 'HUD wiring');
assert.ok(ui.includes('melusina-wardrobe-preview') && ui.includes('melusina-perfect'), 'Wardrobe and beat feedback');
assert.ok(css.includes('steps(4, end)') && css.includes('prefers-reduced-motion'), 'CSS walk and accessibility');
assert.ok(sw.includes('./assets/sprites/melusina-canon-front-4.png'), 'offline asset preload');
assert.ok(sw.includes('resonant-wilds-v16-20261112-melusina-sprite-ui'), 'new PWA cache namespace');
console.log('PASS: canon 4-frame sprite, responsive HUD/wardrobe, PWA offline and reduced motion');
