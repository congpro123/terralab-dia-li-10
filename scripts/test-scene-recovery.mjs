import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createSceneGuard,isModuleFailure} from '../lib/scene-lifecycle.ts';
import {diagramSurface} from '../lib/ocean-diagram.ts';

function scheduler(){let next=0;const tasks=new Map();return {setTimeout(fn){tasks.set(++next,fn);return next;},clearTimeout(id){tasks.delete(id);},fire(){for(const fn of [...tasks.values()])fn();},get size(){return tasks.size;}};}
for(const kind of ['initialisation','context','render','timeout']){
 const clock=scheduler(),errors=[],guard=createSceneGuard(e=>errors.push(e),100,clock);
 if(kind==='initialisation')guard.fail(new Error('WebGL unavailable'));
 if(kind==='context'){const canvas=new EventTarget();guard.observe(canvas);guard.ready();const lost=new Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(lost);assert.ok(lost.defaultPrevented);canvas.dispatchEvent(new Event('webglcontextlost'));}
 if(kind==='render')guard.frame(()=>{throw new Error('Shader failed');})();
 if(kind==='timeout')clock.fire();
 guard.fail(new Error('duplicate'));clock.fire();assert.equal(errors.length,1,kind+' must report exactly once');assert.equal(clock.size,0);
}
{
 const clock=scheduler(),guard=createSceneGuard(()=>assert.fail('Disposed scenes cannot fail'),100,clock);let frames=0;
 assert.equal(guard.ready(),true);assert.equal(guard.ready(),false);assert.equal(clock.size,0);guard.close();guard.frame(()=>frames++)();clock.fire();assert.equal(frames,0);
}
assert.ok(isModuleFailure(new Error('Failed to fetch dynamically imported module: /old-chunk.js')));
assert.ok(isModuleFailure(new Error('Importing a module script failed.')));
assert.equal(isModuleFailure(new Error('WebGL context lost')),false);
for(const mode of ['wave','tide'])for(const wind of [0,50,100])for(const level of [-2,0,2])assert.ok(diagramSurface(mode,level,wind,0).points.flat().every(Number.isFinite));
assert.ok(diagramSurface('wave',0,100,0).amplitude>diagramSurface('wave',0,0,0).amplitude);
assert.notEqual(diagramSurface('wave',0,50,0).buoy,diagramSurface('wave',0,50,1).buoy);
assert.ok(diagramSurface('tide',2,0,0).mean<diagramSurface('tide',-2,0,0).mean,'Higher tides rise on screen');

const release='abc123abc123',origin='https://terralab.example',handlers={},cachesByName=new Map(),navigations=[];
let clientId='old-tab',clientUrl=origin+'/#/lesson/6/3',network=()=>new Response('fresh module',{headers:{'Content-Type':'application/javascript'}}),quotaFailure=false;
const key=r=>typeof r==='string'?r:r.url;
const caches={async open(name){if(quotaFailure)throw Error('Storage unavailable');if(!cachesByName.has(name))cachesByName.set(name,new Map());const map=cachesByName.get(name);return {async match(r){return map.get(key(r))?.clone();},async put(r,response){if(quotaFailure)throw Error('Quota exceeded');map.set(key(r),response);},async addAll(){}};},async keys(){return [...cachesByName.keys()];},async delete(name){return cachesByName.delete(name);}};
const self={location:{origin},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{},get:async()=>({url:clientUrl,async navigate(url){navigations.push(url);clientUrl=url;}})}};
const source=(await readFile(new URL('../public/sw.js',import.meta.url),'utf8')).replaceAll('__TERRALAB_RELEASE__',release);
vm.runInNewContext(source,{self,caches,URL,Request,Response,fetch:async(...args)=>network(...args)});
async function dispatch(path,mode='cors'){let result;const pending=[];handlers.fetch({request:{url:origin+path,method:'GET',mode},clientId,respondWith:p=>result=p,waitUntil:p=>pending.push(p)});const response=await result;await Promise.all(pending);return response;}
network=()=>new Response('missing',{status:404});
await Promise.all([dispatch('/_next/static/chunks/old-geology.js'),dispatch('/_next/static/chunks/old-sky.js')]);assert.equal(navigations.length,1);assert.equal(new URL(navigations[0]).hash,'#/lesson/6/3');assert.equal(new URL(navigations[0]).searchParams.get('v'),release);
await dispatch('/_next/static/chunks/another-missing.js');assert.equal(navigations.length,1,'Never reload-loop on a genuinely missing asset');
clientId='second-tab';clientUrl=origin+'/#/lesson/7/3';network=()=>new Response('<html>fallback</html>',{headers:{'Content-Type':'text/html'}});
await dispatch('/_next/static/chunks/broken.js');assert.equal(navigations.length,2,'An HTML response is not a valid module');
assert.equal(await dispatch('/api/progress'),undefined,'Private API data must not enter the worker cache');
assert.equal(await dispatch('/release.json'),undefined,'Release checks must always reach the server');
const old=await caches.open('terralab-shell-old');await old.put({url:origin+'/cached.js'},new Response('old'));
network=()=>new Response('current',{headers:{'Content-Type':'application/javascript'}});
assert.equal(await (await dispatch('/cached.js')).text(),'current','Never take module code from another release cache');
network=()=>{throw Error('Offline');};assert.equal(await (await dispatch('/cached.js')).text(),'current','Previously loaded modules remain available offline');
quotaFailure=true;network=()=>new Response('network still works',{headers:{'Content-Type':'application/javascript'}});
assert.equal(await (await dispatch('/no-storage.js')).text(),'network still works','Cache failure must not break a successful asset request');
quotaFailure=false;network=()=>new Response('new shell',{headers:{'Content-Type':'text/html'}});await dispatch('/','navigate');
network=()=>{throw Error('Offline');};assert.equal(await (await dispatch('/','navigate')).text(),'new shell');
console.log('PASS scene initialisation/context/render/timeout recovery; interactive ocean fallback; stale-chunk refresh without loops; release isolation, offline and unavailable-cache paths.');
