import * as THREE from 'three';
import { EffectComposer, BloomEffect, EffectPass, RenderPass } from 'postprocessing';
import Stats from 'stats.js';

import { Controls } from './controls.js';
import { Player } from './player.js';
import { Environment } from './environment.js';

// Game constants
const PHYSICS_STEP = 1 / 60; // Fixed time step for physics (60Hz)

// Main class
class ForestExplorer {
    constructor() {
        // Performance monitoring
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        // Time tracking
        this.clock = new THREE.Clock();
        this.physicsClock = new THREE.Clock();
        this.physicsAccumulator = 0;

        // Initialize
        this.init();
    }

    init() {
        // Check for WebGL support
        if (!this.checkWebGL()) {
            document.getElementById('info').textContent = 'WebGL not supported or disabled. Please enable WebGL or use a compatible browser.';
            return;
        }

        try {
            // Create scene
            this.scene = new THREE.Scene();

            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            document.body.appendChild(this.renderer.domElement);

            // Create environment
            this.environment = new Environment(this.scene);
            this.environment.addFog(); // Optional fog

            // Create player
            this.player = new Player(this.scene);

            // Create controls
            this.controls = new Controls(this.camera, this.renderer.domElement);

            // Setup postprocessing
            this.setupPostprocessing();

            // Handle window resize
            window.addEventListener('resize', this.onWindowResize.bind(this));

            // Start animation loop
            this.animate();

        } catch (error) {
            console.error('Error initializing ForestExplorer:', error);
            document.getElementById('info').textContent = 'Error: ' + error.message;
        }
    }

    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    setupPostprocessing() {
        // Create composer
        this.composer = new EffectComposer(this.renderer);

        // Add render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Add bloom effect
        const bloomEffect = new BloomEffect({
            intensity: 0.5,
            luminanceThreshold: 0.9,
            luminanceSmoothing: 0.2,
        });

        const effectPass = new EffectPass(this.camera, bloomEffect);
        effectPass.renderToScreen = true;
        this.composer.addPass(effectPass);
    }

    onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer and composer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.stats.begin();

        // Get elapsed time
        const deltaTime = Math.min(this.clock.getDelta(), 0.1); // Clamp to avoid large jumps

        // Fixed timestep for physics
        this.physicsAccumulator += this.physicsClock.getDelta();

        while (this.physicsAccumulator >= PHYSICS_STEP) {
            // Update player with controls
            const controlsUpdate = this.controls.update(PHYSICS_STEP);

            // Handle jump if requested
            if (controlsUpdate.jump) {
                this.player.jump();
            }

            // Update player position and check collisions
            const playerPosition = this.player.update(
                PHYSICS_STEP,
                controlsUpdate.movement,
                this.environment.getColliders()
            );

            // Update camera position to follow player
            this.camera.position.copy(playerPosition);

            // Decrease accumulator
            this.physicsAccumulator -= PHYSICS_STEP;
        }

        // Render scene with postprocessing
        this.composer.render(deltaTime);

        this.stats.end();
    }
}

// Start the application
try {
    new ForestExplorer();
} catch (error) {
    console.error('Fatal error:', error);
    document.getElementById('info').textContent = 'Fatal error: ' + error.message;
}
