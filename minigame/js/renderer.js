'use strict';
const {FOODS,isStacked}=require('./trolley');
const {Presentation}=require('./presentation');
const {BASKET_ITEMS,basketOrigin,trayOrigin,TWO_LAYOUT}=require('./completion-framing');
const {FOOD_ART}=require('./food-framing');
const {format}=require('./timer');
// Card-only adjustment: siu mai, pork bun, egg tart, piggy bun and double-skin milk.
const SMALLER_CARD_FOODS=new Set([1,6,7,12,20]);
const EXTRA_FOOD_ART=['beef-balls','piggy-custard-bun','tofu-skin-roll','pan-fried-dumplings','red-rice-rolls','turnip-cake','malay-sponge-cake','ham-sui-gok','fried-spring-rolls','double-skin-milk'].map(name=>'food-'+name+'.png');
const ASSETS=['background.jpg','food-atlas.png','steamer.png','chassis.png','tray-board.png','button.png','plaque.png','book.png','auntie-serving.png','har-gow.png','tool-undo-on.png','tool-undo-off.png','tool-shuffle-on.png','tool-shuffle-off.png',...EXTRA_FOOD_ART];
class Renderer {
 constructor(canvas,api,platform){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.api=api;this.platform=platform;this.images={};this.hits=[];this.ready=false;this.feedback=new Presentation();this.animating=false;this.resize();}
 resize(){
  const m=this.platform.window();this.metrics=m;const safe=m.safeArea||{top:0,bottom:m.height};
  // The two-order design shares the capsule row; its left/center controls avoid the right-hand capsule.
  const capsuleBottom=m.menu&&m.menu.height>0?m.menu.top+m.menu.height:0;
  const headerTop=this.headerTop??24,adaptive=headerTop===-21;
  const top=(adaptive?Math.max(0,safe.top||0):Math.max(0,safe.top||0,capsuleBottom))+(adaptive?8/3:16),bottom=Math.min(m.height,safe.bottom||m.height)-12;
  // Fill the design width first. Reclaim whitespace before shrinking on short screens.
  this.scale=adaptive?Math.min(m.width/402,(bottom-top)/740):Math.min(1,m.width/402,(bottom-top)/(900-headerTop));
  this.toolY=adaptive?Math.min(820,headerTop+(bottom-top)/this.scale-78):820;
  this.offset=(m.width-402*this.scale)/2;this.originY=top-headerTop*this.scale;
  this.height=(m.height-this.originY)/this.scale;this.canvas.width=Math.round(m.width*m.dpr);this.canvas.height=Math.round(m.height*m.dpr);
 }
 async load(){await Promise.all(ASSETS.map(name=>new Promise((resolve,reject)=>{const im=this.api.createImage();im.onload=()=>{this.images[name]=im;resolve();};im.onerror=()=>reject(Error(name));im.src='assets/v103/'+name;})));this.ready=true;}
 box(x,y,w,h,r,fill,stroke,line=1){const c=this.ctx;r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 text(s,x,y,size=14,color='#663d2a',align='center'){const c=this.ctx;c.font='bold '+size+'px serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(String(s),x,y);}
 image(name,x,y,w,h){const im=this.images[name];if(im)this.ctx.drawImage(im,x,y,w,h);}
 fit(name,x,y,w,h){const im=this.images[name];if(!im)return;const k=Math.min(w/im.width,h/im.height);this.ctx.drawImage(im,x+(w-im.width*k)/2,y+(h-im.height*k)/2,im.width*k,im.height*k);}
 crop(name,x,y,w,h,iw,ih,left,top){const c=this.ctx;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();this.image(name,x+w*left/100,y+h*top/100,w*iw/100,h*ih/100);c.restore();}
 food(type,x,y,size){const f=FOOD_ART[type],name=type===0?'har-gow.png':type>=11?EXTRA_FOOD_ART[type-11]:'food-atlas.png',im=this.images[name];if(!im||!f)return;const [rx,ry,rw,rh]=f.rect,dx=x+rx*size,dy=y+ry*size,w=rw*size,h=rh*size;if(f.mode==='FIT'){this.fit(name,dx,dy,w,h);return;}const [sx,sy,tx,ty]=f.crop,c=this.ctx;c.save();c.beginPath();c.rect(dx,dy,w,h);c.clip();c.drawImage(im,dx-tx*w/sx,dy-ty*h/sy,w/sx,h/sy);c.restore();}
 hit(id,x,y,w,h,enabled=true){this.hits.push({id,x,y,w,h,enabled});}
 button(label,id,x,y,w=120,h=38,primary=false){this.box(x,y+3,w,h,7,'#8d5132');this.box(x,y,w,h,7,primary?'#f3cf8b':'#fff1d4','#754a36');this.text(label,x+w/2,y+h/2,14);this.hit(id,x,y,w,h);}
 card(type,x,y,w=60){this.box(x,y+3,w,w,7,'#8d5132');this.box(x,y,w,w-1,7,'#fff1d4','#754a36',.7);const size=w*.92*(SMALLER_CARD_FOODS.has(type)?.86:1);this.food(type,x+(w-size)/2,y+w*.485-size/2,size);}
 tiles(g){if(isStacked(g)){
   if(g.config.orders!==2)return g.slots;
   const minY=Math.min(...g.slots.map(p=>p.y)),maxY=Math.max(...g.slots.map(p=>p.y+p.h)),minX=Math.min(...g.slots.map(p=>p.x)),maxX=Math.max(...g.slots.map(p=>p.x+p.w));
   const top=trayOrigin(g)+124,bottom=this.toolY-18,k=Math.min(1.12,368/(maxX-minX),(bottom-top)/(maxY-minY)),y=top+(bottom-top-(maxY-minY)*k)/2;
   return g.slots.map(p=>({...p,x:201+(p.x-201)*k,y:y+(p.y-minY)*k,w:p.w*k,h:p.h*k}));
  }const count=g.tiles.length,cols=Math.min(count>42?7:6,count),rows=Math.ceil(count/cols),w=Math.min(60,(372-(cols-1)*2.4)/cols,(432-(rows-1)*4.8-3)/rows),left=(402-(cols*w+(cols-1)*2.4))/2;return g.tiles.map(t=>({id:t.id,x:left+(t.id%cols)*(w+2.4),y:420+Math.floor(t.id/cols)*(w+4.8),w,h:w+3,rows}));}
 toolButton(key,x,g){this.image('tool-'+key+'-'+(g.tools[key]?'on':'off')+'.png',x,this.toolY,84,78);this.hit(key,x,this.toolY,84,78,g.canTool(key));}
 steam(x,y,progress){
  if(progress<=0||progress>=1)return;
  const c=this.ctx,fade=Math.sin(Math.PI*progress);c.save();c.lineCap='round';
  for(let i=0;i<3;i++){
   const cx=x+31+i*27+Math.sin(progress*5+i*2)*5,base=y+48-progress*30,bend=Math.sin(progress*6+i)*7;
   c.globalAlpha=.24*fade;c.strokeStyle='#fffaf0';c.lineWidth=1.8;c.beginPath();c.moveTo(cx,base);c.bezierCurveTo(cx-9+bend,base-13,cx+10+bend,base-23,cx,base-36);c.bezierCurveTo(cx-8-bend,base-46,cx+7,base-50,cx+3,base-58);c.stroke();
   const cy=base-20,radius=15+progress*8,gradient=c.createRadialGradient(cx,cy,0,cx,cy,radius);
   if(gradient){gradient.addColorStop(0,'rgba(255,250,240,0.21)');gradient.addColorStop(1,'rgba(255,250,240,0)');c.globalAlpha=fade;c.fillStyle=gradient;c.fillRect(cx-radius,cy-radius,radius*2,radius*2);}
  }c.restore();
 }
 topButton(id,label,x,g,y=29){const c=this.ctx;c.save();if(id==='swap'&&!g.canTool('swap'))c.globalAlpha=.6;this.crop('button.png',x,y,48,48,139.43,120.57,-17.69,-8.94);c.fillStyle='#8d513b';c.fillRect(x+7,y+5,34,37);if(id==='settings')this.fit('book.png',x+10,y+5,27,23);else this.fit('steamer.png',x+12,y+3,25,25);this.text(label,x+24,y+36,10,'#fff6eb');c.restore();this.hit(id,x,y,48,48,id==='settings'||g.canTool('swap'));if(id==='swap'){this.box(x+36,y-5,18,18,9,'#fff1d4','#754a36');this.text(g.tools.swap,x+45,y+4,12);}}
 render(controller){
  const g=controller.game,twoOrders=g.config.orders===2,headerTop=twoOrders?-21:24;if(this.headerTop!==headerTop){this.headerTop=headerTop;this.resize();}const c=this.ctx,m=this.metrics;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#e8dfc9';c.fillRect(0,0,this.canvas.width,this.canvas.height);
  const bg=this.images['background.jpg'];if(bg)c.drawImage(bg,0,0,this.canvas.width,this.canvas.height);
  c.setTransform(m.dpr*this.scale,0,0,m.dpr*this.scale,m.dpr*this.offset,m.dpr*this.originY);this.hits=[];
  if(!this.ready){this.text('点心正在上桌…',201,420,22);return;}
  const stacked=isStacked(g),view=stacked?this.feedback.update(controller,this.tiles(g)):null;this.animating=!!view?.active;
  this.topButton('settings','设置',20,g,twoOrders?-21:29);if(!stacked)this.topButton('swap','换笼',334,g);
  this.image('plaque.png',134,twoOrders?-19:29,136,45);this.text('第 '+g.config.level+' 关',202,twoOrders?4:52,24);
  if(controller.platform.testMode){if(twoOrders){this.text('重开',40,53,14);this.text('选关',40,80,14);this.hit('restart',20,40,40,25);this.hit('levels',20,67,40,25);}else{this.text('重开',178,93,14);this.text('选关',219,93,14);this.hit('restart',158,80,40,27);this.hit('levels',200,80,40,27);}}
  this.crop('chassis.png',0,twoOrders?TWO_LAYOUT.chassisY:170,402,134,100/.9641108512878418,100/.5004289746284485,-100*.018634367734193802/.9641108512878418,-100*.017654918134212494/.5004289746284485);
  g.baskets.forEach((basket,column)=>{
   const served=view?.serves.find(e=>e.column===column),pending=view?.pendingServes.find(e=>e.column===column),b=pending?{type:pending.type,ids:pending.ids}:basket,count=served?3:b?.ids.filter(id=>!view?.flights.some(f=>f.id===id)).length,active=stacked||column===g.current;
   const {x,y}=basketOrigin(g,column);this.fit('steamer.png',x,y+16,120,128);
   this.box(x+27,y,66,20,4,'#fff1d4','#754a36');
   this.text(!b?'已出笼':stacked?'收集 '+count+'/3':active?'当前 '+count+'/3':'等待',x+60,y+10,11);
   this.text(b?FOODS[b.type].name:'',x+60,y+123,b&&FOODS[b.type].name.length>4?9:11);
   if(served){for(const p of this.feedback.completionItems(b.type))this.food(b.type,x+p.x,y+p.y,p.size);const progress=Math.min(1,(view.time-served.start)/(served.end-served.start));this.steam(x,y,progress);c.save();c.globalAlpha=Math.max(0,1-progress*1.5);this.text('齐啦',x+60,y+40,16,'#8b321c');c.restore();}
   else if(b)b.ids.forEach((id,i)=>{if(view?.flights.some(f=>f.id===id))return;const p=BASKET_ITEMS[i];this.food(g.tiles[id].type,x+p.x,y+p.y,p.size);});
  });
  const trayY=trayOrigin(g);this.image('tray-board.png',13,trayY,376,108);
  this.box(31,trayY+17,64,22,11,'#643622');this.text('暂存区',62.5,trayY+27,15,'#fff6eb');this.box(319,trayY+16,54,22,11,'#643622');this.text(g.tray.length+' / '+g.config.capacity,347.5,trayY+27,14,'#fff6eb');
  for(let i=0;i<7;i++){const x=31+49*i;this.box(x,trayY+46,46,42,7,'rgba(61,31,15,.28)');this.box(x,trayY+44,46,42,7,'#fff1d4','#6a3a2a');if(g.tray[i]!==undefined&&!view?.flights.some(f=>f.id===g.tray[i]))this.food(g.tiles[g.tray[i]].type,x+1.4,trayY+44,43.2);}
  for(let i=g.config.capacity;i<7;i++)this.box(31+49*i,trayY+44,46,42,7,'rgba(184,170,162,.8)');
  for(const p of this.tiles(g)){const t=g.tiles[p.id];if(t.zone!=='board')continue;this.card(t.type,p.x,p.y,p.w);if(stacked&&!g.exposed(t.id))this.box(p.x,p.y,p.w,p.w-1,7,'rgba(38,27,21,.40)');this.hit('tile:'+t.id,p.x,p.y,p.w,p.h,g.canPick(t.id)&&!view?.blocking);}
  if(stacked){this.feedback.drawFlights(this,view);this.toolButton('undo',101,g);this.toolButton('shuffle',217,g);if(view.blocking)for(const h of this.hits)if(['undo','shuffle'].includes(h.id))h.enabled=false;}
  const timer=controller.timer;
  if(timer){const warning=timer.started&&timer.remainingMs<=15000;
   if(twoOrders){this.box(110,TWO_LAYOUT.timerY,184,28,8,'#643622','#cb8e4e');this.text((timer.started?'剩余时间 ':'点牌开始 ')+format(timer.remainingMs),202,TWO_LAYOUT.timerY+14,14,warning?'#ff8a73':'#fff1d4');}
   else if(stacked){this.box(294,29,88,48,8,'#643622','#cb8e4e');this.text(timer.started?'剩余时间':'点牌开始',338,41,10,'#fff1d4');this.text(format(timer.remainingMs),338,60,20,warning?'#ff8a73':'#fff1d4');this.box(304,73,68*timer.remainingMs/timer.durationMs,2,1,warning?'#d84632':'#dcb66c');}
   else{this.box(109,871,184,28,8,'#643622','#cb8e4e',1);this.text((timer.started?'剩余时间 ':'点牌开始 ')+format(timer.remainingMs),201,885,14,warning?'#ff8a73':'#fff1d4');this.box(119,898,164,2,1,'#b68a60');if(timer.remainingMs>0)this.box(119,898,164*timer.remainingMs/timer.durationMs,2,1,warning?'#d84632':'#dcb66c');}
  }
  if(controller.modal&&!(view?.delayResult&&['won','lost','ended'].includes(controller.modal)))this.modal(controller,view);
 }
 modal(controller,view){
  const c=this.ctx,m=controller.modal,g=controller.game;
  c.fillStyle='rgba(38,27,21,.48)';c.fillRect(-this.offset/this.scale,-this.originY/this.scale,this.metrics.width/this.scale,this.metrics.height/this.scale);this.hits=[];
  if(m==='intro'){
   const intro=controller.introduction,f=FOODS[intro.ids[intro.index]],x=41,y=235;
   this.box(x,y+4,320,362,15,'#7f4f33');this.box(x+4,y,312,358,13,'#fff1d4','#754a36');this.text('今日识点心',201,y+30,21);this.text('新点心 · '+(intro.index+1)+'/'+intro.ids.length,201,y+58,11);
   this.food(f.id,x+112,y+76,96);this.text(f.name,201,y+191,20);f.intro.forEach((line,i)=>this.text(line,201,y+226+i*23,13));this.button(intro.index+1===intro.ids.length?'开始叹茶':'下一款','introNext',x+32,y+275,256,40,true);this.text('跳过介绍',201,y+337,13);this.hit('introSkip',151,y+318,100,32);return;
  }
  const h=m==='levels'?380:m==='rules'?320:m==='settings'?330:m==='won'?370:230,y=(850-h)/2+(m==='won'?20*Math.pow(1-(view?.resultProgress??1),2):0);
  this.box(21,y+5,360,h,15,'#653824');this.box(21,y,360,h,15,'#fff1d4','#875334',2);
  const titles={settings:'设置',rules:'叹茶小贴士',resume:'继续叹茶',ended:'本轮叹茶结束',timeout:'叹茶时间到',storage:'存档暂不可用',saveError:'进度尚未保存',abandon:'重新挑战？',restart:'重新开始？',levels:'选择测试关卡',lost:'暂存区已满',won:g.config.level===30?'今日叹茶圆满':'这一笼，齐啦！'};
  this.text(titles[m]||'',201,y+34,23);
  if(m==='storage'){this.text(controller.platform.channel==='unknown'?'无法确认版本，请重新进入':'原存档已保留，请联系开发者',201,y+100,14);return;}
  if(m==='saveError'){this.text('请释放存储空间，再保存当前进度',201,y+93,14);this.button('重试保存','retrySave',141,y+155,120,40,true);return;}
  if(m==='resume'){this.text(controller.challengeDate+' · 第'+g.config.level+'关',201,y+87,16);this.text(isStacked(g)?'恢复原牌局、剩余时间与道具次数':'恢复原牌局和剩余换笼机会',201,y+116,13);this.button('放弃恢复','abandonResume',69,y+164);this.button('恢复对局','resume',211,y+164,120,38,true);return;}
  if(m==='settings'){this.button('玩法说明','rules',51,y+65,300);this.button('背景音乐：'+(controller.music.enabled?'开':'关'),'music',51,y+114,300);this.button('操作音效：'+(controller.sound.enabled?'开':'关'),'sound',51,y+163,300);this.button('重新挑战','newChallenge',51,y+212,300);this.button('返回游戏','close',141,y+275,120,36,true);return;}
  if(m==='rules'){(isStacked(g)?['只可取未被遮挡的亮牌。',(g.baskets.length===2?'两':'三')+'笼均可接收对应点心，满三份出笼。','其他点心进入暂存，同类不自行消除。','新订单出现时，暂存自动补入。',(g.config.capacity===5?'五':'七')+'格仍满时，可撤回刚才的一步。','撤回不退时间，不退已用道具次数。','洗牌只重排剩余牌；洗后不跨步撤回。','每种道具整轮一次，过关不恢复。','首次点牌计时，弹窗与后台暂停。']:['所有牌均可自由点选。','仅当前笼接收对应点心，满三份出笼。','其他点心进入暂存，同类不会自行消除。','左、中、右轮转，暂存点心自动补入。','连锁补入后七格仍满，本轮结束。','可用换笼切到下一笼，原笼进度保留。','换笼整轮仅一次，过关不会恢复。','限时内清空点心；点牌开始计时。','介绍、设置与切后台暂停。']).forEach((s,i)=>this.text(s,201,y+62+i*21,12));this.button('知道了','close',141,y+267,120,34,true);return;}
  if(m==='levels'){for(let n=1;n<=30;n++)this.button(String(n),'level:'+n,39+(n-1)%5*66,y+67+Math.floor((n-1)/5)*43,57,32,n===g.config.level);this.button('关闭','close',151,y+332,100,32);return;}
  if(m==='abandon'||m==='restart'){this.text('结束本轮，从第1关重新挑战',201,y+95,14);this.button('继续游戏','close',69,y+163);this.button('重新开始',m==='restart'?'confirmRestart':'confirmAbandon',211,y+163,120,38,true);return;}
  if(m==='won'){const p=view?.resultProgress??1;this.fit('auntie-serving.png',111,y+57-8*Math.sin(p*Math.PI),180,193);this.text(g.config.level===1?'饮啖茶，再嚟一笼':g.config.level===30?'三十关都叹完啦，得闲再嚟！':'点心上齐，慢慢叹茶。',201,y+272,17);this.button(g.config.level===30?'重新挑战':'下一关',g.config.level===30?'retry':'next',141,y+313,120,38,true);return;}
  this.text(m==='timeout'?'饮啖茶，下轮再慢慢嚟。':m==='lost'?(isStacked(g)?'撤回刚才的一步，重新安排取牌':'换一笼，试试腾出暂存位置'):'先看看可取的牌和蒸笼需要什么',201,y+95,14);if(m==='lost'){this.button('重新挑战','retry',69,y+164);this.button(isStacked(g)?'撤回一步':'换笼继续',isStacked(g)?'undo':'swap',211,y+164,120,38,true);}else this.button('从第1关开始','retry',131,y+164,140,38,true);
 }
 target(clientX,clientY){const x=(clientX-this.offset)/this.scale,y=(clientY-this.originY)/this.scale;for(let i=this.hits.length-1;i>=0;i--){const h=this.hits[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)return h.enabled?h.id:null;}return null;}
}
module.exports={Renderer,ASSETS,EXTRA_FOOD_ART};

