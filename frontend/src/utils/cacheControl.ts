/**
 * Cache control utilities for managing service worker caches
 * and detecting draft environment
 */

/**
 * Check if the app is running on the draft.caffeine.xyz domain
 */
export function isDraftEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'draft.caffeine.xyz' || 
         window.location.hostname.includes('draft.caffeine');
}

/**
 * Clear all service worker caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log('[Cache Control] Clearing all caches:', cacheNames);
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[Cache Control] All caches cleared successfully');
    } catch (error) {
      console.error('[Cache Control] Failed to clear caches:', error);
      throw error;
    }
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('[Cache Control] Unregistering service workers:', registrations.length);
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('[Cache Control] All service workers unregistered');
    } catch (error) {
      console.error('[Cache Control] Failed to unregister service workers:', error);
      throw error;
    }
  }
}

/**
 * Add cache-busting parameter to a URL
 */
export function addCacheBuster(url: string): string {
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${timestamp}`;
}

/**
 * Perform a hard reload bypassing all caches
 */
export function hardReload(): void {
  if (typeof window !== 'undefined') {
    // Clear session storage
    sessionStorage.clear();
    
    // Reload with cache bypass
    window.location.reload();
  }
}

/**
 * Initialize cache control for draft environment
 * Clears all caches and unregisters service workers
 */
export async function initializeDraftEnvironment(): Promise<void> {
  if (!isDraftEnvironment()) {
    return;
  }

  console.log('[Cache Control] Draft environment detected, clearing caches...');
  
  try {
    await clearAllCaches();
    await unregisterServiceWorkers();
    console.log('[Cache Control] Draft environment initialized successfully');
  } catch (error) {
    console.error('[Cache Control] Failed to initialize draft environment:', error);
  }
}
