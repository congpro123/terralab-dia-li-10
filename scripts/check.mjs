import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const target of ['node_modules/typescript/bin/tsc','scripts/test-models.mjs','scripts/test-learning.mjs','scripts/test-scenes.mjs']){
  const args=[fileURLToPath(new URL('../'+target,import.meta.url)),...(target.endsWith('/tsc')?['--noEmit']:[])];
  const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
  if(result.error){console.error(result.error.message);process.exit(1);}
  if(result.status!==0)process.exit(result.status??1);
}
