import * as THREE from 'three';
import { createPlayer, setupPlayerControls, updatePlayer } from './player.js';
import { createEnvironment, checkCollisions, checkTreeCollisions } from './environment.js';
import { createRenderer, createCamera, createPostprocessing, render } from './rendering.js';

// Game state
let lastTime = 0;
const timestep = 1 / 60; // 60 updates per second
let accumulator = 0;

// Initialize game
function init() {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // Setup renderer and get canvas
    const renderer = createRenderer(document.body);
    const canvas = renderer.domElement;

    // Setup camera
    const camera = createCamera();
    scene.add(camera);

    // Create environment
    const environment = createEnvironment(scene);

    // Create player
    const player = createPlayer(scene);

    // Setup controls
    setupPlayerControls(camera, canvas);

    // Setup postprocessing
    const composer = createPostprocessing(renderer, scene, camera);

    // Collision handler that combines ground and tree collisions
    const handleCollisions = (player, nextPos) => {
        // First check ground and boundaries
        const result = checkCollisions(player, nextPos);

        // Then check tree collisions
        return {
            position: checkTreeCollisions(player, result.position, environment.trees),
            onGround: result.onGround
        };
    };

    // Start animation loop
    requestAnimationFrame((time) => gameLoop(time, scene, camera, composer, player, handleCollisions));

    // Hide instructions when pointer is locked
    document.addEventListener('pointerlockchange', () => {
        const instructions = document.getElementById('instructions');
        if (document.pointerLockElement) {
            instructions.style.display = 'none';
        } else {
            instructions.style.display = 'block';
        }
    });
}

// Game loop with fixed timestep physics
function gameLoop(currentTime, scene, camera, composer, player, handleCollisions) {
    // Convert to seconds
    currentTime *= 0.001;

    // Calculate delta time
    const deltaTime = Math.min(0.1, currentTime - lastTime);
    lastTime = currentTime;

    // Accumulate time for fixed physics updates
    accumulator += deltaTime;

    // Update physics with fixed timestep
    while (accumulator >= timestep) {
        updatePlayer(player, camera, timestep, handleCollisions);
        accumulator -= timestep;
    }

    // Render scene
    render(composer, deltaTime);

    // Continue game loop
    requestAnimationFrame((time) => gameLoop(time, scene, camera, composer, player, handleCollisions));
}

// Initialize when page has loaded
window.addEventListener('load', init);
