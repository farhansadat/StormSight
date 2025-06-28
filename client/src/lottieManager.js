export class LottieManager {
    constructor() {
        this.currentAnimation = null;
        this.animationCache = new Map();
        this.isLoading = false;
    }
    
    async updateWeatherAnimation(weatherCondition) {
        const iconId = this.getWeatherIconId(weatherCondition);
        const iconElement = document.getElementById('main-weather-icon');
        
        if (!iconElement) {
            console.error('Main weather icon element not found');
            return;
        }
        
        try {
            // Load the appropriate animation
            await this.loadAnimation(iconElement, iconId);
            this.currentAnimation = iconId;
            
            console.log(`Weather animation updated to: ${iconId}`);
            
        } catch (error) {
            console.error('Failed to update weather animation:', error);
            // Fallback to a simple icon or default animation
            this.loadFallbackAnimation(iconElement);
        }
    }
    
    async loadAnimation(element, iconId) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Check if animation is cached
            if (this.animationCache.has(iconId)) {
                const cachedData = this.animationCache.get(iconId);
                element.load(cachedData);
                return;
            }
            
            // Load animation from file
            const animationPath = `/animations/${iconId}.json`;
            element.src = animationPath;
            
            // Wait for animation to load
            await new Promise((resolve, reject) => {
                element.addEventListener('ready', resolve, { once: true });
                element.addEventListener('error', reject, { once: true });
                
                // Timeout after 5 seconds
                setTimeout(() => reject(new Error('Animation load timeout')), 5000);
            });
            
        } finally {
            this.isLoading = false;
        }
    }
    
    loadFallbackAnimation(element) {
        // Create a simple fallback animation using CSS
        element.style.display = 'none';
        
        const fallbackIcon = document.createElement('div');
        fallbackIcon.className = 'fallback-weather-icon';
        fallbackIcon.innerHTML = this.getFallbackIcon(this.currentAnimation || 'sun');
        
        element.parentNode.replaceChild(fallbackIcon, element);
    }
    
    getFallbackIcon(iconId) {
        const icons = {
            sun: '☀️',
            moon: '🌙',
            clouds: '☁️',
            rain: '🌧️',
            snow: '❄️'
        };
        
        return `<span style="font-size: 120px;">${icons[iconId] || icons.sun}</span>`;
    }
    
    getWeatherIconId(weatherMain) {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour > 18;
        
        const iconMap = {
            'Clear': isNight ? 'moon' : 'sun',
            'Clouds': 'clouds',
            'Rain': 'rain',
            'Drizzle': 'rain',
            'Thunderstorm': 'rain',
            'Snow': 'snow',
            'Mist': 'clouds',
            'Smoke': 'clouds',
            'Haze': 'clouds',
            'Dust': 'clouds',
            'Fog': 'clouds',
            'Sand': 'clouds',
            'Ash': 'clouds',
            'Squall': 'rain',
            'Tornado': 'rain'
        };
        
        return iconMap[weatherMain] || (isNight ? 'moon' : 'sun');
    }
    
    preloadAnimations() {
        const animations = ['sun', 'moon', 'clouds', 'rain', 'snow'];
        
        animations.forEach(async (animationId) => {
            try {
                const response = await fetch(`/animations/${animationId}.json`);
                if (response.ok) {
                    const data = await response.json();
                    this.animationCache.set(animationId, data);
                    console.log(`Preloaded animation: ${animationId}`);
                }
            } catch (error) {
                console.warn(`Failed to preload animation: ${animationId}`, error);
            }
        });
    }
    
    dispose() {
        this.animationCache.clear();
        this.currentAnimation = null;
    }
}
