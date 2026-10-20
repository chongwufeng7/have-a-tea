'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Platform}=require('../minigame/js/platform');
test('TEST-049-SHARE menu enables friend and timeline entries without forcing a share',()=>{
 const calls=[],p=new Platform({showShareMenu:o=>calls.push(o)});p.enableSharing();assert.equal(calls.length,1);assert.deepEqual(calls[0].menus,['shareAppMessage','shareTimeline']);assert.equal(typeof calls[0].fail,'function');assert.doesNotThrow(()=>calls[0].fail({errMsg:'unsupported'}));
});
test('TEST-049-SHARE unsupported clients do not prevent startup',()=>{
 assert.doesNotThrow(()=>new Platform({}).enableSharing());assert.doesNotThrow(()=>new Platform({showShareMenu(){throw Error('unsupported');}}).enableSharing());
});
