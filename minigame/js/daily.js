'use strict';
// Existing numerical configuration remains provisional; keep this identifier stable
// while restoring it. Future configuration changes must retain old versions or migrate.
const CONFIG_VERSION='daily-test-v1';
const clone=v=>JSON.parse(JSON.stringify(v));
function beijingDate(now=Date.now()){return new Date(now+8*3600000).toISOString().slice(0,10);}
function seedFor(date,level,version=CONFIG_VERSION){let h=2166136261;for(const ch of date+'|'+version+'|'+level)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function empty(legacy={}){return {schema:2,sequence:0,completed:Array.isArray(legacy.completed)?legacy.completed:[],history:[],run:null,adLedger:{days:{},receipts:{}}};}
// Pure future reward transaction. Never invoked by the launch controller.
// Receipt date must be decided by the authoritative service at successful commit.
function applyReward(state,game,receipt){
 const {id,date,runId,kind,level}=receipt||{},ledger=state.adLedger;
 if(!id||!validDate(date)||!['undo','shuffle','remove','revive'].includes(kind)||!ledger||!state.run||state.run.status!=='active'||state.run.id!==runId||game.config.level!==level)return false;
 if(Object.prototype.hasOwnProperty.call(ledger.receipts,id)||(ledger.days[date]||0)>=3)return false;
 if(kind==='revive'){if(!game.revive())return false;}else{if(game.tools[kind]!==0||game.status==='won')return false;game.tools[kind]=1;}
 ledger.days[date]=(ledger.days[date]||0)+1;ledger.receipts[id]={date,kind,runId};return true;
}
module.exports={CONFIG_VERSION,clone,beijingDate,seedFor,validDate,empty,applyReward};
