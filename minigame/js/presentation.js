'use strict';
const {FULL_BASKET_ITEMS,BASKET_ITEMS,basketOrigin,trayOrigin}=require('./completion-framing');
const LAND_MS=220;
const SERVE_MS=1000;
function basketPoint(game,column,index){const p=BASKET_ITEMS[Math.min(index,2)],o=basketOrigin(game,column);return {x:o.x+p.x,y:o.y+p.y,size:p.size};}
function trayPoint(game,index){return {x:32.4+49*Math.min(index,6),y:trayOrigin(game)+44,size:43.2};}
class Presentation{
 constructor(){this.game=null;this.actions=0;this.time=0;this.wall=Date.now();this.jobs=[];this.previous=null;this.resultAt=null;this.resultSound=false;this.resultAllowed=false;}
 cancel(){this.jobs=[];this.resultAllowed=false;this.resultSound=true;this.wall=Date.now();}
 capture(g,positions){return {tiles:g.tiles.map(t=>({...t})),tray:[...g.tray],positions:positions.map(p=>({...p}))};}
 update(controller,positions){
  const wall=Date.now(),paused=controller.background||controller.modal&&!['won','lost','ended','timeout'].includes(controller.modal);if(!paused)this.time+=Math.max(0,wall-this.wall);this.wall=wall;
  const g=controller.game;
  if(g!==this.game){this.game=g;this.actions=g.actions.length;this.jobs=[];this.previous=this.capture(g,positions);this.resultAt=null;this.resultSound=false;this.resultAllowed=false;}
  else if(g.actions.length!==this.actions){
   this.actions=g.actions.length;const events=g.events||[],at=this.time;this.resultAllowed=g.status==='won';
   if(events.some(e=>['undo','shuffle'].includes(e.kind))){this.jobs=[];controller.sound?.play(events[0].kind);}
   else{
    if(events.some(e=>e.kind==='load'||e.kind==='tray'))controller.sound?.play('tap');
    const columnReady={},columnLanding={};
    for(const e of events){
     if(['load','tray','auto'].includes(e.kind)){
      const old=this.previous.tiles[e.id],slot=this.previous.positions.find(p=>p.id===e.id),trayIndex=this.previous.tray.indexOf(e.id);
      const from=old.zone==='tray'?trayPoint(g,trayIndex):{x:slot.x,y:slot.y,size:slot.w};
      const served=events.find(s=>s.kind==='serve'&&s.ids?.includes(e.id)),ids=served?.ids||g.baskets[e.column]?.ids||[],index=Math.max(0,ids.indexOf(e.id));
      const to=e.kind==='tray'?trayPoint(g,g.tray.indexOf(e.id)>=0?g.tray.indexOf(e.id):this.previous.tray.length):basketPoint(g,e.column,index);
      const start=(columnReady[e.column]||at)+(e.kind==='auto'?90:0),end=start+LAND_MS;
      columnLanding[e.column]=Math.max(columnLanding[e.column]||at,end);
      this.jobs.push({kind:'flight',id:e.id,type:g.tiles[e.id].type,from,to,start,end,sounded:false});
     }else if(e.kind==='serve'){const start=Math.max(columnReady[e.column]||at,columnLanding[e.column]||at);columnReady[e.column]=start+SERVE_MS;this.jobs.push({...e,start,end:start+SERVE_MS,sounded:false});}
    }
   }
   this.previous=this.capture(g,positions);
  }
  if(paused)return {...this.view(),active:false};
  for(const j of this.jobs)if(!j.sounded&&this.time>=(j.kind==='flight'?j.end:j.start)){controller.sound?.play(j.kind==='flight'?'land':'serve');j.sounded=true;}
  this.jobs=this.jobs.filter(j=>j.end>this.time);
  if(g.status==='won'&&!this.jobs.length){if(this.resultAt===null)this.resultAt=this.time;if(this.resultAllowed&&!this.resultSound){controller.sound?.play('voice');this.resultSound=true;}}
  return this.view();
 }
 view(){const flights=this.jobs.filter(j=>j.kind==='flight'),pendingServes=this.jobs.filter(j=>j.kind==='serve'),serves=pendingServes.filter(j=>this.time>=j.start);return {flights,serves,pendingServes,time:this.time,active:this.jobs.length>0||this.resultAt!==null&&this.time-this.resultAt<420,blocking:pendingServes.length>0,delayResult:this.jobs.length>0,resultProgress:this.resultAt===null?1:Math.min(1,(this.time-this.resultAt)/420)};}
 drawFlights(renderer,view){for(const j of view.flights){if(view.time<j.start)continue;const t=Math.min(1,(view.time-j.start)/(j.end-j.start)),ease=1-Math.pow(1-t,3),p={x:j.from.x+(j.to.x-j.from.x)*ease,y:j.from.y+(j.to.y-j.from.y)*ease-36*Math.sin(Math.PI*t),size:j.from.size+(j.to.size-j.from.size)*ease};renderer.food(j.type,p.x,p.y,p.size);}}
 completionItems(type){return FULL_BASKET_ITEMS[type]||[];}
}
module.exports={Presentation,LAND_MS,SERVE_MS};
