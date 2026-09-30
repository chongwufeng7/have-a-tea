'use strict';
const { normalizeLevel, LEVELS } = require('./core');

class Platform {
  constructor(api) {
    this.api = api;
    let version, query = {};
    try { version = api.getAccountInfoSync().miniProgram.envVersion; } catch (_) {}
    try { query = api.getLaunchOptionsSync().query || {}; } catch (_) {}
    // Only an explicit release build may access production keys.
    this.channel = version === 'release' ? 'production' :
      ['develop', 'trial'].includes(version) ? 'test' : 'unknown';
    this.testMode = this.channel === 'test' && query.mode !== 'production';
    this.key = 'dimsum.' + this.channel + (query.mode === 'production' && this.channel === 'test' ? '.preview' : '') + '.progress.v1';
    this.query = query;
    this.saveError = false;
  }
  read() {
    if (this.channel === 'unknown') return { level: 1, completed: [] };
    try {
      let d = this.api.getStorageSync(this.key);
      if (typeof d === 'string') d = JSON.parse(d);
      if (!d || typeof d !== 'object' || Array.isArray(d)) return { level: 1, completed: [] };
      return { level: normalizeLevel(d.level), completed: [...new Set((Array.isArray(d.completed) ? d.completed : []).filter(n => Number.isInteger(n) && n > 0 && n <= LEVELS.length))] };
    } catch (_) { return { level: 1, completed: [] }; }
  }
  readDaily() {
    if (this.channel === 'unknown') throw Error('Unknown platform environment');
    if(this.api.getStorageSync(this.key.replace('progress.v1','daily.pending.v2'))===true)throw Error('Interrupted storage transaction');
    const value=this.api.getStorageSync(this.key.replace('progress.v1','daily.v2'));
    if(value===undefined||value===null||value==='')return null;
    return typeof value==='string'?JSON.parse(value):JSON.parse(JSON.stringify(value));
  }
  saveDaily(data) {
    if (this.channel === 'unknown') { this.saveError = true; return false; }
    try {this.api.setStorageSync(this.key.replace('progress.v1','daily.v2'),JSON.parse(JSON.stringify(data)));this.api.setStorageSync(this.key.replace('progress.v1','daily.pending.v2'),false);this.saveError=false;return true;}
    catch(_){this.saveError=true;return false;}
  }
  beginMutation(){if(this.channel==='unknown'){this.saveError=true;return false;}try{this.api.setStorageSync(this.key.replace('progress.v1','daily.pending.v2'),true);return true;}catch(_){this.saveError=true;return false;}}
  save(data) {
    if (this.channel === 'unknown') { this.saveError = true; return false; }
    try { this.api.setStorageSync(this.key, data); this.saveError = false; return true; }
    catch (_) { this.saveError = true; return false; }
  }
  window() {
    let info;
    try { info = this.api.getWindowInfo(); } catch (_) { info = this.api.getSystemInfoSync(); }
    let menu;
    try { menu = this.api.getMenuButtonBoundingClientRect(); } catch (_) {}
    return { width: info.windowWidth, height: info.windowHeight, dpr: Math.min(info.pixelRatio || 1, 3), safeArea: info.safeArea, menu };
  }
}
module.exports = { Platform };
