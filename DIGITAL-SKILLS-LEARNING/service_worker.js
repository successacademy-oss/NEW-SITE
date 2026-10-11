/* Success Academy Tech Digital Skills Learning — service worker
   Caches the static app shell (HTML/CSS/JS/icons) so the site can load
   offline or on a poor connection. Payment status, progress and
   certificates all live in localStorage on the device, not in this cache,
   so verification data is never served stale from here. */

const CACHE_NAME = 'dsl-static-v2';

const STATIC_ASSETS = [
  'index.html',
  'courses.html',
  'dashboard.html',
  'payment.html',
  'video.html',
  'contact.html',
  'admin.html',
  'certificate.html',
  'verify.html',
  'manifest.json',
  'css/style.css',
  'css/index.css',
  'css/courses.css',
  'css/dashboard.css',
  'css/payment.css',
  'css/video.css',
  'css/contact.css',
  'css/admin.css',
  'css/certificate.css',
  'css/verify.css',
  'js/app.js',
  'js/index.js',
  'js/courses.js',
  'js/dashboard.js',
  'js/payment.js',
  'js/video.js',
  'js/contact.js',
  'js/admin.js',
  'js/certificate.js',
  'js/verify.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
