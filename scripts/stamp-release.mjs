import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=new URL('../dist/client/',import.meta.url);
async function walk(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]))).flat();}
const files=(await walk(fileURLToPath(root))).filter(p=>/\.(?:js|css)$/.test(p)&&basename(p)!=='sw.js').sort();
if(!files.length)throw Error('No client assets to stamp');
const hash=createHash('sha256');for(const path of files){hash.update(path.split(/[\\/]/).at(-1));hash.update(await readFile(path));}const release=hash.digest('hex').slice(0,12);
const worker=await readFile(new URL('../public/sw.js',import.meta.url),'utf8');await writeFile(new URL('sw.js',root),worker.replaceAll('__TERRALAB_RELEASE__',release));await writeFile(new URL('release.json',root),JSON.stringify({release})+'\n');console.log('Stamped TerraLab release '+release);
