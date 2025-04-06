import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { SHADOW_MAP_SIZE } from './constants.js';

// Create renderer
export function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    return renderer;
}

// Set up scene lighting
export function setupLighting(scene) {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(100, 100, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
    sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0001; // Reduce shadow acne
    sunLight.shadow.normalBias = 0.01; // Better contact shadows
    scene.add(sunLight);

    return { ambientLight, sunLight };
}

// Create post-processing setup
export function setupPostProcessing(renderer, scene, camera, params) {
    const composer = new EffectComposer(renderer);

    // Render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom pass
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        params.bloomStrength,
        params.bloomRadius,
        params.bloomThreshold
    );
    composer.addPass(bloomPass);

    // Vignette pass
    const vignettePass = new ShaderPass(VignetteShader);
    if (vignettePass.uniforms && vignettePass.uniforms.offset) {
        vignettePass.uniforms.offset.value = 0.95;
    }
    if (vignettePass.uniforms && vignettePass.uniforms.darkness) {
        vignettePass.uniforms.darkness.value = 0.6;
    }
    composer.addPass(vignettePass);

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return { composer, bloomPass, vignettePass };
}
