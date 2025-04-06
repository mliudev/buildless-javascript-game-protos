import * as THREE from 'three';
import { createForest } from './environment.js';
import { createPlayer } from './player.js';
import { createControls } from './controls.js';
import {
    CAMERA_FOV,
    CAMERA_NEAR,
    CAMERA_FAR,
    CAMERA_HEIGHT,
    COLORS,
    WORLD_SIZE,
    AMBIENT_LIGHT_INTENSITY,
    DIRECTIONAL_LIGHT_INTENSITY,
    IS_MOBILE,
    DAY_CYCLE_SPEED,
    FOG_NEAR,
    FOG_FAR,
    ARTIFACT_COUNT
} from './constants.js';

// DOM elements
const artifactsCounter = document.getElementById('artifacts-counter');
const gameTitle = document.getElementById('game-title');

// Game state
let gameActive = false;
let artifactsCollected = 0;

// Initialize the game
function init() {
    // Create the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.SKY_DAY);
    scene.fog = new THREE.Fog(COLORS.FOG_DAY, FOG_NEAR, FOG_FAR);

    // Create the camera
    const camera = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        CAMERA_NEAR,
        CAMERA_FAR
    );

    // Set initial camera position
    camera.position.set(0, CAMERA_HEIGHT, 5);
    // Set rotation order to prevent gimbal lock
    camera.rotation.order = 'YXZ';

    // Create lighting
    setupLighting(scene);

    // Create player
    const player = createPlayer(scene);

    // Create forest environment
    const forest = createForest(scene);

    // Create controls
    const controls = createControls(player, camera);

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Set up intro screen event listener
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            gameActive = true;
            updateArtifactsCounter(0);
        });
    }

    // Animation loop
    let lastTime = performance.now();
    let accumulatedTime = 0;
    const fixedTimeStep = 1 / 60; // 60 updates per second

    // Main animation loop
    function animate(currentTime) {
        requestAnimationFrame(animate);

        // Calculate delta time in seconds
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
        lastTime = currentTime;

        // Only update game if active
        if (gameActive) {
            // Accumulate time for fixed physics update
            accumulatedTime += deltaTime;

            // Update physics with fixed timestep
            while (accumulatedTime >= fixedTimeStep) {
                // Update player physics
                player.update(fixedTimeStep, forest.ground.heightField, WORLD_SIZE, forest.ground.heightFieldSize);

                // Update controls
                controls.update();

                // Update camera position to follow player
                updateCameraPosition(camera, player);

                accumulatedTime -= fixedTimeStep;
            }

            // Update forest animations (runs at variable framerate)
            forest.update(currentTime * 0.001);

            // Check for artifact collection
            if (forest.checkArtifactCollection(player.position)) {
                artifactsCollected = ARTIFACT_COUNT - forest.getRemainingArtifacts();
                updateArtifactsCounter(artifactsCollected);

                // Check if all artifacts are collected
                if (artifactsCollected >= ARTIFACT_COUNT) {
                    gameTitle.textContent = "All artifacts found! You win!";
                }
            }

            // Update day/night cycle
            updateDayNightCycle(scene, currentTime);
        }

        // Render scene
        renderer.render(scene, camera);
    }

    // Start animation loop
    animate(performance.now());
}

// Set up lighting for the scene
function setupLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_LIGHT_INTENSITY);
    directionalLight.position.set(50, 100, 30);
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -70;
    directionalLight.shadow.camera.right = 70;
    directionalLight.shadow.camera.top = 70;
    directionalLight.shadow.camera.bottom = -70;

    // Add directional light to scene
    scene.add(directionalLight);

    // Store sun for day/night cycle
    scene.userData.sun = directionalLight;

    // Hemisphere light (sky/ground gradient)
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.4);
    scene.add(hemisphereLight);

    // Store for day/night cycle
    scene.userData.hemisphereLight = hemisphereLight;
}

// Update camera position to follow player
function updateCameraPosition(camera, player) {
    // Set camera position relative to player
    camera.position.x = player.position.x;
    camera.position.z = player.position.z;

    // Set fixed camera height
    camera.position.y = player.position.y + CAMERA_HEIGHT;
}

// Update day/night cycle
function updateDayNightCycle(scene, time) {
    // Use cyclical angle based on time
    const angle = (time * DAY_CYCLE_SPEED) % (Math.PI * 2);

    // Calculate sun position
    scene.userData.sun.position.x = Math.cos(angle) * 100;
    scene.userData.sun.position.y = Math.sin(angle) * 100 + 30;

    // Day/night transition
    const dayness = Math.max(0, Math.sin(angle));

    // Interpolate sky color
    const skyColorDay = new THREE.Color(COLORS.SKY_DAY);
    const skyColorNight = new THREE.Color(COLORS.SKY_NIGHT);
    const skyColor = skyColorDay.clone().lerp(skyColorNight, 1 - dayness);
    scene.background = skyColor;

    // Interpolate fog color
    const fogColorDay = new THREE.Color(COLORS.FOG_DAY);
    const fogColorNight = new THREE.Color(COLORS.FOG_NIGHT);
    const fogColor = fogColorDay.clone().lerp(fogColorNight, 1 - dayness);
    scene.fog.color = fogColor;

    // Adjust light intensities
    scene.userData.sun.intensity = DIRECTIONAL_LIGHT_INTENSITY * dayness;
    scene.userData.hemisphereLight.intensity = 0.4 * dayness + 0.1;
}

// Update the artifacts counter in the UI
function updateArtifactsCounter(count) {
    if (artifactsCounter) {
        artifactsCounter.textContent = `Artifacts: ${count}/${ARTIFACT_COUNT}`;
    }
}

// Initialize the game when the document is loaded
window.addEventListener('load', init);
