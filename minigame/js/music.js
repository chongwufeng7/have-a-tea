'use strict';
// User-selected local music; keep test and production listening preferences separate.
class Music {
  constructor(platform, source = '') {
    this.platform = platform; this.source = source; this.audio = null; this.foreground = true; this.unlocked = false; this.error = false;
    this.key = platform.key.replace('progress.v1', 'settings.v1');
    this.enabled = true;
    if (platform.channel === 'unknown') return;
    try { const d = platform.api.getStorageSync(this.key); if (d && typeof d.music === 'boolean') this.enabled = d.music; } catch (_) {}
  }
  toggle() { if (this.platform.channel === 'unknown') return; this.enabled = !this.enabled; try { this.platform.api.setStorageSync(this.key, { music: this.enabled }); } catch (_) {} this.sync(); }
  interact() { if (!this.unlocked) { this.unlocked = true; this.sync(); } }
  hide() { this.foreground = false; this.sync(); }
  show() { this.foreground = true; this.sync(); }
  sync() {
    if (!this.source) return;
    if (!this.enabled || !this.foreground || !this.unlocked) { if (this.audio) this.audio.pause(); return; }
    if (!this.audio) {
      try { this.audio = this.platform.api.createInnerAudioContext(); this.audio.loop = true; this.audio.volume = .45; this.audio.src = this.source; this.audio.onError(() => { this.error = true; }); }
      catch (_) { this.error = true; return; }
    }
    this.audio.play();
  }
}
module.exports = { Music };
