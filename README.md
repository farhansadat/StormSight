# 🌩️ StormSight – Advanced Weather Application

**StormSight** is a powerful, responsive, and visually stunning weather application that delivers real-time meteorological data, interactive radar mapping, and detailed forecasting. Built using modern web technologies and optimized for seamless deployment on [Netlify](https://netlify.com), StormSight provides accurate weather insights across European cities and beyond.

---

## 🚀 Features

- **Real-Time Weather Data**  
  Powered by the OpenWeatherMap API for live updates.

- **Interactive Weather Radar**  
  Explore cloud coverage, temperature, lightning, and air quality on an interactive, zoomable map.

- **7-Day Weather Forecast**  
  Get comprehensive daily forecasts with animated weather icons.

- **City Explorer Mode**  
  Click on European cities to view localized weather conditions.

- **Automatic Location Detection**  
  GPS-based and IP fallback geolocation support.

- **Real-Time Air Quality**  
  City-specific air quality data and updates included.

- **Professional UI**  
  Sleek glassmorphism-inspired design with smooth, modern animations.

- **Responsive Design**  
  Mobile-first, adaptive layout for all screen sizes.

---

## 🛠️ Deployment on Netlify

### Prerequisites

- A [Netlify](https://app.netlify.com/) account
- An [OpenWeatherMap](https://openweathermap.org/api) API key

### ⚙️ Deployment Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd stormsight
   ```

2. **Connect to Netlify**
   - Log in to your Netlify dashboard
   - Click **"New Site from Git"**
   - Choose your Git provider and connect the repository

3. **Configure Build Settings**
   - **Build command**: *(leave blank for static site)*
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

4. **Set Environment Variables**
   - Go to **Site Settings → Environment Variables**
   - Add:
     ```
     OPENWEATHER_API_KEY=your_api_key_here
     ```

5. **Deploy**
   - Click **Deploy Site**
   - Netlify will build and deploy automatically

---

## 🔑 Getting an OpenWeatherMap API Key

1. Sign up at [OpenWeatherMap](https://openweathermap.org/)
2. Navigate to your profile → API Keys
3. Generate a new key
4. Add the key to your Netlify environment variables

---

## 🌐 Custom Domain (Optional)

- In Netlify → **Site Settings → Domain Management**
- Add your custom domain and configure DNS
- SSL certificate will be auto-provisioned

---

## 🧱 Architecture Overview

### Frontend

- **Technology**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with animations and custom properties
- **UI Design**: Glassmorphism with responsive grid layouts
- **Performance**: Optimized for fast load and smooth UX

### Backend (Serverless)

- **Serverless Functions**: Netlify Functions for secure API proxying
- **Security**: API keys never exposed client-side
- **Caching**: Optimized response caching
- **CORS**: Properly configured for cross-origin requests

---

## 🔌 API Integration

- **Weather Data**: [OpenWeatherMap API](https://openweathermap.org/api)
- **Geolocation**: Browser Geolocation API with IP fallback
- **Air Quality**: Integrated support for European air quality metrics

---

## 📁 File Structure

```
├── dist/                   # Compiled production build
│   ├── index.html          # Main application file
│   └── assets/             # Static assets (icons, styles)
├── netlify/
│   └── functions/          # Serverless backend functions
│       ├── weather-current.js
│       ├── weather-forecast.js
│       └── weather-search.js
├── netlify.toml            # Netlify configuration file
└── README.md               # Project documentation
```

---

## 📡 API Endpoints

| Endpoint                                      | Description              | Parameters     | Response               |
|----------------------------------------------|--------------------------|----------------|------------------------|
| `/.netlify/functions/weather-current`        | Fetch current weather    | `lat`, `lon`   | JSON                   |
| `/.netlify/functions/weather-forecast`       | Get 5-day forecast       | `lat`, `lon`   | JSON                   |
| `/.netlify/functions/weather-search`         | Search for a city        | `q` (city name)| JSON                   |

---

## ⚡ Performance Optimizations

- **Lazy Loading**: Efficient rendering of content on demand
- **Image Optimization**: Lightweight SVGs and compressed assets
- **Browser Caching**: Static assets cached for fast reloads
- **Compression**: Gzip compression via Netlify
- **CDN**: Global content delivery for low-latency access

---

## 🌍 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

---

## 🔒 Security

- HTTPS enforced via Netlify TLS
- API keys securely handled on the server
- CORS protection for API requests
- HTTP headers for XSS and clickjacking protection

---

## 🤝 Contributing

1. Fork the repository  
2. Create a new branch  
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit  
   ```bash
   git commit -m "Add feature"
   ```
4. Push your changes  
   ```bash
   git push origin feature-name
   ```
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.

---

## 🙌 Credits

Crafted with care by **Said Alimullah Sadat**  
Weather data provided by [OpenWeatherMap](https://openweathermap.org/)

---

## 📬 Support

For issues or questions, [open an issue](https://github.com/your-username/stormsight/issues) or contact the developer directly.

---

### 🔗 Live Demo  
👉 [View Live App on Netlify](#)