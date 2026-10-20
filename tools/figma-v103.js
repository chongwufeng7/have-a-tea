// Figma MCP construction source. Runtime game is unchanged.
module.exports = async function build(figma) {

const page=figma.root.children[0];
await figma.setCurrentPageAsync(page);
const existing=page.findOne(n=>n.name==='V1.0.3 / 主页面 / 中性米白');
if(existing)return {existing:existing.id,notice:'Already built; inspect before changing'};
await figma.loadFontAsync({family:'Noto Sans SC',style:'Medium'});
await figma.loadFontAsync({family:'Noto Serif SC',style:'Bold'});
page.name='01 · 主页面与组件';
const ids=[],keep=n=>(ids.push(n.id),n);
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
async function createVariableCollection(name,modeNames){
 const collection=figma.variables.createVariableCollection(name);
 const defaultMode=collection.modes[0];collection.renameMode(defaultMode.modeId,modeNames[0]);
 return {collection,modeIds:{[modeNames[0]]:defaultMode.modeId}};
}
const {collection,modeIds}=await createVariableCollection('早茶 / 1.0.3',['中性米白']);
const colors={paper:'#F5F3EC',card:'#FFFEF8',wall:'#E9E7DF',wood:'#775B48',woodLight:'#A88B70',ink:'#483B31',muted:'#8D8175',bamboo:'#CDB38B',bambooLight:'#E6D5B8',metal:'#B3B0A6',accent:'#B88B45',red:'#9F5545',line:'#D4C9B8'};
const vars={};
for(const [name,value] of Object.entries(colors)){
 const v=figma.variables.createVariable('color/'+name,collection,'COLOR');
 v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];
 v.setValueForMode(modeIds['中性米白'],rgb(value));vars[name]=v;
}
const nums={gap:8,sectionGap:14,radius:7};
for(const [name,value] of Object.entries(nums)){const v=figma.variables.createVariable(name,collection,'FLOAT');v.scopes=name==='radius'?['CORNER_RADIUS']:['GAP'];v.setValueForMode(modeIds['中性米白'],value);vars[name]=v;}
const paint=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(colors[k])},'color',vars[k]);
const fill=(n,k)=>{n.fills=[paint(k)];return n;};
const line=(n,k,w=1)=>{n.strokes=[paint(k)];n.strokeWeight=w;return n;};
function rect(p,name,x,y,w,h,k,r=0){const n=keep(figma.createRectangle());p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;if(r)n.cornerRadius=r;if(k)fill(n,k);return n;}
function ellipse(p,name,x,y,w,h,k,stroke){const n=keep(figma.createEllipse());p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;fill(n,k);if(stroke)line(n,stroke);return n;}
function text(p,s,x,y,size=12,k='ink',serif=false){const n=keep(figma.createText());p.appendChild(n);n.name=s;n.fontName={family:serif?'Noto Serif SC':'Noto Sans SC',style:serif?'Bold':'Medium'};n.fontSize=size;n.characters=s;fill(n,k);n.x=x;n.y=y;return n;}
function frame(p,name,w,h,k){const n=keep(figma.createFrame());p.appendChild(n);n.name=name;n.resize(w,h);n.fills=k?[paint(k)]:[];n.clipsContent=false;return n;}
function stack(p,name,dir,w,h,gap=8){const n=keep(figma.createAutoLayout(dir));p.appendChild(n);n.name=name;n.resize(w,h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.itemSpacing=gap;n.fills=[];return n;}
const defs='<defs><linearGradient id="iv" x2=".2" y2="1"><stop stop-color="#fffdf4"/><stop offset="1" stop-color="#decbb4"/></linearGradient><linearGradient id="meat" x2=".3" y2="1"><stop stop-color="#b8663c"/><stop offset="1" stop-color="#7c3f29"/></linearGradient><linearGradient id="gold" x2=".3" y2="1"><stop stop-color="#f5ce65"/><stop offset="1" stop-color="#cb8c35"/></linearGradient></defs>';
const plate='<ellipse cx="40" cy="51" rx="33" ry="18" fill="#f8f7f0" stroke="#9b8d7c" stroke-width="1.4"/><ellipse cx="40" cy="49" rx="27" ry="13" fill="#eeece2" stroke="#c7bcac"/>';
const dumpling=(x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M-17 5Q-19-6-7-10Q-2-21 5-11Q21-5 17 6Q5 17-10 12Z" fill="url(#iv)" stroke="#a98066" stroke-width="1.2"/><path d="M-7-10Q-8 2-11 7M-2-14Q2 0-1 10M5-11Q10 0 8 10" fill="none" stroke="#c49d83" stroke-width="1.1"/><path d="M-11 7Q0 2 11 7" fill="none" stroke="#edbda5" stroke-width="3" opacity=".7"/></g>';
const bao='<path d="M14 51Q6 36 22 25L35 14Q40 8 45 16L59 25Q76 42 63 54Q39 65 14 51Z" fill="url(#iv)" stroke="#a68b71" stroke-width="1.5"/><path d="M35 17Q23 33 21 46M39 17L38 48M44 19Q55 34 58 46M29 24Q34 27 39 22Q46 29 50 25" fill="none" stroke="#c4af96" stroke-width="1.4"/>';
const rib=(x,y,a)=>'<g transform="translate('+x+' '+y+') rotate('+a+')"><rect x="-10" y="-7" width="20" height="15" rx="5" fill="#bd9271" stroke="#82624b" stroke-width="1.2"/><path d="M-5-4L4 4M-5 3L3-3" stroke="#e9c7a4" stroke-width="3" stroke-linecap="round"/></g>';
const chicken=(x,y,a)=>'<g transform="translate('+x+' '+y+') rotate('+a+')"><path d="M-7 12L0-2L-7-15M0-2L1-19M0-2L9-15M0-2L14-7" fill="none" stroke="#74442d" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M-7 12L0-2L-7-15M0-2L1-19M0-2L9-15M0-2L14-7" fill="none" stroke="#b56a3b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-5 8L0 0M0-7L1-14" stroke="#d89a59" stroke-width="1.3" stroke-linecap="round"/></g>';
const svgs=[
['虾饺',dumpling(40,38)],
['烧卖','<path d="M23 29L21 53Q39 66 57 53L59 29Z" fill="url(#gold)" stroke="#9c7136" stroke-width="1.4"/><path d="M26 32L29 56M36 33L37 59M46 33L45 59M54 32L51 56" stroke="#b78338" stroke-width="1.2"/><ellipse cx="41" cy="29" rx="19" ry="12" fill="#d7b480" stroke="#9c7136"/><path d="M27 28L33 23L39 27L46 21L54 27L48 33L40 31L34 35Z" fill="#e6d4a3"/><g fill="#c76f32"><circle cx="37" cy="24" r="4"/><circle cx="43" cy="27" r="4"/><circle cx="38" cy="31" r="3"/></g>'],
['皮蛋瘦肉粥','<path d="M9 35Q12 65 39 68Q65 65 71 35Z" fill="#f7f6ef" stroke="#8c897d" stroke-width="1.5"/><ellipse cx="40" cy="35" rx="31" ry="15" fill="#ebe3ca" stroke="#9c9483"/><ellipse cx="40" cy="34" rx="26" ry="11" fill="#f5efd8"/><g fill="#737248"><path d="M24 31l7-4 5 6-7 4Z"/><path d="M45 34l6-6 7 5-6 6Z"/></g><g stroke="#8a6549" stroke-width="2"><path d="M34 31l7 4M39 29l5-2"/></g><g fill="#6b8253"><ellipse cx="29" cy="34" rx="3" ry="1.5"/><ellipse cx="46" cy="31" rx="3" ry="1.5"/><ellipse cx="39" cy="38" rx="3" ry="1.5"/></g><path d="M19 51Q40 62 61 51" fill="none" stroke="#85939a" stroke-width="2"/>'],
['豉汁凤爪',plate+chicken(27,43,-25)+chicken(48,46,25)+'<path d="M22 53l4-2M55 47l5-2" stroke="#63814b" stroke-width="2"/>'],
['豉汁排骨',plate+rib(26,39,-15)+rib(48,39,15)+rib(37,52,5)+rib(57,49,-20)+'<g fill="#40382f"><ellipse cx="30" cy="38" rx="3" ry="2"/><ellipse cx="46" cy="44" rx="3" ry="2"/><ellipse cx="39" cy="52" rx="3" ry="2"/><ellipse cx="56" cy="36" rx="3" ry="2"/></g><path d="M22 44l5-3M51 52l5-2" stroke="#74834c" stroke-width="2"/>'],
['鲜虾肠粉',plate+'<g stroke="#bca98f" stroke-width="1.2" fill="url(#iv)"><path d="M13 41l37-15q7 1 9 9L21 52q-9-1-8-11Z"/><path d="M23 49l37-15q9 2 8 12L32 62q-9-1-9-13Z"/></g><path d="M21 42l30-12M32 50l27-11" stroke="#e0ac95" stroke-width="4" opacity=".7"/><path d="M22 56Q43 66 62 51" fill="none" stroke="#956447" stroke-width="2"/>'],
['叉烧包',bao],
['蛋挞','<path d="M16 36L21 57Q41 69 60 56L65 36" fill="#bd8b53" stroke="#906c44" stroke-width="1.4"/><ellipse cx="40" cy="35" rx="27" ry="19" fill="#dfb16a" stroke="#987344" stroke-width="1.5"/><ellipse cx="40" cy="34" rx="22" ry="14" fill="url(#gold)" stroke="#b48643"/><path d="M25 28Q34 21 46 24" fill="none" stroke="#fff0b9" stroke-width="3" stroke-linecap="round"/><path d="M22 43L25 57M31 48L32 61M43 49L43 62M54 45L53 60" stroke="#a77844"/>']
];
const foodIds=[];
const title=text(page,'1.0.3 早茶推车 · 可编辑组件',960,42,26,'ink',true);
const subtitle=text(page,'中性米白 / 木棕 / 单笼接收 / 全场自由取牌',960,84,13,'muted');
for(let i=0;i<svgs.length;i++){
 const [name,body]=svgs[i],comp=keep(figma.createComponent());page.appendChild(comp);comp.name='点心/'+name;comp.description='广州早茶点心，独立可编辑矢量。'+name;comp.resize(80,80);comp.x=960+(i%4)*112;comp.y=138+Math.floor(i/4)*122;comp.fills=[];
 const svg=keep(figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">'+defs+body+'</svg>'));comp.appendChild(svg);svg.name=name+' / 矢量插画';svg.x=0;svg.y=0;
 svg.findAll().forEach(n=>ids.push(n.id));foodIds.push(comp.id);
 text(page,name,comp.x,comp.y+83,12,'muted');
}
const cards=[];
for(const [i,state] of ['默认','选中','空位'].entries()){
 const c=keep(figma.createComponent());page.appendChild(c);c.name='状态='+state;c.description='点心卡片：通过图案实例替换点心。';c.resize(52,58);c.cornerRadius=7;fill(c,state==='空位'?'wall':'card');line(c,state==='选中'?'accent':'line',state==='选中'?2:1);c.x=960+i*80;c.y=430;
 c.effects=[{type:'DROP_SHADOW',color:{r:.25,g:.2,b:.15,a:.12},offset:{x:0,y:2},radius:2,spread:0,visible:true,blendMode:'NORMAL'}];
 if(state!=='空位'){const inst=keep((await figma.getNodeByIdAsync(foodIds[0])).createInstance());c.appendChild(inst);inst.name='点心图案';inst.rescale(46/80);inst.x=3;inst.y=5;const prop=c.addComponentProperty('点心','INSTANCE_SWAP',foodIds[0]);inst.componentPropertyReferences={mainComponent:prop};}
 cards.push(c);
}
const cardSet=keep(figma.combineAsVariants(cards,page));cardSet.name='点心卡片';cardSet.x=960;cardSet.y=430;cardSet.description='平铺点心卡片，默认、选中、空位状态；图案可替换。';cardSet.fills=[];
const baskets=[];
for(const [i,state] of ['当前','等待','完成'].entries()){
 const b=keep(figma.createComponent());page.appendChild(b);b.name='状态='+state;b.description='单笼接收状态；等待笼保持空白。';b.resize(110,145);b.fills=[];b.x=960+i*130;b.y=570;
 const status=rect(b,'状态底',26,0,58,20,state==='当前'?'wood':'paper',10);text(b,state,42,1,11,state==='当前'?'card':'muted');
 for(let j=2;j>=0;j--){rect(b,'蒸笼侧壁 '+j,6,45+j*17,98,31,'bamboo',7);line(b.children[b.children.length-1],'woodLight');ellipse(b,'笼沿 '+j,6,31+j*17,98,36,'bambooLight','woodLight');}
 ellipse(b,'开放笼内',10,32,90,35,'paper','woodLight');
 if(state==='当前'){const ring=ellipse(b,'当前笼描边',4,27,102,44,'bambooLight','accent');ring.fills=[];ring.strokeWeight=2;}
 rect(b,'标识吊牌',28,110,54,29,'card',4);line(b.children[b.children.length-1],'woodLight');
 text(b,state==='当前'?'虾饺':state==='等待'?'烧卖':'出餐',42,116,12,'ink',true);
 if(state==='当前'){for(let j=0;j<2;j++){const icon=keep((await figma.getNodeByIdAsync(foodIds[0])).createInstance());b.appendChild(icon);icon.rescale(35/80);icon.x=18+j*33;icon.y=28;}text(b,'2 / 3',42,84,11,'ink');}
 baskets.push(b);
}
const basketSet=keep(figma.combineAsVariants(baskets,page));basketSet.name='蒸笼';basketSet.description='仅当前蒸笼可接收点心，满三份出餐。';basketSet.x=960;basketSet.y=570;basketSet.fills=[];
const buttons=[];
for(const [i,state] of ['可用','用尽'].entries()){
 const b=keep(figma.createComponent());page.appendChild(b);b.name='状态='+state;b.resize(104,48);b.cornerRadius=10;fill(b,state==='可用'?'wood':'wall');line(b,'woodLight');text(b,'↻  洗牌',21,13,15,state==='可用'?'card':'muted');b.x=960+i*130;b.y=780;buttons.push(b);
}
const buttonSet=keep(figma.combineAsVariants(buttons,page));buttonSet.name='洗牌按钮';buttonSet.description='新版唯一道具。';buttonSet.x=960;buttonSet.y=780;buttonSet.fills=[];
const screen=frame(page,'V1.0.3 / 主页面 / 中性米白',402,844,'paper');screen.x=80;screen.y=80;screen.clipsContent=true;
const bg=frame(screen,'茶楼背景 / 分层可编辑',402,844,'paper');
rect(bg,'墙面',0,0,402,470,'wall');rect(bg,'室内浅色主墙',35,0,332,470,'paper');
for(const x of [21,370]){rect(bg,'木立柱',x,0,10,474,'woodLight');for(let j=0;j<5;j++){rect(bg,'窗格横',x===21?0:380,92+j*21,22,3,'woodLight');}}
rect(bg,'顶部横梁',0,16,402,9,'woodLight');
for(let y=500;y<844;y+=62){const n=rect(bg,'地面细缝',0,y,402,1,'line');n.opacity=.45;}
for(let x=-160;x<600;x+=90){const n=rect(bg,'地板纵线',x,475,1,400,'line');n.rotation=12;n.opacity=.32;}
const ui=stack(screen,'主界面 / 纵向布局','VERTICAL',370,767,12);ui.x=16;ui.y=49;ui.setBoundVariable('itemSpacing',vars.sectionGap);
const header=stack(ui,'顶部导航','HORIZONTAL',370,48,12);header.counterAxisAlignItems='CENTER';
const set=frame(header,'设置按钮',44,44,'wood');set.cornerRadius=8;text(set,'设置',9,12,12,'card');
const plaque=frame(header,'关卡牌匾',180,44,'card');plaque.cornerRadius=8;line(plaque,'wood',2);text(plaque,'第 6 关',50,7,23,'ink',true);
const capsule=frame(header,'系统胶囊预留',120,44);rect(capsule,'胶囊',12,8,88,29,'wood',15);text(capsule,'•••    ◉',25,10,14,'card');
const trolley=frame(ui,'早茶推车 / 三列蒸笼',370,184);
rect(trolley,'推车台面',4,146,362,9,'metal',4);line(trolley.children[trolley.children.length-1],'muted');
rect(trolley,'推车前梁',8,158,354,12,'wood',3);
for(const x of [5,357]){rect(trolley,'金属扶手',x,48,6,115,'metal',3);ellipse(trolley,'脚轮',x-2,169,15,15,'wood','muted');}
const basketrow=stack(trolley,'三列笼位','HORIZONTAL',342,145,6);basketrow.x=14;basketrow.y=0;
for(let i=0;i<3;i++){
 const inst=keep(baskets[i===0?0:1].createInstance());basketrow.appendChild(inst);inst.name=['当前 · 虾饺','等待 · 烧卖','等待 · 排骨'][i];
 const tag=inst.findOne(n=>n.type==='TEXT'&&n.characters==='烧卖');if(i===2&&tag)tag.characters='排骨';

}
const tray=frame(ui,'暂存区 / 七格',370,83,'wood');tray.cornerRadius=12;line(tray,'woodLight',2);text(tray,'暂存区',14,6,11,'card');text(tray,'2 / 7',323,6,11,'card');
const slots=stack(tray,'暂存槽位','HORIZONTAL',344,44,5);slots.x=13;slots.y=26;
for(let i=0;i<7;i++){const slot=frame(slots,'槽位 '+(i+1),44,44,'bambooLight');slot.cornerRadius=6;line(slot,'woodLight');if(i<2){const icon=keep((await figma.getNodeByIdAsync(foodIds[[2,3][i]])).createInstance());slot.appendChild(icon);icon.rescale(42/80);icon.x=1;icon.y=1;}}
const board=stack(ui,'点心牌区 / 五行','VERTICAL',370,330,8);
const deal=[0,1,2,6,7,4,2,3,4,0,1,7,6,5,2,-1,3,4,1,0,4,7,5,-1,3,2,6,1,0,4];
for(let row=0;row<5;row++){
 const r=stack(board,'第 '+(row+1)+' 行','HORIZONTAL',370,58,10);
 for(let col=0;col<6;col++){const type=deal[row*6+col],card=keep(cards[type<0?2:0].createInstance());r.appendChild(card);card.name=type<0?'空位':svgs[type][0];if(type>=0){const instance=card.findOne(n=>n.type==='INSTANCE');instance.swapComponent(await figma.getNodeByIdAsync(foodIds[type]));}}
}
const foot=stack(ui,'底部道具栏','HORIZONTAL',370,66,24);foot.primaryAxisAlignItems='CENTER';foot.counterAxisAlignItems='CENTER';
const shuffle=keep(buttons[0].createInstance());foot.appendChild(shuffle);
const remain=text(foot,'本轮剩余 1 次',0,0,11,'muted');
text(screen,'仅当前蒸笼接收 · 满三份出餐',201,826,11,'muted').x=114;
const note=frame(page,'设计说明 / 已确认与待验',402,190,'card');note.x=516;note.y=80;note.cornerRadius=10;line(note,'line');
text(note,'新版主页面 · 设计说明',20,18,19,'ink',true);
text(note,'沿用原稿插画与木质组件语言，减少全屏泛黄。',20,58,12);
text(note,'三列笼位仅当前接收，左中右轮转。',20,84,12);
text(note,'自由取牌；暂存自动补入；道具仅保留洗牌。',20,110,12);
text(note,'此页为设计稿，数量与运行效果仍需验证。',20,143,12,'muted');
figma.viewport.scrollAndZoomIntoView([screen]);
return {createdNodeIds:ids,mutatedNodeIds:[page.id],screenId:screen.id,pageId:page.id,foodComponentIds:foodIds,componentSets:[cardSet.id,basketSet.id,buttonSet.id],collectionId:collection.id,variables:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,v.id])),screenBounds:{width:screen.width,height:screen.height},foodCount:foodIds.length,cardCount:30};

};
