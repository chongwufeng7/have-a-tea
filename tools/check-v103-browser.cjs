'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../artifacts/v1.0.3',process.env.V103_BROWSER_DIR||'browser');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const tab=await(await fetch('http://127.0.0.1:9249/json/new?http://127.0.0.1:4183',{method:'PUT'})).json();
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map(),errors=[];
 ws.onmessage=e=>{const v=JSON.parse(e.data);if(v.method==='Runtime.exceptionThrown')errors.push(v.params.exceptionDetails.text);if(pending.has(v.id)){const [yes,no]=pending.get(v.id);pending.delete(v.id);v.error?no(Error(JSON.stringify(v.error))):yes(v.result);}};
 const send=(method,params={})=>new Promise((yes,no)=>{pending.set(++id,[yes,no]);ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const shot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(s.data,'base64'));};
 await send('Runtime.enable');await send('Page.enable');const results=[];
 for(const [width,height] of [[402,850],[320,568],[375,667],[430,932]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:'http://127.0.0.1:4183/?level=30'});await wait(500);
  await run('localStorage.clear();location.reload();');await wait(600);
  assert.equal(await run('runtime.renderer.ready'),true);assert.equal(await run('runtime.controller.modal'),'intro');
  if(width===402)await shot('intro');
  await run("runtime.controller.action('introSkip');runtime.draw();");await wait(750);
  const rects=await run('runtime.renderer.hits.filter(h=>h.id.startsWith("tile:")).map(h=>({x:h.x*runtime.renderer.scale+runtime.renderer.offset,y:h.y*runtime.renderer.scale+runtime.renderer.originY,w:h.w*runtime.renderer.scale,h:h.h*runtime.renderer.scale}))');assert.equal(rects.length,await run('runtime.controller.game.tiles.length'));
  for(const r of rects){assert.ok(r.x>=0&&r.x+r.w<=width+.01);assert.ok(r.y+r.h<=height-34+.01);}
  await shot('level30-'+width+'x'+height);
  assert.equal(await run(`(()=>{const r=runtime.renderer,h=r.hits.find(h=>h.id.startsWith('tile:')),x=(h.x+h.w/2)*r.scale+r.offset,y=(h.y+h.h/2)*r.scale+r.originY;events.start({touches:[{identifier:1,clientX:x,clientY:y}]});events.end({changedTouches:[{identifier:1,clientX:x,clientY:y}]});return runtime.controller.game.actions.length;})()`),1);
  await run('events.hide();events.show();');assert.equal(await run('runtime.controller.modal'),'resume');await run("runtime.controller.action('resume');runtime.controller.action('swap');runtime.draw();");assert.equal(await run('runtime.controller.game.tools.swap'),0);
  await send('Page.reload');await wait(500);assert.equal(await run('runtime.controller.modal'),'resume');assert.equal(await run('runtime.controller.game.tools.swap'),0);
  results.push({width,height,tiles:rects.length,touch:true,resume:true,swapPersisted:true});
 }
 await run("runtime.controller.action('resume');for(let guard=0;guard<100&&runtime.controller.game.status==='playing';guard++){const g=runtime.controller.game,t=g.tiles.find(t=>t.zone==='board'&&t.type===g.baskets[g.current].type);runtime.controller.pick(t.id);}runtime.draw();");
 assert.equal(await run('runtime.controller.game.status'),'won');await shot('success');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({adapter:'actual game.js, browser wx shim; not WeChat',results,errors},null,2));
 ws.close();console.log(JSON.stringify({results,errors},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
