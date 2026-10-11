'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lockReviewControls } = require('../tools/build-review.cjs');
const { Controller } = require('../minigame/js/controller');
const { Renderer } = require('../minigame/js/renderer');

const source = fs.readFileSync(path.join(__dirname, '../minigame/js/platform.js'), 'utf8');
function load(code) {
  const m = { exports: {} };
  const localRequire = id => require(path.resolve(__dirname, '../minigame/js', id));
  new Function('require', 'module', 'exports', code)(localRequire, m, m.exports);
  return m.exports.Platform;
}
function platform(Platform, envVersion) {
  const store = {};
  return new Platform({
    getAccountInfoSync: () => ({ miniProgram: { envVersion } }),
    getLaunchOptionsSync: () => ({ query: {} }),
    getStorageSync: key => store[key],
    setStorageSync: (key, value) => { store[key] = value; },
    getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 3,
      safeArea: { top: 44, bottom: 810 } }),
    getMenuButtonBoundingClientRect: () => ({ top: 52, bottom: 84, height: 32, left: 281, width: 87 })
  });
}
function hits(p) {
  const context = new Proxy({}, { get: () => () => {} });
  const renderer = new Renderer({ getContext: () => context }, p.api, p);
  renderer.ready = true;
  renderer.render(new Controller(p));
  return renderer.hits.map(item => item.id);
}

test('REVIEW-001: local test build retains debug controls; review build hides them in every environment', () => {
  const TestPlatform = load(source);
  const ReviewPlatform = load(lockReviewControls(source));
  const local = platform(TestPlatform, 'develop');
  assert.equal(local.testMode, true);
  const localHits = hits(local);
  assert.ok(localHits.includes('levels'));
  assert.ok(localHits.includes('restart'));
  for (const version of ['develop', 'trial', 'release']) {
    const review = platform(ReviewPlatform, version);
    assert.equal(review.testMode, false, version);
    const reviewHits = hits(review);
    assert.equal(reviewHits.includes('levels'), false, version);
    assert.equal(reviewHits.includes('restart'), false, version);
  }
});
