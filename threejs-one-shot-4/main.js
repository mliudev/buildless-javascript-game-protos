import * as THREE from 'three';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';
import { createPlayer } from './player.js';
import { initControls, updateControls } from './controls.js';
import { createEnvironment } from './environment.js';

// Constants
const TIMESTEP = 1/60;
const MAX_SUBSTEPS = 10;

// Initialization
let canvas, renderer, scene, camera;
let effectComposer;
let player;
let timeAccumulator = 0;
let lastTime = 0;
let isInitialized = false;

function init() {
    // Hide loading screen once everything is loaded
    const loadingScreen = document.querySelector('.loading');

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x88aadd);
    scene.fog = new THREE.FogExp2(0x88aadd, 0.01);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.order = 'YXZ'; // Prevent gimbal lock

    // Create renderer
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;

    // Setup postprocessing
    effectComposer = new EffectComposer(renderer);
    effectComposer.addPass(new RenderPass(scene, camera));

    const bloomEffect = new BloomEffect({
        intensity: 0.5,
        threshold: 0.8,
        radius: 0.7
    });

    effectComposer.addPass(new EffectPass(camera, bloomEffect));

    // Create environment (ground, trees, lighting)
    createEnvironment(scene);

    // Create player
    player = createPlayer(scene, camera);

    // Initialize controls
    initControls(camera, canvas, player);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Hide loading screen
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    isInitialized = true;

    // Start game loop
    requestAnimationFrame(gameLoop);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectComposer.setSize(window.innerWidth, window.innerHeight);
}

function fixedUpdate(deltaTime) {
    // Update player physics with fixed timestep
    player.update(deltaTime);
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    if (!isInitialized) return;

    // Convert to seconds
    currentTime *= 0.001;

    // Calculate delta time
    const deltaTime = Math.min(0.1, currentTime - lastTime);
    lastTime = currentTime;

    // Accumulate time for fixed physics updates
    timeAccumulator += deltaTime;

    // Update controls (camera movement)
    updateControls();

    // Run fixed timestep updates
    let substeps = 0;
    while (timeAccumulator >= TIMESTEP && substeps < MAX_SUBSTEPS) {
        fixedUpdate(TIMESTEP);
        timeAccumulator -= TIMESTEP;
        substeps++;
    }

    // Render scene
    effectComposer.render();
}

// Begin initialization
setTimeout(init, 100); // Short delay to ensure all modules are loaded
