const RELEASE='__TERRALAB_RELEASE__';
const CACHE='terralab-shell-'+RELEASE;
const refreshingClients=new Set();
async function storage(){try{return await caches.open(CACHE);}catch{return null;}}
async function read(cache,key){try{return await cache?.match(key);}catch{return undefined;}}
async function remember(cache,key,response){try{await cache?.put(key,response);}catch{}}
self.addEventListener('install',event=>{event.waitUntil(storage().then(async cache=>{try{await cache?.addAll([new Request('/',{cache:'reload'}),'/favicon.svg','/land-110m.json']);}catch{}await self.skipWaiting();}));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().catch(()=>[]).then(keys=>Promise.all(keys.filter(k=>k.startsWith('terralab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function refreshStaleClient(event){if(!event.clientId||RELEASE.startsWith('__')||refreshingClients.has(event.clientId))return;refreshingClients.add(event.clientId);const client=await self.clients.get(event.clientId);if(!client)return;client.postMessage({type:'TERRALAB_ASSET_UPDATE',release:RELEASE});}
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;
 if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/signin')||u.pathname.startsWith('/signout')||u.pathname.startsWith('/callback')||u.pathname==='/release.json')return;
 if(r.mode==='navigate'){event.respondWith(fetch(r,{cache:'no-store'}).then(async response=>{if(response.ok&&response.headers.get('content-type')?.includes('text/html')){const cache=await storage();await remember(cache,'/',response.clone());}return response;}).catch(async()=>{const cache=await storage();return await read(cache,'/')||Response.error();}));return;}
 if(/\.(js|css|woff2?|ttf|json|svg|png|webp|jpg|gltf|bin|hdr)$/.test(u.pathname)){
 const work=(async()=>{const cache=await storage(),cached=await read(cache,r);if(cached)return cached;const response=await fetch(r);const module=/\.js$/.test(u.pathname)&&u.pathname.startsWith('/_next/static/');const html=response.headers.get('content-type')?.includes('text/html');if(module&&(response.status===404||html)){await refreshStaleClient(event);return response;}if(response.ok&&!html)await remember(cache,r,response.clone());return response;})();event.respondWith(work);event.waitUntil(work.then(()=>{},()=>{}));}
});
