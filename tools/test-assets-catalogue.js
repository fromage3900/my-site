// Node tests for the Assets catalogue filter logic (wix/melodia-assets-catalogue.js).
// Run: node tools/test-assets-catalogue.js
const assert = require('node:assert/strict');
const { filterProducts, countByCategory } = require('../wix/melodia-assets-catalogue.js');

const products = [
  { title: 'Rose Window Kit', category: 'ornaments', software: ['Unreal Engine 5'], formats: ['FBX', 'glTF'], description: 'Gothic rose windows.', status: 'published' },
  { title: 'Sea Glass Props', category: 'props', software: ['Blender'], formats: ['blend'], description: 'Shells and glass.', status: 'draft' },
  { title: 'Lantern Ribbon Materials', category: 'materials', software: ['Substance Designer'], formats: ['sbsar'], description: 'Silk and ribbon.', status: 'published' },
];

// no filters returns everything
assert.equal(filterProducts(products, { category: 'all', query: '' }).length, 3);
// category filter
assert.deepEqual(filterProducts(products, { category: 'props', query: '' }).map(p => p.title), ['Sea Glass Props']);
// search matches title, description, software and formats, case-insensitively
assert.equal(filterProducts(products, { category: 'all', query: 'ROSE' })[0].title, 'Rose Window Kit');
assert.equal(filterProducts(products, { category: 'all', query: 'blender' })[0].title, 'Sea Glass Props');
assert.equal(filterProducts(products, { category: 'all', query: 'sbsar' })[0].title, 'Lantern Ribbon Materials');
// every term must match (AND), whitespace tolerant
assert.equal(filterProducts(products, { category: 'all', query: '  gothic   windows ' }).length, 1);
assert.equal(filterProducts(products, { category: 'all', query: 'gothic blender' }).length, 0);
// category and search combine
assert.equal(filterProducts(products, { category: 'props', query: 'rose' }).length, 0);
// no products → empty result, no throw
assert.deepEqual(filterProducts([], { category: 'all', query: 'x' }), []);
// counts per category
assert.deepEqual(countByCategory(products), { ornaments: 1, props: 1, materials: 1 });
assert.deepEqual(countByCategory([]), {});
console.log('assets catalogue tests: ok');
