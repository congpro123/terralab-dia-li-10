import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/client/',import.meta.url));
async function walk(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]))).flat();}
let references=0;
for(const path of (await walk(root)).filter(p=>p.endsWith('.js'))){
 const source=await readFile(path,'utf8');
 for(const match of source.matchAll(/(?:from\s*|import\s*\(\s*)["'](\.{1,2}\/[^"']+\.js)["']/g)){
  const target=resolve(dirname(path),match[1]);assert.ok(target.startsWith(root),'Modules stay inside the client output');assert.ok((await stat(target)).isFile(),match[1]+' is missing');references++;
 }
}
assert.ok(references>10,'The client dependency graph was inspected');
const {release}=JSON.parse(await readFile(resolve(root,'release.json'),'utf8'));
assert.match(release,/^[a-f0-9]{12}$/);const worker=await readFile(resolve(root,'sw.js'),'utf8');assert.ok(worker.includes("const RELEASE='"+release+"'"));assert.ok(!worker.includes('__TERRALAB_RELEASE__'));
console.log('PASS '+references+' client module references exist; service worker and release manifest match '+release+'.');
