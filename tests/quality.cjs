const test=require('node:test');
const assert=require('node:assert/strict');
const {Platform}=require('../minigame/js/platform');
const {Controller}=require('../minigame/js/controller');

function fixture(envVersion,store={},throwAccount=false){
 const writes=[];
 const api={
  getAccountInfoSync:()=>{if(throwAccount)throw Error('account API unavailable');return {miniProgram:{envVersion}};},
  getLaunchOptionsSync:()=>({query:{level:20}}),
  getStorageSync:key=>store[key],
  setStorageSync:(key,value)=>{writes.push(key);store[key]=JSON.parse(JSON.stringify(value));}
 };
 const platform=new Platform(api);
 return {platform,controller:new Controller(platform,()=>Date.parse('2026-09-30T08:00:00Z')),store,writes};
}

test('TEST-QUALITY-001: only explicit release writes production; unknown environment never reads or writes it',()=>{
 const store={};
 const production=fixture('release',store);
 assert.equal(production.platform.channel,'production');
 assert.equal(production.controller.game.config.level,1);
 const before=JSON.stringify(store);
 const beforeDaily=JSON.stringify(store['dimsum.production.daily.v2']);
 for(const [version,throws] of [['unknown',false],[null,false],[undefined,false],['release',true]]){
  const unknown=fixture(version,store,throws);
  assert.equal(unknown.platform.channel,'unknown');
  assert.equal(unknown.platform.testMode,false);
  assert.equal(unknown.controller.modal,'storage');
  assert.equal(unknown.controller.action('abandonResume'),undefined);
  assert.equal(unknown.controller.pick(unknown.controller.game.solution[0]),false);
  assert.equal(unknown.platform.beginMutation(),false);
  assert.equal(unknown.platform.saveDaily({}),false);
  assert.equal(unknown.platform.save({level:1}),false);
  assert.deepEqual(unknown.writes,[]);
  assert.equal(JSON.stringify(store),before);
 }
 for(const version of ['develop','trial']){
  const trial=fixture(version,store);
  assert.equal(trial.platform.channel,'test');
  assert.ok(trial.writes.every(key=>key.startsWith('dimsum.test.')));
 }
 assert.equal(JSON.stringify(store['dimsum.production.daily.v2']),beforeDaily);
});

test('TEST-QUALITY-002: corrupted run fields fail at read boundary without a pending write',()=>{
 const store={};
 const initial=fixture('develop',store);
 const dailyKey=initial.platform.key.replace('progress.v1','daily.v2');
 const pendingKey=initial.platform.key.replace('progress.v1','daily.pending.v2');
 const original=JSON.parse(JSON.stringify(store[dailyKey]));
 for(const change of [run=>{run.completed={};},run=>{run.completed=[0];},run=>{run.completed=[1,1];},run=>{run.id=null;},run=>{run.date='bad';},run=>{run.status='invalid';}]){
  store[dailyKey]=JSON.parse(JSON.stringify(original));change(store[dailyKey].run);
  store[pendingKey]=false;
  const before=JSON.stringify(store[dailyKey]);
  const loaded=fixture('develop',store);
  assert.equal(loaded.controller.modal,'storage');
  assert.deepEqual(loaded.writes,[]);
  assert.equal(JSON.stringify(store[dailyKey]),before);
  assert.equal(store[pendingKey],false);
  assert.doesNotThrow(()=>loaded.controller.action('abandonResume'));
  assert.deepEqual(loaded.writes,[]);
 }
 for(const completed of [undefined,[],[1,2]]){
  store[dailyKey]=JSON.parse(JSON.stringify(original));
  if(completed===undefined)delete store[dailyKey].run.completed;
  else store[dailyKey].run.completed=completed;
  store[pendingKey]=false;
  const loaded=fixture('develop',store);
  assert.equal(loaded.controller.modal,'resume');
  assert.equal(loaded.controller.game.config.level,20);
  assert.doesNotThrow(()=>loaded.controller.action('abandonResume'));
  assert.equal(loaded.controller.game.config.level,1);
 }
});
