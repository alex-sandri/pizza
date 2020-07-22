const VERSION  = "SW_VERSION";
const ASSETS = [ "SW_ASSETS" ];

const cacheName = `static-v${VERSION}`;

self.addEventListener("install", (e: any) =>
	e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(ASSETS))));

self.addEventListener("activate", (e: any) =>
	e.waitUntil(caches.keys().then(cacheNames =>
		Promise.all(cacheNames
			.filter(cache => cache !== cacheName)
			.map(cache => caches.delete(cache))))));

self.addEventListener("fetch", (e: any) =>
{
	const respondWith = (path: string) =>
	{
		e.respondWith(caches.open(cacheName).then(cache => cache.match(path)
			.then(cacheResponse => cacheResponse || fetch(path).then(fetchResponse =>
			{
				if (e.request.method === "GET") cache.put(path, fetchResponse.clone());

				return fetchResponse;
			}).catch(() =>
			{
				return cache.match("/offline.html");
			}))));
	};

	respondWith(e.request);
});

self.addEventListener("message", e =>
{
	if (e.data.action === "skipWaiting") (<any>self).skipWaiting();
});
