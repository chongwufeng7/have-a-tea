'use strict';
// Dependency-free syntax check for the files executed by this project.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folders=['minigame','tests','tools'];
const files=[];
function collect(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())collect(file);
  else if(/\.(?:c?js)$/.test(entry.name))files.push(file);
 }
}
for(const folder of folders)collect(path.join(root,folder));
let errors=0;
for(const file of files){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 if(result.status!==0){errors++;process.stderr.write(result.stderr||`${file}: syntax check failed\n`);}
}
console.log(`Checked ${files.length} JavaScript files with ${process.version}; ${errors} syntax errors.`);
if(errors)process.exitCode=1;
