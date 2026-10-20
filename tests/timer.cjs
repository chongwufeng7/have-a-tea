'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {setup,dismiss,win,ctx}=require('./helpers/trolley');
const {duration,format}=require('../minigame/js/timer');
const {Renderer}=require('../minigame/js/renderer');
const {clone}=require('../minigame/js/daily');
const start=()=>{const t=setup();dismiss(t.c);return t;};
const advance=(t,ms)=>t.setTime(new Date(t.c.now()+ms).toISOString());
const pick=c=>c.pick(c.game.tiles.find(t=>t.zone==='board'&&t.type===c.game.baskets[c.game.current].type).id);
test('TEST-049-TIME-V2 old timed saves retain remaining time, next/new level uses shorter limits',()=>{
 for(const [level,oldSeconds] of [[1,120],[6,150],[11,180],[21,240],[30,240]]){const t=setup({level});dismiss(t.c);pick(t.c);const oldDuration=oldSeconds*1000,key=t.c.storage.key;t.store[key].run.timer={version:1,durationMs:oldDuration,remainingMs:oldDuration-5000,started:true};const c=t.reload();assert.equal(c.storageBlocked,false);assert.equal(c.timer.remainingMs,oldDuration-5000);c.action('resume');assert.equal(c.timer.version,1);win(c);if(level<30){c.action('next');assert.equal(c.timer.version,2);assert.equal(c.timer.remainingMs,duration(level+1));}c.start(level);assert.equal(c.timer.version,2);assert.equal(c.timer.remainingMs,duration(level));}
 const untouched=setup();untouched.store[untouched.c.storage.key].run.timer={version:1,durationMs:120000,remainingMs:120000,started:false};const c=untouched.reload();assert.equal(c.timer.version,2);assert.equal(c.timer.remainingMs,90000);assert.equal(c.timer.started,false);
});
test('TEST-049-TIME-01 limits, introduction and first legal pick',()=>{
 assert.deepEqual([1,5,6,10,11,20,21,30].map(n=>duration(n)),[90,90,120,120,150,150,180,180].map(n=>n*1000));
 const t=setup();advance(t,600000);t.c.tick();assert.equal(t.c.timer.remainingMs,90000);dismiss(t.c);advance(t,600000);t.c.tick();assert.equal(t.c.timer.started,false);assert.equal(t.c.pick(-1),false);assert.equal(t.c.timer.started,false);assert.equal(pick(t.c),true);advance(t,1234);t.c.tick();assert.equal(t.c.timer.remainingMs,88766);assert.equal(format(15001),'00:16');assert.equal(format(15000),'00:15');
});
test('TEST-049-TIME-02 settings, rules, confirmation, background and resume pause exact remaining time',()=>{
 const t=start();pick(t.c);advance(t,1500);t.c.action('settings');assert.equal(t.c.timer.remainingMs,88500);advance(t,90000);t.c.tick();t.c.action('rules');advance(t,90000);t.c.action('close');t.c.action('newChallenge');advance(t,90000);t.c.action('close');t.c.action('close');assert.equal(t.c.timer.remainingMs,88500);advance(t,250);t.c.hide();assert.equal(t.c.timer.remainingMs,88250);advance(t,3600000);t.c.show();advance(t,90000);t.c.tick();assert.equal(t.c.modal,'resume');t.c.action('resume');assert.equal(t.c.timer.remainingMs,88250);advance(t,500);t.c.tick();assert.equal(t.c.timer.remainingMs,87750);
});
test('TEST-049-TIME-03 reload retains time, expired run cannot swap or pick and ends once',()=>{
 const t=start();pick(t.c);advance(t,5000);t.c.tick();const c=t.reload();assert.equal(c.timer.remainingMs,85000);advance(t,600000);c.tick();assert.equal(c.timer.remainingMs,85000);c.action('resume');advance(t,85000);c.tick();assert.equal(c.modal,'timeout');assert.equal(c.saved.run.reason,'timeout');assert.equal(c.timer.remainingMs,0);assert.equal(c.tool('swap'),false);assert.equal(pick(c),false);c.tick();assert.equal(c.saved.history.length,1);const r=t.reload();assert.equal(r.modal,'timeout');assert.equal(r.timer.remainingMs,0);r.action('retry');assert.equal(r.timer.remainingMs,90000);assert.equal(r.timer.started,false);
});
test('TEST-049-TIME-04 win freezes timer, next level resets timer and preserves spent swap',()=>{
 const t=start();t.c.tool('swap');win(t.c);const left=t.c.timer.remainingMs;advance(t,999999);t.c.tick();assert.equal(t.c.timer.remainingMs,left);t.c.action('next');assert.equal(t.c.game.config.level,2);assert.equal(t.c.timer.started,false);assert.equal(t.c.timer.remainingMs,90000);assert.equal(t.c.game.tools.swap,0);
});
test('TEST-049-TIME-05 old save migration preserves exact board and malformed timer is blocked',()=>{
 const t=start();pick(t.c);const board=t.c.game.serialize(),key=t.c.storage.key;delete t.store[key].run.timer;const migrated=t.reload();assert.deepEqual(migrated.game.serialize(),board);assert.equal(migrated.timer.remainingMs,90000);assert.equal(migrated.timer.started,false);const original=clone(t.store[key]);t.store[key].run.timer={version:2,durationMs:90000,remainingMs:Infinity,started:true};const bad=structuredClone(t.store[key]);assert.equal(t.reload().storageBlocked,true);assert.deepEqual(t.store[key],bad);t.store[key]=original;
});
test('TEST-049-TIME-06 deadline takes precedence over last card, saving failure pauses and retries exact state',()=>{
 const t=start();dismiss(t.c);while(t.c.game.tiles.filter(x=>x.zone==='board').length>1)pick(t.c);advance(t,90000);const before=t.c.game.actions.length;assert.equal(pick(t.c),false);assert.equal(t.c.modal,'timeout');assert.equal(t.c.game.actions.length,before);
 const s=start();pick(s.c);const write=s.api.setStorageSync;s.api.setStorageSync=()=>{throw Error('full');};advance(s,1100);s.c.tick();assert.equal(s.c.modal,'saveError');const left=s.c.timer.remainingMs;advance(s,90000);s.c.tick();assert.equal(s.c.timer.remainingMs,left);s.api.setStorageSync=write;s.c.action('retrySave');assert.equal(s.c.timer.remainingMs,left);assert.equal(s.c.modal,null);
});
test('TEST-049-TIME-07 footer and all cards stay separated and fit short/tall safe areas',()=>{
 for(const [width,height] of [[320,568],[402,850],[430,932]])for(const level of [1,30]){const t=setup({width,height,level});dismiss(t.c);const r=new Renderer({getContext:()=>ctx()},t.api,t.p);r.ready=true;r.render(t.c);assert.ok(r.tiles(t.c.game).every(p=>p.y+p.h<871));assert.ok(r.originY+900*r.scale<=height-34);const texts=[];r.text=(s,...a)=>texts.push({s,a});t.c.timer.started=true;t.c.timer.remainingMs=15000;r.render(t.c);assert.ok(texts.some(x=>x.s==='剩余时间 00:15'&&x.a[3]==='#ff8a73'));assert.ok(!r.hits.some(h=>/ad|extend/i.test(h.id)));}
});
