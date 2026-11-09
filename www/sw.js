// Beaver Dam - Service Worker (offline support)
// Bump CACHE_VERSION whenever you change any cached file so users get the update.
const CACHE_VERSION = 'beaver-dam-v3';
const CORE_ASSETS = ['./', 'index.html', 'manifest.json', 'icon.png', 'small-icon.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) =>
            // Add individually so one missing file doesn't break the whole install
            Promise.all(CORE_ASSETS.map((url) => cache.add(url).catch(() => null)))
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Stale-while-revalidate: serve cached copy instantly, refresh it in the background.
    event.respondWith(
        caches.open(CACHE_VERSION).then((cache) =>
            cache.match(req).then((cached) => {
                const network = fetch(req)
                    .then((res) => {
                        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
                        return res;
                    })
                    .catch(() => cached || (req.mode === 'navigate' ? cache.match('index.html') : undefined));
                return cached || network;
            })
        )
    );
});
