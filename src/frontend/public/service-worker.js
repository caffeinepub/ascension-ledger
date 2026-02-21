const CACHE_VERSION = 'cryonex-v2'; // Increment version to force cache refresh
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Check if running on draft environment
function isDraftEnvironment() {
  return self.location.hostname === 'draft.caffeine.xyz' || 
         self.location.hostname.includes('draft.caffeine');
}

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/cryonex-icon-192.dim_192x192.png',
  '/assets/generated/cryonex-icon-512.dim_512x512.png'
];

// Install event - cache static assets (skip on draft)
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  if (isDraftEnvironment()) {
    console.log('[Service Worker] Draft environment detected, skipping cache installation');
    return self.skipWaiting();
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
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
              // On production, only delete old versions
              return cacheName.startsWith('cryonex-') && cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // On draft environment, always use network-first (bypass cache)
  if (isDraftEnvironment()) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error('[Service Worker] Network request failed on draft:', error);
          throw error;
        })
    );
    return;
  }

  // Skip Internet Computer canister calls (API requests)
  if (url.pathname.includes('/api/') || url.hostname.includes('.ic0.app') || url.hostname.includes('.icp0.io')) {
    // Network-first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error('[Service Worker] Network request failed:', error);
          throw error;
        })
    );
    return;
  }

  // Cache-first strategy for static assets (production only)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // Network-first for HTML/documents
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses (production only)
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return cached index.html for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            throw new Error('No cached response available');
          });
      })
  );
});
