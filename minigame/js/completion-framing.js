'use strict';
// Figma 199:2203, user-adjusted 2026-10-19. Coordinates relative to the basket frame.
// Source and variant IDs: assets/v1.0.3/figma-full-basket-position.json.
const FULL_BASKET_ITEMS=[[{"x":27,"y":36,"size":29.6},{"x":66,"y":36,"size":29.6},{"x":47,"y":51,"size":29.6}],[{"x":27,"y":33,"size":29.6},{"x":66,"y":33,"size":29.6},{"x":47,"y":48,"size":29.6}],[{"x":28,"y":18,"size":64}],[{"x":28,"y":18,"size":64}],[{"x":28,"y":21,"size":64}],[{"x":28,"y":21,"size":64}],[{"x":27,"y":34,"size":29.6},{"x":66,"y":34,"size":29.6},{"x":47,"y":49,"size":29.6}],[{"x":26,"y":33,"size":29.6},{"x":65,"y":33,"size":29.6},{"x":46,"y":49,"size":29.6}],[{"x":28,"y":19,"size":64}],[{"x":28,"y":21,"size":64}],[{"x":28,"y":22,"size":64}],[{"x":28,"y":19,"size":64}],[{"x":27,"y":32,"size":29.6},{"x":66,"y":32,"size":29.6},{"x":47,"y":47,"size":29.6}],[{"x":28,"y":23,"size":64}],[{"x":28,"y":22,"size":64}],[{"x":28,"y":23,"size":64}],[{"x":28,"y":21,"size":64}],[{"x":28,"y":20,"size":64}],[{"x":28,"y":22,"size":64}],[{"x":28,"y":22,"size":64}],[{"x":27,"y":16.7,"size":64}]];
// Larger pieces preserve their Figma centers. Single-piece and plated servings stay distinct.
function enlarge(p,size){return {x:p.x-(size-p.size)/2,y:Math.min(size===80?12:Infinity,p.y-(size-p.size)/2),size};}
const BASKET_ITEMS=[{x:27,y:36,size:29.6},{x:66,y:36,size:29.6},{x:47,y:51,size:29.6}].map(p=>enlarge(p,42));
const LARGE_FULL_BASKET_ITEMS=FULL_BASKET_ITEMS.map(items=>items.map(p=>enlarge(p,items.length===3?42:80)));
// Keep only one third of the title-to-clock and clock-to-order gaps.
const TWO_LAYOUT={timerY:35,basketY:223/3,chassisY:388/3,trayY:757/3};
function basketOrigin(game,column){return game.config.orders===2?{x:73+142*column,y:TWO_LAYOUT.basketY}:{x:38+104*column,y:110};}
function trayOrigin(game){return game.config.orders===2?TWO_LAYOUT.trayY:293;}
module.exports={BASKET_ITEMS,FULL_BASKET_ITEMS:LARGE_FULL_BASKET_ITEMS,basketOrigin,trayOrigin,TWO_LAYOUT};
