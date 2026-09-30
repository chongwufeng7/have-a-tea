const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const errors=[];let checked=0;
const allowed=new Set(['AGENTS.md','项目入口.md','package.json','package-lock.json','.gitignore','.git','.cache','文档','doc','prototypes','tests','tools','artifacts','minigame','assets','node_modules']);
// ITER-035: user-confirmed project helpers and Codex-generated source artwork.
allowed.add('Implement-from-Figma-main');
allowed.add('UI');
for(const f of fs.readdirSync(root))if(!allowed.has(f))errors.push(`未登记的根目录项: ${f}`);
const required=['AGENTS.md','项目入口.md','文档/00-目录导航.md','文档/01-开发与迭代指南/01-从零开发指南.md','文档/01-开发与迭代指南/02-项目迭代指南.md','文档/02-当前项目/00-项目状态.md','文档/03-迭代记录/ITER-001.md'];
for(const f of required)if(!fs.existsSync(path.join(root,f)))errors.push(`缺少: ${f}`);
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(p.endsWith('.md'))check(p);}}
function check(p){checked++;const content=fs.readFileSync(p,'utf8');for(const m of content.matchAll(/\]\(([^)]+)\)/g)){const target=m[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;const dest=path.resolve(path.dirname(p),decodeURIComponent(target));if(!fs.existsSync(dest))errors.push(`${path.relative(root,p)}: 失效链接 ${target}`);}}
check(path.join(root,'AGENTS.md'));check(path.join(root,'项目入口.md'));walk(path.join(root,'文档'));walk(path.join(root,'doc'));walk(path.join(root,'prototypes'));
console.log(`Checked ${checked} Markdown files; ${errors.length} errors.`);errors.forEach(e=>console.error(e));process.exitCode=errors.length?1:0;
