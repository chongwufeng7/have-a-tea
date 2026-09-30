'use strict';
// Decorative only: capture the initial clickable cards, never change game state.
class Steam {
  constructor() { this.game=null; this.started=0; this.emitters=[]; this.active=false; this.arrivalDone=false; }
  delay(id) { return (id*137)%550; }
  appearance(id,now) {
    if(this.arrivalDone)return {opacity:1,dy:0};
    const progress=Math.max(0,Math.min(1,(now-this.started-this.delay(id))/300));
    const eased=1-Math.pow(1-progress,3);
    return {opacity:eased,dy:(1-eased)*10};
  }
  update(game,now) {
    if(this.game!==game){
      this.game=game;this.started=now;this.active=true;this.arrivalDone=false;
      this.emitters=game.tiles.filter(t=>game.canPick(t.id)&&t.zone==='board').map(t=>({id:t.id,delay:this.delay(t.id)+300,stopped:false}));
    }
    for(const e of this.emitters)if(game.tiles[e.id].zone!=='board')e.stopped=true;
    if(now-this.started>=850)this.arrivalDone=true;
    if(now-this.started>=3000||(this.arrivalDone&&this.emitters.every(e=>e.stopped)))this.active=false;
  }
  stop() { this.active=false;this.arrivalDone=true;this.emitters.forEach(e=>e.stopped=true); }
  draw(ctx,positions,now) {
    if(!this.active)return;
    const elapsed=now-this.started,ending=Math.min(1,Math.max(0,(3000-elapsed)/850));
    ctx.save();
    for(const e of this.emitters){
      if(e.stopped)continue;const p=positions.find(p=>p.id===e.id);if(!p)continue;
      for(let i=0;i<3;i++){
        const age=(elapsed-e.delay-i*240)/1500;if(age<=0||age>=1)continue;
        const alpha=Math.sin(Math.PI*age)*.30*ending;
        const x=p.x+p.w*(.36+i*.13)+Math.sin(age*3+e.id)*p.w*.06;
        const y=p.y+p.h*.12-age*p.h*.55;
        const radius=p.w*(.065+age*.095);
        // Layered translucent circles give soft edges without a bitmap or blur API.
        ctx.fillStyle='#fff9ec';
        for(let ring=4;ring>=1;ring--){ctx.globalAlpha=alpha/4;ctx.beginPath();ctx.arc(x,y,radius*(.55+ring*.17),0,Math.PI*2);ctx.fill();}
      }
    }
    ctx.restore();
  }
}
module.exports={Steam};
