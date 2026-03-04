const CACHE_VERSION = 'cryonex-v9';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const API_CACHE = `${CACHE_VERSION}-api`;

// All known cache names for this version
const KNOWN_CACHES = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];

// Check if running on draft environment
function isDraftEnvironment() {
  return self.location.hostname === 'draft.caffeine.xyz' ||
         self.location.hostname.includes('draft.caffeine');
}

// Assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/icon-192.png',
  '/assets/generated/icon-512.png',
  '/assets/generated/apple-touch-icon.png',
  '/assets/generated/icon-192.png',
  '/assets/generated/icon-512.png'
];

// Install event - pre-cache static assets
self.addEventListener('install', (event) => {
  if (isDraftEnvironment()) {
    return self.skipWaiting();
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Use individual adds so one failure doesn't block the rest
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Failed to pre-cache:', url, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Install failed:', error);
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // On draft, delete ALL caches
              if (isDraftEnvironment()) return true;
              // On production, delete caches that belong to old versions
              return name.startsWith('cryonex-') && !KNOWN_CACHES.includes(name);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper: is this an ICP canister / API request?
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('.ic0.app') ||
         url.hostname.includes('.icp0.io') ||
         url.hostname.includes('.raw.ic0.app') ||
         url.hostname.includes('icp-api.io');
}

// Helper: is this a static asset (JS, CSS, font, image)?
function isStaticAsset(request, url) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         request.destination === 'image' ||
         /\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|svg|webp|ico|gif)$/i.test(url.pathname);
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // On draft: always bypass cache, go straight to network
  if (isDraftEnvironment()) {
    event.respondWith(
      fetch(request).catch((err) => {
        console.warn('[SW] Draft network request failed:', err);
        throw err;
      })
    );
    return;
  }

  // Skip cross-origin requests that aren't ICP API calls
  if (url.origin !== self.location.origin && !isApiRequest(url)) {
    return;
  }

  // Stale-while-revalidate for ICP canister / API calls
  if (isApiRequest(url)) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const networkFetch = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              if (cachedResponse) return cachedResponse;
              throw new Error('[SW] Offline and no cached API response');
            });

          // Return cached immediately if available, update in background
          return cachedResponse || networkFetch;
        });
      })
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  if (isStaticAsset(request, url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache; revalidate in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                const contentType = networkResponse.headers.get('content-type') || '';
                const isImage = request.destination === 'image' ||
                                /\.(png|jpg|jpeg|svg|webp|ico|gif)$/i.test(url.pathname);
                if (!isImage || contentType.startsWith('image/')) {
                  caches.open(RUNTIME_CACHE).then((c) => c.put(request, networkResponse.clone()));
                }
              }
            })
            .catch(() => {/* background revalidation failed — cached version still served */});
          return cachedResponse;
        }

        // Not cached — fetch from network and cache it
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const contentType = networkResponse.headers.get('content-type') || '';
              const isImage = request.destination === 'image' ||
                              /\.(png|jpg|jpeg|svg|webp|ico|gif)$/i.test(url.pathname);
              if (!isImage || contentType.startsWith('image/')) {
                caches.open(RUNTIME_CACHE).then((c) => c.put(request, networkResponse.clone()));
              }
            }
            return networkResponse;
          })
          .catch(() => {
            console.warn('[SW] Asset unavailable offline:', url.pathname);
            throw new Error('[SW] Asset not available offline: ' + url.pathname);
          });
      })
    );
    return;
  }

  // Network-first with offline fallback for HTML / navigation requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // For navigation requests, serve the cached app shell
          if (request.mode === 'navigate') {
            return caches.match('/index.html').then((shell) => {
              if (shell) return shell;
              throw new Error('[SW] App shell not cached — cannot serve offline');
            });
          }
          throw new Error('[SW] No cached response for: ' + url.pathname);
        });
      })
  );
});
