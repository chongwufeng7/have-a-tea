/* Figma MCP scripts for the approved 1.0.3 artwork. Not executed by minigame/. */
module.exports = {
async buildComponents(figma) {

const page=await figma.getNodeByIdAsync('3:2');await figma.setCurrentPageAsync(page);
for(const font of [{family:'Noto Sans SC',style:'Black'},{family:'Noto Sans SC',style:'Bold'}])await figma.loadFontAsync(font);
const area=await figma.getNodeByIdAsync('142:1516');
const found=area.children.find(n=>n.name==='1.0.3/卡片');
if(found)return {existing:found.id,children:area.children.map(n=>({id:n.id,name:n.name}))};
area.resize(1300,2100);
const ids=[],keep=n=>(ids.push(n.id),n),color=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const variables=await figma.variables.getLocalVariablesAsync(),v=name=>variables.find(v=>v.name===name);
const semantic={ink:'color/ink',cream:'color/cream',border:'color/border',wood:'color/wood',dark:'color/woodDark'};
const hex={ink:'#603922',cream:'#FFF5E3',border:'#805339',wood:'#8E5033',dark:'#5C3421'};
function paint(k){const p={type:'SOLID',color:color(hex[k])};return v(semantic[k])?figma.variables.setBoundVariableForPaint(p,'color',v(semantic[k])):p;}
function rectangle(p,name,x,y,w,h,k,r=0){const n=keep(figma.createRectangle());p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;n.fills=k?[paint(k)]:[];if(r)n.cornerRadius=r;return n;}
function text(p,s,x,y,size=12,k='ink'){const n=keep(figma.createText());p.appendChild(n);n.name=s;n.fontName={family:'Noto Sans SC',style:'Bold'};n.characters=s;n.fontSize=size;n.fills=[paint(k)];n.x=x;n.y=y;return n;}
function component(name,w,h,x,y){const n=keep(figma.createComponent());area.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;n.fills=[];n.clipsContent=false;return n;}
function desc(n,s){n.description=s;return n;}
const foods=['虾饺','烧卖','皮蛋瘦肉粥','豉汁凤爪','豉汁排骨','鲜虾肠粉','叉烧包','蛋挞','油条','炒粉','金钱肚'];
const foodIds=[];
text(area,'1.0.3 · 已确认效果图组件',0,358,25);
text(area,'独立图片素材 + 可编辑文字、状态与容器；原组件保留。',0,394,13);
for(let i=0;i<11;i++){
 const c=component('1.0.3/点心/'+foods[i],80,80,(i%6)*110,445+Math.floor(i/6)*126);
 desc(c,'广州早茶点心：'+foods[i]+'。独立透明图案，可替换到卡片或蒸笼。');
 const art=rectangle(c,foods[i]+' / 插画',0,0,80,80);
 art.fills=[{type:'IMAGE',imageHash:'8384a498a0d11b2015bbaf2ff540ec183f964ecd',scaleMode:'CROP',imageTransform:[[.25,0,(i%4)*.25],[0,1/3,Math.floor(i/4)/3]]}];
 foodIds.push(c.id);text(area,foods[i],c.x,c.y+82,11);
}
const cardVariants=[];
for(const [index,state] of ['默认','选中','空位'].entries()){
 const c=component('状态='+state,60,63,80*index,740);desc(c,'原稿奶油牌框，图案通过实例替换。');
 rectangle(c,'牌体底边',0,3,60,60,'wood',7);
 const face=rectangle(c,'奶油牌面',0,0,60,59,'cream',7);face.strokes=[paint(state==='选中'?'wood':'border')];face.strokeWeight=state==='选中'?2:0.7;
 if(state!=='空位'){const f=keep((await figma.getNodeByIdAsync(foodIds[0])).createInstance());c.appendChild(f);f.rescale(.69);f.x=2.4;f.y=1.5;const prop=c.addComponentProperty('点心图案','INSTANCE_SWAP',foodIds[0]);f.componentPropertyReferences={mainComponent:prop};}
 else {face.opacity=.65;}
 cardVariants.push(c);
}
const cardSet=keep(figma.combineAsVariants(cardVariants,area));cardSet.name='1.0.3/卡片';cardSet.x=0;cardSet.y=740;cardSet.fills=[];desc(cardSet,'全场自由取牌，无遮挡状态；默认、选中、空位，图案可替换。');
const slotVariants=[];
for(const [i,state]of ['空','有点心'].entries()){
 const c=component('状态='+state,44,50,80*i,860);
 rectangle(c,'象牙白槽位',0,0,44,50,'cream',5);
 const outline=rectangle(c,'虚线内框',3,3,38,44,null,4);outline.strokes=[{type:'SOLID',color:color('#D7B480')}];outline.strokeWeight=.6;outline.dashPattern=[2,2];
 if(i){const f=keep((await figma.getNodeByIdAsync(foodIds[2])).createInstance());c.appendChild(f);f.rescale(.54);f.x=.4;f.y=3;const prop=c.addComponentProperty('点心图案','INSTANCE_SWAP',foodIds[2]);f.componentPropertyReferences={mainComponent:prop};}
 slotVariants.push(c);
}
const slotSet=keep(figma.combineAsVariants(slotVariants,area));slotSet.name='1.0.3/暂存槽';slotSet.x=0;slotSet.y=860;slotSet.fills=[];
const basketVariants=[];
for(const [i,entry]of [['等待',0],['当前',0],['当前',1],['当前',2],['当前',3],['完成',0]].entries()){
 const [state,count]=entry,c=component('状态='+state+', 数量='+count,120,144,(i%3)*140,1000+Math.floor(i/3)*190);
 const art=rectangle(c,'竹蒸笼 / 打孔油纸',0,16,120,128);
 art.fills=[{type:'IMAGE',imageHash:'c2265b99981ec78f5a986c8d3700db04ec73eeff',scaleMode:'FIT'}];
 rectangle(c,'笼状态标签',27,0,66,20,'cream',4).strokes=[paint('border')];
 const st=text(c,state==='当前'?'当前 '+count+'/3':state,32,2,11);
 const stateProp=c.addComponentProperty('状态文案','TEXT',st.characters);st.componentPropertyReferences={characters:stateProp};
 const tag=text(c,'虾饺',46,118,11);const prop=c.addComponentProperty('点心名称','TEXT','虾饺');tag.componentPropertyReferences={characters:prop};
 for(let j=0;j<count;j++){const f=keep((await figma.getNodeByIdAsync(foodIds[0])).createInstance());c.appendChild(f);f.rescale(.37);f.x=[24,57,42][j];f.y=[38,42,55][j];const swap=c.addComponentProperty('点心'+(j+1),'INSTANCE_SWAP',foodIds[0]);f.componentPropertyReferences={mainComponent:swap};}
 if(state==='完成')c.opacity=.45;
 desc(c,'一笼三份；当前笼接收，等待笼保留纸衬。名称与图案可替换。');basketVariants.push(c);
}
const basketSet=keep(figma.combineAsVariants(basketVariants,area));basketSet.name='1.0.3/蒸笼';basketSet.x=350;basketSet.y=740;basketSet.fills=[];
const oldSettings=await figma.getNodeByIdAsync('65:3804'),buttonIds=[];
for(let i=0;i<3;i++){
 const c=keep(oldSettings.clone());area.appendChild(c);c.name=['1.0.3/设置','状态=可用','状态=用尽'][i];c.x=i*85;c.y=1270;
 for(const n of c.findAllWithCriteria({types:['TEXT']})){await figma.loadFontAsync(n.fontName);n.characters=i?'换笼':'设置';}
 if(i){const icon=c.children.find(n=>n.name==='饺子');if(icon)icon.visible=false;const art=rectangle(c,'蒸笼图标',12,3,25,25);art.fills=[{type:'IMAGE',imageHash:'c2265b99981ec78f5a986c8d3700db04ec73eeff',scaleMode:'FIT'}];const badge=keep(figma.createEllipse());c.appendChild(badge);badge.name='次数底';badge.resize(18,18);badge.x=36;badge.y=-5;badge.fills=[paint('cream')];badge.strokes=[paint('border')];const t=text(c,i===1?'1':'0',42,-5,12);const prop=c.addComponentProperty('剩余次数','TEXT',t.characters);t.componentPropertyReferences={characters:prop};if(i===2)c.opacity=.55;}
 desc(c,i?'切换当前接收笼；默认1次，已装点心保留。次数作用域待规则定稿。':'复用原设置木质按钮样式。');buttonIds.push(c.id);
}
const swapVariants=buttonIds.slice(1).map(id=>area.findOne(n=>n.id===id));
const swapSet=keep(figma.combineAsVariants(swapVariants,area));swapSet.name='1.0.3/换笼';swapSet.x=90;swapSet.y=1270;swapSet.fills=[];
const tray=component('1.0.3/暂存区底座',374,100,0,1430);
const wood=rectangle(tray,'原托盘木纹',0,0,374,100,null,11);wood.fills=(await figma.getNodeByIdAsync('123:3053')).fills;wood.strokes=[paint('border')];wood.strokeWeight=2;
const outer=rectangle(tray,'木框内沿',6,6,362,88,null,8);outer.strokes=[{type:'SOLID',color:color('#CB8E4E')}];outer.strokeWeight=1;
rectangle(tray,'标题底',14,10,64,22,'dark',5);text(tray,'暂存区',20,10,15,'cream');
rectangle(tray,'容量底',306,10,54,22,'dark',10);const ct=text(tray,'2 / 7',315,10,14,'cream');const cp=tray.addComponentProperty('占用提示','TEXT','2 / 7');ct.componentPropertyReferences={characters:cp};
desc(tray,'底座复用123:3053木纹，七格槽位独立组合，标题与容量原生文字。');
return {createdNodeIds:ids,mutatedNodeIds:[area.id],pageId:page.id,areaId:area.id,foodComponentIds:foodIds,cardSetId:cardSet.id,cardVariantIds:cardVariants.map(n=>n.id),slotSetId:slotSet.id,slotVariantIds:slotVariants.map(n=>n.id),basketSetId:basketSet.id,basketVariantIds:basketVariants.map(n=>n.id),settingsId:buttonIds[0],swapSetId:swapSet.id,swapVariantIds:buttonIds.slice(1),trayId:tray.id,foodCount:11};

},
async buildMain(figma) {

const p=await figma.getNodeByIdAsync('0:1');await figma.setCurrentPageAsync(p);
for(const f of [{family:'Noto Sans SC',style:'Black'},{family:'Noto Sans SC',style:'Bold'}])await figma.loadFontAsync(f);
const prior=p.children.find(n=>n.name==='1.0.3 · 已确认效果 · 换笼与早茶介绍');
if(prior)return {existing:true,screenId:prior.id};
const ids=[],keep=n=>(ids.push(n.id),n);
const ink=await figma.variables.getVariableByIdAsync('VariableID:3:7');
const paint=()=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:.38,g:.22,b:.13}},'color',ink);
function text(parent,s,x,y,size=12){const n=keep(figma.createText());parent.appendChild(n);n.name=s;n.fontName={family:'Noto Sans SC',style:'Bold'};n.characters=s;n.fontSize=size;n.x=x;n.y=y;n.fills=[paint()];return n;}
async function instance(parent,id,name,x,y){const c=await figma.getNodeByIdAsync(id),n=keep(c.createInstance());parent.appendChild(n);n.name=name;n.x=x;n.y=y;return n;}
function frame(parent,name,w,h,x=0,y=0){const n=keep(figma.createFrame());parent.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;n.fills=[];n.clipsContent=false;return n;}
const right=Math.max(0,...p.children.map(n=>n.x+n.width));
const screen=frame(p,'1.0.3 · 已确认效果 · 换笼与早茶介绍',402,850,right+100,80);screen.clipsContent=true;
const bg=keep(figma.createRectangle());screen.appendChild(bg);bg.name='背景 / 弱化老茶楼';bg.resize(402,850);bg.fills=[{type:'IMAGE',imageHash:'6d5c9338f8d56cabdcb0792459bf5885566027f4',scaleMode:'FILL'}];
const nav=frame(screen,'顶部 / 设置·换笼·关卡',402,106);
const set=await instance(nav,'145:1617','设置',20,29);
const swap=await instance(nav,'145:1625','换笼 / 默认一次',72,29);
const plaque=keep((await figma.getNodeByIdAsync('86:1418')).clone());nav.appendChild(plaque);plaque.name='关卡牌匾 / 原稿复用';plaque.x=134;plaque.y=29;plaque.rescale(136/plaque.width);
const level=text(nav,'第 6 关',0,34,24);level.x=202-level.width/2;
const capsule=keep((await figma.getNodeByIdAsync('86:1422')).clone());nav.appendChild(capsule);capsule.name='微信胶囊 / 系统占位';capsule.x=298;capsule.y=38;
const links=keep(figma.createAutoLayout('HORIZONTAL'));nav.appendChild(links);links.name='测试专用 / 审核包隐藏';links.fills=[];links.resize(91,23);links.x=165;links.y=83;links.primaryAxisSizingMode='FIXED';links.counterAxisSizingMode='FIXED';links.itemSpacing=14;text(links,'重开',0,0,14);text(links,'选关',0,0,14);
const trolley=frame(screen,'推车 / 三列蒸笼',382,160,10,110);
const chassis=keep(figma.createRectangle());trolley.appendChild(chassis);chassis.name='餐车底架 / 独立素材裁切';chassis.resize(382,31);chassis.x=0;chassis.y=132;chassis.fills=[{type:'IMAGE',imageHash:'7ca47f97f95c1e4b2b19b514c50202bb39d24d04',scaleMode:'CROP',imageTransform:[[1,0,0],[0,.18,.77]]}];
const row=keep(figma.createAutoLayout('HORIZONTAL'));trolley.appendChild(row);row.name='三列蒸笼 / 左中右循环';row.fills=[];row.resize(370,144);row.x=6;row.y=0;row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.itemSpacing=5;
const baskets=[];
for(let i=0;i<3;i++){const b=await instance(row,i===0?'145:1591':'145:1574',['当前 / 虾饺 / 2份','等待 / 烧卖','等待 / 排骨'][i],0,0);const t=b.findOne(n=>n.type==='TEXT'&&n.name==='虾饺');if(t){await figma.loadFontAsync(t.fontName);t.characters=['虾饺','烧卖','排骨'][i];}baskets.push(b.id);}
const tray=frame(screen,'暂存区 / 七格自动补入',374,100,14,268);
await instance(tray,'145:1648','木托盘底座 / 原素材123:3053',0,0);
const slots=keep(figma.createAutoLayout('HORIZONTAL'));tray.appendChild(slots);slots.name='暂存槽位';slots.resize(344,50);slots.x=15;slots.y=36;slots.itemSpacing=6;slots.fills=[];slots.primaryAxisSizingMode='FIXED';slots.counterAxisSizingMode='FIXED';
for(let i=0;i<7;i++){const n=await instance(slots,i<2?'145:1568':'145:1565','槽位 '+(i+1),0,0);if(i===1){const icon=n.findOne(n=>n.type==='INSTANCE');icon.swapComponent(await figma.getNodeByIdAsync('145:1527'));}}
const grid=keep(figma.createAutoLayout('VERTICAL'));screen.appendChild(grid);grid.name='牌区 / 六列七行 / 全场自由取';grid.resize(372,452);grid.x=15;grid.y=375;grid.fills=[];grid.primaryAxisSizingMode='FIXED';grid.counterAxisSizingMode='FIXED';grid.itemSpacing=1.8;
const foodIds=["145:1518","145:1521","145:1524","145:1527","145:1530","145:1533","145:1536","145:1539","145:1542","145:1545","145:1548"];
const types=[0,1,7,2,5,3,4,9,8,6,10,0,2,3,1,5,7,9,8,10,4,0,2,6,1,5,3,7,8,10,0,2,9,4,6,1,7,8,10,5,3,2];
for(let y=0;y<7;y++){const r=keep(figma.createAutoLayout('HORIZONTAL'));grid.appendChild(r);r.name='第'+(y+1)+'行';r.fills=[];r.resize(372,63);r.primaryAxisSizingMode='FIXED';r.counterAxisSizingMode='FIXED';r.itemSpacing=2.4;for(let x=0;x<6;x++){const type=types[y*6+x],card=await instance(r,'145:1551','卡片 / '+type,0,0);const icon=card.findOne(n=>n.type==='INSTANCE');icon.swapComponent(await figma.getNodeByIdAsync(foodIds[type]));}}
figma.viewport.scrollAndZoomIntoView([screen]);
return {createdNodeIds:ids,screenId:screen.id,pageId:p.id,backgroundId:bg.id,swapId:swap.id,trolleyId:trolley.id,basketIds:baskets,trayId:tray.id,gridId:grid.id,cardCount:42,foodCount:11,width:402,height:850};

},
async finishComponents(figma) {

const p=await figma.getNodeByIdAsync('3:2');await figma.setCurrentPageAsync(p);
await figma.loadFontAsync({family:'Noto Sans SC',style:'Bold'});
const changed=[],created=[],keep=n=>(created.push(n.id),n);
const set=await figma.getNodeByIdAsync('145:1616');
for(const c of set.children){
 const state=c.name.includes('状态=当前')?'当前':c.name.includes('状态=完成')?'完成':'等待';
 const count=(c.name.match(/数量=(\d+)/)||[])[1]||'0';
 for(const t of c.findAllWithCriteria({types:['TEXT']})){
  if(t.componentPropertyReferences?.characters==='状态文案#145:25'){
   await figma.loadFontAsync(t.fontName);t.componentPropertyReferences={};
   t.characters=state==='当前'?'当前 '+count+'/3':state;changed.push(t.id);
  }
 }
}
if(set.componentPropertyDefinitions['状态文案#145:25'])set.deleteComponentProperty('状态文案#145:25');changed.push(set.id);
const used=await figma.getNodeByIdAsync('145:1636');
for(const t of used.findAllWithCriteria({types:['TEXT']})){if(t.componentPropertyReferences?.characters==='剩余次数#145:44'){await figma.loadFontAsync(t.fontName);t.componentPropertyReferences={};t.characters='0';changed.push(t.id);}}
const wood=await figma.getNodeByIdAsync('145:1649');
wood.fills=[{...wood.fills[0],scaleMode:'CROP',imageTransform:[[.86,0,.07],[0,.65,.18]]}];changed.push(wood.id);
const area=await figma.getNodeByIdAsync('142:1516');
const old=area.children.find(n=>n.name==='1.0.3/点心介绍');
if(old)return {mutatedNodeIds:changed,existingIntroId:old.id};
const ink=await figma.variables.getVariableByIdAsync('VariableID:3:7'),cream=await figma.variables.getVariableByIdAsync('VariableID:3:9'),border=await figma.variables.getVariableByIdAsync('VariableID:3:25');
const paint=(v,c)=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:c},'color',v);
const cp=paint(cream,{r:1,g:.945,b:.83}),ip=paint(ink,{r:.38,g:.22,b:.13}),bp=paint(border,{r:.44,g:.27,b:.19});
function rect(parent,name,x,y,w,h,r,fill){const n=keep(figma.createRectangle());parent.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;n.cornerRadius=r;n.fills=fill?[fill]:[];return n;}
function text(parent,s,x,y,size=14){const n=keep(figma.createText());parent.appendChild(n);n.name=s;n.fontName={family:'Noto Sans SC',style:'Bold'};n.characters=s;n.fontSize=size;n.x=x;n.y=y;n.fills=[ip];return n;}
const c=keep(figma.createComponent());area.appendChild(c);c.name='1.0.3/点心介绍';c.resize(320,366);c.x=800;c.y=740;c.fills=[];c.clipsContent=false;c.description='首次开始与新点心出现前展示，可跳过。图案、名称、文案、进度均可编辑；已介绍点心不重复打扰。';
const shadow=rect(c,'木质外框',0,4,320,362,15,bp);
const sheet=rect(c,'奶油纸面',4,0,312,358,13,cp);sheet.strokes=[bp];sheet.strokeWeight=1.5;
text(c,'今日识点心',95,18,21);const progress=text(c,'新点心 · 1 / 3',113,51,11);
const icon=keep((await figma.getNodeByIdAsync('145:1530')).createInstance());c.appendChild(icon);icon.rescale(1.2);icon.x=112;icon.y=76;
const swap=c.addComponentProperty('点心图案','INSTANCE_SWAP','145:1530');icon.componentPropertyReferences={mainComponent:swap};
const name=text(c,'豉汁排骨',115,177,20);const np=c.addComponentProperty('点心名称','TEXT',name.characters);name.componentPropertyReferences={characters:np};
const desc=text(c,'豉香浓郁，蒸得鲜嫩入味。\n是广州茶楼里常见的经典蒸点。',32,216,14);const dp=c.addComponentProperty('介绍文案','TEXT',desc.characters);desc.componentPropertyReferences={characters:dp};
rect(c,'主要按钮底',32,275,256,40,8,bp);const primary=text(c,'下一款',138,284,15);primary.fills=[cp];
const skip=text(c,'跳过介绍',131,327,13);skip.textDecoration='UNDERLINE';
const pp=c.addComponentProperty('介绍进度','TEXT',progress.characters);progress.componentPropertyReferences={characters:pp};
return {mutatedNodeIds:changed,createdNodeIds:created,introComponentId:c.id,description:'组件状态文案及用尽次数已修正，点心介绍已建立'};

}
};
