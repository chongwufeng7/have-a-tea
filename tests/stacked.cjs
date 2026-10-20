'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Game,CONFIG_VERSION,FLAT_VERSION}=require('../minigame/js/trolley');
const {Renderer}=require('../minigame/js/renderer');
const {setup,dismiss,ctx}=require('./helpers/trolley');
const fresh=(options={})=>{const s=setup({...options,query:{variant:'stacked'}});dismiss(s.c);return s;};
function counts(g){return g.tiles.filter(t=>t.zone==='board').map(t=>t.type).sort((a,b)=>a-b);}
function invariant(g){const ids=[...g.tray,...g.baskets.filter(Boolean).flatMap(b=>b.ids),...g.tiles.filter(t=>['board','gone'].includes(t.zone)).map(t=>t.id)];assert.equal(ids.length,g.tiles.length);assert.equal(new Set(ids).size,ids.length);const types=g.baskets.filter(Boolean).map(b=>b.type);assert.equal(new Set(types).size,types.length);for(let type=0;type<g.config.types;type++)assert.equal(g.tiles.filter(t=>t.type===type&&t.zone!=='gone').length,3*(g.pending.filter(t=>t===type).length+types.filter(t=>t===type).length));}
function finish(g){for(const id of g.solution)if(g.tiles[id].zone==='board')assert.equal(g.pick(id),true);assert.equal(g.status,'won');}

test('TEST-049-V2-STACK-01 900 boards are layered, exposed-only, initially solvable and replay exact',()=>{
 for(let level=1;level<=30;level++)for(let seed=0;seed<30;seed++){
  const g=new Game(level,seed);assert.equal(g.version,CONFIG_VERSION);assert.ok(g.tiles.some(t=>!g.canPick(t.id)));assert.ok(g.tiles.some(t=>g.canPick(t.id)));
  assert.ok(new Set(g.slots.map(s=>s.z)).size>=3);
  const blocked=g.tiles.find(t=>!g.canPick(t.id));assert.equal(g.pick(blocked.id),false);
  for(const id of g.solution){invariant(g);assert.equal(g.pick(id),true);}assert.equal(g.status,'won');invariant(g);assert.deepEqual(Game.restore(g.serialize()).tiles,g.tiles);
 }
});
test('TEST-049-V2-STACK-02 cover graph matches actual card rectangles',()=>{
 for(const level of [1,10,11,30]){const g=new Game(level,42);assert.ok(g.slots.some(upper=>g.slots.filter(lower=>lower.z===upper.z-1&&g.blocks(upper,lower)).length>=2),'one upper card must cover neighboring lower cards');for(const a of g.slots)for(const b of g.slots){if(a.id!==b.id&&a.z===b.z)assert.ok(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.w-1&&a.y+a.w-1>b.y),'same-layer faces do not overlap');}}
});

test('TEST-049-V2-SHARED matches 1.0.2 layer shapes after one uniform fit',()=>{
 const {layerPositions}=require('../minigame/js/core');
 for(const level of [1,6,11,30]){const g=new Game(level,7),expected=[];let groups=g.config.groups;for(let packet=0;groups>0;packet++){const m=Math.min(groups,g.config.types,12);groups-=m;for(let k=0;k<3;k++){const z=packet*3+k;for(const p of layerPositions(m,z,level<=10))expected.push({...p,z});}}const unit=g.slots[0].w/.94;assert.equal(expected.length,g.slots.length);expected.forEach((p,i)=>{assert.equal(g.slots[i].z,p.z);assert.ok(Math.abs((g.slots[i].x-g.slots[0].x)/unit-(p.x-expected[0].x))<1e-8);assert.ok(Math.abs((g.slots[i].y-g.slots[0].y)/unit-(p.y-expected[0].y))<1e-8);});}
});

