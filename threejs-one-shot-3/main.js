import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { createPlayer, update as updatePlayer } from './player.js';
import { setupControls } from './controls.js';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';

// Constants
const FIXED_TIMESTEP = 1 / 60; // 60 updates per second

// Game state
let renderer, scene, camera, controls, player, composer;
let stats = null;
let lastTime = 0;
let accumulator = 0;
let gameInitialized = false;

// Initialize game
init();

/**
 * Initialize the game
 */
function init() {
    try {
        // Setup renderer
        initRenderer();

        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x88CCEE);
        scene.fog = new THREE.FogExp2(0x88CCEE, 0.02);

        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

        // Create environment
        const environment = createEnvironment(scene);

        // Create player
        player = createPlayer(scene, environment);

        // Setup controls
        controls = setupControls(camera, renderer.domElement);

        // Setup postprocessing
        setupPostprocessing();

        // Try to setup stats if available
        try {
            setupStats();
        } catch (statsError) {
            console.warn('Stats.js could not be initialized:', statsError);
        }

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        // Wait a short time to ensure all initialization is complete
        setTimeout(() => {
            gameInitialized = true;
            console.log('Game fully initialized');
            // Start animation loop only when everything is ready
            animate();
        }, 100);
    } catch (error) {
        console.error('Error initializing game:', error);
        document.querySelector('.loading').textContent = 'Error loading game: ' + error.message;
    }
}

/**
 * Initialize the WebGL renderer
 */
function initRenderer() {
    // Check for WebGL support
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            const warning = document.createElement('div');
            warning.style.position = 'absolute';
            warning.style.top = '50%';
            warning.style.width = '100%';
            warning.style.textAlign = 'center';
            warning.style.color = 'white';
            warning.textContent = 'WebGL is not supported by your browser';
            document.body.appendChild(warning);
            throw new Error('WebGL not supported');
        }
    } catch (e) {
        console.error('WebGL detection failed:', e);
        const warning = document.createElement('div');
        warning.style.position = 'absolute';
        warning.style.top = '50%';
        warning.style.width = '100%';
        warning.style.textAlign = 'center';
        warning.style.color = 'white';
        warning.textContent = 'WebGL is not supported by your browser';
        document.body.appendChild(warning);
        throw new Error('WebGL not supported');
    }

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);
}

/**
 * Setup post-processing effects
 */
function setupPostprocessing() {
    // Create effect composer
    composer = new EffectComposer(renderer);

    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom effect
    const bloomEffect = new BloomEffect({
        intensity: 0.5,
        threshold: 0.8,
        radius: 0.4
    });

    // Add effect pass
    const effectPass = new EffectPass(camera, bloomEffect);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);
}

/**
 * Setup performance monitoring
 */
function setupStats() {
    try {
        // Dynamically import Stats.js
        import('stats.js').then(StatsModule => {
            const Stats = StatsModule.default;
            stats = new Stats();
            stats.showPanel(0);
            document.body.appendChild(stats.dom);
        }).catch(error => {
            console.warn('Failed to load Stats.js:', error);
        });
    } catch (error) {
        console.warn('Stats.js setup failed:', error);
    }
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Main animation loop with fixed timestep physics
 * @param {Number} time - Current time from requestAnimationFrame
 */
function animate(time = 0) {
    requestAnimationFrame(animate);

    // Only use stats if available
    if (stats) stats.begin();

    // Only update and render if game is fully initialized
    if (gameInitialized && renderer && scene && camera && controls && player) {
        // Convert to seconds
        time *= 0.001;

        // Calculate delta time and update accumulator
        const deltaTime = Math.min(time - lastTime, 0.1);
        lastTime = time;
        accumulator += deltaTime;

        // Fixed timestep updates for physics
        while (accumulator >= FIXED_TIMESTEP) {
            update(FIXED_TIMESTEP);
            accumulator -= FIXED_TIMESTEP;
        }

        // Render scene
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    // Only use stats if available
    if (stats) stats.end();
}

/**
 * Update game state
 * @param {Number} deltaTime - Fixed timestep delta
 */
function update(deltaTime) {
    // Only continue if controls and player are initialized
    if (!controls || !player || !camera) return;

    // Get movement direction from controls
    const direction = controls.getMovementDirection();

    // Update controls (camera rotation)
    controls.update(camera);

    // Update player
    updatePlayer(
        player.mesh,
        direction,
        camera,
        deltaTime,
        controls.isRunning()
    );
}
