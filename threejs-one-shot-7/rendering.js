import * as THREE from 'three';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';
import Stats from 'stats.js';

// Constants
const FOV = 75;
const NEAR = 0.1;
const FAR = 1000;

// Module state
let stats;

export function createRenderer(container) {
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Add to container
    container.appendChild(renderer.domElement);

    // Create performance monitor
    try {
        stats = new Stats();
        stats.showPanel(0);
        container.appendChild(stats.dom);
    } catch (e) {
        console.warn('Stats.js could not be initialized', e);
    }

    return renderer;
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
    camera.position.y = 1.7; // Start at player eye height
    return camera;
}

export function createPostprocessing(renderer, scene, camera) {
    // Create base render pass
    const renderPass = new RenderPass(scene, camera);

    // Create bloom effect for subtle glow
    const bloomEffect = new BloomEffect({
        intensity: 0.5,
        threshold: 0.8,
        radius: 0.7
    });

    // Create effect pass with bloom
    const effectPass = new EffectPass(camera, bloomEffect);
    effectPass.renderToScreen = true;

    // Create composer and add passes
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(effectPass);

    // Setup window resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return composer;
}

export function render(composer, deltaTime) {
    if (stats) stats.begin();
    composer.render(deltaTime);
    if (stats) stats.end();
}
