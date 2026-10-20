'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Renderer}=require('../minigame/js/renderer');
const {setup,dismiss,ctx}=require('./helpers/trolley');
test('TEST-049-SIZE-01 header and count badge keep safe-area breathing room with high or missing capsule',()=>{
 const cases=[{width:320,height:568,top:0,bottom:568,menu:{top:0,height:32}},{width:402,height:850,top:44,bottom:816,menu:{top:52,height:32}},{width:430,height:932,top:59,bottom:898,menu:{top:0,height:32}},{width:539,height:1182,top:0,bottom:1182,menu:undefined}];
 for(const m of cases){const t=setup({level:30,width:m.width,height:m.height});dismiss(t.c);t.api.getWindowInfo=()=>({windowWidth:m.width,windowHeight:m.height,pixelRatio:1,safeArea:{top:m.top,bottom:m.bottom}});t.api.getMenuButtonBoundingClientRect=()=>m.menu;const r=new Renderer({getContext:()=>ctx()},t.api,t.p);r.ready=true;r.render(t.c);assert.ok(r.originY+24*r.scale>=m.top+16-1e-6);assert.ok(r.originY+900*r.scale<=m.bottom-12+1e-6);if(m.menu)assert.ok(r.originY+24*r.scale>=m.menu.top+m.menu.height+16-1e-6);const settings=r.hits.find(h=>h.id==='settings'),swap=r.hits.find(h=>h.id==='swap');assert.equal(settings.y,swap.y);assert.ok(swap.x>300);assert.ok(swap.x+swap.w<=402);assert.equal(r.target((swap.x+24)*r.scale+r.offset,(swap.y+24)*r.scale+r.originY),'swap');assert.ok(r.tiles(t.c.game).every(p=>p.y>=420&&p.y+p.h<871));for(const h of r.hits){const x=(h.x+h.w/2)*r.scale+r.offset,y=(h.y+h.h/2)*r.scale+r.originY;assert.equal(r.target(x,y),h.enabled?h.id:null);}assert.equal(r.tiles(t.c.game).length,63);}
});
