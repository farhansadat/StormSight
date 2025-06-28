import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
  const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Weather API proxy routes to handle CORS and API key management
  app.get("/api/weather/current", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          error: "Missing coordinates", 
          message: "Latitude and longitude are required" 
        });
      }

      if (!OPENWEATHER_API_KEY) {
        return res.status(500).json({
          error: "API key not configured",
          message: "OpenWeatherMap API key is required"
        });
      }
      
      const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      
      console.log('Fetching weather data from OpenWeatherMap...');
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }
      
      const weatherData = await response.json();
      console.log('Weather data received successfully');
      
      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ 
        error: "Weather service unavailable", 
        message: "Unable to fetch weather data" 
      });
    }
  });

  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          error: "Missing coordinates", 
          message: "Latitude and longitude are required" 
        });
      }

      if (!OPENWEATHER_API_KEY) {
        return res.status(500).json({
          error: "API key not configured",
          message: "OpenWeatherMap API key is required"
        });
      }
      
      const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      
      console.log('Fetching forecast data from OpenWeatherMap...');
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }
      
      const forecastData = await response.json();
      console.log('Forecast data received successfully');
      
      res.json(forecastData);
    } catch (error) {
      console.error("Forecast API error:", error);
      res.status(500).json({ 
        error: "Forecast service unavailable", 
        message: "Unable to fetch forecast data" 
      });
    }
  });

  app.get("/api/weather/search", async (req, res) => {
    try {
      const { q: cityName } = req.query;
      
      if (!cityName || typeof cityName !== 'string') {
        return res.status(400).json({ 
          error: "Missing city name", 
          message: "City name is required" 
        });
      }

      if (!OPENWEATHER_API_KEY) {
        return res.status(500).json({
          error: "API key not configured",
          message: "OpenWeatherMap API key is required"
        });
      }
      
      const searchUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      
      console.log('Searching for city:', cityName);
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`City search error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const cityData = {
        coord: data.coord,
        name: data.name,
        sys: data.sys
      };
      
      res.json(cityData);
    } catch (error) {
      console.error("City search error:", error);
      res.status(500).json({ 
        error: "Search service unavailable", 
        message: "Unable to search for city" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "3D Weather App API"
    });
  });

  // Cache management endpoints
  app.delete("/api/cache", (req, res) => {
    // Clear server-side cache if implemented
    res.json({ 
      message: "Cache cleared successfully" 
    });
  });

  app.get("/api/cache/stats", (req, res) => {
    // Return cache statistics
    res.json({
      cached_locations: 0,
      cache_size: 0,
      last_updated: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
