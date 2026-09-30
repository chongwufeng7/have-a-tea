const test=require('node:test'),assert=require('node:assert/strict');
const {Renderer}=require('../minigame/js/renderer'),{Game}=require('../minigame/js/core');
test('TEST-UI-039: remaining-count visuals do not grant illegal clicks or refill tools',()=>{
 const calls=[],hits=[],r=Object.create(Renderer.prototype);r.image=(...a)=>calls.push(a);r.crop=()=>{};r.text=()=>{};r.hit=(...a)=>hits.push(a);const g=new Game(20);
 for(const id of ['undo','shuffle','remove']){calls.length=0;hits.length=0;r.toolButton(g,id,id,0,0);assert.equal(calls[0][0],'shuffle-base.png');assert.equal(hits[0][5],id==='shuffle');g.tools[id]=0;calls.length=0;hits.length=0;r.toolButton(g,id,id,0,0);assert.equal(calls[0][0],'tool-base.png');assert.equal(hits[0][5],false);assert.equal(g.use(id),false);}
});
