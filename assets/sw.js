// SW
var VERSION = "$CACHE_VERSION";
var CACHE_NAME = VERSION;
// explicite cache pattern
var CACHE_PATTERN = /\.(js|html|css|png|gif|woff|ico)\?v=\S+?$/;

function fetchedFromNetwork(response, event) {
    var cacheCopy = response.clone();
    var url = event.request.url;
    if (url.indexOf(VERSION) > -1
            && VERSION !== "$CACHE_VERSION"
            && CACHE_PATTERN.test(url)) { // must be revisioned based call
        caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, cacheCopy));
    }
    return response;
}

this.addEventListener("fetch", function (event) {
    // cache GET only
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
            caches.match(event.request)
            .then(function (cached) {
                if (cached) {
                    return cached;
                } else {
                    return fetch(event.request)
                            .then(function (response) {
                                return fetchedFromNetwork(response, event);
                            });
                }
            }, function () { // in case caches.match throws error, simply fetch the request from network and rather don't cache it this time
                return fetch(event.request);
            }));
});

this.addEventListener("activate", function (event) {
    event.waitUntil(
            caches.keys()
            .then(function (keys) {
                return Promise.all(
                        keys.filter(function (key) {
                            // Filter out caches not matching current versioned name
                            return !key.startsWith(CACHE_NAME);
                        })
                        .map(function (key) {
                            // remove obsolete caches
                            return caches.delete(key);
                        }));
            }));
});
