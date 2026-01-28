const CACHE_NAME = "api-cache-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

function isApiRequest(url) {
  return (
    url.includes("script.google.com/macros") &&
    (
      url.includes("arkusz=API_VIEW") ||
      url.includes("arkusz=API_DODATKOWE") ||
      url.includes("api=boje") ||
      url.includes("settings=1")
    )
  );
}

self.addEventListener("fetch", event => {
  const url = event.request.url;

  if (!isApiRequest(url)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cached => {

        const networkFetch = fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        // jeśli mamy cache → daj od razu
        return cached || networkFetch;
      });
    })
  );
});
