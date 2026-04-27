// Minimal service worker — required by Chrome/Android for `beforeinstallprompt`
// to fire. Intentionally no caching; network-first passthrough.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op fetch handler. Required for installability criteria.
});
