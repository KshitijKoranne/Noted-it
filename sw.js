// Offline: network first, cache as fallback. Bump C to force a fresh cache.
const C='noted-it-v3',CORE=['./','./app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='share').map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(u.origin!==location.origin)return;
 // Share target: keep shared text on the device (POST body, never in a URL or server log), then open the app.
 if(r.method==='POST'&&u.searchParams.has('share'))return e.respondWith((async()=>{const f=await r.formData(),o={};for(const k of['title','text','url'])if(f.get(k))o[k]=String(f.get(k));
  await(await caches.open('share')).put('shared',new Response(JSON.stringify(o)));return Response.redirect('./?shared',303)})());
 if(r.method!=='GET')return;
 // Only the app shell is cached: no query strings (they can hold shared text), no error pages.
 e.respondWith(fetch(r).then(res=>{if(res.ok&&!u.search){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))))});
