'use strict';
// Reuse 1.0.2's half-cell interlocking shapes, with the current food/card budgets.
const {layerPositions}=require('./core');
const {LEVELS}=require('./trolley-legacy');
function overlaps(a,b){return a.x<b.x+b.w-.01&&a.x+a.w>b.x+.01&&a.y<b.y+b.w-1-.01&&a.y+a.w-1>b.y+.01;}
function covers(upper,lower){return upper.z>lower.z&&overlaps(upper,lower);}
function stackLayout(count,level){
 const positions=[];let groups=count/3;
 for(let packet=0;groups>0;packet++){
  const m=Math.min(groups,LEVELS[level-1].types,12);groups-=m;
  for(let k=0;k<3;k++){const z=packet*3+k;for(const p of layerPositions(m,z,level<=10))positions.push({...p,z});}
 }
 const minX=Math.min(...positions.map(p=>p.x)),minY=Math.min(...positions.map(p=>p.y));
 const spanX=Math.max(...positions.map(p=>p.x))+.94-minX,spanY=Math.max(...positions.map(p=>p.y))+.94-minY;
 const unit=Math.min(66,368/spanX,372/spanY),left=(402-spanX*unit)/2,top=420+(372-spanY*unit)/2;
 return positions.map((p,id)=>({id,z:p.z,x:left+(p.x-minX)*unit,y:top+(p.y-minY)*unit,w:.94*unit,h:.94*unit+3}));
}
module.exports={stackLayout,covers};
