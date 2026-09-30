'use strict';
const design = require('./design-layout');
const { Steam } = require('./steam');
const { boardScale } = require('./config');
const { FOODS, LEVELS } = require('./core');
const names = FOODS.map((s, i) => i === 8 ? '蛋散' : s);
const foodArt = [[7,6,38,35,368.26,417.65,-16.77,-11.11],[6,5,40,38,354.47,405.71,-239.19,-9.84],[7,7,40,35,342.62,405.71,-119.22,-106.98],[6.15,5.1,40,38,376.15,407.01,-133.33,-9.55],[6,7,40,33,336.99,414.94,-223.56,-114.94],[8,6,36,37,407.28,412.26,-21.85,-111.61],[6,7,40,33,355.12,143.48,-10.07,-21.21],[6,7,40,33,355.12,143.48,-127.57,-21.21],[6,7,40,33,355.12,143.48,-245.07,-21.21]];
const ASSETS = ['background.jpg','food-sheet.png','food-extra.png','icon-sheet.png','rules-base.png','level-plaque.png','bulb.png','wood-tray.png','tool-base.png','shuffle-base.png','tool-badge.png','component-undo-on.png','component-remove-on.png','component-shuffle-off.png','component-egg.png','component-noodles.png','component-soymilk.png'];
class Renderer {
  constructor(canvas, api, platform) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.api = api; this.platform = platform;
    this.images = {}; this.hits = []; this.ready = false; this.steam=new Steam(); this.resize();
  }
  resize() {
    const m = this.platform.window(); this.metrics = m;
    this.canvas.width = Math.round(m.width * m.dpr); this.canvas.height = Math.round(m.height * m.dpr);
    this.scale = Math.min(m.width / 402, m.height / 640);
    this.height = m.height / this.scale; this.offset = (m.width - 402 * this.scale) / 2;
    const safe = m.safeArea || { top: 0, bottom: m.height };
    const menu = m.menu;
    const menuCenter = menu && Number.isFinite(menu.top) && menu.height > 0 ? menu.top + menu.height / 2 : null;
    this.top = menuCenter !== null ? Math.max(safe.top / this.scale, menuCenter / this.scale - 25.5) : Math.max(43, (safe.top || 0) / this.scale);
    // Align header artwork to the system capsule; keep the board below the safe area.
    this.headerY = menuCenter !== null ? Math.max(0, menuCenter / this.scale - 25.5) : this.top;
    this.plaqueX = Math.min(124, menu && Number.isFinite(menu.left) ? (menu.left-this.offset)/this.scale-8-141.653 : 124);
    this.plaqueX = Math.max(77, this.plaqueX);
    this.bottom = Math.max(15, (m.height - safe.bottom) / this.scale + 8);
    this.boardY = this.top + 55.651;
    this.storageY = this.height - this.bottom - 253;
    this.boardH = Math.max(80, this.storageY - this.boardY);
  }
  async load() {
    await Promise.all(ASSETS.map(name => new Promise((resolve,reject) => {
      const im = this.api.createImage(); im.onload = () => { this.images[name] = im; resolve(); };
      im.onerror = () => reject(Error('图片加载失败：' + name)); im.src = 'assets/' + name;
    })));
    this.ready = true;
  }
  begin() {
    const c = this.ctx, m = this.metrics;
    c.setTransform(1,0,0,1,0,0); c.fillStyle = '#38251c'; c.fillRect(0,0,this.canvas.width,this.canvas.height);
    c.setTransform(m.dpr*this.scale,0,0,m.dpr*this.scale,m.dpr*this.offset,0); this.hits=[];
  }
  box(x,y,w,h,r,fill,stroke,line=1) {
    const c=this.ctx; r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r); c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h); c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r); c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y); c.closePath();
    if(fill){c.fillStyle=fill;c.fill();} if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
  }
  text(s,x,y,size=14,color='#663d2a',align='left',weight='bold') {
    const c=this.ctx;c.font=weight+' '+size+'px sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;
    if(size>=16&&color==='#fff6eb'){c.strokeStyle='#6a3a2a';c.lineWidth=2;c.lineJoin='round';c.strokeText(String(s),x,y);}
    c.fillText(String(s),x,y);
  }
  image(name,x,y,w,h) { const im=this.images[name]; if(im)this.ctx.drawImage(im,x,y,w,h); }
  crop(name,x,y,w,h,iw,ih,left,top) {
    const c=this.ctx;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();this.image(name,x+w*left/100,y+h*top/100,w*iw/100,h*ih/100);c.restore();
  }
  hit(id,x,y,w,h,enabled=true) { this.hits.push({id,x,y,w,h,enabled}); }
  card(type,x,y,w=52,blocked=false) {
    const c=this.ctx;c.save();c.translate(x,y);c.scale(w/52,w/52);
    this.box(0,0,52,54,6,'#9e4a29','#754a36',.866);this.box(0,0,52,48,6,'#fff1d4','#754a36',.866);
    const a=foodArt[type];if(a)this.crop(type>=6?'food-extra.png':'food-sheet.png',...a);else if(type>=9&&type<=11){
      const name=['egg','noodles','soymilk'][type-9],im=this.images['component-'+name+'.png'];
      if(im){const slot=type===9?[-1,0,42,35]:type===10?[-1,-1,42,38]:[0,0,40,35],k=Math.min(slot[2]/im.width,slot[3]/im.height),iw=im.width*k,ih=im.height*k;c.save();c.beginPath();c.rect(6,7,40,type===11?33:34);c.clip();c.drawImage(im,6+slot[0]+(slot[2]-iw)/2,7+slot[1]+(slot[3]-ih)/2,iw,ih);c.restore();}
    }else this.text(names[type],26,26,13,'#663d2a','center');
    if(blocked)this.box(0,0,52,54,6,'rgba(100,54,34,.35)');c.restore();
  }
  slotCard(type,x,y,w,h) {
    const width=Math.min(w-4,(h-4)*52/54),height=width*54/52;
    this.card(type,x+(w-width)/2,y+(h-height)/2,width);
  }
  label(s,x,y,w,h,size=14) { this.box(x,y,w,h,5,'#743e30','#51291a',1.2);this.text(s,x+w/2,y+h/2,size,'#fff6e4','center'); }
  tiles(game) {
    const w=370,h=this.boardH;
    if(game.config.level===20&&!game.revived){const scale=Math.min(boardScale,(h-18)/design.height,(w-24)/design.width);return design.tiles.map(t=>({id:t.id,x:16+(w-design.width*scale)/2+t.x*scale,y:this.boardY+(h-design.height*scale)/2+t.y*scale,w:t.w*scale,h:t.w*scale*54/52}));}
    const ts=game.tiles,minX=Math.min(...ts.map(t=>t.x)),minY=Math.min(...ts.map(t=>t.y)),sx=Math.max(...ts.map(t=>t.x))+.94-minX,sy=Math.max(...ts.map(t=>t.y))+.94*54/52-minY,unit=Math.min(55.4*boardScale,(w-28)/sx,(h-24)/sy);
    return ts.map(t=>({id:t.id,x:16+(w-sx*unit)/2+(t.x-minX)*unit,y:this.boardY+(h-sy*unit)/2+(t.y-minY)*unit,w:unit*.94,h:unit*.94*54/52}));
  }
  toolButton(g,id,label,x,y) {
    const has=g.tools[id]>0,i=['undo','shuffle','remove'].indexOf(id);
    this.image(has?'shuffle-base.png':'tool-base.png',x,y,84,69);
    const ix=x+(i===0?25:21.3),iy=y+(i===0?5:i===1?4.7:4),iw=i===0?35.552:41,ih=i===0?30:i===1?34:31;
    if(id==='undo'&&has)this.crop('component-undo-on.png',ix,iy,iw,ih,106.38,126.1,-3.19,-12.61);
    else if(id==='remove'&&has)this.crop('component-remove-on.png',ix,iy,iw,ih,100,88.18,0,5.91);
    else if(id==='shuffle'&&!has)this.crop('component-shuffle-off.png',ix,iy,iw,ih,138.89,112.36,-19.44,-6.18);
    else this.crop('icon-sheet.png',ix,iy,iw,ih,336.99,i===2?455.09:414.94,[-10.04,-118.46,-223.89][i],[-209.62,-214.09,-233.6][i]);
    this.text(label,x+42,y+45,16,'#fff6eb','center');this.image('tool-badge.png',x+11,y+57,62,20);this.text('剩余'+g.tools[id]+'次',x+42,y+66,i===0?10:11,'#fff6eb','center');this.hit(id,x,y,84,78,g.canTool(id));
  }
  button(s,id,x,y,w=100,h=38,primary=false) {
    this.box(x,y+3,w,h,8,'#915332');this.box(x,y,w,h,8,primary?'#ffce68':'#fff1d4','#875334');this.text(s,x+w/2,y+h/2,14,'#663d2a','center');this.hit(id,x,y,w,h);
  }
  render(controller) {
    this.begin(); const c=this.ctx,g=controller.game,y=this.headerY,sy=this.storageY;
    // Fit the entire scene to the viewport; tall screens must not crop the side furniture.
    const bg=this.images['background.jpg'];if(bg){c.drawImage(bg,0,0,402,this.height);c.fillStyle='rgba(255,248,234,.16)';c.fillRect(0,0,402,this.height);}
    if(!this.ready){this.text('小吃正在上桌…',201,this.height/2,22,'#663d2a','center');return;}
    this.image('level-plaque.png',this.plaqueX,y+2,141.653,46.784);this.text(controller.challengeDate,this.plaqueX+71,y+17,15,'#663d2a','center');this.text('第 '+String(g.config.level).padStart(2,'0')+' 关',this.plaqueX+71,y+35,13,'#663d2a','center');
    this.crop('rules-base.png',21,y+1.5,48,48,139.43,120.57,-17.69,-8.94);c.fillStyle='#8d513b';c.fillRect(28,y+6.5,34,37);this.crop('icon-sheet.png',32,y+8,27,23,336.99,414.94,-118.76,-305.13);this.text('设置',45,y+37,10,'#fff6eb','center');this.hit('settings',21,y,48,50);
    const now=Date.now();this.steam.update(g,now);
    this.tiles(g).sort((a,b)=>g.tiles[a.id].z-g.tiles[b.id].z||a.id-b.id).forEach(p=>{const t=g.tiles[p.id];if(t.zone!=='board')return;const a=this.steam.appearance(t.id,now);c.save();c.globalAlpha=a.opacity;this.card(t.type,p.x,p.y+a.dy,p.w,!g.canPick(t.id));c.restore();this.hit('tile:'+t.id,p.x,p.y,p.w,p.h+a.dy,g.canPick(t.id)&&a.opacity>=.5);});
    c.save();c.beginPath();c.rect(16,this.boardY,370,this.boardH);c.clip();this.steam.draw(c,this.tiles(g),now);c.restore();
    this.crop('wood-tray.png',16,sy+4.06,370,157,105.63,124.77,-2.82,-11.59);
    this.label('临时区',38,sy+30,64,36,16);
    for(let i=0;i<3;i++){const x=108.86+i*42.86,t=g.reserve[i];this.box(x,sy+30,36,36,6,'#fff1d4','#6a3a2a');c.save();c.setLineDash([3,2]);this.box(x+3,sy+33,30,30,4,'#ead0ad','#fff8e8',1.4);c.restore();if(t){this.slotCard(t.type,x,sy+30,36,36);this.hit('tile:'+t.id,x,sy+30,36,36,g.canPick(t.id));}}
    this.box(238,sy+31,130,35,5,'#fff3db','#6a3a2a');this.image('bulb.png',244,sy+35,19.722,25.724);this.text('集齐三张相同小吃',268,sy+43,10);this.text('即可消除',268,sy+56,10);
    this.label('暂存槽',38,sy+74,62,19,14);this.label(g.tray.length+' / 7',315,sy+74,52,19,13);
    for(let i=0;i<7;i++){const x=37.01+i*47.59;this.box(x,sy+96,44.16,40.32,7,'#fff1d4','#6a3a2a');this.box(x+3,sy+99,38.4,34.56,5,'#ead0ad','#fff8e8');if(g.tray[i]!==undefined)this.slotCard(g.tiles[g.tray[i]].type,x,sy+96,44.16,40.32);}
    const ty=sy+172;
    [['undo','撤回'],['shuffle','洗牌'],['remove','移出3张']].forEach(([id,label],i)=>this.toolButton(g,id,label,56+i*104,ty));
    if(controller.platform.testMode){[['restart','重开',ty+29],['levels','选关',ty+60]].forEach(([id,s,by])=>{c.font='bold 14px sans-serif';c.strokeStyle='#a94431';c.lineWidth=2.5;c.textAlign='left';c.textBaseline='middle';c.strokeText(s,20,by);this.text(s,20,by,14,'#fff7e6');this.hit(id,12,by-15,40,30);});}
    if(controller.message)this.text(controller.message,201,this.height-this.bottom/2,11,'#663d2a','center');
    if(controller.modal)this.modal(controller);
  }
  modal(controller) {
    const m=controller.modal,g=controller.game,c=this.ctx;
    c.fillStyle='rgba(38,27,21,.65)';c.fillRect(0,0,402,this.height);this.hits=[];
    const h=m==='levels'?370:m==='rules'?300:m==='settings'?310:220,y=(this.height-h)/2;
    this.box(21,y+5,360,h,18,'#653824');this.box(21,y,360,h,18,'#fff1d4','#875334',3);
    const titles={resume:'继续每日挑战',ended:'本轮挑战结束',storage:'存档暂不可用',saveError:'进度尚未保存',abandon:'重新挑战？',settings:'设置',rules:'玩法说明',restart:'重新开始？',levels:'选择测试关卡',lost:'暂存槽已满',won:g.config.level===LEVELS.length?'全部关卡完成':'本关完成'};
    this.text(titles[m],201,y+36,24,'#663d2a','center');
    if(m==='storage'){this.text(controller.platform.channel==='unknown'?'无法确认当前版本，请重新进入。':'原存档已保留，请联系开发者检查。',201,y+98,14,'#663d2a','center');return;}
    if(m==='saveError'){this.text('请释放存储空间，再保存当前进度。',201,y+93,14,'#663d2a','center');this.button('重试保存','retrySave',141,y+147,120,40,true);return;}
    if(m==='resume'){this.text(controller.challengeDate+' · 第'+g.config.level+'关',201,y+88,16,'#663d2a','center');this.text('恢复原牌局与剩余道具次数',201,y+116,13,'#663d2a','center');this.button('放弃恢复','abandonResume',69,y+153,120,40);this.button('恢复对局','resume',211,y+153,120,40,true);return;}
    if(m==='abandon'){this.text('结束本轮，从今天第1关重新挑战。',201,y+93,14,'#663d2a','center');this.button('继续本轮','close',69,y+147,120,40);this.button('重新挑战','confirmAbandon',211,y+147,120,40,true);return;}
    if(m==='settings'){
      this.button('重新挑战','newChallenge',51,y+190,300,38);
      this.button('玩法说明','rules',51,y+70,300,42);
      this.text('背景音乐',60,y+150,16);const on=controller.music.enabled;
      this.box(274,y+133,66,34,17,on?'#86a35b':'#b9a898','#875334');this.box(on?308:278,y+137,26,26,13,'#fff8e8');this.text(on?'开':'关',on?290:324,y+150,11,'#fff8e8','center');this.hit('music',266,y+127,82,46);
      
      this.button('返回游戏','close',141,y+254,120,36,true);return;
    }
    if(m==='levels') {for(let n=1;n<=LEVELS.length;n++){const x=39+(n-1)%5*66,by=y+70+Math.floor((n-1)/5)*41;this.button(String(n),'level:'+n,x,by,57,31,n===g.config.level);}this.button('关闭','close',151,y+h-48,100,32);return;}
    if(m==='rules'){['点击未被遮挡的小吃，放入暂存槽。','集齐三张相同小吃即可消除。','满槽后无可用救场道具，从第1关重来。','移出：把槽内最早三张移到临时区。','临时区的小吃需要点回槽内消除。','每轮道具各1次，过关和跨日不恢复。','清空牌区、临时区和暂存槽即可过关。'].forEach((s,i)=>this.text(s,42,y+76+i*23,13));this.button('知道了','close',141,y+h-49,120,34,true);return;}
    if(m==='restart'){this.text('结束本轮，从第1关重新挑战。',201,y+93,14,'#663d2a','center');this.button('继续游戏','close',74,y+147,116,40);this.button('重新开始','confirmRestart',211,y+147,116,40,true);return;}
    if(m==='won'){if(g.config.level===30){this.text('今日30关已全部通关！',201,y+85,17,'#663d2a','center');this.text('后续有新关卡时再更新。',201,y+112,14,'#663d2a','center');}else this.text('这一笼小吃，全部消除啦！',201,y+93,15,'#663d2a','center');this.button(g.config.level===30?'重新挑战':'下一关',g.config.level===30?'retry':'next',141,y+147,120,40,true);return;}
    const buttons=[];if(controller.canRescue()&&g.canTool('undo'))buttons.push(['撤回继续','undo']);if(controller.canRescue()&&g.canTool('remove'))buttons.push(['移出3张继续','remove']);buttons.push(['从第1关开始','retry']);
    this.text(controller.canRescue()?'可以使用剩余道具继续。':'已无可用救场道具，返回第1关。',201,y+93,14,'#663d2a','center');const bw=buttons.length===3?100:120,gap=12,left=(402-buttons.length*bw-(buttons.length-1)*gap)/2;buttons.forEach(([s,id],i)=>this.button(s,id,left+i*(bw+gap),y+147,bw,40,i===0));
  }
  target(clientX,clientY) {
    const x=(clientX-this.offset)/this.scale,y=clientY/this.scale;
    for(let i=this.hits.length-1;i>=0;i--){const h=this.hits[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)return h.enabled?h.id:null;}
    return null;
  }
}
module.exports={Renderer,ASSETS};

