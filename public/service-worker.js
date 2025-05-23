const CACHE_NAME = "ticketbook-cache-v1";
const urlsToCache = ["/", "/index.html", "/offline.html"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("✅ Caching app shell");
            return cache.addAll(urlsToCache);
        })
    );
});

// self.addEventListener("fetch", (event) => {
//     const { request } = event;

//     // 🔥 Bypass cache for API calls and always fetch fresh data
//     if (request.url.includes("/api/")) {
//         event.respondWith(fetch(request));
//         return;
//     }

//     // Default caching for other assets (HTML, CSS, JS)
//     event.respondWith(
//         caches.match(request).then((cachedResponse) => {
//             return cachedResponse || fetch(request);
//         })
//     );
// });

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Always bypass cache for API requests
    if (request.url.includes("/api/")) {
        event.respondWith(fetch(request));
        return;
    }

    // Always fetch fresh versions of JS and CSS
    if (request.url.endsWith(".js") || request.url.endsWith(".css")) {
        event.respondWith(fetch(request));
        return;
    }

    // Fallback for other static assets
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            return cachedResponse || fetch(request);
        })
    );
});