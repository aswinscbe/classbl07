const CACHE="classbl07-final-stable-20260809-mobile2";
const SHELL=["./index.html","./styles.css?v=20260809-mobile2","./visual.css?v=20260809-mobile2","./app.js?v=20260809-mobile2","./polish.js?v=20260809-mobile2","./campus-data.js?v=20260809-mobile2","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.hostname==="script.google.com"){e.respondWith(fetch(e.request));return}
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(cache=>cache.put("./index.html",copy));return r}).catch(()=>caches.match("./index.html")));return}
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
