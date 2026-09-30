// Read-only probes for ITER-040. Exercises the actual minigame with in-memory wx storage.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Platform } = require('../minigame/js/platform');
const { Controller } = require('../minigame/js/controller');
const { Renderer } = require('../minigame/js/renderer');
const { seedFor } = require('../minigame/js/daily');
const { Game } = require('../minigame/js/core');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'artifacts/code-review-v0.1');
fs.mkdirSync(out, { recursive: true });
function setup(version = 'develop', store = {}) {
  const api = {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: version } }),
    getLaunchOptionsSync: () => ({ query: { level: 20 } }),
    getStorageSync: k => store[k],
    setStorageSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); },
    getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 1, safeArea: { top: 44, bottom: 810 } }),
  };
  const p = new Platform(api);
  return { api, p, store, c: new Controller(p, () => Date.parse('2026-09-30T08:00:00Z')) };
}
const t = setup();
const ctx = new Proxy({}, { get: () => () => {} });
const renderer = new Renderer({ getContext: () => ctx }, t.api, t.p);
const game = t.c.game;
const rects = renderer.tiles(game);
const visualBlocks = (a, b) => game.tiles[b.id].z > game.tiles[a.id].z && Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x) > .01 && Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y) > .01;
const disagreement = [];
for (const a of rects) for (const b of rects) {
  const ta = game.tiles[a.id], tb = game.tiles[b.id];
  const rule = tb.z > ta.z && Math.abs(ta.x-tb.x)<.94 && Math.abs(ta.y-tb.y)<.94;
  const visual = visualBlocks(a,b);
  if (rule !== visual) disagreement.push({ lower: a.id, upper: b.id, rule, visual });
}
// Follow the rule engine's legal solution; compare each board's visible blockers.
const exposedButBlocked = [], pickableButCovered = [];
for (let step=0; step<game.solution.length; step++) {
  const board = rects.filter(p => game.tiles[p.id].zone === 'board');
  for (const a of board) {
    const blockers = board.filter(b => visualBlocks(a,b)).map(b=>b.id);
    if (!blockers.length && !game.canPick(a.id)) exposedButBlocked.push({step,id:a.id});
    if (blockers.length && game.canPick(a.id)) pickableButCovered.push({step,id:a.id,blockers});
  }
  game.pick(game.solution[step]);
}
// A failed account API must not let a development session mutate existing production data.
const production = setup('release');
const productionKey = production.p.key.replace('progress.v1','daily.v2');
const beforeProduction = JSON.stringify(production.store[productionKey]);
const unknownApi = {...production.api, getAccountInfoSync: () => { throw Error('account API unavailable'); }};
const unknownPlatform = new Platform(unknownApi);
const unknownController = new Controller(unknownPlatform, () => Date.parse('2026-09-30T08:00:00Z'));
unknownController.action('abandonResume');
const isolation = {channel:unknownPlatform.channel,key:unknownPlatform.key,productionChanged:beforeProduction!==JSON.stringify(production.store[productionKey])};
// Saved state is untrusted; run-level fields also need validation before later use.
const malformed = setup();
const dailyKey = malformed.p.key.replace('progress.v1','daily.v2');
malformed.store[dailyKey].run.completed = {};
const restored = new Controller(malformed.p, () => Date.parse('2026-09-30T08:00:00Z'));
let malformedResult = {modalAtLoad:restored.modal};
try { restored.action('abandonResume'); malformedResult.action='completed'; }
catch(e) { malformedResult.error=e.message; }
malformedResult.modalAfterReload = new Controller(malformed.p).modal;
const stats = fs.readdirSync(path.join(root,'minigame/js')).filter(n=>n.endsWith('.js')).map(name=>{
  const lines=fs.readFileSync(path.join(root,'minigame/js',name),'utf8').split(/\r?\n/);
  return {name,lines:lines.length,maxLine:Math.max(...lines.map(s=>s.length)),linesOver200:lines.filter(s=>s.length>200).length};
});
const timings=[];
for(let level=1;level<=30;level++) {const begin=performance.now();new Game(level,seedFor('2026-09-30',level));timings.push({level,ms:performance.now()-begin});}
const result = {
  context:'Node probes; not WeChat or real-device verification',
  geometry:{mismatchedPairs:disagreement.length,examples:disagreement.slice(0,8),exposedButBlocked:exposedButBlocked.slice(0,8),pickableButCovered:pickableButCovered.slice(0,8)},
  unknownEnvironment:isolation,
  malformedRun:malformedResult,
  sourceMetrics:stats,
  generationTiming:{max:timings.reduce((a,b)=>a.ms>b.ms?a:b),totalMs:timings.reduce((s,t)=>s+t.ms,0)},
};
fs.writeFileSync(path.join(out,'probes.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
// A successful reproduction is still a product defect, not a passing quality gate.
process.exitCode = isolation.productionChanged || malformedResult.error ? 1 : 0;
