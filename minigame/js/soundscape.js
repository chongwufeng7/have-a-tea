'use strict';
const config=require('./config');
const SOURCES={tap:'v2-bamboo.wav',land:'v2-porcelain.wav',serve:'v2-stamp.wav',undo:'v2-return.wav',shuffle:'v2-rustle.wav',voice:'v2-aunt-cantonese.mp3'};
class Soundscape{
 constructor(platform){this.api=platform.api;this.channel=platform.channel;this.key=platform.key.replace('progress.v1','sound.v1');this.enabled=true;this.hidden=false;this.pool={};this.voiceAvailable=config.voicePreview;try{if(this.channel!=='unknown')this.enabled=this.api.getStorageSync(this.key)!==false;}catch(_){} }
 play(kind){if(!this.enabled||this.hidden||!SOURCES[kind]||kind==='voice'&&!this.voiceAvailable||!this.api.createInnerAudioContext)return;
  try{const pool=this.pool[kind]||(this.pool[kind]={players:[],cursor:0});let player=pool.players[pool.cursor];if(!player){player=this.api.createInnerAudioContext();player.src='assets/audio/'+SOURCES[kind];player.loop=false;player.volume=kind==='tap'?.28:kind==='voice'?.85:.5;player.onError?.(()=>{if(kind==='voice')this.onVoiceEnd?.();});if(kind==='voice')player.onEnded?.(()=>this.onVoiceEnd?.());pool.players[pool.cursor]=player;}pool.cursor=(pool.cursor+1)%(kind==='voice'?1:3);player.stop();if(kind==='voice')this.onVoiceStart?.();player.play();}catch(_){if(kind==='voice')this.onVoiceEnd?.();} }
 toggle(){this.enabled=!this.enabled;if(!this.enabled)this.hidePlayers();try{if(this.channel!=='unknown')this.api.setStorageSync(this.key,this.enabled);}catch(_){}return this.enabled;}
 hidePlayers(){for(const pool of Object.values(this.pool))for(const player of pool.players)try{player.stop();}catch(_){}this.onVoiceEnd?.(); }
 hide(){this.hidden=true;this.hidePlayers();}
 show(){this.hidden=false;}
}
module.exports={Soundscape};
