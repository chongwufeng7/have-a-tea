const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game,LEVELS}=require('../prototypes/snack-tiles/game.js');
test('STRAT-001: same-layer triples are absent in default and 600 seeded initial boards',()=>{
 for(const config of LEVELS)for(let sample=0;sample<=20;sample++){
  const g=new Game(config.level,config.seed+sample),byLayer=new Map();
  for(const t of g.tiles){const key=t.z+':'+t.type;byLayer.set(key,(byLayer.get(key)||0)+1);}
  assert.ok([...byLayer.values()].every(n=>n<=2));
  assert.equal(new Set(g.tiles.map(t=>t.z)).size,config.layers);
  for(const id of g.solution)assert.ok(g.pick(id));assert.equal(g.status,'won');
 }
});
test('STRAT-002: levels 2–30 have reproducible wrong-order losses and undo/remove recover space',()=>{
 for(let level=2;level<=30;level++){
  let lost=null;
  for(let attempt=1;attempt<=30&&!lost;attempt++){
   let seed=attempt;const g=new Game(level);
   for(let step=0;step<g.config.count&&g.status==='playing';step++){
    const open=g.tiles.filter(t=>g.canPick(t.id));
    const avoidMatch=open.filter(t=>g.tray.filter(id=>g.tiles[id].type===t.type).length<2);
    const choices=avoidMatch.length?avoidMatch:open;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    g.pick(choices[seed%choices.length].id);
   }
   if(g.status==='lost')lost=g;
  }
  assert.ok(lost,'No wrong-order loss found in level '+level);
  const before=lost.history;assert.equal(lost.tray.length,7);
  assert.ok(lost.use('undo'));assert.equal(lost.status,'playing');assert.deepEqual(lost.snapshot(),before);
  assert.ok(lost.use('remove'));assert.equal(lost.status,'playing');assert.equal(lost.reserve.length,3);assert.equal(lost.tray.length,3);
 }
});
