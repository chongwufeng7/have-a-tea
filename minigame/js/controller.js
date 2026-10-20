'use strict';
const {Game,FOODS,LEVELS,normalizeLevel,CONFIG_VERSION,CONFIG_VERSIONS,FLAT_VERSION,isStacked}=require('./trolley');
const {Storage}=require('./trolley-storage');
const {AdGateway}=require('./ads');
const {Music}=require('./music');
const {Soundscape}=require('./soundscape');
const {createTimer,validateTimer}=require('./timer');
const config=require('./config');
const {beijingDate,seedFor,validDate}=require('./daily');
const levels=a=>Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=1&&n<=30)&&new Set(a).size===a.length;
const foods=a=>Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=0&&n<FOODS.length)&&new Set(a).size===a.length;
function restore(data){
 if(!data||data.schema!==3||!Number.isInteger(data.sequence)||data.sequence<0||!levels(data.completed)||!foods(data.seen)||!Array.isArray(data.history))throw Error('Invalid progress');
 const r=data.run;if(r===null)return {data,game:null};
 if(!r||typeof r.id!=='string'||!r.id||!validDate(r.date)||!CONFIG_VERSIONS.includes(r.configVersion)||!['active','ended','completed'].includes(r.status)||!levels(r.completed)||![0,1].includes(r.swapUsed))throw Error('Invalid run');
 const game=Game.restore(r.game);
 if(game.version!==r.configVersion||game.seed!==seedFor(r.date,game.config.level,r.configVersion))throw Error('Invalid run configuration');
 if(isStacked(game)){
  if(!r.toolsUsed||Object.keys(r.toolsUsed).length!==2||!['undo','shuffle'].every(k=>[0,1].includes(r.toolsUsed[k])&&game.tools[k]===1-r.toolsUsed[k]))throw Error('Invalid shared tools');
 }else if(game.tools.swap!==1-r.swapUsed)throw Error('Invalid legacy tools');
 if(r.status==='completed'&&(game.status!=='won'||game.config.level!==30)||r.status==='ended'&&!['failed','abandoned','timeout'].includes(r.reason))throw Error('Invalid run status');
 // Older saves have no timer. Keep the exact board and grant this level's full limit once.
 if(r.timer===undefined)r.timer=createTimer(game.config.level);
 if(!validateTimer(r.timer,game.config.level)||r.reason==='timeout'&&(r.timer.remainingMs!==0||!r.timer.started||game.status!=='playing')||r.timer.remainingMs===0&&r.reason!=='timeout')throw Error('Invalid timer');
 // Untouched levels can adopt the shorter limit; running levels keep their saved allowance.
 if(r.timer.version===1&&!r.timer.started)r.timer=createTimer(game.config.level);
 if(r.intro!==null&&(!r.intro||!foods(r.intro.ids)||!r.intro.ids.length||r.intro.ids.some(id=>id>=game.config.types||data.seen.includes(id))||!Number.isInteger(r.intro.index)||r.intro.index<0||r.intro.index>=r.intro.ids.length))throw Error('Invalid introduction');
 return {data,game};
}
class Controller {
 constructor(platform,now=()=>Date.now()){
  this.platform=platform;this.now=now;this.timerAt=now();this.background=false;this.storage=new Storage(platform);this.ads=new AdGateway();this.music=new Music(platform,config.musicSource);this.sound=new Soundscape(platform);this.message='';this.modal=null;this.storageBlocked=false;
  this.sound.onVoiceStart=()=>this.music.duck(true);this.sound.onVoiceEnd=()=>this.music.duck(false);
  this.saved={schema:3,sequence:0,completed:[],seen:[],history:[],run:null};this.game=new Game(1);
  try{const d=this.storage.read();if(d){const r=restore(d);this.saved=r.data;if(r.game){this.game=r.game;this.modal=this.saved.run.status==='active'?'resume':this.saved.run.status==='completed'?'won':this.saved.run.reason==='timeout'?'timeout':'ended';return;}}}
  catch(_){this.storageBlocked=true;this.modal='storage';this.message='存档无法读取，已保留原数据';return;}
  this.start(platform.testMode&&platform.query.level?platform.query.level:1);
 }
 get challengeDate(){return this.saved.run?.date||beijingDate(this.now());}
 get introduction(){return this.saved.run?.intro||null;}
 get timer(){return this.saved.run?.timer||null;}
 get timerRunning(){return !!this.timer?.started&&!this.background&&!this.modal&&!this.storageBlocked&&this.saved.run?.status==='active'&&this.game.status==='playing';}
 tick(save=true){
  const now=this.now(),delta=Math.max(0,now-this.timerAt);this.timerAt=now;
  if(!this.timerRunning)return;
  const before=Math.ceil(this.timer.remainingMs/1000);this.timer.remainingMs=Math.max(0,this.timer.remainingMs-delta);
  if(this.timer.remainingMs===0){this.endRun('timeout');this.modal='timeout';}
  if(save&&(before!==Math.ceil(this.timer.remainingMs/1000)||this.modal==='timeout')){if(this.prepare())this.persist();}
 }
 hide(){this.tick(false);this.background=true;this.persist();}
 show(){this.background=false;this.timerAt=this.now();this.offerResume();}
 unlocked(){return LEVELS.length;}
 offerResume(){if(!this.storageBlocked&&this.saved.run?.status==='active')this.modal='resume';}
 prepare(){if(this.storage.begin())return true;this.storageBlocked=true;this.modal='saveError';this.message='进度保存失败，请释放空间后重试';return false;}
 present(){const r=this.saved.run;if(r?.status==='ended')this.modal=r.reason==='timeout'?'timeout':'ended';else if(this.game.status==='won')this.modal='won';else if(this.game.status==='lost')this.modal=this.canRescue()?'lost':'ended';else this.modal=r?.intro?'intro':null;}
 introduce(){const ids=Array.from({length:this.game.config.types},(_,i)=>i).filter(i=>!this.saved.seen.includes(i));this.saved.run.intro=ids.length?{ids,index:0}:null;this.present();}
 start(level=1){
  if(this.storageBlocked||!this.prepare())return false;
  if(this.saved.run?.status==='active')this.endRun('abandoned');
  const date=beijingDate(this.now()),n=this.platform.testMode?normalizeLevel(level):1,version=this.platform.testMode&&this.platform.query.variant==='flat'?FLAT_VERSION:CONFIG_VERSION;
  this.saved.sequence++;this.saved.run={id:date+':'+this.saved.sequence,date,configVersion:version,status:'active',reason:null,completed:[],swapUsed:0,...(version===CONFIG_VERSION?{toolsUsed:{undo:0,shuffle:0}}:{}),intro:null,timer:createTimer(n)};this.timerAt=this.now();
  this.game=new Game(n,seedFor(date,n,version),undefined,version);this.message='';this.introduce();return this.persist();
 }
 persist(){
  if(this.storageBlocked&&this.modal==='storage')return false;
  if(this.saved.run)this.saved.run.game=this.game.serialize();
  if(!this.storage.save(this.saved)){this.storageBlocked=true;this.modal='saveError';this.message='进度保存失败，请释放空间后重试';return false;}
  this.storageBlocked=false;return true;
 }
 endRun(reason){const r=this.saved.run;if(!r||r.status!=='active')return;r.status=reason==='completed'?'completed':'ended';r.reason=reason;this.saved.history.push({id:r.id,date:r.date,configVersion:r.configVersion,level:this.game.config.level,result:reason,finishedAt:this.now(),completed:[...r.completed]});}
 canRescue(){return this.saved.run?.status==='active'&&this.game.canTool(isStacked(this.game)?'undo':'swap');}
 pick(id){this.tick();if(this.storageBlocked||this.modal||this.saved.run?.status!=='active'||!this.game.canPick(id)||!this.prepare())return false;this.timer.started=true;this.game.pick(id);this.settle();return true;}
 tool(key){this.tick();if(this.storageBlocked||(this.modal&&this.modal!=='lost')||this.saved.run?.status!=='active'||!this.game.canTool(key)||!this.prepare())return false;this.game.use(key);if(isStacked(this.game))for(const k of ['undo','shuffle'])this.saved.run.toolsUsed[k]=1-this.game.tools[k];else this.saved.run.swapUsed=1;this.modal=null;this.settle();return true;}
 settle(){
  const g=this.game,r=this.saved.run;
  if(g.status==='won'){
   const first=!r.completed.includes(g.config.level);
   if(!this.saved.completed.includes(g.config.level))this.saved.completed.push(g.config.level);
   if(first)r.completed.push(g.config.level);
   if(g.config.level===30)this.endRun('completed');
  }else if(g.status==='lost'&&!this.canRescue())this.endRun('failed');
  this.present();this.persist();
 }
 action(name){
  this.tick();
  if(name==='retrySave'&&this.modal==='saveError'){if(this.persist()){this.message='';if(!this.saved.run)this.start(1);else this.present();}return;}
  if(this.storageBlocked)return;
  if(name==='resume'&&this.modal==='resume'){this.present();return;}
  if(name==='abandonResume'&&this.modal==='resume'){this.start(1);return;}
  if(this.modal==='resume')return;
  if(this.modal==='intro'){
   if(!['introNext','introSkip'].includes(name)||!this.prepare())return;
   const i=this.introduction;if(name==='introSkip'||i.index+1===i.ids.length){this.saved.seen=[...new Set([...this.saved.seen,...i.ids])];this.saved.run.intro=null;}else i.index++;
   this.present();this.persist();return;
  }
  if(name==='settings'&&!this.modal){this.modal='settings';return;}
  if(name==='music'&&this.modal==='settings'){this.music.toggle();return;}
  if(name==='sound'&&this.modal==='settings'){this.sound.toggle();return;}
  if(name==='rules'&&this.modal==='settings'){this.modal='rules';return;}
  if(name==='newChallenge'&&this.modal==='settings'){this.modal='abandon';return;}
  if(name==='confirmAbandon'&&this.modal==='abandon'){this.start(1);return;}
  if(name==='restart'&&this.platform.testMode&&!this.modal){this.modal='restart';return;}
  if(name==='levels'&&this.platform.testMode&&!this.modal){this.modal='levels';return;}
  if(name==='close'&&['settings','rules','restart','levels','abandon'].includes(this.modal)){this.modal=['rules','abandon'].includes(this.modal)?'settings':null;return;}
  if(name==='retry'&&['lost','ended','won','timeout'].includes(this.modal)){this.start(1);return;}
  if(name==='confirmRestart'&&this.platform.testMode&&this.modal==='restart'){this.start(1);return;}
  if(name==='next'&&this.modal==='won'&&this.game.config.level<30&&this.saved.run.status==='active'){
   if(!this.prepare())return;const n=this.game.config.level+1;
   const version=this.saved.run.configVersion;
   const tools=isStacked(this.game)?Object.fromEntries(['undo','shuffle'].map(k=>[k,1-this.saved.run.toolsUsed[k]])):1-this.saved.run.swapUsed;
   this.game=new Game(n,seedFor(this.challengeDate,n,version),tools,version);this.saved.run.timer=createTimer(n);this.timerAt=this.now();this.message='';this.introduce();this.persist();return;
  }
  if(/^level:\d+$/.test(name)&&this.platform.testMode&&this.modal==='levels'){this.start(Number(name.split(':')[1]));return;}
  if(['swap','undo','shuffle'].includes(name))this.tool(name);
 }
}
module.exports={Controller,restore};
