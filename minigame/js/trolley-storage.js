'use strict';
const {clone}=require('./daily');
// Separate schema: legacy layered boards remain untouched in daily.v2.
class Storage {
 constructor(platform){this.p=platform;this.key=platform.key.replace('progress.v1','trolley.v3');this.pending=platform.key.replace('progress.v1','trolley.pending.v3');}
 read(){if(this.p.channel==='unknown')throw Error('Unknown environment');const a=this.p.api;if(a.getStorageSync(this.pending)===true)throw Error('Interrupted commit');const d=a.getStorageSync(this.key);return d===undefined||d===null||d===''?null:typeof d==='string'?JSON.parse(d):clone(d);}
 begin(){try{if(this.p.channel==='unknown')throw Error('Unknown environment');this.p.api.setStorageSync(this.pending,true);return true;}catch(_){return false;}}
 save(data){try{if(this.p.channel==='unknown')throw Error('Unknown environment');this.p.api.setStorageSync(this.key,clone(data));this.p.api.setStorageSync(this.pending,false);return true;}catch(_){return false;}}
}
module.exports={Storage};
