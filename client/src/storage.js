export class StorageManager {
    constructor() {
        this.dbName = 'WeatherApp';
        this.dbVersion = 1;
        this.db = null;
        this.isIndexedDBSupported = this.checkIndexedDBSupport();
        
        if (this.isIndexedDBSupported) {
            this.initIndexedDB();
        } else {
            console.warn('IndexedDB not supported, falling back to localStorage');
        }
    }
    
    checkIndexedDBSupport() {
        return 'indexedDB' in window && indexedDB !== null;
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                this.isIndexedDBSupported = false;
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('weather')) {
                    const weatherStore = db.createObjectStore('weather', { keyPath: 'key' });
                    weatherStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('images')) {
                    const imageStore = db.createObjectStore('images', { keyPath: 'key' });
                    imageStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    async set(key, value, ttl = 3600000) { // Default TTL: 1 hour
        const item = {
            key,
            value,
            timestamp: Date.now(),
            ttl
        };
        
        if (this.isIndexedDBSupported && this.db) {
            return this.setIndexedDB(item);
        } else {
            return this.setLocalStorage(item);
        }
    }
    
    async get(key) {
        if (this.isIndexedDBSupported && this.db) {
            return this.getIndexedDB(key);
        } else {
            return this.getLocalStorage(key);
        }
    }
    
    async remove(key) {
        if (this.isIndexedDBSupported && this.db) {
            return this.removeIndexedDB(key);
        } else {
            return this.removeLocalStorage(key);
        }
    }
    
    async clear() {
        if (this.isIndexedDBSupported && this.db) {
            return this.clearIndexedDB();
        } else {
            return this.clearLocalStorage();
        }
    }
    
    // IndexedDB methods
    async setIndexedDB(item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['weather'], 'readwrite');
            const store = transaction.objectStore('weather');
            const request = store.put(item);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async getIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['weather'], 'readonly');
            const store = transaction.objectStore('weather');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                
                if (!result) {
                    resolve(null);
                    return;
                }
                
                // Check if item has expired
                const now = Date.now();
                if (now - result.timestamp > result.ttl) {
                    // Item expired, remove it
                    this.removeIndexedDB(key);
                    resolve(null);
                    return;
                }
                
                resolve(result.value);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async removeIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['weather'], 'readwrite');
            const store = transaction.objectStore('weather');
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async clearIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['weather'], 'readwrite');
            const store = transaction.objectStore('weather');
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // localStorage fallback methods
    setLocalStorage(item) {
        try {
            localStorage.setItem(`weather_${item.key}`, JSON.stringify(item));
            return Promise.resolve();
        } catch (error) {
            console.error('localStorage setItem error:', error);
            return Promise.reject(error);
        }
    }
    
    getLocalStorage(key) {
        try {
            const item = localStorage.getItem(`weather_${key}`);
            
            if (!item) {
                return Promise.resolve(null);
            }
            
            const parsed = JSON.parse(item);
            
            // Check if item has expired
            const now = Date.now();
            if (now - parsed.timestamp > parsed.ttl) {
                localStorage.removeItem(`weather_${key}`);
                return Promise.resolve(null);
            }
            
            return Promise.resolve(parsed.value);
            
        } catch (error) {
            console.error('localStorage getItem error:', error);
            return Promise.resolve(null);
        }
    }
    
    removeLocalStorage(key) {
        try {
            localStorage.removeItem(`weather_${key}`);
            return Promise.resolve();
        } catch (error) {
            console.error('localStorage removeItem error:', error);
            return Promise.reject(error);
        }
    }
    
    clearLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('weather_')) {
                    localStorage.removeItem(key);
                }
            });
            return Promise.resolve();
        } catch (error) {
            console.error('localStorage clear error:', error);
            return Promise.reject(error);
        }
    }
    
    // Utility methods
    async getCachedWeather(lat, lon) {
        const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        return this.get(key);
    }
    
    async setCachedWeather(lat, lon, data) {
        const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        return this.set(key, data, 3600000); // 1 hour TTL
    }
    
    async getCachedForecast(lat, lon) {
        const key = `forecast_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        return this.get(key);
    }
    
    async setCachedForecast(lat, lon, data) {
        const key = `forecast_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        return this.set(key, data, 3600000); // 1 hour TTL
    }
    
    // Cleanup expired items periodically
    async cleanup() {
        if (!this.isIndexedDBSupported || !this.db) return;
        
        try {
            const transaction = this.db.transaction(['weather'], 'readwrite');
            const store = transaction.objectStore('weather');
            const index = store.index('timestamp');
            const now = Date.now();
            
            const request = index.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const item = cursor.value;
                    if (now - item.timestamp > item.ttl) {
                        cursor.delete();
                    }
                    cursor.continue();
                }
            };
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

// Run cleanup every 30 minutes
setInterval(() => {
    if (window.storageManager) {
        window.storageManager.cleanup();
    }
}, 30 * 60 * 1000);
