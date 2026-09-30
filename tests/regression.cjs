const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const {Game,LEVELS}=require('../prototypes/snack-tiles/game.js');
const {app}=require('../tools/tester-audit.cjs');
test('TEST-011 / QA-001—014: report regressions (isolated DOM, no browser)',()=>{const r=spawnSync(process.execPath,[path.resolve(__dirname,'../tools/tester-audit.cjs')],{encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);});
test('TEST-012 / RULE-008: invalid levels safely fall back; valid levels and button strings preserved',()=>{
 for(const level of [1.5,-1,0,31,NaN,Infinity,-Infinity,null,{},[],true,false,'1.5','NaN','Infinity','',Symbol('bad')])assert.equal(new Game(level).config.level,1);
 for(const {level} of LEVELS){assert.equal(new Game(level).config.level,level);assert.equal(new Game(String(level)).config.level,level);}
});
test('TEST-013 / RULE-008: malformed storage values, completion filtering and reload remain playable',()=>{
 for(const raw of ['null','[]','true','"bad"','42',JSON.stringify({level:1.5,completed:{}}),JSON.stringify({level:{},completed:null})]){const a=app(raw);assert.equal(a.run('game.config.level'),1);a.run('pick(game.solution[0])');assert.equal(a.run('game.moves'),1);}
 const a=app(JSON.stringify({level:10,completed:[1,1,30,0,31,1.5,'2',null,{},true,10]}));
 assert.equal(a.run('game.config.level'),10);assert.deepEqual(JSON.parse(a.values.get('snack-progress-test-v2')),{level:10,completed:[1,30,10]});
 const b=app(a.values.get('snack-progress-test-v2'));assert.equal(b.run('game.config.level'),10);assert.equal(b.run('saved.completed.length'),3);
});
test('TEST-014 / RULE-004/006: arbitrary reserve order survives middle pick, undo and rendering',()=>{
 const a=app();a.run("game.tiles=Array.from({length:6},(_,id)=>({id,type:id,x:id,y:0,z:0,zone:'board'}));[5,2,4].forEach(id=>pick(id));use('remove')");
 const ids=()=>JSON.parse(a.run('JSON.stringify(game.reserve.map(t=>t.id))'));
 assert.deepEqual(ids(),[5,2,4]);assert.deepEqual(a.get('reserve').children.map(e=>e.getAttribute('aria-label')),['烧麦，点回暂存槽','粽子，点回暂存槽','饺子，点回暂存槽']);
 a.run('pick(2)');assert.deepEqual(ids(),[5,4]);a.run("use('undo')");assert.deepEqual(ids(),[5,2,4]);
 assert.deepEqual(a.get('reserve').children.map(e=>e.getAttribute('aria-label')),['烧麦，点回暂存槽','粽子，点回暂存槽','饺子，点回暂存槽']);assert.equal(a.run('game.tools.undo'),0);
});
