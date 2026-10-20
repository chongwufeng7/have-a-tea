'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Renderer}=require('../minigame/js/renderer');
const {setup,dismiss,ctx}=require('./helpers/trolley');
test('TEST-049-07 swap count and disabled hit are consistent; obsolete tools absent',()=>{const t=setup();dismiss(t.c);const r=new Renderer({getContext:()=>ctx()},t.api,t.p);r.ready=true;r.render(t.c);assert.equal(r.hits.find(h=>h.id==='swap').enabled,true);t.c.tool('swap');r.render(t.c);assert.equal(r.hits.find(h=>h.id==='swap').enabled,false);assert.ok(!r.hits.some(h=>['undo','shuffle','remove'].includes(h.id)));const h=r.hits.find(h=>h.id==='swap');assert.equal(r.target((h.x+10)*r.scale+r.offset,(h.y+10)*r.scale+r.originY),null);});
