import * as THREE from 'three';
import { EffectComposer, BloomEffect, EffectPass, RenderPass } from 'postprocessing';
import Stats from 'stats.js';

import { createPlayer, updatePlayer, setupPlayerControls } from './player.js';
import { createTerrain, createSky, setupLighting, WORLD_SIZE } from './environment.js';

// Game variables
let scene, camera, renderer, composer;
let terrain, player, sky, lights;
let stats;

let lastTime = performance.now();
const timeStep = 1 / 60; // Fixed time step (60 FPS)
let accumulator = 0;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, WORLD_SIZE * 2);
    camera.position.set(0, 2, 5);
    camera.rotation.order = 'YXZ'; // Prevent gimbal lock

    // Create renderer
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Setup postprocessing
    setupPostprocessing();

    // Create environment
    terrain = createTerrain(scene);
    sky = createSky(scene);
    lights = setupLighting(scene);

    // Create player
    player = createPlayer(scene);

    // Setup player controls
    setupPlayerControls(player, camera);

    // Setup performance monitoring (optional)
    try {
        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
    } catch (e) {
        console.warn('Stats.js could not be initialized:', e);
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Remove loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading');
        loadingScreen.style.display = 'none';
    }, 1000);

    // Start animation loop
    animate();
}

// Set up post-processing effects
function setupPostprocessing() {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Add bloom effect for a more atmospheric look
    const bloomEffect = new BloomEffect({
        intensity: 0.3,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.3
    });

    composer.addPass(new EffectPass(camera, bloomEffect));
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Game loop with fixed timestep for physics
function animate() {
    requestAnimationFrame(animate);

    if (stats) stats.begin();

    const currentTime = performance.now();
    let deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Cap delta time to avoid large jumps after tab switching, etc.
    deltaTime = Math.min(deltaTime, 0.1);

    // Accumulate time and run physics at fixed timestep
    accumulator += deltaTime;

    while (accumulator >= timeStep) {
        updatePhysics(timeStep);
        accumulator -= timeStep;
    }

    // Render the scene
    composer.render();

    if (stats) stats.end();
}

// Update physics at fixed timestep
function updatePhysics(deltaTime) {
    // Update player
    updatePlayer(player, camera, terrain, deltaTime);

    // Update any animated environment objects here
    // (e.g., moving elements, day/night cycle, etc.)
}

// Check for WebGL support and initialize the game
try {
    init();
} catch (error) {
    document.getElementById('loading').innerHTML = 'WebGL not supported or initialization failed!<br>' + error;
    console.error('Error initializing game:', error);
}
