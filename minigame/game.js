'use strict';
const { Platform } = require('./js/platform');
const { Controller } = require('./js/controller');
const { Renderer } = require('./js/renderer');

const canvas = wx.createCanvas();
const platform = new Platform(wx);
const controller = new Controller(platform);
const renderer = new Renderer(canvas, wx, platform);
let active = true, touch = null, loading = true, animationTimer=null, hasHidden=false;
const draw = () => {
  if(animationTimer!==null){clearTimeout(animationTimer);animationTimer=null;}
  if(!active)return;
  renderer.render(controller);
  if(renderer.ready&&renderer.steam.active)animationTimer=setTimeout(draw,33);
};
draw();
function load() {
  loading = true;
  renderer.load().then(() => { loading = false; draw(); }).catch(() => {
    loading = false;
    wx.showModal({ title: '小吃暂未上桌', content: '图片加载失败，请重试。', confirmText: '重试', showCancel: false, success: load });
  });
}
load();
wx.onTouchStart(e => {
  if (!active || loading || !renderer.ready || e.touches.length !== 1) { touch=null;return; }
  const p=e.touches[0];touch={id:p.identifier,x:p.clientX,y:p.clientY,target:renderer.target(p.clientX,p.clientY)};
});
wx.onTouchEnd(e => {
  const start=touch;touch=null;if(!active||!start)return;
  const p=e.changedTouches.find(p=>p.identifier===start.id);
  if(!p||Math.hypot(p.clientX-start.x,p.clientY-start.y)>12)return;
  const id=renderer.target(p.clientX,p.clientY);if(!id||id!==start.target)return;
  controller.music.interact();
  if(id.startsWith('tile:'))controller.pick(Number(id.slice(5)));else controller.action(id);
  draw();
});
wx.onTouchCancel(()=>{touch=null;});
wx.onHide(()=>{hasHidden=true;active=false;touch=null;if(animationTimer!==null){clearTimeout(animationTimer);animationTimer=null;}renderer.steam.stop();controller.music.hide();controller.persist();});
wx.onShow(()=>{active=true;touch=null;if(hasHidden){controller.offerResume();hasHidden=false;}controller.music.show();renderer.resize();draw();});
wx.onWindowResize(()=>{touch=null;renderer.resize();draw();});
