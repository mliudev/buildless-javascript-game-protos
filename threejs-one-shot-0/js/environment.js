import * as THREE from 'three';
import { createPlatformBody, createTriggerBody, createGround } from './physics.js';
import {
    createGroundTexture,
    createPlatformTexture,
    createCollectibleTexture,
    getRandomPlatformPosition
} from './utils.js';
import {
    PLATFORM_COUNT,
    COLLECTIBLE_COUNT,
    GROUND_LEVEL,
    PLATFORM_MIN_SCALE,
    PLATFORM_MAX_SCALE,
    COLORS
} from './constants.js';

// Create the ground plane
export function createGroundPlane(scene, world, groundMaterial) {
    // Create ground geometry
    const groundSize = 100;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
    groundGeometry.rotateX(-Math.PI / 2);

    // Create material with procedural texture
    const groundTexture = createGroundTexture();
    const groundMeshMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.1,
    });

    // Create ground mesh
    const groundMesh = new THREE.Mesh(groundGeometry, groundMeshMaterial);
    groundMesh.position.y = GROUND_LEVEL;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Create physics body
    const groundBody = createGround(world, groundMaterial);

    return { mesh: groundMesh, body: groundBody };
}

// Create a single platform
export function createPlatform(scene, world, position, platformMaterial) {
    // Random size for variety
    const scale = {
        x: PLATFORM_MIN_SCALE + Math.random() * (PLATFORM_MAX_SCALE - PLATFORM_MIN_SCALE),
        y: 0.5, // Height
        z: PLATFORM_MIN_SCALE + Math.random() * (PLATFORM_MAX_SCALE - PLATFORM_MIN_SCALE)
    };

    // Create platform geometry
    const platformGeometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z);

    // Create material with procedural texture
    const platformTexture = createPlatformTexture();
    const platformMeshMaterial = new THREE.MeshStandardMaterial({
        map: platformTexture,
        roughness: 0.7,
        metalness: 0.2
    });

    // Create platform mesh
    const platformMesh = new THREE.Mesh(platformGeometry, platformMeshMaterial);
    platformMesh.position.copy(position);
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;
    scene.add(platformMesh);

    // Add a colored edge to the platform
    const edgeGeometry = new THREE.BoxGeometry(scale.x + 0.05, 0.1, scale.z + 0.05);
    const edgeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(COLORS.PLATFORM).multiplyScalar(1.5),
        roughness: 0.5,
        metalness: 0.5
    });

    const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edgeMesh.position.y = scale.y / 2 + 0.05;
    platformMesh.add(edgeMesh);

    // Create physics body
    const platformBody = createPlatformBody(world, position, scale, platformMaterial);

    return {
        mesh: platformMesh,
        body: platformBody,
        size: scale
    };
}

// Create multiple platforms
export function createPlatforms(scene, world, platformMaterial) {
    const platforms = [];

    // Create a starter platform under the player
    const starterPlatform = createPlatform(
        scene,
        world,
        new THREE.Vector3(0, 1, 0),
        platformMaterial
    );
    platforms.push(starterPlatform);

    // Create random platforms
    for (let i = 0; i < PLATFORM_COUNT - 1; i++) {
        const position = getRandomPlatformPosition();
        const platform = createPlatform(scene, world, position, platformMaterial);
        platforms.push(platform);
    }

    return platforms;
}

// Create a collectible star
export function createCollectible(scene, world, position) {
    // Create collectible group
    const collectibleGroup = new THREE.Group();
    scene.add(collectibleGroup);
    collectibleGroup.position.copy(position);

    // Star geometry with custom texture
    const starRadius = 0.4;
    const starGeometry = new THREE.CircleGeometry(starRadius, 5);

    // Create material with procedural texture
    const starTexture = createCollectibleTexture();
    const starMaterial = new THREE.MeshStandardMaterial({
        map: starTexture,
        emissive: COLORS.COLLECTIBLE,
        emissiveIntensity: 0.5,
        transparent: true,
        side: THREE.DoubleSide
    });

    // Create star mesh
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    collectibleGroup.add(starMesh);

    // Add a point light for glow effect
    const pointLight = new THREE.PointLight(COLORS.COLLECTIBLE, 1, 3);
    pointLight.intensity = 0.5;
    collectibleGroup.add(pointLight);

    // Create physics trigger
    const triggerBody = createTriggerBody(world, position, starRadius);

    // Add some rotation animation
    const animationData = {
        rotationSpeed: 1 + Math.random() * 2,
        bobSpeed: 0.5 + Math.random(),
        bobHeight: 0.2 + Math.random() * 0.3,
        initialY: position.y
    };

    // Make a back-facing star for double sided effect
    const backStar = starMesh.clone();
    backStar.rotation.y = Math.PI;
    collectibleGroup.add(backStar);

    // Collectible state
    const collectibleState = {
        group: collectibleGroup,
        mesh: starMesh,
        body: triggerBody,
        isCollected: false,
        animation: animationData,
        collected: false,

        // Update animation
        update: function(time) {
            if (this.collected) return;

            // Rotate the star
            this.group.rotation.y += this.animation.rotationSpeed * 0.01;

            // Bob up and down
            const bobOffset = Math.sin(time * this.animation.bobSpeed) * this.animation.bobHeight;
            this.group.position.y = this.animation.initialY + bobOffset;
        },

        // Handle collection
        collect: function() {
            if (this.collected) return false;

            this.collected = true;

            // Scale down and fade out animation
            const scaleTween = {
                value: 1.0
            };

            const duration = 300; // ms
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.group.scale.set(1 - progress, 1 - progress, 1 - progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Remove from scene
                    scene.remove(this.group);
                    world.removeBody(this.body);
                }
            };

            animate();

            return true;
        }
    };

    return collectibleState;
}

// Create multiple collectibles on platforms
export function createCollectibles(scene, world, platforms) {
    const collectibles = [];

    // Create collectibles on some platforms (not on the starter platform)
    for (let i = 0; i < COLLECTIBLE_COUNT; i++) {
        // Choose a random platform (not starter platform)
        const platformIndex = 1 + Math.floor(Math.random() * (platforms.length - 1));
        const platform = platforms[platformIndex];

        // Position above the platform
        const position = platform.mesh.position.clone();
        position.y += platform.size.y / 2 + 1; // Above the platform

        // Add some random offset on the platform
        position.x += (Math.random() - 0.5) * (platform.size.x * 0.8);
        position.z += (Math.random() - 0.5) * (platform.size.z * 0.8);

        const collectible = createCollectible(scene, world, position);
        collectibles.push(collectible);
    }

    return collectibles;
}
