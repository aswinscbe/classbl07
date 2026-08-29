const CACHE="classbl07-review-20260809-1";
const CACHE_VERSION="20260827-nova9";
const ACTIVE_CACHE=`${CACHE}-${CACHE_VERSION}`;
const SHELL=["./index.html","./styles.css?v=20260827-nova9","./app.js?v=20260827-nova9","./polish.js?v=20260827-nova9","./campus-data.js?v=20260827-nova9","./exam-data.js?v=20260827-nova9","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(ACTIVE_CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==ACTIVE_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.hostname==="script.google.com"){e.respondWith(fetch(e.request));return}
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(ACTIVE_CACHE).then(cache=>cache.put("./index.html",copy));return r}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(ACTIVE_CACHE).then(cache=>cache.put(e.request,copy));return r})));
});
