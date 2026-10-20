'use strict';
// Actual native entry in the local wx adapter. Requires the agent-owned CDP Chrome.
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const dir='artifacts/v1.0.3/browser-timer';fs.mkdirSync(dir,{recursive:true});
 const tab=await(await fetch('http://127.0.0.1:9249/json/new?http://127.0.0.1:4183',{method:'PUT'})).json();
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();
 ws.onmessage=e=>{const v=JSON.parse(e.data);if(pending.has(v.id)){const [a,b]=pending.get(v.id);pending.delete(v.id);v.error?b(Error(JSON.stringify(v.error))):a(v.result);}};
 const send=(method,params={})=>new Promise((a,b)=>{pending.set(++id,[a,b]);ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const shot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(dir+'/'+name+'.png',Buffer.from(s.data,'base64'));};
 try{
  await send('Emulation.setDeviceMetricsOverride',{width:402,height:850,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:'http://127.0.0.1:4183/?level=1'});await wait(400);await run('localStorage.clear();location.reload()');await wait(700);
  await run("runtime.controller.action('introSkip');window.testTime=Date.now();runtime.controller.now=()=>window.testTime;runtime.controller.timerAt=window.testTime;runtime.draw();");
  await wait(700);await shot('level1-idle-centered');
  assert.equal(await run('runtime.controller.timer.started'),false);
  const touch="(id)=>{const r=runtime.renderer,h=r.hits.find(h=>h.id===id),x=(h.x+h.w/2)*r.scale+r.offset,y=(h.y+h.h/2)*r.scale+r.originY;events.start({touches:[{identifier:1,clientX:x,clientY:y}]});events.end({changedTouches:[{identifier:1,clientX:x,clientY:y}]});}";
  await run('window.tap='+touch);
  await run("(()=>{const g=runtime.controller.game;tap('tile:'+g.tiles.find(t=>t.zone==='board'&&t.type===g.baskets[g.current].type).id);})();testTime+=2000;runtime.draw();");
  assert.equal(await run('runtime.controller.timer.remainingMs'),88000);
  await run("tap('settings');testTime+=60000;runtime.draw();");assert.equal(await run('runtime.controller.timer.remainingMs'),88000);
  await run("runtime.controller.action('close');runtime.draw();events.hide();testTime+=60000;events.show();runtime.controller.action('resume');runtime.draw();");assert.equal(await run('runtime.controller.timer.remainingMs'),88000);
  await run('testTime+=73000;runtime.draw();');assert.equal(await run('runtime.controller.timer.remainingMs'),15000);await shot('last15-seconds');
  await run('testTime+=15000;runtime.draw();');assert.equal(await run('runtime.controller.modal'),'timeout');
  assert.equal(await run("runtime.renderer.hits.some(h=>/swap|ad|extend/i.test(h.id))"),false);await shot('timeout-no-ad');
  await send('Page.reload');await wait(700);assert.equal(await run('runtime.controller.modal'),'timeout');assert.equal(await run('runtime.controller.timer.remainingMs'),0);
  fs.writeFileSync(dir+'/timer-results.json',JSON.stringify({firstTouch:true,settingsPause:true,backgroundPause:true,warning:true,timeout:true,noAdOrSwap:true,reloadZero:true},null,2));
  console.log('Timer browser lifecycle, warning, timeout and reload checks passed.');
 }finally{ws.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
