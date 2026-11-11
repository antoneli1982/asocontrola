const CACHE_NAME = 'aso-controla-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './design-system.css?v=20261111-colorido-2',
  './theme.js?v=20261111-colorido-2',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js',
  'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS.map(asset => new Request(asset, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Revalidate app files so a new page cannot receive an older theme from HTTP cache.
  const url = new URL(e.request.url);
  const isAppFile = url.origin === self.location.origin && (
    e.request.mode === 'navigate' ||
    /\/(?:index\.html|theme\.js|design-system\.css)$/.test(url.pathname)
  );

  e.respondWith(
    fetch(e.request, isAppFile ? { cache: 'no-cache' } : undefined)
      .then(response => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Fallback to index for navigation requests
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
