'use strict';
const {clone}=require('./daily');
const LEGACY_VERSION='trolley-v103-1';
const CONFIG_VERSION='trolley-v103-2';
const CONFIG_VERSIONS=[LEGACY_VERSION,CONFIG_VERSION];
const FOODS=[
 ['虾饺','晶莹的薄皮，包住鲜甜虾仁。','一盅两件，叹一口鲜。'],
 ['烧卖','薄皮裹着猪肉与鲜虾，顶上点缀蟹籽。','茶楼里熟悉的金黄滋味。'],
 ['皮蛋瘦肉粥','米粥绵滑，配上皮蛋和瘦肉。','热粥慢慢饮，早茶慢慢叹。'],
 ['豉汁凤爪','凤爪蒸得软糯，吸足浓香豉汁。','广州早茶的经典滋味。'],
 ['豉汁排骨','小块排骨配豆豉蒸制，鲜香入味。','趁热夹一块，肉嫩又多汁。'],
 ['鲜虾肠粉','薄薄的米浆皮，卷着鲜虾。','淋上酱汁，软滑又鲜甜。'],
 ['叉烧包','松软包皮里，是甜咸交融的叉烧馅。','掰开一个，热气和香味一起冒出。'],
 ['蛋挞','酥香挞皮，托着嫩滑蛋馅。','茶香配蛋香，叹茶好时光。'],
 ['油条','金黄酥脆的油条，常与粥同桌。','一口粥，一口油条。'],
 ['炒粉','米粉配爽脆芽菜，大火快炒。','镬气飘香，咸香可口。'],
 ['金钱肚','蜂窝般的牛肚，焖得软韧入味。','浓香酱汁，是茶楼里的好滋味。'],
 ['陈皮牛肉球','牛肉揉成圆球，带着淡淡陈皮香。','肉香与陈皮香，伴茶正好。'],
 ['猪猪流沙包','可爱的猪猪包，藏着金黄流沙馅。','轻轻掰开，小心热馅流出来。'],
 ['腐皮卷','薄薄的腐皮，包住鲜香馅料。','一卷软香，也是茶楼好滋味。'],
 ['煎饺','弯弯的饺子，底部煎得金黄。','外香里嫩，趁热慢慢叹。'],
 ['红米肠','红色米皮裹住酥脆馅心。','软滑与香脆，一口都尝到。'],
 ['萝卜糕','萝卜与米浆制成糕，煎出金黄表面。','外层微脆，里头软香。'],
 ['马拉糕','松软的蒸糕，带着温柔的甜香。','细密气孔里，藏着蓬松口感。'],
 ['咸水角','金黄糯皮里，包着咸香馅料。','外脆内糯，甜咸相伴。'],
 ['炸春卷','薄皮卷起馅料，炸得金黄酥脆。','咬一口，听见酥香的声音。'],
 ['双皮奶','细滑奶冻，表面覆着薄薄奶皮。','奶香绵柔，给早茶添一口甜。']
].map(([name,...intro],id)=>Object.freeze({id,name,intro}));
const LEGACY_UNLOCK=[1,1,1,3,5,7,9,12,16,21,26];
const UNLOCK=[1,1,1,1,1,1,2,3,4,5,6,7,9,11,13,15,17,19,21,24,27];
const LEGACY_LEVELS=Array.from({length:30},(_,i)=>Object.freeze({level:i+1,types:LEGACY_UNLOCK.filter(n=>n<=i+1).length,groups:Math.min(14,6+Math.floor(i/2)),capacity:7}));
const LEVELS=Array.from({length:30},(_,i)=>{const types=UNLOCK.filter(n=>n<=i+1).length;return Object.freeze({level:i+1,types,groups:Math.max(types,Math.min(21,12+Math.floor(i/2))),capacity:7});});
const CONFIGS={[LEGACY_VERSION]:LEGACY_LEVELS,[CONFIG_VERSION]:LEVELS};
function normalizeLevel(n){return Math.max(1,Math.min(30,Math.floor(Number(n)||1)));}
function random(seed){let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
class Game {
 constructor(level=1,seed=1,swap=1,version=CONFIG_VERSION){
  if(!CONFIG_VERSIONS.includes(version))throw Error('Unknown trolley configuration');
  this.version=version;this.config=CONFIGS[version][normalizeLevel(level)-1];this.seed=seed>>>0;this.initialSwap=swap;this.tools={swap};this.actions=[];this.events=[];this.status='playing';this.tray=[];this.current=0;this.served=0;
  const r=random(this.seed),palette=shuffle(Array.from({length:this.config.types},(_,i)=>i),r);
  this.pending=Array.from({length:Math.max(this.config.groups,this.config.types)},(_,i)=>palette[i%palette.length]);
  this.tiles=shuffle(this.pending.flatMap(type=>[type,type,type]),r).map((type,id)=>({id,type,zone:'board'}));
  this.baskets=[null,null,null];this.refill();
 }
 refill(){
  for(let column=0;column<3;column++)if(!this.baskets[column]){
   const occupied=this.baskets.filter(Boolean).map(b=>b.type),index=this.pending.findIndex(type=>!occupied.includes(type));
   if(index>=0)this.baskets[column]={type:this.pending.splice(index,1)[0],ids:[]};
  }
 }
 nextColumn(){for(let step=1;step<=3;step++){const c=(this.current+step)%3;if(this.baskets[c])return c;}return -1;}
 canPick(id){return this.status==='playing'&&Number.isInteger(id)&&this.tiles[id]?.zone==='board';}
 canTool(key){return key==='swap'&&this.tools.swap===1&&this.status!=='won'&&this.baskets.filter(Boolean).length>1;}
 pick(id){
  if(!this.canPick(id))return false;
  this.events=[];this.actions.push(['pick',id]);const t=this.tiles[id],b=this.baskets[this.current];
  if(t.type===b.type){t.zone='basket';b.ids.push(id);this.events.push({kind:'load',id,column:this.current});}
  else {t.zone='tray';this.tray.push(id);this.events.push({kind:'tray',id});}
  this.settle();return true;
 }
 use(key){if(!this.canTool(key))return false;this.events=[];this.actions.push(['swap']);this.tools.swap=0;this.current=this.nextColumn();this.status='playing';this.events.push({kind:'swap',column:this.current});this.settle();return true;}
 settle(){
  // Each completed pass consumes a basket. This bound also guards corrupted state.
  for(let guard=0;guard<=this.tiles.length/3;guard++){
   const b=this.baskets[this.current];if(!b)break;
   for(let i=0;i<this.tray.length&&b.ids.length<3;){const id=this.tray[i];if(this.tiles[id].type!==b.type){i++;continue;}this.tray.splice(i,1);this.tiles[id].zone='basket';b.ids.push(id);this.events.push({kind:'auto',id,column:this.current});}
   if(b.ids.length<3)break;
   for(const id of b.ids)this.tiles[id].zone='gone';
   this.events.push({kind:'serve',column:this.current,type:b.type});this.served++;this.baskets[this.current]=null;this.refill();
   const next=this.nextColumn();if(next<0)break;this.current=next;
  }
  this.status=this.tiles.every(t=>t.zone==='gone')?'won':this.tray.length>=this.config.capacity?'lost':'playing';
 }
 serialize(){return {version:this.version,level:this.config.level,seed:this.seed,initialSwap:this.initialSwap,actions:clone(this.actions)};}
 static restore(s){
  if(!s||!CONFIG_VERSIONS.includes(s.version)||!Number.isInteger(s.level)||s.level<1||s.level>30||!Number.isInteger(s.seed)||s.seed<0||s.seed>0xffffffff||![0,1].includes(s.initialSwap)||!Array.isArray(s.actions)||s.actions.length>64)throw Error('Invalid trolley save');
  const g=new Game(s.level,s.seed,s.initialSwap,s.version);
  if(s.actions.length>g.tiles.length+1)throw Error('Too many saved actions');
  for(const a of s.actions){if(!Array.isArray(a)||!(a.length===2&&a[0]==='pick'&&g.pick(a[1])||a.length===1&&a[0]==='swap'&&g.use('swap')))throw Error('Invalid saved action');}
  g.events=[];return g;
 }
}
module.exports={Game,FOODS,LEVELS,normalizeLevel,CONFIG_VERSION,CONFIG_VERSIONS,LEGACY_VERSION};
