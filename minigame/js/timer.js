'use strict';
const VERSION=2;
// Version 1 remains valid for an already-started level; new levels use version 2.
function duration(level){return (level<=5?90:level<=10?120:level<=20?150:180)*1000;}
function legacyDuration(level){return (level<=5?120:level<=10?150:level<=20?180:240)*1000;}
function createTimer(level){return {version:VERSION,durationMs:duration(level),remainingMs:duration(level),started:false};}
function validateTimer(t,level){return !!t&&[1,VERSION].includes(t.version)&&t.durationMs===(t.version===1?legacyDuration(level):duration(level))&&Number.isFinite(t.remainingMs)&&t.remainingMs>=0&&t.remainingMs<=t.durationMs&&typeof t.started==='boolean'&&(t.started||t.remainingMs===t.durationMs);}
function format(ms){const seconds=Math.ceil(Math.max(0,ms)/1000);return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
module.exports={duration,createTimer,validateTimer,format};
