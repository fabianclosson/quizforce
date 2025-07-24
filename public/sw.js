/**
 * QuizForce Service Worker
 */

const CACHE_NAME = "quizforce-v2";
const STATIC_CACHE_NAME = "quizforce-static-v2";

// Resources to cache immediately on install
const STATIC_RESOURCES = ["/", "/catalog", "/dashboard", "/manifest.json"];

// Install event - cache static resources
self.addEventListener("install", event => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_RESOURCES);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", event => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});

console.log("Service Worker loaded");
