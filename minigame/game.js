'use strict';
const { Platform } = require('./js/platform');
const { Controller } = require('./js/controller');
const { Renderer } = require('./js/renderer');

const canvas = wx.createCanvas();
const platform = new Platform(wx);
platform.enableSharing();
const controller = new Controller(platform);
const renderer = new Renderer(canvas, wx, platform);
let active = true, touch = null, loading = true, tickTimer=null, hasHidden=false;
const draw = () => {
  if(tickTimer!==null){clearTimeout(tickTimer);tickTimer=null;}
  if(!active)return;
  controller.tick();
  renderer.render(controller);
  if(renderer.ready&&(renderer.animating||controller.timerRunning))tickTimer=setTimeout(draw,renderer.animating?16:200);
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
wx.onHide(()=>{controller.hide();hasHidden=true;active=false;touch=null;if(tickTimer!==null){clearTimeout(tickTimer);tickTimer=null;}renderer.feedback.cancel();controller.music.hide();controller.sound.hide();});
wx.onShow(()=>{active=true;touch=null;if(hasHidden){controller.show();hasHidden=false;}controller.music.show();controller.sound.show();renderer.resize();draw();});
wx.onWindowResize(()=>{touch=null;renderer.resize();draw();});