test('TEST-049-V2-PILE-SAVE previous independent-pile runs retain geometry and spent tools',()=>{
 const {PILE_VERSION}=require('../minigame/js/stacked-game');const {seedFor}=require('../minigame/js/daily');
 const s=fresh(),c=s.c;c.saved.run.configVersion=PILE_VERSION;c.game=new Game(1,seedFor(c.challengeDate,1,PILE_VERSION),undefined,PILE_VERSION);c.pick(c.game.solution[0]);c.tool('undo');c.tool('shuffle');const slots=structuredClone(c.game.slots),saved=c.game.serialize();const r=s.reload();assert.equal(r.modal,'resume');assert.deepEqual(r.game.slots,slots);assert.deepEqual(r.game.serialize(),saved);assert.deepEqual(r.game.tools,{undo:0,shuffle:0});r.action('resume');finish(r.game);r.settle();r.action('next');assert.equal(r.game.version,PILE_VERSION);r.start(1);assert.equal(r.game.version,CONFIG_VERSION);
});
test('TEST-049-V2-ORDER all configured distinct baskets accept an exposed match directly',()=>{
 const seen=new Set();for(let seed=0;seed<40;seed++){const g=new Game(1,seed);for(const t of g.tiles.filter(t=>g.canPick(t.id))){const col=g.baskets.findIndex(b=>b?.type===t.type);if(col<0)continue;assert.equal(g.pick(t.id),true);assert.ok(g.events.some(e=>e.kind==='load'&&e.column===col));assert.ok(!g.tray.includes(t.id));seen.add(col);break;}}assert.deepEqual([...seen].sort(),[0,1]);
});
test('TEST-049-V2-UNDO restores an entire real completion without returning time or tools',()=>{
 const s=fresh(),g=s.c.game;for(let n=0;n<2;n++)s.c.pick(g.solution[n]);const before=g.checkpoint(),remaining=s.c.timer.remainingMs;s.c.pick(g.solution[2]);assert.equal(g.served,1);assert.equal(s.c.tool('undo'),true);assert.deepEqual(g.checkpoint(),before);assert.equal(g.tools.undo,0);assert.equal(s.c.timer.remainingMs,remaining);assert.equal(s.c.tool('undo'),false);invariant(g);
 const r=s.reload();assert.equal(r.storageBlocked,false);assert.deepEqual(r.game.checkpoint(),g.checkpoint());assert.equal(r.game.tools.undo,0);
});
test('TEST-049-V2-SHUFFLE preserves partial baskets and tray, provides a remaining solution',()=>{
 for(let seed=0;seed<100;seed++){const g=new Game(20,seed);for(let n=0;n<5&&g.status==='playing';n++){const available=g.tiles.filter(t=>g.canPick(t.id));g.pick(available[(seed+n)%available.length].id);}if(g.status!=='playing')continue;
  const before={counts:counts(g),tray:[...g.tray],baskets:structuredClone(g.baskets),pending:[...g.pending]};assert.equal(g.use('shuffle'),true);assert.deepEqual(counts(g),before.counts);assert.deepEqual(g.tray,before.tray);assert.deepEqual(g.baskets,before.baskets);assert.deepEqual(g.pending,before.pending);assert.equal(g.canTool('undo'),false);assert.equal(g.use('shuffle'),false);finish(g);invariant(g);assert.deepEqual(Game.restore(g.serialize()).tiles,g.tiles);
 }
});
test('TEST-049-V2-LOSS undo rescues a full tray and persists its consumed chance',()=>{
 let found=false;for(let seed=0;seed<100&&!found;seed++){
  const g=new Game(30,seed);for(let n=0;n<63&&g.status==='playing';n++){const available=g.tiles.filter(t=>g.canPick(t.id)),t=available.find(t=>!g.baskets.some(b=>b?.type===t.type))||available[0];g.pick(t.id);}
  if(g.status!=='lost')continue;found=true;assert.equal(g.tray.length,g.config.capacity);assert.equal(g.canTool('shuffle'),false);assert.equal(g.use('undo'),true);assert.equal(g.status,'playing');assert.equal(g.tray.length,g.config.capacity-1);assert.equal(Game.restore(g.serialize()).tools.undo,0);
 }assert.equal(found,true);
});
test('TEST-049-V2-SAVE tools survive levels and tampering is rejected before writes',()=>{
 const s=fresh(),c=s.c;c.pick(c.game.solution[0]);c.tool('undo');c.tool('shuffle');for(const id of c.game.solution)c.pick(id);assert.equal(c.game.status,'won');c.action('next');assert.deepEqual(c.game.tools,{undo:0,shuffle:0});
 const key=c.storage.key;s.store[key].run.toolsUsed.undo=0;const old=structuredClone(s.store),writes=s.writes.length;assert.equal(s.reload().modal,'storage');assert.deepEqual(s.store,old);assert.equal(s.writes.length,writes);
});
test('TEST-049-V2-LEGACY flat saved run stays flat, new run can enter second trial',()=>{
 const s=setup();dismiss(s.c);s.c.pick(0);s.c.tool('swap');delete s.p.query.variant;const restored=s.reload();assert.equal(restored.game.version,FLAT_VERSION);assert.equal(restored.game.tools.swap,0);const before=restored.game.serialize();restored.action('resume');assert.deepEqual(restored.game.serialize(),before);restored.start(1);assert.equal(restored.game.version,CONFIG_VERSION);assert.deepEqual(restored.game.tools,{undo:1,shuffle:1});
});
test('TEST-049-V2-LAYOUT blocked cards consume taps, tools sit below board, clock is on right',()=>{
 for(const [width,height] of [[320,568],[375,667],[402,850],[430,932],[539,1182]]){const s=fresh({level:30,width,height}),r=new Renderer({getContext:()=>ctx()},s.api,s.p);r.ready=true;r.render(s.c);assert.ok(!r.hits.some(h=>h.id==='swap'));
  for(const key of ['undo','shuffle']){const h=r.hits.find(h=>h.id===key);assert.equal(h.y,r.toolY);assert.ok(r.originY+(h.y+h.h)*r.scale<=height-34);}
  for(const p of r.tiles(s.c.game))assert.ok(p.y+p.h<=r.toolY-18+1e-6);
  for(const p of r.tiles(s.c.game)){const target=r.target((p.x+p.w/2)*r.scale+r.offset,(p.y+p.w/2)*r.scale+r.originY);if(target?.startsWith('tile:'))assert.equal(s.c.game.canPick(Number(target.slice(5))),true);}
  const texts=[];r.text=(text,x,y)=>texts.push({text,x,y});r.render(s.c);assert.ok(texts.some(t=>String(t.text).startsWith('点牌开始 ')&&t.x===202&&t.y===49));assert.ok(!texts.some(t=>String(t.text).includes('当前')));
 }
});
test('TEST-049-V2-FEEDBACK voice follows final landing, pause freezes flight, redraw cannot replay',t=>{
 let now=1000;t.mock.method(Date,'now',()=>now);const s=fresh(),r=new Renderer({getContext:()=>ctx()},s.api,s.p),sounds=[];s.c.sound.play=k=>sounds.push(k);r.ready=true;r.render(s.c);
 for(const id of s.c.game.solution){s.c.pick(id);r.render(s.c);now+=1500;r.render(s.c);}assert.equal(s.c.modal,'won');assert.equal(sounds.filter(k=>k==='voice').length,1);r.render(s.c);assert.equal(sounds.filter(k=>k==='voice').length,1);
 const u=fresh(),ur=new Renderer({getContext:()=>ctx()},u.api,u.p);ur.ready=true;ur.render(u.c);u.c.pick(u.c.game.solution[0]);ur.render(u.c);u.c.action('settings');ur.render(u.c);const before=ur.feedback.time;now+=9000;ur.render(u.c);assert.equal(ur.feedback.time,before);assert.equal(ur.animating,false);u.c.action('close');ur.render(u.c);assert.ok(ur.feedback.jobs.length);ur.feedback.cancel();now+=1000;ur.render(u.c);assert.equal(ur.feedback.jobs.length,0);
});

