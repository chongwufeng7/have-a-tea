'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(root, 'game.json'))) throw Error('Expected a WeChat minigame project');
const { Platform } = require(path.join(root, 'js', 'platform.js'));
const { Controller } = require(path.join(root, 'js', 'controller.js'));
const { Renderer } = require(path.join(root, 'js', 'renderer.js'));
const result = [];
for (const envVersion of ['develop', 'trial', 'release']) {
  const store = {};
  const api = {
    getAccountInfoSync: () => ({ miniProgram: { envVersion } }),
    getLaunchOptionsSync: () => ({ query: { level: 20 } }),
    getStorageSync: key => store[key],
    setStorageSync: (key, value) => { store[key] = value; },
    getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 3,
      safeArea: { top: 44, bottom: 810 } }),
    getMenuButtonBoundingClientRect: () => ({ top: 52, bottom: 84, height: 32, left: 281, width: 87 })
  };
  const platform = new Platform(api);
  const controller = new Controller(platform);
  const context = new Proxy({}, { get: () => () => {} });
  const renderer = new Renderer({ getContext: () => context }, api, platform);
  renderer.ready = true;
  renderer.render(controller);
  const hidden = !renderer.hits.some(item => item.id === 'restart' || item.id === 'levels');
  assert.equal(platform.testMode, false, envVersion);
  assert.equal(hidden, true, envVersion);
  assert.equal(controller.game.config.level, 1, envVersion);
  const modal = controller.modal;
  controller.action('levels');
  controller.action('restart');
  assert.equal(controller.modal, modal, envVersion);
  result.push({ envVersion, hidden, level: controller.game.config.level });
}
console.log(JSON.stringify({ reviewProject: root, result }, null, 2));
