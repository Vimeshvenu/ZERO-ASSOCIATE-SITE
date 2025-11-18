// service-worker.js - simple cache-first static strategy
const CACHE = 'zeroassociate-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/about.html',
  '/services.html',
  '/contact.html'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  // use network-first for form submissions (POST) and external APIs
  if (evt.request.method === 'POST') {
    return evt.respondWith(fetch(evt.request).catch(() => new Response(null, { status: 503 })));
  }
  // cache-first for same-origin navigation & static files
  if (ASSETS.includes(url.pathname) || url.origin === location.origin) {
    evt.respondWith(caches.match(evt.request).then(r => r || fetch(evt.request).then(res => {
      // cache new GET responses
      if (evt.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(evt.request, clone));
      }
      return res;
    }).catch(()=>caches.match('/index.html'))));
  } else {
    evt.respondWith(fetch(evt.request).catch(()=>caches.match('/index.html')));
  }
});
