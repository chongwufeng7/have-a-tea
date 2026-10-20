'use strict';
const assert=require('node:assert/strict');
const {Platform}=require('../../minigame/js/platform');
const {Controller}=require('../../minigame/js/controller');
const {clone}=require('../../minigame/js/daily');
function setup({store={},level,version='develop',query={},time='2026-09-30T15:59:00Z',width=402,height=850}={}){
 let now=Date.parse(time);const reads=[],writes=[];
 const api={getAccountInfoSync:()=>({miniProgram:{envVersion:version}}),getLaunchOptionsSync:()=>({query:{variant:'flat',...query,...(level?{level}:{})}}),getStorageSync:k=>{reads.push(k);return store[k];},setStorageSync:(k,v)=>{writes.push(k);store[k]=clone(v);},getWindowInfo:()=>({windowWidth:width,windowHeight:height,pixelRatio:1,safeArea:{top:44,bottom:height-34}}),getMenuButtonBoundingClientRect:()=>({top:52,height:32,left:width-109,width:87})};
 const p=new Platform(api),c=new Controller(p,()=>now);
 return {c,p,api,store,reads,writes,setTime:t=>now=Date.parse(t),reload:()=>new Controller(p,()=>now)};
}
function dismiss(c){if(c.modal==='resume')c.action('resume');if(c.modal==='intro')c.action('introSkip');}
function win(c){dismiss(c);for(let guard=0;guard<100&&c.game.status==='playing';guard++){const g=c.game,b=g.baskets[g.current],t=g.tiles.find(t=>t.zone==='board'&&t.type===b.type);assert.ok(t,'current demand must be reachable');assert.equal(c.pick(t.id),true);}assert.equal(c.game.status,'won');}
function ctx(){return new Proxy({},{get:(t,k)=>k in t?t[k]:()=>{}});}
module.exports={setup,dismiss,win,ctx};
