const CACHE_NAME = "hkec-api-v1";

// które requesty cache’ujemy
function isApiRequest(url) {
  return (
    url.includes("script.google.com/macros") &&
    (
      url.includes("arkusz=API_VIEW") ||
      url.includes("arkusz=API_DODATKOWE") ||
      url.includes("api=boje")
      url.includes("settings=1")
    )
  );
}

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = req.url;

  if (!isApiRequest(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(req).then(cached => {

        // fetch w tle (aktualizacja cache)
        const fetchPromise = fetch(req)
          .then(res => {
            if (res && res.status === 200) {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached);

        // cache-first
        return cached || fetchPromise;
      })
    )
  );
});



