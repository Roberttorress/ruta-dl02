const V='dl02-6cddde65',CORE=['./','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./data.js?v=6cddde65','./app.js?v=6cddde65'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='dl02-tiles').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const timeout=(p,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej('t'),ms);p.then(r=>{clearTimeout(t);res(r)},e=>{clearTimeout(t);rej(e)})});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
 if(u.hostname==='tile.openstreetmap.org'){e.respondWith(caches.open('dl02-tiles').then(c=>c.match(r).then(h=>h||fetch(r).then(n=>{if(n.ok)c.put(r,n.clone());return n}))));return}
 if(u.origin!==location.origin)return;
 if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
  const net=fetch(r).then(n=>{if(n.ok)caches.open(V).then(c=>c.put('./',n.clone()));return n});
  e.respondWith(caches.match('./').then(h=>h?timeout(net,2500).catch(()=>h):net));return}
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{if(n.ok&&u.search.indexOf('v=')>=0)caches.open(V).then(c=>c.put(r,n.clone()));return n})))});