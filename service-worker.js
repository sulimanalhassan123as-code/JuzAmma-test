const CACHE_NAME = 'juz-amma-soft-dev-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Amiri&family=Poppins:wght@300;500;700&display=swap'
];

// 1. INSTALL: Just set it up, don't be aggressive
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Activate immediately
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// 2. ACTIVATE: Clean up old messes
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. FETCH: NETWORK FIRST (The "Soft" Strategy)
// This logic says: "Go to the internet FIRST. If that fails, THEN look at the cache."
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // If we got a valid response from the internet, update the cache!
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return res;
            })
            .catch(() => {
                // If internet fails, fallback to cache
                return caches.match(e.request);
            })
    );
});
