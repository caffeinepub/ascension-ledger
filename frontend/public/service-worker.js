const CACHE_VERSION = 'cryonex-v7'; // Incremented for offline-first strategy
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Check if running on draft environment
function isDraftEnvironment() {
  return self.location.hostname === 'draft.caffeine.xyz' || 
         self.location.hostname.includes('draft.caffeine');
}

// Assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets (skip on draft)
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v7 with offline-first strategy...');
  
  if (isDraftEnvironment()) {
    console.log('[Service Worker] Draft environment detected, skipping cache installation');
    return self.skipWaiting();
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v7...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // On draft, delete ALL caches
              if (isDraftEnvironment()) {
                return true;
              }
              // On production, delete all old versioned caches
              return cacheName.startsWith('cryonex-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== RUNTIME_CACHE &&
                     cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete, old caches cleared');
        return self.clients.claim();
      })
  );
});

// Helper: is this an API / ICP canister request?
function isApiRequest(url) {
  return url.pathname.includes('/api/') || 
         url.hostname.includes('.ic0.app') || 
         url.hostname.includes('.icp0.io') ||
         url.hostname.includes('.raw.ic0.app');
}

// Helper: is this a static asset (JS, CSS, font, image)?
function isStaticAsset(request, url) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         request.destination === 'image' ||
         url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|svg|webp|ico|gif)$/i);
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except ICP API which we handle below)
  if (url.origin !== location.origin && !isApiRequest(url)) {
    return;
  }

  // On draft environment, always use network (bypass cache entirely)
  if (isDraftEnvironment()) {
    event.respondWith(
      fetch(request).catch((error) => {
        console.error('[Service Worker] Network request failed on draft:', error);
        throw error;
      })
    );
    return;
  }

  // Stale-while-revalidate for ICP canister / API calls
  if (isApiRequest(url)) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed - return cached if available
              return cachedResponse || Promise.reject(new Error('Offline and no cached API response'));
            });

          // Return cached immediately, update in background
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Cache-first strategy for static assets (JS, CSS, fonts, images)
  if (isStaticAsset(request, url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache, update in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const contentType = networkResponse.headers.get('content-type') || '';
                // For images, validate content-type before caching
                if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i)) {
                  if (contentType.startsWith('image/')) {
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, networkResponse.clone()));
                  }
                } else {
                  caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, networkResponse.clone()));
                }
              }
            })
            .catch(() => {/* background update failed, cached version still served */});
          return cachedResponse;
        }

        // Not in cache - fetch from network and cache it
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const contentType = networkResponse.headers.get('content-type') || '';
              const responseClone = networkResponse.clone();
              // Validate image content-type before caching
              if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i)) {
                if (contentType.startsWith('image/')) {
                  caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
                }
              } else {
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
              }
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline and not cached
            console.warn('[Service Worker] Asset not available offline:', url.pathname);
            throw new Error('Asset not available offline: ' + url.pathname);
          });
      })
    );
    return;
  }

  // Network-first with cache fallback for HTML / navigation requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For navigation requests, serve the app shell
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          throw new Error('No cached response available for: ' + url.pathname);
        });
      })
  );
});
