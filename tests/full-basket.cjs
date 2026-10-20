'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Renderer}=require('../minigame/js/renderer');
const {setup,dismiss,ctx,win}=require('./helpers/trolley');

test('TEST-049-RESET-01 automatic chain settles immediately and next card remains selectable',()=>{
 const s=setup();dismiss(s.c);const r=new Renderer({getContext:()=>ctx()},s.api,s.p);r.ready=true;r.render(s.c);
 assert.ok(r.hits.some(h=>h.id.startsWith('tile:')&&h.enabled));const types=s.c.game.baskets.map(b=>b.type);
 for(const type of [types[1],types[2],types[0]])for(let i=0;i<3;i++)assert.equal(s.c.pick(s.c.game.tiles.find(t=>t.zone==='board'&&t.type===type).id),true);
 assert.equal(s.c.game.served,3);assert.equal(s.c.game.tray.length,0);r.render(s.c);const h=r.hits.find(h=>h.id.startsWith('tile:')&&h.enabled);assert.ok(h);
 assert.equal(r.target((h.x+h.w/2)*r.scale+r.offset,(h.y+h.h/2)*r.scale+r.originY),h.id);assert.deepEqual(s.reload().game.serialize(),s.c.game.serialize());
});

test('TEST-049-RESET-02 picks, win and restore create no sound players while music still plays',()=>{
 const s=setup();dismiss(s.c);let players=0;s.api.createInnerAudioContext=()=>{players++;return {play(){},pause(){},onError(){}};};
 win(s.c);assert.equal(players,0);const c=s.reload();assert.equal(c.modal,'resume');dismiss(c);assert.equal(c.modal,'won');assert.equal(players,0);c.music.interact();assert.equal(players,1);c.music.hide();c.music.show();assert.equal(players,1);
});

test('TEST-049-LEGACY-03 flat result controls remain immediate and music settings remain available',()=>{
 const s=setup();dismiss(s.c);const r=new Renderer({getContext:()=>ctx()},s.api,s.p);r.ready=true;s.c.action('settings');r.render(s.c);
 assert.ok(r.hits.some(h=>h.id==='music'));s.c.action('close');win(s.c);r.render(s.c);assert.ok(r.hits.find(h=>h.id==='next')?.enabled);
 const before=s.c.game.serialize();r.render(s.c);assert.deepEqual(s.c.game.serialize(),before);s.c.action('next');assert.equal(s.c.game.config.level,2);
});
