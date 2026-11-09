const CACHE="classbl07-review-20260809-1";
const CACHE_VERSION="20260928-nova199";
const ACTIVE_CACHE=`${CACHE}-${CACHE_VERSION}`;
const SHELL=["./index.html","./styles.css?v=20260928-nova199","./app.js?v=20260928-nova199","./polish.js?v=20260928-nova199","./campus-data.js?v=20260928-nova199","./exam-data.js?v=20260928-nova199","./term4-data.js?v=20260928-nova199","./staff-bus-data.js?v=20260928-nova199","./fonts/inter-latin.woff2","./fonts/jakarta-latin.woff2","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-192.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png","./icons/favicon-32.png","./icons/favicon-16.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(ACTIVE_CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==ACTIVE_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  /* Anything that is not one of this app's own files goes to the network and is never
     stored. The rule at the bottom is cache-first, which is right for a versioned
     stylesheet and ruinous for an API: the first Google Calendar response was cached
     under its request URL and every refresh afterwards was answered from that copy,
     without a request ever leaving the device. The schedule froze at whatever it said
     the first time, and tapping refresh could not shift it - it only ever came back to
     life when a new app version created a new cache and dropped the old one.

     There was a hostname exception here already, for script.google.com, written when
     that was where the schedule came from. The calendar replaced it and nothing added
     googleapis.com. Naming hosts one at a time is how that happens; this asks the
     opposite question, which does not need maintaining. */
  if(u.origin!==self.location.origin){e.respondWith(fetch(e.request));return}
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(ACTIVE_CACHE).then(cache=>cache.put("./index.html",copy));return r}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(ACTIVE_CACHE).then(cache=>cache.put(e.request,copy));return r})));
});
