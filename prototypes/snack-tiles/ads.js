// The prototype has no SDK, ad requests, or visible ad placements.
// A future provider must resolve rewarded() only after the SDK confirms completion.
(function(root){
 const placements=Object.freeze({undo:'reward.undo',shuffle:'reward.shuffle',remove:'reward.remove',settlement:'interstitial.settlement'});
 class AdGateway{
  constructor({enabled=false,provider=null}={}){this.enabled=enabled;this.provider=provider;this.busy=false;}
  async reward(tool,grant){if(!this.enabled||!this.provider||this.busy||!['undo','shuffle','remove'].includes(tool))return {status:'unavailable'};this.busy=true;try{const result=await this.provider.rewarded(placements[tool]);if(result?.completed===true){grant();return {status:'granted'};}return {status:'cancelled'};}catch{return {status:'failed'};}finally{this.busy=false;}}
  async settlement(){if(!this.enabled||!this.provider||this.busy)return false;this.busy=true;try{await this.provider.interstitial(placements.settlement);return true;}catch{return false;}finally{this.busy=false;}}
 }
 if(typeof module!=='undefined')module.exports={AdGateway,placements};else root.SnackAds={AdGateway,placements};
})(globalThis);
