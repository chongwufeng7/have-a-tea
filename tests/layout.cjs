const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game,boardLayout,LEVELS}=require('../prototypes/snack-tiles/game.js');
test('LAYOUT-001: centered full board fits narrow viewports and stays fixed after removal',()=>{
 for(let level=1;level<=30;level++)for(const width of [260,320,378]){
  const g=new Game(level),v=boardLayout(g.tiles,width);
  const xs=g.tiles.map(t=>v.left+t.x*v.unit),ys=g.tiles.map(t=>v.top+t.y*v.unit),size=.94*v.unit;
  const left=Math.min(...xs),right=width-Math.max(...xs)-size,top=Math.min(...ys),bottom=v.height-Math.max(...ys)-size;
  assert.ok(Math.abs(left-right)<1e-8);assert.ok(Math.abs(top-bottom)<1e-8);assert.ok(left>=15.99&&top>=19.99);assert.ok(size>=44);
  g.solution.slice(0,3).forEach(id=>g.pick(id));assert.deepEqual(boardLayout(g.tiles,width),v);
 }
});
test('LAYOUT-003: early boards keep three rows; later layers interlock on both axes',()=>{
 for(const c of LEVELS){
  const {tiles}=new Game(c.level);
  if(c.level<=10)assert.equal(new Set(tiles.map(t=>t.y)).size,3);
  else {
   assert.ok(tiles.some(a=>tiles.some(b=>b.z===a.z+1&&a.x!==b.x&&a.y!==b.y&&Math.abs(a.x-b.x)<.94&&Math.abs(a.y-b.y)<.94)));
   // Same-layer tiles must remain separate, otherwise visual overlap would be clickable.
   for(const a of tiles)for(const b of tiles)if(a.id!==b.id&&a.z===b.z)assert.ok(Math.abs(a.x-b.x)>=.94||Math.abs(a.y-b.y)>=.94);
  }
 }
});
test('LAYOUT-002: shared covering replaces independent piles, preserving level budgets',()=>{
 const {Game:PreviousGame}=require('../artifacts/layout-v0.5/baseline/game.js');
 const blocks=(a,b)=>a.z>b.z&&Math.abs(a.x-b.x)<.94&&Math.abs(a.y-b.y)<.94;
 for(let level=1;level<=30;level++){
  const old=new PreviousGame(level),g=new Game(level);assert.deepEqual(g.config,old.config);
  if(level>1)assert.ok(g.tiles.some(a=>g.tiles.filter(b=>b.z===a.z-1&&blocks(a,b)).length>=2),`level ${level}: no shared blocker`);
  assert.deepEqual(new Game(level).tiles,g.tiles,'restarts must stay deterministic');
 }
});
