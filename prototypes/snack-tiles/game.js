(function(root){
 'use strict';
 const FOODS=['包子','油条','粽子','糖葫芦','饺子','烧麦','春卷','月饼','麻花','煎蛋','面条','豆浆'];
 const LEVELS=Array.from({length:30},(_,i)=>{const n=i+1;const bands=n===1?[9,3]:n<=5?[18+(n-2)*6,4]:n<=10?[42+(n-6)*3,6]:n<=20?[60+Math.floor((n-11)/2)*6,9]:[90+Math.floor((n-21)/3)*6,12];const types=Math.min(bands[1],bands[0]/3);return {level:n,count:bands[0],types,layers:Math.ceil(bands[0]/3/types)*3,seed:n*7919};});
 function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
 function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function overlaps(a,b){return Math.abs(a.x-b.x)<.94&&Math.abs(a.y-b.y)<.94;}
 function available(tiles,t){return t.zone==='reserve'||t.zone==='board'&&!tiles.some(b=>b.zone==='board'&&b.z>t.z&&overlaps(t,b));}
 function layerPositions(m,z,early){
 const shapes={1:[0,1,0],2:[1,0,1],3:[1,1,1],4:[1,2,1],5:[2,1,2],6:[2,2,2],7:[2,3,2],8:[3,2,3],9:early?[3,3,3]:[[2,3,2,2],[3,3,3],[2,2,3,2]][z%3],10:[2,3,3,2],11:[2,4,3,2],12:[[2,4,4,2],[3,3,3,3],[2,4,4,2]][z%3]};
 const rows=shapes[m],a=[];rows.forEach((n,y)=>{for(let x=0;x<n;x++)a.push({x:x-(n-1)/2+(z%2)*.5,y:y-(rows.length-1)/2+(early?0:(Math.floor(z/2)%2)*.5)});});return a;
}
function makeLevel(config,seed=config.seed){
 const r=rng(seed),tiles=[];let groups=config.count/3;
 for(let packet=0;groups>0;packet++){const m=Math.min(groups,config.types);groups-=m;for(let k=0;k<3;k++){const z=packet*3+k;for(const p of layerPositions(m,z,config.level<=10))tiles.push({id:tiles.length,...p,z,type:-1,zone:'board'});}}
 // Half-cell offsets create shared blockers between neighboring columns and rows.
 const blockers=tiles.map(a=>tiles.filter(b=>b.z>a.z&&Math.abs(a.x-b.x)<.94&&Math.abs(a.y-b.y)<.94).map(t=>t.id));
 // First construct a legal uncovering route, then assign balanced triples along it.
 // Backtracking keeps the witness below seven held cards and prevents same-layer triples.
 for(let attempt=0;attempt<80;attempt++){
  const removed=new Set(),route=[];
  while(route.length<tiles.length){const open=tiles.filter(t=>!removed.has(t.id)&&blockers[t.id].every(id=>removed.has(id)));open.sort((a,b)=>a.z-b.z);const choice=open[Math.floor(r()*Math.min(open.length,4))];removed.add(choice.id);route.push(choice.id);}
  const palette=shuffle(Array.from({length:config.types},(_,i)=>i),r),left=Array(config.types).fill(0),held=Array(config.types).fill(0),layers=Array.from({length:config.layers},()=>Array(config.types).fill(0));
  for(let g=0;g<config.count/3;g++)left[palette[g%palette.length]]+=3;
  let nodes=0;
  function assign(i,load){if(i===route.length)return true;if(++nodes>12000)return false;const tile=tiles[route[i]],z=tile.z;
   const choices=shuffle(palette.filter(t=>left[t]&&layers[z][t]<2&&load+(held[t]===2?-2:1)<7),r);
   choices.sort((a,b)=>{const rank=t=>load>=4?(held[t]===2?10:held[t]):(held[t]===0?3:held[t]===1?2:0);return rank(b)-rank(a);});
   for(const t of choices){const before=held[t];left[t]--;layers[z][t]++;held[t]=(before+1)%3;tile.type=t;if(assign(i+1,load+(before===2?-2:1)))return true;left[t]++;layers[z][t]--;held[t]=before;}
   return false;
  }
  if(assign(0,0))return {tiles,solution:route};
 }
 throw Error('Unable to construct solvable level '+config.level+' for seed '+seed);
}
 function normalizeLevel(value){const n=typeof value==='number'?value:typeof value==='string'&&/^\d+$/.test(value)?Number(value):NaN;return Number.isInteger(n)&&n>=1&&n<=LEVELS.length?n:1;}
 // Use the original full board bounds, including removed tiles, to avoid
 // repositioning or enlarging targets while the player clears the board.
 function boardLayout(tiles,width){
  const minX=Math.min(...tiles.map(t=>t.x)),minY=Math.min(...tiles.map(t=>t.y));
  const spanX=Math.max(...tiles.map(t=>t.x))+.94-minX,spanY=Math.max(...tiles.map(t=>t.y))+.94-minY;
  const unit=Math.min(64,(width-32)/spanX),height=Math.max(260,spanY*unit+40);
  return {unit,height,left:(width-spanX*unit)/2-minX*unit,top:(height-spanY*unit)/2-minY*unit};
 }
 class Game{
  constructor(level=1,seed){this.config=LEVELS[normalizeLevel(level)-1];const built=makeLevel(this.config,seed);this.tiles=built.tiles;this.solution=built.solution;this.tray=[];this.tools={undo:1,shuffle:1,remove:1};this.status='playing';this.history=null;this.moves=0;this.random=rng(seed??this.config.seed);}
  get reserve(){return this.tiles.filter(t=>t.zone==='reserve').sort((a,b)=>(a.reserveOrder??a.id)-(b.reserveOrder??b.id));}
  get remaining(){return this.tiles.filter(t=>t.zone!=='gone').length;}
  canPick(id){const t=this.tiles[id];return this.status==='playing'&&!!t&&available(this.tiles,t);}
  snapshot(){return {tiles:this.tiles.map(t=>({...t})),tray:[...this.tray],moves:this.moves};}
  pick(id){if(!this.canPick(id))return false;this.history=this.snapshot();const t=this.tiles[id];t.zone='tray';this.tray.push(id);this.moves++;const matching=this.tray.filter(i=>this.tiles[i].type===t.type);this.lastMatch=matching.length===3;if(this.lastMatch){matching.forEach(i=>this.tiles[i].zone='gone');this.tray=this.tray.filter(i=>!matching.includes(i));}this.settle();return true;}
  settle(){this.status=this.remaining===0?'won':this.tray.length>=7?'lost':'playing';}
  canTool(key){if(this.status==='won'||!this.tools[key])return false;if(key==='undo')return !!this.history;if(key==='remove')return this.tray.length>=3&&this.reserve.length===0;return key==='shuffle'&&this.status==='playing'&&this.tiles.filter(t=>t.zone==='board').length>1;}
  use(key){if(!this.canTool(key))return false;this.tools[key]--;if(key==='undo'){Object.assign(this,this.history);this.history=null;}else if(key==='remove'){const ids=this.tray.splice(0,3);ids.forEach((id,order)=>{this.tiles[id].zone='reserve';this.tiles[id].reserveOrder=order;});this.history=null;}else{const board=this.tiles.filter(t=>t.zone==='board');const types=shuffle(board.map(t=>t.type),this.random);board.forEach((t,i)=>t.type=types[i]);this.history=null;}this.settle();return true;}
 }
 const api={FOODS,LEVELS,Game,makeLevel,available,normalizeLevel,boardLayout,layerPositions};if(typeof module!=='undefined')module.exports=api;else root.SnackGame=api;
})(globalThis);
