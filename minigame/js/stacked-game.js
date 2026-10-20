'use strict';
const {LEVELS,normalizeLevel}=require('./trolley-legacy');
const {clone}=require('./daily');
const {stackLayout,covers}=require('./stack-layout');
const {pileLayout}=require('./pile-layout');
const PILE_VERSION='trolley-stacked-v1',SHARED_VERSION='trolley-stacked-v2',FIVE_VERSION='trolley-stacked-v3',STACK_VERSION='trolley-stacked-v4';
const STACK_VERSIONS=[PILE_VERSION,SHARED_VERSION,FIVE_VERSION,STACK_VERSION];
function random(seed){let n=seed>>>0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffled(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function toolsValid(t){return !!t&&Object.keys(t).length===2&&[0,1].includes(t.undo)&&[0,1].includes(t.shuffle);}
class StackedGame {
 constructor(level=1,seed=1,tools={undo:1,shuffle:1},version=STACK_VERSION){
  if(!toolsValid(tools))throw Error('Invalid tools');
  if(!STACK_VERSIONS.includes(version))throw Error('Invalid stacked version');
  this.version=version;const base=LEVELS[normalizeLevel(level)-1];this.config={...base,capacity:[FIVE_VERSION,STACK_VERSION].includes(version)?5:base.capacity,orders:version===STACK_VERSION?2:3};this.seed=seed>>>0;this.initialTools=clone(tools);this.tools=clone(tools);
  this.actions=[];this.events=[];this.status='playing';this.tray=[];this.served=0;this.lastPick=null;
  const r=random(this.seed),palette=shuffled(Array.from({length:this.config.types},(_,i)=>i),r);
  this.pending=Array.from({length:this.config.groups},(_,i)=>palette[i%palette.length]);this.baskets=Array(this.config.orders).fill(null);this.refill();
  this.slots=(version===PILE_VERSION?pileLayout:stackLayout)(this.config.groups*3,this.config.level,r);this.tiles=this.slots.map(s=>({id:s.id,type:-1,zone:'board'}));
  this.arrange(this.seed^0x51a7);this.events=[];
 }
 refill(){for(let col=0;col<this.baskets.length;col++)if(!this.baskets[col]){const occupied=this.baskets.filter(Boolean).map(b=>b.type),i=this.pending.findIndex(t=>!occupied.includes(t));if(i>=0)this.baskets[col]={type:this.pending.splice(i,1)[0],ids:[]};}}
 blocks(upper,lower){return this.version===PILE_VERSION?upper.pile===lower.pile&&upper.z>lower.z:covers(upper,lower);}
 exposed(id){const p=this.slots[id];return !!p&&!this.slots.some(s=>this.blocks(s,p)&&this.tiles[s.id].zone==='board');}
 canPick(id){return this.status==='playing'&&Number.isInteger(id)&&this.tiles[id]?.zone==='board'&&this.exposed(id);}
 canTool(key){return this.tools[key]===1&&(key==='undo'?!!this.lastPick&&this.status!=='won':key==='shuffle'&&this.status==='playing'&&this.tiles.some(t=>t.zone==='board'));}
 checkpoint(){return clone({tiles:this.tiles,pending:this.pending,baskets:this.baskets,tray:this.tray,served:this.served,status:this.status});}
 pick(id){
  if(!this.canPick(id))return false;
  this.lastPick=this.checkpoint();this.events=[];this.actions.push(['pick',id]);const t=this.tiles[id],col=this.baskets.findIndex(b=>b?.type===t.type);
  if(col>=0){t.zone='basket';this.baskets[col].ids.push(id);this.events.push({kind:'load',id,column:col});}
  else{t.zone='tray';this.tray.push(id);this.events.push({kind:'tray',id});}
  this.settle();return true;
 }
 settle(){
  for(let guard=0;guard<=this.tiles.length/3;guard++){
   let completed=false;
   for(let col=0;col<this.baskets.length;col++){
    const b=this.baskets[col];if(!b)continue;
    for(let i=0;i<this.tray.length&&b.ids.length<3;){const id=this.tray[i];if(this.tiles[id].type!==b.type){i++;continue;}this.tray.splice(i,1);this.tiles[id].zone='basket';b.ids.push(id);this.events.push({kind:'auto',id,column:col});}
    if(b.ids.length===3){const ids=[...b.ids];for(const id of ids)this.tiles[id].zone='gone';this.events.push({kind:'serve',column:col,type:b.type,ids});this.served++;this.baskets[col]=null;completed=true;}
   }
   this.refill();if(!completed)break;
  }
  this.status=this.tiles.every(t=>t.zone==='gone')?'won':this.tray.length>=this.config.capacity?'lost':'playing';
 }
 // Construct a completion schedule before assigning remaining card faces. No retries/search loops.
 schedule(r){
  const pending=[...this.pending],baskets=this.baskets.map(b=>b?{type:b.type,count:b.ids.length}:null),tray=this.tray.map(id=>this.tiles[id].type),plan=[];
  function refill(){for(let c=0;c<baskets.length;c++)if(!baskets[c]){const types=baskets.filter(Boolean).map(b=>b.type),i=pending.findIndex(t=>!types.includes(t));if(i>=0)baskets[c]={type:pending.splice(i,1)[0],count:0};}}
  for(let guard=0;guard<=this.config.groups;guard++){
   refill();const cols=baskets.map((b,i)=>b?i:-1).filter(i=>i>=0);if(!cols.length)break;
   const c=cols[Math.floor(r()*cols.length)],b=baskets[c];
   for(let i=0;i<tray.length&&b.count<3;){if(tray[i]===b.type){tray.splice(i,1);b.count++;}else i++;}
   while(b.count<3){plan.push(b.type);b.count++;}baskets[c]=null;
  }
  if(tray.length||pending.length||baskets.some(Boolean))throw Error('Unbalanced remaining orders');
  return plan;
 }
 arrange(seed){
  const r=random(seed),remaining=new Set(this.tiles.filter(t=>t.zone==='board').map(t=>t.id)),order=[];
  while(remaining.size){const available=[...remaining].filter(id=>!this.slots.some(s=>remaining.has(s.id)&&this.blocks(s,this.slots[id])));const id=available[Math.floor(r()*available.length)];order.push(id);remaining.delete(id);}
  const plan=this.schedule(r);if(plan.length!==order.length)throw Error('Invalid remaining board count');
  const old=this.tiles.filter(t=>t.zone==='board'&&t.type>=0).map(t=>t.type).sort((a,b)=>a-b);
  if(old.length&&JSON.stringify(old)!==JSON.stringify([...plan].sort((a,b)=>a-b)))throw Error('Shuffle changed food counts');
  order.forEach((id,i)=>this.tiles[id].type=plan[i]);this.solution=order;
 }
 use(key){
  if(!this.canTool(key))return false;
  this.events=[];this.actions.push([key]);this.tools[key]=0;
  if(key==='undo'){const saved=this.lastPick;Object.assign(this,clone(saved));this.lastPick=null;this.events.push({kind:'undo'});}
  else{this.arrange(this.seed^Math.imul(this.actions.length,2654435761));this.lastPick=null;this.events.push({kind:'shuffle'});}
  return true;
 }
 serialize(){return {version:this.version,level:this.config.level,seed:this.seed,initialTools:clone(this.initialTools),actions:clone(this.actions)};}
 static restore(s){
  if(!s||!STACK_VERSIONS.includes(s.version)||!Number.isInteger(s.level)||s.level<1||s.level>30||!Number.isInteger(s.seed)||s.seed<0||s.seed>0xffffffff||!toolsValid(s.initialTools)||!Array.isArray(s.actions)||s.actions.length>68)throw Error('Invalid stacked save');
  const g=new StackedGame(s.level,s.seed,s.initialTools,s.version);
  for(const a of s.actions){if(!Array.isArray(a)||!(a.length===2&&a[0]==='pick'&&g.pick(a[1])||a.length===1&&['undo','shuffle'].includes(a[0])&&g.use(a[0])))throw Error('Invalid stacked action');}
  g.events=[];return g;
 }
}
module.exports={StackedGame,STACK_VERSION,PILE_VERSION,SHARED_VERSION,FIVE_VERSION,STACK_VERSIONS,toolsValid};
