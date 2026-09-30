'use strict';
// Launch is fail-closed: no SDK request or client callback may issue rewards.
// Future service must verify receipts and commit game + shared daily quota atomically.
const placements=Object.freeze({undo:'reward.undo',shuffle:'reward.shuffle',remove:'reward.remove',revive:'reward.revive'});
class AdGateway {
 constructor(){this.enabled=false;this.busy=false;}
 async reward(){return {status:'unavailable'};}
 async revive(){return {status:'unavailable'};}
 async quota(){return {status:'unavailable',limit:3};}
 async settlement(){return false;}
}
module.exports={AdGateway,placements};
