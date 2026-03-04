# Specification

## Summary
**Goal:** Set up a fully functional PWA for CRYONEX with manifest, service worker, icons, and correct cache headers.

**Planned changes:**
- Add complete PWA meta tags to `index.html` (apple-mobile-web-app-capable, status-bar-style, title, theme-color, viewport, manifest link, apple-touch-icon link)
- Create `frontend/public/manifest.json` with all required PWA fields (name, short_name, description, start_url, display: standalone, orientation, colors, icons array for 72–512px sizes, categories)
- Place all PWA icon PNG files in `frontend/public/icons/` for sizes 72, 96, 128, 152, 192, 384, and 512px
- Place `apple-touch-icon.png` (180x180) at `frontend/public/apple-touch-icon.png`
- Rewrite `frontend/public/service-worker.js` with cache versioning, pre-caching, cache-first for static assets, network-first for API calls, proper install/activate lifecycle, offline fallback to `index.html`, and draft environment bypass
- Add service worker registration in `index.html` or app entry point (production only, skipped on draft, with error handling)
- Update `frontend/.ic-assets.json` so `service-worker.js` is served with `Cache-Control: no-cache`, and icons/manifest use appropriate long-lived cache headers

**User-visible outcome:** The CRYONEX app can be installed as a PWA on mobile and desktop, works offline via service worker caching, and shows the correct icon on home screens.
