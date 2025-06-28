# StormSight - Advanced Weather Application

A professional weather application featuring real-time weather data, interactive radar mapping, and comprehensive forecasting capabilities. Built with modern web technologies and optimized for deployment on Netlify.

## Features

- **Real-time Weather Data**: Live weather information powered by OpenWeatherMap API
- **Interactive Weather Radar**: Zoomable map with weather layers (clouds, temperature, lightning, air quality)
- **7-Day Forecast**: Detailed weather predictions with animated icons
- **City Exploration**: Click on European cities to explore local weather conditions
- **Automatic Location Detection**: GPS and IP-based location detection
- **Professional UI**: Glass morphism design with smooth animations
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Air Quality**: City-specific air quality data and updates

## Deployment on Netlify

### Prerequisites

1. Netlify account
2. OpenWeatherMap API key

### Deployment Steps

1. **Fork or Clone Repository**
   ```bash
   git clone <repository-url>
   cd stormsight
   ```

2. **Connect to Netlify**
   - Log into your Netlify dashboard
   - Click "New site from Git"
   - Connect your repository

3. **Configure Build Settings**
   - Build command: Leave empty (static site)
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

4. **Set Environment Variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your application

### Getting OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Generate a new API key
5. Copy the key to your Netlify environment variables

### Custom Domain (Optional)

1. In Netlify dashboard → Domain settings
2. Add custom domain
3. Configure DNS settings as instructed
4. SSL certificate will be automatically provisioned

## Architecture

### Frontend
- **Technology**: Vanilla JavaScript with modern ES6+ features
- **Styling**: CSS3 with custom properties and animations
- **Design**: Glass morphism UI with responsive grid layouts
- **Performance**: Optimized for fast loading and smooth interactions

### Backend (Serverless)
- **Functions**: Netlify Functions for API proxying
- **Security**: API keys hidden from client-side code
- **Caching**: Optimized API request handling
- **CORS**: Proper cross-origin resource sharing configuration

### API Integration
- **Weather Data**: OpenWeatherMap API for current weather and forecasts
- **Geolocation**: Browser geolocation API with IP fallback
- **Air Quality**: Integrated air quality data for major European cities

## File Structure

```
├── dist/                 # Production build
│   ├── index.html       # Main application file
│   └── assets/          # Static assets
├── netlify/
│   └── functions/       # Serverless functions
│       ├── weather-current.js
│       ├── weather-forecast.js
│       └── weather-search.js
├── netlify.toml         # Netlify configuration
└── README.md           # Documentation
```

## API Endpoints

### Weather Current
- **Endpoint**: `/.netlify/functions/weather-current`
- **Parameters**: `lat`, `lon`
- **Returns**: Current weather data

### Weather Forecast
- **Endpoint**: `/.netlify/functions/weather-forecast`
- **Parameters**: `lat`, `lon`
- **Returns**: 5-day weather forecast

### City Search
- **Endpoint**: `/.netlify/functions/weather-search`
- **Parameters**: `q` (city name)
- **Returns**: City coordinates and information

## Performance Optimizations

- **Lazy Loading**: Dynamic content loading for better performance
- **Image Optimization**: SVG icons and optimized graphics
- **Caching**: Browser caching for static assets
- **Compression**: Automatic Gzip compression via Netlify
- **CDN**: Global content delivery network

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Security Features

- **HTTPS**: Enforced SSL/TLS encryption
- **API Protection**: Server-side API key management
- **CORS**: Configured cross-origin policies
- **Headers**: Security headers for XSS and clickjacking protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Credits

Created by **Said Alimullah Sadat**

## Support

For issues or questions, please create an issue in the repository or contact the developer.

---

**Live Demo**: [Your Netlify URL will appear here after deployment]