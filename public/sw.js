const CACHE_NAME = 'dicoding-story-cache-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js',
    'https://fonts.googleapis.com/css2?family=Poppins&display=swap'
];

// Install: cache app shell
self.addEventListener('install', event => {
    console.log('📦 Service Worker: installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                STATIC_ASSETS.map(url =>
                    cache.add(url).catch(err => {
                        console.warn(`⚠️ Gagal cache: ${url}`, err);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: activated');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('🧹 Menghapus cache lama:', key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch: strategi cache-first, tapi jangan cache non-GET
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Cache response dari API story saat offline
    if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first untuk asset lainnya
    event.respondWith(
        caches.match(event.request).then(response =>
            response || fetch(event.request).catch(() =>
                new Response('❌ Offline dan file tidak tersedia.', {
                    headers: { 'Content-Type': 'text/plain' }
                })
            )
        )
    );
});
