import * as THREE from 'three';
import Stats from 'stats.js';
import {
    createPhysicsWorld,
    createMaterials,
    updatePhysics
} from './physics.js';
import {
    createGroundPlane,
    createPlatforms,
    createCollectibles
} from './environment.js';
import { createPlayer } from './player.js';
import { createControls } from './controls.js';
import {
    CAMERA_FOV,
    CAMERA_DISTANCE,
    CAMERA_HEIGHT,
    COLORS,
    PLAYER_SPEED,
    SHADOW_MAP_SIZE,
    SHADOW_RADIUS,
    IS_MOBILE
} from './constants.js';

// DOM elements
const scoreElement = document.getElementById('score');
const infoElement = document.getElementById('info');

// Game state
let score = 0;
let gameActive = true;

// Initialize the game
function init() {
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.SKY);
    scene.fog = new THREE.FogExp2(COLORS.SKY, 0.01);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Set initial camera position and rotation
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
    camera.rotation.order = 'YXZ'; // Important for first-person controls

    // Create physics world
    const world = createPhysicsWorld();
    const materials = createMaterials(world);

    // Create ground
    const ground = createGroundPlane(scene, world, materials.groundMaterial);

    // Create player
    const player = createPlayer(scene, world, materials.playerMaterial);

    // Create platforms
    const platforms = createPlatforms(scene, world, materials.platformMaterial);

    // Create collectibles
    const collectibles = createCollectibles(scene, world, platforms);

    // Create controls
    const controls = createControls(player, camera);

    // Setup lighting
    setupLighting(scene);

    // Performance stats (if not mobile)
    let stats;
    if (!IS_MOBILE) {
        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation loop
    let lastTime = 0;
    function animate(time) {
        if (!gameActive) return;

        // Calculate delta time
        const deltaTime = lastTime ? (time - lastTime) / 1000 : 1/60;
        lastTime = time;

        // Cap delta time to avoid physics issues
        const cappedDelta = Math.min(deltaTime, 1/30);

        if (stats) stats.begin();

        // Update player controls
        controls.update();

        // Apply movement to player velocity
        if (player.direction.lengthSq() > 0) {
            // Set velocity based on direction and speed
            player.body.velocity.x = player.direction.x * PLAYER_SPEED;
            player.body.velocity.z = player.direction.z * PLAYER_SPEED;
        } else {
            // Slow down gradually when not moving
            player.body.velocity.x *= 0.9;
            player.body.velocity.z *= 0.9;
        }

        // Update physics
        updatePhysics(world, cappedDelta);

        // Check if player is on ground
        player.checkGroundContact();

        // Update player visual position
        player.updateVisual();

        // Position camera behind player
        positionCamera(camera, player);

        // Check player death (falling)
        if (player.checkDeath()) {
            // Player fell and respawned
            updateScore(-10);
            infoElement.textContent = "Oops! You fell. -10 points";
            setTimeout(() => {
                infoElement.textContent = "Sky Hopper";
            }, 2000);
        }

        // Check collectible collisions
        collectibles.forEach((collectible, index) => {
            if (collectible.collected) return;

            // Update collectible animation
            collectible.update(time * 0.001);

            // Simple distance check for collection
            const distance = player.group.position.distanceTo(collectible.group.position);
            if (distance < 1.2) {
                if (collectible.collect()) {
                    updateScore(10);
                    infoElement.textContent = "Star collected! +10 points";
                    setTimeout(() => {
                        infoElement.textContent = "Sky Hopper";
                    }, 2000);
                }
            }
        });

        // Render scene
        renderer.render(scene, camera);

        if (stats) stats.end();
        requestAnimationFrame(animate);
    }

    // Start the animation loop
    animate();

    return { scene, camera, player, controls };
}

// Position camera behind player with smooth follow
function positionCamera(camera, player) {
    // Store the current camera rotation
    const currentRotationX = camera.rotation.x;
    const currentRotationY = camera.rotation.y;

    // Position camera relative to player
    const idealOffset = new THREE.Vector3(
        -CAMERA_DISTANCE * Math.sin(currentRotationY),
        CAMERA_HEIGHT,
        -CAMERA_DISTANCE * Math.cos(currentRotationY)
    );

    // Add offset to player position
    camera.position.copy(player.group.position).add(idealOffset);

    // DON'T use lookAt as it overrides the rotation controlled by the mouse
    // Instead, maintain the current rotation
    camera.rotation.x = currentRotationX;
    camera.rotation.y = currentRotationY;
}

// Setup scene lighting
function setupLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;

    // Configure shadow settings
    directionalLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -70;
    directionalLight.shadow.camera.right = 70;
    directionalLight.shadow.camera.top = 70;
    directionalLight.shadow.camera.bottom = -70;
    directionalLight.shadow.radius = SHADOW_RADIUS;

    scene.add(directionalLight);

    // Hemisphere light (sky/ground color gradient)
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.4);
    scene.add(hemisphereLight);
}

// Update score
function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

// Initialize the game when the page loads
window.addEventListener('load', init);
