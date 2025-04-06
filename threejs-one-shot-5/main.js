import * as THREE from 'three';
import Stats from 'stats.js';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';
import { createPlayer, updatePlayer } from './player.js';
import { createEnvironment } from './environment.js';
import { initPhysics, updatePhysics } from './physics.js';

// Constants
const FIXED_TIMESTEP = 1 / 60;
let accumulator = 0;
let lastTime = performance.now();
let gameInitialized = false;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccff); // Sky blue

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ'; // Prevent gimbal lock

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect({
    intensity: 0.5,
    luminanceThreshold: 0.7
})));

// Stats
let stats;
try {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
} catch (e) {
    console.warn('Stats.js not available:', e);
}

// Initialize game components
const player = createPlayer(camera);
scene.add(player.mesh);

const environment = createEnvironment();
scene.add(environment.forestGroup);

// Physics system
const physics = initPhysics(environment.colliders);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Game loop
function gameLoop() {
    if (!gameInitialized) return;

    if (stats) stats.begin();

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Fixed timestep for physics
    accumulator += deltaTime;
    while (accumulator >= FIXED_TIMESTEP) {
        updatePhysics(player, physics, FIXED_TIMESTEP);
        accumulator -= FIXED_TIMESTEP;
    }

    // Update player based on input
    updatePlayer(player, camera, deltaTime);

    // Render scene
    composer.render();

    if (stats) stats.end();

    requestAnimationFrame(gameLoop);
}

// Ensure everything is loaded before starting
setTimeout(() => {
    gameInitialized = true;
    gameLoop();
}, 100);

// Add instructions
const instructions = document.createElement('div');
instructions.style.position = 'absolute';
instructions.style.top = '10px';
instructions.style.width = '100%';
instructions.style.textAlign = 'center';
instructions.style.color = 'white';
instructions.style.fontFamily = 'Arial';
instructions.style.fontSize = '18px';
instructions.style.textShadow = '1px 1px 2px black';
instructions.innerHTML = 'Click to play<br>WASD - Move, Mouse - Look, Space - Jump';
document.body.appendChild(instructions);

document.addEventListener('click', () => {
    instructions.style.display = 'none';
});
