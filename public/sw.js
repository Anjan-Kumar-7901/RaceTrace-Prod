const CACHE_NAME = "racetrace-cache-v6";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/racetrace-icon.svg",
  "/racetrace-icon.png"
];

// Installs and caches structural layout files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[RaceTrace SW] Pre-caching structural assets...");
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn("Pre-cache warning (usually dynamic Vite assets can be resolved on load):", err);
      });
    })
  );
  self.skipWaiting();
});

// Clean outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[RaceTrace SW] Discarding stale cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept layouts and support elegant offline loading
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // API requests must always reach the serverless API and must never resolve to the SPA shell.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip dev dependencies, hot module reloading socket feeds, etc.
  if (url.pathname.includes("@vite") || url.pathname.includes("hot-update") || url.pathname.includes("node_modules") || url.pathname.startsWith("/src/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response valid, save copy to cache for static assets
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          // Fallback static responses for critical layout routes or API when offline
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }

        });
      })
  );
});
