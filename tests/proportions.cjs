'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {Renderer}=require('../minigame/js/renderer');
const {setup,dismiss,ctx}=require('./helpers/trolley');
test('TEST-049-PROPORTION width fills on regular screens; compact layout preserves every control and saved geometry',()=>{
 for(const [width,height] of [[402,960],[430,932],[539,1182],[320,568],[375,667]]){
  const s=setup({level:30,width,height,query:{variant:'stacked'}});dismiss(s.c);const before=s.c.game.serialize(),r=new Renderer({getContext:()=>ctx()},s.api,s.p);r.ready=true;r.render(s.c);
  if(height>=932)assert.ok(Math.abs(r.scale-width/402)<1e-9,'use complete available width');
  assert.ok(Math.abs(r.originY-21*r.scale-(44+8/3))<1e-6);const tool=r.hits.find(h=>h.id==='shuffle');assert.ok(r.originY+(tool.y+tool.h)*r.scale<=height-46+1e-6);
  assert.ok(r.tiles(s.c.game).every(p=>p.y>=757/3+124&&p.y+p.h<=tool.y-18+1e-6));assert.deepEqual(s.c.game.serialize(),before);
  for(const h of r.hits.filter(h=>['settings','shuffle'].includes(h.id)))assert.equal(r.target((h.x+h.w/2)*r.scale+r.offset,(h.y+h.h/2)*r.scale+r.originY),h.id);
 }
});
test('TEST-049-PROPORTION tool files are exact Figma component exports for both states',()=>{
 const meta=JSON.parse(fs.readFileSync('assets/v1.0.3/figma-tools/source.json','utf8'));assert.equal(meta.items.length,4);for(const item of meta.items){const data=fs.readFileSync('minigame/assets/v103/'+item.file);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.sha256);assert.equal(data.readUInt32BE(16),168);assert.equal(data.readUInt32BE(20),156);}
});
test('TEST-049-STEAM full basket stays visible, pauses in settings and delays result until steam finishes',t=>{
 let now=1000;t.mock.method(Date,'now',()=>now);const {SERVE_MS}=require('../minigame/js/presentation');assert.equal(SERVE_MS,1000);
 const s=setup({query:{variant:'stacked'}});dismiss(s.c);const r=new Renderer({getContext:()=>ctx()},s.api,s.p);r.ready=true;r.render(s.c);
 for(const id of s.c.game.solution.slice(0,3)){s.c.pick(id);r.render(s.c);now+=230;r.render(s.c);}
 const serve=r.feedback.jobs.find(j=>j.kind==='serve');assert.ok(serve);assert.equal(serve.end-serve.start,1000);assert.ok(r.feedback.view().blocking);
 now+=300;r.render(s.c);assert.equal(r.feedback.view().serves.length,1);const time=r.feedback.time;s.c.action('settings');r.render(s.c);now+=2000;r.render(s.c);assert.equal(r.feedback.time,time);s.c.action('close');r.render(s.c);now+=900;r.render(s.c);assert.equal(r.feedback.view().blocking,false);
 let strokes=0,fills=0;r.ctx.stroke=()=>strokes++;r.ctx.fillRect=()=>fills++;r.ctx.createRadialGradient=()=>({addColorStop(){}});r.steam(0,0,.5);assert.equal(strokes,3);assert.equal(fills,3);r.steam(0,0,1);r.steam(0,0,0);assert.equal(strokes,3);assert.equal(fills,3);
 const {TWO_LAYOUT}=require('../minigame/js/completion-framing');assert.equal(TWO_LAYOUT.timerY-26,(53-26)/3);assert.ok(Math.abs(TWO_LAYOUT.basketY-(TWO_LAYOUT.timerY+28)-(115-81)/3)<1e-9);
});
