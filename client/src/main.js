import { Weather3D } from './weather3d.js';
import { WeatherAPI } from './weatherApi.js';
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';
import { LottieManager } from './lottieManager.js';

class WeatherApp {
    constructor() {
        this.weather3D = null;
        this.weatherAPI = null;
        this.storage = null;
        this.ui = null;
        this.lottie = null;
        this.currentLocation = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing 3D Weather App...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Force display main content immediately for debugging
            const mainContent = document.getElementById('main-content');
            const loading = document.getElementById('loading');
            
            if (loading) {
                loading.style.display = 'none';
            }
            
            if (mainContent) {
                mainContent.style.display = 'grid';
                mainContent.style.opacity = '1';
                console.log('Main content forced to display');
            } else {
                console.error('Main content element not found!');
            }
            
            // Initialize managers
            this.storage = new StorageManager();
            this.weatherAPI = new WeatherAPI();
            this.lottie = new LottieManager();
            this.ui = new UIManager();
            
            // Initialize 3D scene
            this.weather3D = new Weather3D();
            await this.weather3D.init();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial weather data
            await this.loadInitialWeather();
            
            this.isInitialized = true;
            console.log('3D Weather App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.ui.showError('Failed to initialize application', error.message);
        }
    }
    
    setupEventListeners() {
        // Location button
        document.getElementById('location-btn').addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshWeather();
        });
        
        // City search
        const cityInput = document.getElementById('city-search');
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCity(cityInput.value.trim());
            }
        });
        
        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.loadInitialWeather();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            if (this.weather3D) {
                this.weather3D.handleResize();
            }
        });
        
        // Visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (this.weather3D) {
                if (document.hidden) {
                    this.weather3D.pause();
                } else {
                    this.weather3D.resume();
                }
            }
        });
    }
    
    async loadInitialWeather() {
        this.ui.showLoading();
        
        try {
            // Try to get cached location first
            const cachedLocation = await this.storage.get('lastLocation');
            
            if (cachedLocation) {
                await this.loadWeatherForLocation(cachedLocation);
            } else {
                // Try to get current location with timeout
                try {
                    await this.getCurrentLocation();
                } catch (locationError) {
                    console.log('Geolocation unavailable, using default location');
                    // Fallback to default location (London)
                    await this.loadWeatherForLocation({ 
                        lat: 51.5074, 
                        lon: -0.1278, 
                        name: 'London',
                        country: 'GB'
                    });
                }
            }
            
        } catch (error) {
            console.error('Failed to load initial weather:', error);
            this.ui.showError('Weather Unavailable', 'Unable to load weather data. Please check your internet connection.');
        }
    }
    
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }
            
            this.ui.showLoading('Getting your location...');
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    
                    try {
                        await this.loadWeatherForLocation(location);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error.message);
                    let errorMessage = 'Unable to access location';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    
                    reject(new Error(errorMessage));
                },
                { 
                    timeout: 8000, 
                    enableHighAccuracy: false, // Use less accurate but faster location
                    maximumAge: 300000 // Accept cached location up to 5 minutes old
                }
            );
        });
    }
    
    async searchCity(cityName) {
        if (!cityName) return;
        
        this.ui.showLoading(`Searching for ${cityName}...`);
        
        try {
            const location = await this.weatherAPI.getLocationByCity(cityName);
            await this.loadWeatherForLocation(location);
            
            // Clear search input
            document.getElementById('city-search').value = '';
            
        } catch (error) {
            console.error('City search error:', error);
            this.ui.showError('City not found', `Unable to find weather data for "${cityName}"`);
        }
    }
    
    async loadWeatherForLocation(location) {
        try {
            this.currentLocation = location;
            
            // Save location for next time
            await this.storage.set('lastLocation', location, 24 * 60 * 60 * 1000); // 24 hours
            
            // Get weather data
            const weatherData = await this.weatherAPI.getCurrentWeather(location.lat, location.lon);
            const forecastData = await this.weatherAPI.getForecast(location.lat, location.lon);
            
            // Update 3D scene
            this.weather3D.updateWeather(weatherData);
            
            // Load background image
            await this.loadBackgroundImage(weatherData.weather[0].main);
            
            // Update UI
            this.ui.updateCurrentWeather(weatherData);
            this.ui.updateForecast(forecastData.list);
            
            // Load appropriate Lottie animation
            await this.lottie.updateWeatherAnimation(weatherData.weather[0].main);
            
            // Hide loading and show weather
            this.ui.hideLoading();
            this.ui.showWeather();
            
        } catch (error) {
            console.error('Failed to load weather:', error);
            // Still show the UI even if some data fails to load
            this.ui.hideLoading();
            this.ui.showWeather();
            this.ui.showError('Weather data unavailable', error.message);
        }
    }
    
    async loadBackgroundImage(weatherCondition) {
        try {
            const imageUrl = await this.weatherAPI.getBackgroundImage(weatherCondition);
            
            if (imageUrl) {
                document.body.style.backgroundImage = `url(${imageUrl})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            }
        } catch (error) {
            console.error('Failed to load background image:', error);
            // Keep default gradient background
        }
    }
    
    async refreshWeather() {
        if (!this.currentLocation) {
            await this.getCurrentLocation();
            return;
        }
        
        this.ui.showLoading('Refreshing weather...');
        
        try {
            // Clear cache for this location
            const cacheKey = `weather_${this.currentLocation.lat}_${this.currentLocation.lon}`;
            await this.storage.remove(cacheKey);
            
            // Reload weather
            await this.loadWeatherForLocation(this.currentLocation);
            
        } catch (error) {
            console.error('Failed to refresh weather:', error);
            this.ui.showError('Refresh failed', error.message);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Handle unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
