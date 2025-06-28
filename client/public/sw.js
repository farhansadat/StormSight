const CACHE_NAME = 'weather-app-v1';
const STATIC_CACHE = 'weather-static-v1';
const DYNAMIC_CACHE = 'weather-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/src/main.js',
    '/src/weather3d.js',
    '/src/weatherApi.js',
    '/src/storage.js',
    '/src/ui.js',
    '/src/particleSystem.js',
    '/src/lottieManager.js',
    '/src/index.css',
    '/animations/sun.json',
    '/animations/moon.json',
    '/animations/clouds.json',
    '/animations/rain.json',
    '/animations/snow.json',
    '/manifest.json'
];

// API endpoints to cache dynamically
const API_ENDPOINTS = [
    'api.openweathermap.org',
    'api.unsplash.com'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (STATIC_ASSETS.includes(url.pathname)) {
        // Static assets - cache first
        event.respondWith(cacheFirst(request));
    } else if (API_ENDPOINTS.some(endpoint => url.hostname.includes(endpoint))) {
        // API requests - network first with cache fallback
        event.respondWith(networkFirst(request));
    } else if (url.pathname.startsWith('/animations/')) {
        // Animation files - cache first
        event.respondWith(cacheFirst(request));
    } else {
        // Other requests - network first
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy (for static assets)
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Serving from cache:', request.url);
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('Cached new resource:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Cache first failed:', error);
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        return createOfflineResponse(request);
    }
}

// Network first strategy (for dynamic content)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('Cached dynamic resource:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Serving cached version:', request.url);
            return cachedResponse;
        }
        
        // Return offline fallback
        return createOfflineResponse(request);
    }
}

// Create offline response
function createOfflineResponse(request) {
    const url = new URL(request.url);
    
    if (request.headers.get('Accept').includes('application/json')) {
        // API request - return offline JSON
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'This request is not available offline'
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
    
    if (request.headers.get('Accept').includes('text/html')) {
        // HTML request - return offline page
        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Weather App</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                    }
                    .offline-content {
                        max-width: 400px;
                        padding: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(20px);
                        border-radius: 16px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                </style>
            </head>
            <body>
                <div class="offline-content">
                    <h1>You're Offline</h1>
                    <p>Weather data is not available without an internet connection.</p>
                    <p>Please check your connection and try again.</p>
                    <button onclick="window.location.reload()" style="
                        background: #60a5fa;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: 20px;
                    ">Retry</button>
                </div>
            </body>
            </html>
            `,
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
    
    // Other requests
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Background sync for weather updates
self.addEventListener('sync', event => {
    if (event.tag === 'weather-sync') {
        console.log('Background sync: weather-sync');
        event.waitUntil(
            // Could implement background weather updates here
            Promise.resolve()
        );
    }
});

// Push notifications (future enhancement)
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    if (event.data) {
        const data = event.data.json();
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Weather Update', {
                body: data.body || 'Check the latest weather conditions',
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: 'weather-update'
            })
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
