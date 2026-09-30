'use strict';
const {Game,LEVELS,normalizeLevel}=require('./core');
const {AdGateway}=require('./ads');
const {Music}=require('./music');
const config=require('./config');
const {CONFIG_VERSION,clone,beijingDate,seedFor,validDate,empty}=require('./daily');
function validLevels(levels){
 return Array.isArray(levels)&&levels.every(n=>Number.isInteger(n)&&n>=1&&n<=LEVELS.length)&&new Set(levels).size===levels.length;
}
function restoreChallenge(data){
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
 if(!object(data)||data.schema!==2||!Number.isInteger(data.sequence)||data.sequence<0||
    !validLevels(data.completed)||!Array.isArray(data.history)||!object(data.adLedger)||
    !object(data.adLedger.days)||!object(data.adLedger.receipts))throw Error('Invalid challenge data');
 const run=data.run;
 if(run===null)return {data,game:null,modal:null};
 if(!object(run)||typeof run.id!=='string'||!run.id||!validDate(run.date)||
    run.configVersion!==CONFIG_VERSION||!['active','ended','completed'].includes(run.status)||
    (run.completed!==undefined&&!validLevels(run.completed)))throw Error('Invalid saved run');
 const game=Game.restore(run.game);
 if(run.status==='completed'&&(game.status!=='won'||game.config.level!==30))throw Error('Invalid completed run');
 return {data,game,modal:run.status==='active'?'resume':run.status==='completed'?'won':'ended'};
}
class Controller {
 constructor(platform,now=()=>Date.now()){
  this.platform=platform;this.now=now;this.ads=new AdGateway();this.music=new Music(platform,config.musicSource);this.message='';this.modal=null;this.storageBlocked=false;
  this.saved=empty(platform.read());
  try{
   const data=platform.readDaily();
   if(data){
    const restored=restoreChallenge(data);
    if(restored.game){this.saved=restored.data;this.game=restored.game;this.modal=restored.modal;return;}
    this.saved=restored.data;
   }
  }catch(_){this.game=new Game(1);this.storageBlocked=true;this.modal='storage';this.message=platform.channel==='unknown'?'无法确认当前版本，已停止读取进度':'存档无法读取，已保留原数据';return;}
  this.game=new Game(1);
  this.start(platform.testMode&&platform.query.level?platform.query.level:1);
 }
 get challengeDate(){return this.saved.run?.date||beijingDate(this.now());}
 unlocked(){return 30;}
 offerResume(){if(!this.storageBlocked&&this.saved.run?.status==='active')this.modal='resume';}
 prepare(){if(this.platform.beginMutation())return true;this.storageBlocked=true;this.modal='saveError';this.message='进度保存失败，请释放空间后重试';return false;}
 start(level=1){
  if(this.storageBlocked)return false;
  if(!this.prepare())return false;
  if(this.saved.run?.status==='active')this.endRun('abandoned');
  const date=beijingDate(this.now()),n=this.platform.testMode?normalizeLevel(level):1;
  this.saved.sequence++;this.saved.run={id:date+':'+this.saved.sequence,date,configVersion:CONFIG_VERSION,status:'active',reason:null};
  this.game=new Game(n,seedFor(date,n));this.modal=null;this.message='';return this.persist();
 }
 persist(){
  if(this.storageBlocked&&this.modal==='storage')return false;
  if(this.saved.run&&this.game)this.saved.run.game=this.game.serialize();
  if(!this.platform.saveDaily(this.saved)){this.storageBlocked=true;this.message='进度保存失败，请释放空间后重试';this.modal='saveError';return false;}
  this.storageBlocked=false;return true;
 }
 endRun(reason){
  const r=this.saved.run;if(!r||r.status!=='active')return;
  r.status=reason==='completed'?'completed':'ended';r.reason=reason;
  this.saved.history.push({id:r.id,date:r.date,configVersion:r.configVersion,level:this.game.config.level,result:reason,finishedAt:this.now(),completed:[...(r.completed||[])]});
 }
 canRescue(){return this.saved.run?.status==='active'&&(this.game.canTool('undo')||this.game.canTool('remove'));}
 pick(id){if(this.storageBlocked||this.modal||this.saved.run?.status!=='active'||!this.game.canPick(id)||!this.prepare())return false;this.game.pick(id);this.message=this.game.lastMatch?'三张相同，已消除':'';this.settle();return true;}
 tool(key){if(this.storageBlocked||(this.modal&&this.modal!=='lost')||this.saved.run?.status!=='active'||!this.game.canTool(key)||!this.prepare())return false;this.game.use(key);this.modal=null;this.message='';this.settle();return true;}
 settle(){
  const g=this.game,r=this.saved.run;
  if(g.status==='won'){
   if(!this.saved.completed.includes(g.config.level))this.saved.completed.push(g.config.level);
   if(!Array.isArray(r.completed))r.completed=[];
   if(!r.completed.includes(g.config.level))r.completed.push(g.config.level);
   if(g.config.level===30)this.endRun('completed');this.modal='won';
  }else if(g.status==='lost'){
   if(this.canRescue())this.modal='lost';else{this.endRun('failed');this.modal='ended';}
  }else this.modal=null;
  this.persist();
 }
 action(name){
  if(name==='retrySave'&&this.modal==='saveError'){if(this.persist()){this.message='';this.modal=null;if(!this.saved.run)this.start(1);else if(this.saved.run.status==='ended')this.modal='ended';else this.settle();}return;}
  if(this.storageBlocked)return;
  if(name==='resume'&&this.modal==='resume'){this.modal=null;this.settle();return;}
  if(name==='abandonResume'&&this.modal==='resume'){this.start(1);return;}
  if(this.modal==='resume')return;
  if(name==='settings'&&!this.modal){this.modal='settings';return;}
  if(name==='music'&&this.modal==='settings'){this.music.toggle();return;}
  if(name==='rules'&&this.modal==='settings'){this.modal='rules';return;}
  if(name==='newChallenge'&&this.modal==='settings'){this.modal='abandon';return;}
  if(name==='confirmAbandon'&&this.modal==='abandon'){this.start(1);return;}
  if(name==='restart'&&this.platform.testMode&&!this.modal){this.modal='restart';return;}
  if(name==='levels'&&this.platform.testMode&&!this.modal){this.modal='levels';return;}
  if(name==='close'&&['settings','rules','restart','levels','abandon'].includes(this.modal)){this.modal=['rules','abandon'].includes(this.modal)?'settings':null;return;}
  if(name==='retry'&&['lost','ended','won'].includes(this.modal)){this.start(1);return;}
  if(name==='confirmRestart'&&this.platform.testMode&&this.modal==='restart'){this.start(1);return;}
  if(name==='next'&&this.modal==='won'&&this.game.status==='won'&&this.game.config.level<30&&this.saved.run.status==='active'){
   if(!this.prepare())return;
   const tools=clone(this.game.tools),n=this.game.config.level+1;
   this.game=new Game(n,seedFor(this.challengeDate,n));this.game.tools=tools;this.modal=null;this.message='';this.persist();return;
  }
  if(/^level:\d+$/.test(name)&&this.platform.testMode&&this.modal==='levels'){this.start(Number(name.split(':')[1]));return;}
  if(['undo','shuffle','remove'].includes(name))this.tool(name);
 }
}
module.exports={Controller};
