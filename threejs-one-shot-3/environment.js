import * as THREE from 'three';

// Constants
const GROUND_SIZE = 50;
const TREE_COUNT = 8;

/**
 * Creates a simple forest environment
 * @param {THREE.Scene} scene - The scene to add environment elements to
 * @returns {Object} - Environment objects and data
 */
export function createEnvironment(scene) {
    // Ground geometry (reused for all ground pieces)
    const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
    groundGeometry.rotateX(-Math.PI / 2);

    // Ground material with texture
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x567d46,
        roughness: 0.8,
        metalness: 0.1
    });

    // Create ground
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    ground.position.y = 0;
    scene.add(ground);

    // Create trees
    const trees = createTrees(scene);

    // Setup lighting
    const lights = setupLighting(scene);

    // Return environment objects for potential later use
    return {
        ground,
        trees,
        lights
    };
}

/**
 * Creates procedural trees and places them in the scene
 * @param {THREE.Scene} scene - The scene to add trees to
 * @returns {Array} - Array of tree objects
 */
function createTrees(scene) {
    const trees = [];

    // Reusable geometries for tree parts
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const leavesGeometry = new THREE.ConeGeometry(1, 3, 8);

    // Reusable materials for tree parts
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a5f0b,
        roughness: 0.8
    });

    // Create multiple trees and position them randomly
    for (let i = 0; i < TREE_COUNT; i++) {
        // Create tree group
        const tree = new THREE.Group();

        // Create trunk
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.position.y = 1; // Position from bottom
        tree.add(trunk);

        // Create leaves
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.castShadow = true;
        leaves.position.y = 3.5; // Position on top of trunk
        tree.add(leaves);

        // Position tree randomly in the scene
        // Keep away from center (player starting position)
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * (GROUND_SIZE / 2 - 8); // Between 5 and ground edge with margin

        tree.position.x = Math.cos(angle) * radius;
        tree.position.z = Math.sin(angle) * radius;

        // Add slight random rotation and scale variation
        tree.rotation.y = Math.random() * Math.PI * 2;
        const scale = 0.8 + Math.random() * 0.4;
        tree.scale.set(scale, scale, scale);

        scene.add(tree);
        trees.push(tree);
    }

    return trees;
}

/**
 * Sets up scene lighting appropriate for a forest
 * @param {THREE.Scene} scene - The scene to add lights to
 * @returns {Object} - Lighting objects
 */
function setupLighting(scene) {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // Directional light for sun-like lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;

    scene.add(directionalLight);

    // Add subtle hemisphere light for sky color variation
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x567d46, 0.4);
    scene.add(hemisphereLight);

    return { ambientLight, directionalLight, hemisphereLight };
}
