// Zero-dependency runtime-logic regression smoke for authored 3D-Jutsu dressing.
// Evaluates the actual class methods, with fake POIs / Three.js groups. All
// gameplay state and animated primitive refs must remain untouched.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL('../js/' + name, import.meta.url), 'utf8');
function extractMethod(file, name, sentinel) {
  const code = read(file);
  const open = code.indexOf('  ' + name + '(kit) {');
  assert.ok(open >= 0, 'Missing method: ' + name);
  const close = code.indexOf(sentinel, open);
  assert.ok(close > open, 'Missing method terminator for ' + name);
  const method = code.slice(open, close);
  const body = method.slice(method.indexOf('{') + 1, method.lastIndexOf('}'));
  return new Function('kit', body);
}
const dressPOIs = extractMethod('activities.js', 'installHarmonicGrove', '  // ------------------------------------------------------------ per frame');
const dressHub = extractMethod('world.js', '_dressHubWithGrove', '  // ------------------------------------------------------------------ sampling');

const makeObject = () => ({
  visible: true, rotation: { y: 0 }, name: '',
  position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
  scale: { setScalar(s) { this.value = s; } },
});
const makeGroup = (primitives) => ({
  children: Array.from({ length: primitives }, makeObject),
  add(obj) { this.children.push(obj); },
});
const low = new Set(['ARC_pearl_column', 'ARC_column_pillar_small', 'ARC_round_resonance_step']);
const base = { spawn(name) { return low.has(name) ? makeObject() : null; } };
const full = { spawn() { return makeObject(); } };
const shr = { type: 'shrine', mesh: makeGroup(5), spin: { key: 'clef' } };
const pyl = { type: 'pylon', mesh: makeGroup(2), spin: { key: 'crystal' } };
const boss = { type: 'boss', mesh: makeGroup(2), spin: { key: 'orb' } };
const chest = { type: 'chest', mesh: makeGroup(2), lid: { key: 'animated lid' } };
const actual = { pois: [shr, pyl, boss, chest] };
const primitiveClef = shr.mesh.children[4];
const primitiveCrystal = pyl.mesh.children[1];

dressPOIs.call(actual, base);
assert.equal(shr.mesh.children.length, 9, 'Base shrine has four columns');
assert.equal(primitiveClef.visible, true, 'Shrine clef stays visible');
assert.equal(pyl.mesh.children[0].visible, true, 'Pylon primitive remains until replacement');
const oldBase = pyl._groveVisuals.get('pylon_base_fallback');
assert.ok(oldBase, 'Fallback pylon base added');
dressPOIs.call(actual, full);
assert.equal(shr.mesh.children.length, 10, 'Optional shrine bowl added once');
assert.ok(shr._groveVisuals.get('shrine_echo_bowl'));
assert.equal(shr._groveVisuals.size, 5);
assert.equal(pyl._groveVisuals.size, 2);
assert.equal(chest._groveVisuals.size, 1);
assert.equal(boss._groveVisuals.size, 1);
assert.equal(pyl.mesh.children[0].visible, false, 'Pylon primitive replaced');
assert.equal(oldBase.visible, false, 'Fallback base hidden once upgraded');
assert.equal(primitiveCrystal.visible, true, 'Active pylon crystal remains visible');
assert.equal(primitiveClef.visible, true);
assert.deepEqual(chest.lid, { key: 'animated lid' }, 'Chest state not modified');
const counts = actual.pois.map(p => p.mesh.children.length);
dressPOIs.call(actual, full);
assert.deepEqual(actual.pois.map(p => p.mesh.children.length), counts, 'Retry cannot duplicate models');
assert.equal(shr.spin.key, 'clef');
assert.equal(pyl.spin.key, 'crystal');
assert.equal(boss.spin.key, 'orb');

const hub = {
  hubGroup: makeGroup(0),
  fontStaticBase: makeObject(), fontStaticWater: makeObject(),
  height() { return 2.2; },
};
dressHub.call(hub, base);
assert.equal(hub.hubGroup.children.length, 0, 'No extra models until downloaded');
assert.equal(hub.fontStaticBase.visible, true, 'Fallback fountain remains');
dressHub.call(hub, full);
assert.equal(hub.hubGroup.children.length, 5, 'Exactly five curated hub props');
assert.equal(hub.fontStaticBase.visible, false);
assert.equal(hub.fontStaticWater.visible, false);
assert.equal(hub._hubGroveProps.get('ARC_lyre_gate').position.z, -39);
dressHub.call(hub, full);
assert.equal(hub.hubGroup.children.length, 5, 'Hub placement is idempotent');

console.log('PASS: optional POI and hub dressing, idempotency, primitive fallback, animated cores');
