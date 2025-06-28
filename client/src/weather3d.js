import * as THREE from 'three';
import { ParticleSystem } from './particleSystem.js';

export class Weather3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
        this.lights = {};
        this.isAnimating = true;
        this.frameId = null;
        
        // Performance settings
        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        
        // Weather state
        this.currentWeather = null;
        this.transitionDuration = 3000; // 3 seconds
        this.transitionStartTime = null;
    }
    
    async init() {
        try {
            console.log('Initializing 3D Weather Scene...');
            
            const canvas = document.getElementById('weather-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Initialize Three.js scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x000000, 50, 200);
            
            // Setup camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);
            
            // Setup renderer with performance optimizations
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true, // Enable transparency
                antialias: false, // Disable for performance
                powerPreference: 'default',
                stencil: false,
                depth: true
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
            this.renderer.setClearColor(0x000000, 0); // Transparent background
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
            
            // Setup lighting
            this.setupLighting();
            
            // Initialize particle system
            this.particleSystem = new ParticleSystem(this.scene);
            await this.particleSystem.init();
            
            // Start animation loop
            this.startAnimation();
            
            console.log('3D Weather Scene initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize 3D scene:', error);
            throw error;
        }
    }
    
    setupLighting() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(this.lights.ambient);
        
        // Directional light (sun/moon)
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1);
        this.lights.directional.position.set(10, 10, 5);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 1024;
        this.lights.directional.shadow.mapSize.height = 1024;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 500;
        this.scene.add(this.lights.directional);
        
        // Point light for atmospheric effects
        this.lights.point = new THREE.PointLight(0xffffff, 0.5, 100);
        this.lights.point.position.set(0, 20, 0);
        this.scene.add(this.lights.point);
    }
    
    updateWeather(weatherData) {
        if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
            console.warn('Invalid weather data provided');
            return;
        }
        
        const weather = weatherData.weather[0];
        const newWeatherType = this.getWeatherType(weather.main);
        
        console.log('Updating 3D scene for weather:', newWeatherType);
        
        // Update lighting based on time of day
        this.updateLighting(weatherData);
        
        // Update particles
        if (this.particleSystem) {
            this.particleSystem.updateWeather(newWeatherType, weatherData);
        }
        
        // Update fog
        this.updateFog(newWeatherType);
        
        this.currentWeather = newWeatherType;
        this.transitionStartTime = Date.now();
    }
    
    getWeatherType(weatherMain) {
        const weatherMap = {
            'Clear': 'clear',
            'Clouds': 'clouds',
            'Rain': 'rain',
            'Drizzle': 'rain',
            'Thunderstorm': 'storm',
            'Snow': 'snow',
            'Mist': 'fog',
            'Smoke': 'fog',
            'Haze': 'fog',
            'Dust': 'fog',
            'Fog': 'fog',
            'Sand': 'fog',
            'Ash': 'fog',
            'Squall': 'storm',
            'Tornado': 'storm'
        };
        
        return weatherMap[weatherMain] || 'clear';
    }
    
    updateLighting(weatherData) {
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour <= 18;
        
        // Adjust ambient light based on weather and time
        let ambientIntensity = isDay ? 0.4 : 0.1;
        let directionalIntensity = isDay ? 1.2 : 0.3;
        
        const weather = weatherData.weather[0].main;
        
        // Adjust for weather conditions
        switch (weather) {
            case 'Clouds':
                ambientIntensity *= 0.7;
                directionalIntensity *= 0.6;
                break;
            case 'Rain':
            case 'Drizzle':
                ambientIntensity *= 0.5;
                directionalIntensity *= 0.4;
                break;
            case 'Thunderstorm':
                ambientIntensity *= 0.3;
                directionalIntensity *= 0.2;
                break;
            case 'Snow':
                ambientIntensity *= 0.8;
                directionalIntensity *= 0.9;
                break;
            case 'Fog':
            case 'Mist':
                ambientIntensity *= 0.4;
                directionalIntensity *= 0.3;
                break;
        }
        
        // Animate lighting changes
        this.animateLightingChange(ambientIntensity, directionalIntensity, isDay);
    }
    
    animateLightingChange(targetAmbient, targetDirectional, isDay) {
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        const initialAmbient = this.lights.ambient.intensity;
        const initialDirectional = this.lights.directional.intensity;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            // Interpolate intensities
            this.lights.ambient.intensity = initialAmbient + (targetAmbient - initialAmbient) * eased;
            this.lights.directional.intensity = initialDirectional + (targetDirectional - initialDirectional) * eased;
            
            // Adjust color temperature
            if (isDay) {
                this.lights.directional.color.setHex(0xffffff);
            } else {
                this.lights.directional.color.setHex(0x9999ff);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    updateFog(weatherType) {
        let density, color;
        
        switch (weatherType) {
            case 'fog':
                density = 0.01;
                color = 0xcccccc;
                break;
            case 'rain':
            case 'storm':
                density = 0.005;
                color = 0x333333;
                break;
            case 'snow':
                density = 0.003;
                color = 0xffffff;
                break;
            case 'clouds':
                density = 0.002;
                color = 0x888888;
                break;
            default:
                density = 0.001;
                color = 0x87ceeb;
        }
        
        // Animate fog transition
        const targetFog = new THREE.Fog(color, 30, 150);
        this.animateFogChange(targetFog, 1500);
    }
    
    animateFogChange(targetFog, duration) {
        const startTime = Date.now();
        const initialNear = this.scene.fog.near;
        const initialFar = this.scene.fog.far;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            this.scene.fog.color.copy(targetFog.color);
            this.scene.fog.near = initialNear + (targetFog.near - initialNear) * eased;
            this.scene.fog.far = initialFar + (targetFog.far - initialFar) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    startAnimation() {
        const animate = (currentTime) => {
            if (!this.isAnimating) return;
            
            // Frame rate limiting
            if (currentTime - this.lastFrameTime >= this.frameInterval) {
                this.update();
                this.render();
                this.lastFrameTime = currentTime;
            }
            
            this.frameId = requestAnimationFrame(animate);
        };
        
        this.frameId = requestAnimationFrame(animate);
    }
    
    update() {
        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update();
        }
        
        // Update camera movement (subtle breathing effect)
        const time = Date.now() * 0.0005;
        this.camera.position.y = 5 + Math.sin(time) * 0.2;
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    pause() {
        this.isAnimating = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }
    
    resume() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.startAnimation();
        }
    }
    
    dispose() {
        this.pause();
        
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.clear();
        }
    }
    
    // Utility function for smooth animations
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
