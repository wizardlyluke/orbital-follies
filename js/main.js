// main.js - Main entry point for the application

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
    createSolarSystem, 
    animateSolarSystem, 
    createStarfield, 
    createGalaxies 
} from './celestialBodies.js';
import { initAsteroid } from './asteroid.js';

// Global variables
let scene, camera, renderer, controls;
let clock, timeScale = 0.1;
let solarSystemObjects;

// Initialize everything
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    camera.position.set(0, 75, 120); // Position camera to see more of the system
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Add lighting
    addLighting();
    
    // Create controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 500;
    controls.target.set(0, 0, 0);
    controls.update();
    
    // Create starfield and galaxies
    createStarfield(scene);
    createGalaxies(scene);
    
    // Create solar system
    solarSystemObjects = createSolarSystem(scene);
    
    // Initialize time controls
    clock = new THREE.Clock();
    initTimeControls();
    
    // Initialize asteroid impact feature
    initAsteroid(scene, camera, controls, solarSystemObjects);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Add lighting to the scene
function addLighting() {
    // Ambient light to softly illuminate the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // Point light originating from the Sun
    const pointLight = new THREE.PointLight(0xFFFFFF, 500, 500);
    scene.add(pointLight);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize time slider controls
function initTimeControls() {
    const timeSlider = document.getElementById('timeSlider');
    const timeValue = document.getElementById('timeValue');
    
    // Set initial slider value to match the timeScale variable
    timeSlider.value = timeScale * 50;
    timeValue.textContent = `Current: ${timeScale.toFixed(2)}`;
    
    timeSlider.addEventListener('input', function() {
        // Convert slider value (0-100) to a useful time scale (0-2)
        timeScale = this.value / 50;
        timeValue.textContent = `Current: ${timeScale.toFixed(2)}`;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Animate solar system
    animateSolarSystem(solarSystemObjects, elapsedTime, timeScale);
    
    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
}

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export variables for other modules
export { scene, camera, renderer, controls, solarSystemObjects };

