const CACHE='terralab-shell-v10';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([new Request('/',{cache:'reload'}),'/favicon.svg','/land-110m.json'])));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('terralab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;
 // Never cache authentication, private progress, attempts or administrative data.
 if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/signin')||u.pathname.startsWith('/signout')||u.pathname.startsWith('/callback'))return;
 if(r.mode==='navigate'){event.respondWith(fetch(r,{cache:'no-store'}).then(response=>{if(response.ok&&response.headers.get('content-type')?.includes('text/html')){const copy=response.clone();caches.open(CACHE).then(c=>c.put('/',copy));}return response;}).catch(()=>caches.match('/').then(r=>r||Response.error())));return;}
 if(/\.(js|css|woff2|json|svg|png|webp|jpg|gltf|bin|hdr)$/.test(u.pathname))event.respondWith(caches.match(r).then(cached=>cached||fetch(r).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(r,copy));}return response;})));
});