test('TEST-049-FIVE capacity is five only for new runs; old shared-stack six-held save stays valid',()=>{
 const {SHARED_VERSION}=require('../minigame/js/stacked-game'),{seedFor}=require('../minigame/js/daily');
 assert.equal(new Game(1,1).config.capacity,5);let found=false;
 for(let n=0;n<50&&!found;n++){const s=fresh(),c=s.c;c.saved.run.configVersion=SHARED_VERSION;c.game=new Game(30,seedFor(c.challengeDate,30,SHARED_VERSION),undefined,SHARED_VERSION);c.saved.run.timer=require("../minigame/js/timer").createTimer(30);for(let step=0;step<63&&c.game.status==='playing'&&c.game.tray.length<6;step++){const g=c.game,t=g.tiles.find(t=>g.canPick(t.id)&&!g.baskets.some(b=>b?.type===t.type))||g.tiles.find(t=>g.canPick(t.id));c.pick(t.id);}if(c.game.tray.length!==6)continue;found=true;c.persist();const r=s.reload();assert.equal(r.modal,'resume');assert.equal(r.game.config.capacity,7);assert.equal(r.game.tray.length,6);r.action('resume');r.start(1);assert.equal(r.game.config.capacity,5);assert.equal(r.game.version,CONFIG_VERSION);}
 assert.equal(found,true);
 const s=fresh(),r=new Renderer({getContext:()=>ctx()},s.api,s.p),texts=[],boxes=[];r.ready=true;r.text=(...v)=>texts.push(v);r.box=(...v)=>boxes.push(v);r.render(s.c);assert.ok(texts.some(v=>v[0]==='0 / 5'));assert.deepEqual(boxes.filter(v=>v[5]==='rgba(184,170,162,.8)').map(v=>v[0]),[276,325]);
});

