// public/service-worker.js

const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
    '/',
    '/public/styles/style.min.css',
    '/public/scripts/script.min.js',
    '/public/images/favicon.ico',
    '/public/images/Kemal Bekcan Profile Photo.jpg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Tüm dosyaları önbelleğe al
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});