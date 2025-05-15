const CACHE_NAME = 'dicoding-story-cache-v1';
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

// ✅ Install event - cache dengan aman
self.addEventListener('install', event => {
    console.log('📦 Service Worker: installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(err => {
                    console.warn(`⚠️ Gagal cache: ${url}`, err);
                }))
            );
        })
    );
    self.skipWaiting();
});

// ✅ Activate event - hapus cache lama
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

// ✅ Fetch event - gunakan cache saat offline
self.addEventListener('fetch', event => {
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

// ✅ Push Notification
self.addEventListener('push', async (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        const fallbackText = await event.data.text();
        data = {
            title: '📩 Notifikasi',
            options: {
                body: fallbackText,
                data: { url: '/' }
            }
        };
    }

    const { title, options } = data;

    event.waitUntil(
        self.registration.showNotification(title, {
            ...options,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            data: {
                url: options?.data?.url || '/'
            }
        })
    );
});

// ✅ Klik notifikasi → buka tab
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            return clients.openWindow(url);
        })
    );
});
