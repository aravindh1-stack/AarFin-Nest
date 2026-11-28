const CACHE_NAME = "nexfix-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/collections",
  "/dashboard/routes",
  "/dashboard/customers",
  "/dashboard/reconciliation",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/nexfix-dark.png",
  "/nexfix-light.png",
  "/offline"
];

// Install: Cache offline shell & critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Asset precache partial notice:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (mutations like POST, PUT, DELETE must go to network)
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension or external protocols
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // 1. API requests: Network-first, with fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: "OFFLINE", message: "You are currently offline. Live financial data unavailable." }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // 2. Static Next.js chunks, fonts, icons: Cache-first / Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background
          fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. HTML Navigation requests: Network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page navigations
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fallback to offline page or cached root
          const offlinePage = await caches.match("/offline");
          if (offlinePage) return offlinePage;
          const dashboardPage = await caches.match("/dashboard");
          if (dashboardPage) return dashboardPage;
          return new Response(
            `<!DOCTYPE html><html><body style="background:#090B0A;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h2>NexFix Financial OS</h2><p>You are currently offline. Please reconnect to cellular or Wi-Fi.</p></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }
});
