export class UIManager {
    constructor() {
        this.elements = {
            loading: document.getElementById('loading'),
            mainContent: document.getElementById('main-content'),
            currentTemp: document.getElementById('current-temp'),
            currentCondition: document.getElementById('current-condition'),
            currentLocation: document.getElementById('current-location'),
            feelsLike: document.getElementById('feels-like'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            forecastContainer: document.getElementById('forecast-container'),
            weatherIcon: document.getElementById('main-weather-icon')
        };
        
        this.isVisible = false;
        this.weatherIcons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
    }
    
    showLoading(message = 'Loading weather data...') {
        console.log('Showing loading screen...');
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
            const loadingText = this.elements.loading.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }
    
    hideLoading() {
        console.log('Hiding loading screen...');
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
        }
    }
    
    showWeather() {
        console.log('Showing weather UI...');
        this.hideLoading();
        
        if (this.elements.mainContent) {
            this.elements.mainContent.style.display = 'grid';
            this.elements.mainContent.style.opacity = '1';
        }
        
        this.isVisible = true;
    }
    
    hideWeather() {
        if (this.elements.mainContent) {
            this.elements.mainContent.style.opacity = '0';
        }
        this.isVisible = false;
    }
    
    updateCurrentWeather(data) {
        console.log('Updating current weather UI with data:', data);
        
        try {
            // Update temperature
            if (this.elements.currentTemp && data.main && data.main.temp) {
                this.elements.currentTemp.textContent = `${Math.round(data.main.temp)}°`;
            }
            
            // Update condition
            if (this.elements.currentCondition && data.weather && data.weather[0]) {
                this.elements.currentCondition.textContent = this.capitalizeWords(data.weather[0].description);
            }
            
            // Update location
            if (this.elements.currentLocation && data.name) {
                const country = data.sys && data.sys.country ? data.sys.country : '';
                this.elements.currentLocation.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${data.name}${country ? ', ' + country : ''}
                `;
            }
            
            // Update weather icon
            if (this.elements.weatherIcon && data.weather && data.weather[0]) {
                const weatherMain = data.weather[0].main;
                this.elements.weatherIcon.textContent = this.weatherIcons[weatherMain] || '🌤️';
            }
            
            // Update feels like
            if (this.elements.feelsLike && data.main && data.main.feels_like) {
                this.elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;
            }
            
            // Update humidity
            if (this.elements.humidity && data.main && data.main.humidity) {
                this.elements.humidity.textContent = `${data.main.humidity}%`;
            }
            
            // Update wind speed
            if (this.elements.windSpeed && data.wind && data.wind.speed) {
                const windSpeedKmh = Math.round(data.wind.speed * 3.6);
                this.elements.windSpeed.textContent = `${windSpeedKmh} km/h`;
            }
            
            // Update pressure
            if (this.elements.pressure && data.main && data.main.pressure) {
                this.elements.pressure.textContent = `${data.main.pressure} hPa`;
            }
            
            console.log('Weather UI updated successfully');
            
        } catch (error) {
            console.error('Error updating weather UI:', error);
        }
    }
    
    updateForecast(forecastList) {
        console.log('Updating forecast UI...');
        
        if (!this.elements.forecastContainer || !forecastList) {
            console.warn('Forecast container or data not available');
            return;
        }
        
        try {
            // Group forecast by day (every 8th item for daily forecast)
            const dailyForecasts = [];
            for (let i = 0; i < forecastList.length; i += 8) {
                if (dailyForecasts.length >= 5) break;
                dailyForecasts.push(forecastList[i]);
            }
            
            // Clear existing forecast cards
            this.elements.forecastContainer.innerHTML = '';
            
            // Create forecast cards
            dailyForecasts.forEach((forecast, index) => {
                const card = this.createForecastCard(forecast, index);
                this.elements.forecastContainer.appendChild(card);
            });
            
            console.log('Forecast UI updated successfully');
            
        } catch (error) {
            console.error('Error updating forecast UI:', error);
        }
    }
    
    createForecastCard(forecast, index) {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        // Get day name
        const date = new Date(forecast.dt * 1000);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = index === 0 ? 'Today' : dayNames[date.getDay()];
        
        // Get weather icon
        const weatherMain = forecast.weather && forecast.weather[0] ? forecast.weather[0].main : 'Clear';
        const weatherIcon = this.weatherIcons[weatherMain] || '🌤️';
        
        // Get temperatures
        const highTemp = forecast.main ? Math.round(forecast.main.temp_max) : '--';
        const lowTemp = forecast.main ? Math.round(forecast.main.temp_min) : '--';
        
        // Get condition
        const condition = forecast.weather && forecast.weather[0] ? 
            this.capitalizeWords(forecast.weather[0].description) : 'Unknown';
        
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${weatherIcon}</div>
            <div class="forecast-temps">
                <span class="forecast-high">${highTemp}°</span>
                <span class="forecast-low">${lowTemp}°</span>
            </div>
            <div class="forecast-condition">${condition}</div>
        `;
        
        return card;
    }
    
    showError(title, message) {
        console.error('Showing error:', title, message);
        this.hideLoading();
        
        // Create error overlay if it doesn't exist
        let errorOverlay = document.getElementById('error-overlay');
        if (!errorOverlay) {
            errorOverlay = document.createElement('div');
            errorOverlay.id = 'error-overlay';
            errorOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                color: white;
                text-align: center;
            `;
            
            errorOverlay.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 20px; padding: 30px; max-width: 400px; margin: 20px;">
                    <h2 style="color: #ef4444; margin-bottom: 15px;">${title}</h2>
                    <p style="margin-bottom: 25px; line-height: 1.5;">${message}</p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: #60a5fa; color: white; border: none; border-radius: 10px; padding: 12px 24px; cursor: pointer; font-size: 1rem;">
                        Close
                    </button>
                </div>
            `;
            
            document.body.appendChild(errorOverlay);
        }
    }
    
    hideError() {
        const errorOverlay = document.getElementById('error-overlay');
        if (errorOverlay) {
            errorOverlay.remove();
        }
    }
    
    capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
}