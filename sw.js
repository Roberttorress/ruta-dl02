const V='dl02-0b063438',CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='dl02-tiles').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
 if(u.hostname==='tile.openstreetmap.org'){e.respondWith(caches.open('dl02-tiles').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok)c.put(e.request,n.clone());return n}))));return}
 if(u.origin===location.origin){if(e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){e.respondWith(fetch(e.request).then(n=>{caches.open(V).then(c=>c.put('./index.html',n.clone()));return n}).catch(()=>caches.match('./index.html')))}
 else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});