const CACHE_VERSION = 'fieldlog-v4';
const CACHE_NAME = `fieldlog-cache-${CACHE_VERSION}`;

const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).catch(() => caches.match('/index.html'));
    })
  );
});

// Background Sync
self.addEventListener('sync', e => {
  if (e.tag === 'fieldlog-sync') {
    e.waitUntil(syncQueuedData());
  }
});

async function syncQueuedData() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({type: 'SYNC_START'});
  });
  
  // Simulate sync delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  clients.forEach(client => {
    client.postMessage({type: 'SYNC_COMPLETE'});
  });
}