test('TEST-049-BASKET-LARGE collection and full servings enlarge around their existing centers',()=>{
 const {BASKET_ITEMS,FULL_BASKET_ITEMS}=require('../minigame/js/completion-framing');assert.equal(BASKET_ITEMS.length,3);assert.ok(BASKET_ITEMS.every(p=>p.size===42));for(let type=0;type<21;type++){const items=FULL_BASKET_ITEMS[type];assert.equal(items.length,[0,1,6,7,12].includes(type)?3:1);for(const p of items){assert.equal(p.size,items.length===3?42:80);assert.ok(p.x>=0&&p.x+p.size<=120&&p.y>=0&&p.y+p.size<94);}}
});


test('TEST-049-TWO old three-order five-slot save retains its rules across levels',()=>{
 const {FIVE_VERSION}=require('../minigame/js/stacked-game'),{seedFor}=require('../minigame/js/daily');const s=fresh(),c=s.c;c.saved.run.configVersion=FIVE_VERSION;c.game=new Game(1,seedFor(c.challengeDate,1,FIVE_VERSION),undefined,FIVE_VERSION);c.pick(c.game.solution[0]);c.persist();const r=s.reload();assert.equal(r.modal,'resume');assert.equal(r.game.baskets.length,3);assert.equal(r.game.config.capacity,5);r.action('resume');finish(r.game);r.settle();r.action('next');assert.equal(r.game.baskets.length,3);r.start(1);assert.equal(r.game.baskets.length,2);assert.equal(r.game.config.capacity,5);
});
test('TEST-049-TWO flight targets and static servings share the new basket coordinates',()=>{
 const {basketOrigin,BASKET_ITEMS}=require('../minigame/js/completion-framing');const s=fresh(),r=new Renderer({getContext:()=>ctx()},s.api,s.p);r.ready=true;r.render(s.c);s.c.pick(s.c.game.solution[0]);r.render(s.c);const flight=r.feedback.jobs.find(j=>j.kind==='flight');assert.ok(flight);const load=s.c.game.events.find(e=>e.kind==='load'),o=basketOrigin(s.c.game,load.column);assert.deepEqual(o,{x:73+142*load.column,y:223/3});assert.ok(r.hits.find(h=>h.id==='settings').y===-21);assert.ok(BASKET_ITEMS.every(p=>p.size===42));
});
