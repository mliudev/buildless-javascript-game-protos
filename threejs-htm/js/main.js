import * as THREE from 'three';
import Stats from 'stats.js';
import { GUI } from 'dat.gui';

// Import constants
import {
    WORLD_SIZE, PLAYER_SPEED, TREE_COUNT, ROCK_COUNT,
    CAMERA_DISTANCE, CAMERA_HEIGHT, GROUND_LEVEL
} from './constants.js';

// Import utility functions
import { createGroundTexture, createBarkTexture } from './utils.js';

// Import modules
import { createPhysicsWorld, createContactMaterials, updatePhysics } from './physics.js';
import { createPlayer } from './player.js';
import { createGround, createTrees, createRocks } from './terrain.js';
import { setupControls, updatePlayerMovement, updateCamera, cameraRotation } from './controls.js';
import { createRenderer, setupLighting, setupPostProcessing } from './rendering.js';

// Initialize the game
function init() {
    // Create stats monitor
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Create GUI params
    window.params = {
        bloomStrength: 0.15,
        bloomThreshold: 0.5,
        bloomRadius: 0.2,
        sunAngle: 0.3,
        treeDensity: TREE_COUNT,
        debugPhysics: false
    };

    // Set up GUI controls
    const gui = new GUI();
    gui.close(); // Hide by default

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#87CEEB'); // Sky blue
    scene.fog = new THREE.FogExp2('#87CEEB', 0.01);

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);

    // Create renderer
    const renderer = createRenderer(document.getElementById('root'));

    // Setup lighting
    const { sunLight } = setupLighting(scene);

    // Create physics world
    const world = createPhysicsWorld();
    const { groundMaterial, playerMaterial } = createContactMaterials(world);

    // Create textures
    const groundTexture = createGroundTexture();
    const barkTexture = createBarkTexture();

    // Create game objects
    const terrain = createGround(scene, world, groundMaterial, groundTexture);
    const player = createPlayer(scene, world, playerMaterial);
    const trees = createTrees(scene, world, TREE_COUNT, barkTexture);
    const rocks = createRocks(scene, world, ROCK_COUNT);

    // Set up controls
    setupControls(player, renderer);

    // Setup post-processing
    const { composer } = setupPostProcessing(renderer, scene, camera, window.params);

    // Add effect parameters to GUI
    const effectsFolder = gui.addFolder('Effects');
    effectsFolder.add(window.params, 'bloomStrength', 0, 3).onChange(value => composer.passes[1].strength = value);
    effectsFolder.add(window.params, 'bloomThreshold', 0, 1).onChange(value => composer.passes[1].threshold = value);
    effectsFolder.add(window.params, 'bloomRadius', 0, 1).onChange(value => composer.passes[1].radius = value);

    const worldFolder = gui.addFolder('World');
    worldFolder.add(window.params, 'sunAngle', 0, Math.PI / 2).onChange(value => {
        sunLight.position.x = Math.cos(value) * 100;
        sunLight.position.y = Math.sin(value) * 100;
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = Math.min(clock.getDelta(), 0.1); // Cap delta time

        // Update stats
        stats.begin();

        // Update physics
        updatePhysics(world, deltaTime);

        // Check player ground contact
        player.checkGroundContact();

        // Update player movement
        updatePlayerMovement(player, PLAYER_SPEED, cameraRotation);

        // Update visuals
        player.updateVisual();

        // Update camera
        updateCamera(camera, player, cameraRotation, CAMERA_DISTANCE, CAMERA_HEIGHT);

        // Update debug if needed
        if (player.debugMesh) {
            player.updateDebug();
        }

        // Update info display
        document.getElementById('info').innerText =
            `Forest Explorer RPG | Position: Y=${player.body.position.y.toFixed(2)} | Bottom: ${(player.body.position.y - player.mesh.geometry.parameters.height/2).toFixed(2)} | OnGround: ${player.onGround}`;

        // Render scene
        composer.render();

        stats.end();
    }

    // Start animation loop
    animate();
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', init);
