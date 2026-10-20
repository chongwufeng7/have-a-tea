'use strict';
// Stable pile geometry. Visual order and cover rules share this one source.
function stackLayout(count,level,random){
 const depth=level<11?2:3,piles=Math.ceil(count/(depth===2?1.5:1.8));
 const heights=Array(piles).fill(1);for(let n=piles;n<count;n++){
  const options=heights.map((h,i)=>h<depth?i:-1).filter(i=>i>=0);heights[options[Math.floor(random()*options.length)]]++;
 }
 const cols=piles>28?7:6,rows=Math.ceil(piles/cols),w=cols===7?46:52,gap=cols===7?8:10;
 const left=(402-(cols*w+(cols-1)*gap+4*(depth-1)))/2,step=rows>1?(376-w-9*(depth-1))/(rows-1):0,slots=[];
 for(let z=0;z<depth;z++)for(let pile=0;pile<piles;pile++)if(heights[pile]>z){
  slots.push({id:slots.length,pile,z,x:left+(pile%cols)*(w+gap)+4*z,y:420+9*(depth-1)+Math.floor(pile/cols)*step-9*z,w,h:w+3});
 }
 return slots;
}
module.exports={pileLayout:stackLayout};
