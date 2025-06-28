export class WeatherAPI {
    constructor() {
        this.baseWeatherUrl = '/api/weather'; // Use server proxy for security
        this.baseUnsplashUrl = 'https://api.unsplash.com';
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests
    }
    
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }
    
    async getCurrentWeather(lat, lon) {
        await this.rateLimit();
        
        const url = `${this.baseWeatherUrl}/current?lat=${lat}&lon=${lon}`;
        
        try {
            console.log('Fetching current weather...');
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Current weather data received:', data);
            
            return data;
            
        } catch (error) {
            console.error('Failed to fetch current weather:', error);
            throw error;
        }
    }
    
    async getForecast(lat, lon) {
        await this.rateLimit();
        
        const url = `${this.baseWeatherUrl}/forecast?lat=${lat}&lon=${lon}`;
        
        try {
            console.log('Fetching weather forecast...');
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Forecast data received');
            
            return data;
            
        } catch (error) {
            console.error('Failed to fetch forecast:', error);
            throw error;
        }
    }
    
    async getLocationByCity(cityName) {
        await this.rateLimit();
        
        const url = `${this.baseWeatherUrl}/search?q=${encodeURIComponent(cityName)}`;
        
        try {
            console.log('Searching for city:', cityName);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`City not found: ${cityName}`);
            }
            
            const data = await response.json();
            
            return {
                lat: data.coord.lat,
                lon: data.coord.lon,
                name: data.name,
                country: data.sys.country
            };
            
        } catch (error) {
            console.error('Failed to find city:', error);
            throw new Error(`Unable to find "${cityName}". Please check the spelling and try again.`);
        }
    }
    
    async getBackgroundImage(weatherCondition) {
        if (this.unsplashApiKey === 'demo_key') {
            console.warn('Using default background - Unsplash API key not configured');
            return null;
        }
        
        await this.rateLimit();
        
        const query = this.getImageQuery(weatherCondition);
        const url = `${this.baseUnsplashUrl}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${this.unsplashApiKey}`;
        
        try {
            console.log('Fetching background image for:', weatherCondition);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Image API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.urls.regular;
            
        } catch (error) {
            console.error('Failed to fetch background image:', error);
            return null;
        }
    }
    
    getImageQuery(weatherCondition) {
        const queries = {
            'Clear': 'sunny sky blue',
            'Clouds': 'cloudy sky nature',
            'Rain': 'rain weather nature',
            'Drizzle': 'light rain nature',
            'Thunderstorm': 'storm clouds dramatic sky',
            'Snow': 'snow winter landscape',
            'Mist': 'misty landscape nature',
            'Fog': 'foggy morning nature',
            'Haze': 'hazy atmosphere nature'
        };
        
        return queries[weatherCondition] || 'nature landscape';
    }
    
    // Mock data for development/demo purposes
    getMockCurrentWeather(lat, lon) {
        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        return {
            coord: { lat, lon },
            weather: [{
                main: randomCondition,
                description: randomCondition.toLowerCase(),
                icon: '01d'
            }],
            main: {
                temp: Math.round(Math.random() * 30 - 5), // -5 to 25°C
                feels_like: Math.round(Math.random() * 30 - 5),
                temp_min: Math.round(Math.random() * 25 - 5),
                temp_max: Math.round(Math.random() * 35 + 5),
                pressure: Math.round(Math.random() * 100 + 1000),
                humidity: Math.round(Math.random() * 100)
            },
            wind: {
                speed: Math.round(Math.random() * 20),
                deg: Math.round(Math.random() * 360)
            },
            sys: {
                country: 'XX'
            },
            name: 'Demo City',
            dt: Date.now() / 1000
        };
    }
    
    getMockForecast() {
        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
        const list = [];
        
        for (let i = 0; i < 40; i++) { // 5 days * 8 forecasts per day
            const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
            
            list.push({
                dt: (Date.now() / 1000) + (i * 3 * 3600), // Every 3 hours
                main: {
                    temp: Math.round(Math.random() * 30 - 5),
                    temp_min: Math.round(Math.random() * 25 - 5),
                    temp_max: Math.round(Math.random() * 35 + 5),
                    humidity: Math.round(Math.random() * 100)
                },
                weather: [{
                    main: randomCondition,
                    description: randomCondition.toLowerCase(),
                    icon: '01d'
                }],
                wind: {
                    speed: Math.round(Math.random() * 20)
                },
                dt_txt: new Date(Date.now() + (i * 3 * 3600 * 1000)).toISOString()
            });
        }
        
        return { list };
    }
}
