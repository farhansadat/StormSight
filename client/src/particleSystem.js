import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.systems = {};
        this.activeSystem = null;
        this.transitionProgress = 0;
        this.isTransitioning = false;
    }
    
    async init() {
        console.log('Initializing particle systems...');
        
        // Initialize different weather particle systems
        this.initRainSystem();
        this.initSnowSystem();
        this.initCloudSystem();
        this.initFogSystem();
        
        console.log('Particle systems initialized');
    }
    
    initRainSystem() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Initialize rain particles
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 100; // x
            positions[i3 + 1] = Math.random() * 50 + 25; // y
            positions[i3 + 2] = (Math.random() - 0.5) * 100; // z
            
            // Velocity
            velocities[i3] = (Math.random() - 0.5) * 2; // x drift
            velocities[i3 + 1] = -(Math.random() * 20 + 30); // y fall speed
            velocities[i3 + 2] = (Math.random() - 0.5) * 2; // z drift
            
            // Size
            sizes[i] = Math.random() * 2 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Rain material with custom shader
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 1.0 },
                color: { value: new THREE.Color(0x4488ff) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                uniform float time;
                varying float vOpacity;
                
                void main() {
                    vec3 pos = position;
                    
                    // Animate rain falling
                    pos.y += velocity.y * time * 0.01;
                    pos.x += velocity.x * time * 0.005;
                    pos.z += velocity.z * time * 0.005;
                    
                    // Reset particle when it falls below ground
                    if (pos.y < -10.0) {
                        pos.y = 50.0 + mod(pos.y, 10.0);
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    
                    vOpacity = 0.6;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vOpacity;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = vOpacity * (1.0 - dist * 2.0);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.systems.rain = new THREE.Points(geometry, material);
        this.systems.rain.visible = false;
        this.scene.add(this.systems.rain);
    }
    
    initSnowSystem() {
        const particleCount = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Initialize snow particles
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = Math.random() * 50 + 25;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            velocities[i3] = (Math.random() - 0.5) * 0.5;
            velocities[i3 + 1] = -(Math.random() * 5 + 2);
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
            
            sizes[i] = Math.random() * 3 + 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 1.0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                uniform float time;
                
                void main() {
                    vec3 pos = position;
                    
                    // Animate snow falling with gentle swaying
                    pos.y += velocity.y * time * 0.01;
                    pos.x += velocity.x * time * 0.005 + sin(time * 0.001 + position.x) * 0.5;
                    pos.z += velocity.z * time * 0.005;
                    
                    if (pos.y < -10.0) {
                        pos.y = 50.0 + mod(pos.y, 10.0);
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = 0.8 * (1.0 - dist * 2.0);
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.systems.snow = new THREE.Points(geometry, material);
        this.systems.snow.visible = false;
        this.scene.add(this.systems.snow);
    }
    
    initCloudSystem() {
        const cloudCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(cloudCount * 3);
        const sizes = new Float32Array(cloudCount);
        const opacities = new Float32Array(cloudCount);
        
        for (let i = 0; i < cloudCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = Math.random() * 30 + 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            sizes[i] = Math.random() * 20 + 10;
            opacities[i] = Math.random() * 0.3 + 0.1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                cloudTexture: { value: this.createCloudTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                uniform float time;
                varying float vOpacity;
                
                void main() {
                    vec3 pos = position;
                    
                    // Slow cloud movement
                    pos.x += time * 0.002;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    
                    vOpacity = opacity;
                }
            `,
            fragmentShader: `
                uniform sampler2D cloudTexture;
                varying float vOpacity;
                
                void main() {
                    vec4 texColor = texture2D(cloudTexture, gl_PointCoord);
                    float alpha = texColor.a * vOpacity;
                    gl_FragColor = vec4(0.9, 0.9, 0.9, alpha);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        
        this.systems.clouds = new THREE.Points(geometry, material);
        this.systems.clouds.visible = false;
        this.scene.add(this.systems.clouds);
    }
    
    initFogSystem() {
        // Create volumetric fog effect using multiple planes
        const fogGroup = new THREE.Group();
        
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.PlaneGeometry(100, 20);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.05,
                side: THREE.DoubleSide
            });
            
            const plane = new THREE.Mesh(geometry, material);
            plane.position.y = i * 3;
            plane.rotation.y = Math.random() * Math.PI;
            
            fogGroup.add(plane);
        }
        
        this.systems.fog = fogGroup;
        this.systems.fog.visible = false;
        this.scene.add(this.systems.fog);
    }
    
    createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Create cloud-like texture
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }
    
    updateWeather(weatherType, weatherData) {
        // Hide all systems first
        Object.values(this.systems).forEach(system => {
            if (system) system.visible = false;
        });
        
        // Show appropriate system
        switch (weatherType) {
            case 'rain':
            case 'storm':
                if (this.systems.rain) {
                    this.systems.rain.visible = true;
                    this.activeSystem = this.systems.rain;
                    
                    // Adjust intensity based on weather
                    const intensity = weatherType === 'storm' ? 1.5 : 1.0;
                    this.systems.rain.material.uniforms.intensity.value = intensity;
                }
                break;
                
            case 'snow':
                if (this.systems.snow) {
                    this.systems.snow.visible = true;
                    this.activeSystem = this.systems.snow;
                }
                break;
                
            case 'clouds':
                if (this.systems.clouds) {
                    this.systems.clouds.visible = true;
                    this.activeSystem = this.systems.clouds;
                }
                break;
                
            case 'fog':
                if (this.systems.fog) {
                    this.systems.fog.visible = true;
                    this.activeSystem = this.systems.fog;
                }
                break;
                
            default:
                this.activeSystem = null;
        }
        
        console.log(`Particle system updated for weather: ${weatherType}`);
    }
    
    update() {
        const time = Date.now();
        
        // Update active systems
        if (this.systems.rain && this.systems.rain.visible) {
            this.systems.rain.material.uniforms.time.value = time;
        }
        
        if (this.systems.snow && this.systems.snow.visible) {
            this.systems.snow.material.uniforms.time.value = time;
        }
        
        if (this.systems.clouds && this.systems.clouds.visible) {
            this.systems.clouds.material.uniforms.time.value = time;
        }
        
        if (this.systems.fog && this.systems.fog.visible) {
            // Animate fog planes
            this.systems.fog.children.forEach((plane, index) => {
                plane.rotation.y += 0.001 * (index + 1);
                plane.material.opacity = 0.05 + Math.sin(time * 0.001 + index) * 0.02;
            });
        }
    }
    
    dispose() {
        Object.values(this.systems).forEach(system => {
            if (system && system.geometry) {
                system.geometry.dispose();
            }
            if (system && system.material) {
                if (system.material.uniforms && system.material.uniforms.cloudTexture) {
                    system.material.uniforms.cloudTexture.value.dispose();
                }
                system.material.dispose();
            }
            if (system && this.scene) {
                this.scene.remove(system);
            }
        });
    }
}
