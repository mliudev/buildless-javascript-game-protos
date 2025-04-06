import * as THREE from 'three';

// Environment constants
const WORLD_SIZE = 50;
const TREE_COUNT = 8;
const TREE_MIN_SCALE = 0.8;
const TREE_MAX_SCALE = 1.2;

export function createEnvironment(scene) {
    // Create lighting
    createLighting(scene);

    // Create ground
    createGround(scene);

    // Create trees
    createTrees(scene);

    return scene;
}

function createLighting(scene) {
    // Ambient light for overall scene brightness
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffeecc, 0.8);
    directionalLight.position.set(1, 3, 2);
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    scene.add(directionalLight);
}

function createGround(scene) {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 10, 10);

    // Create ground texture
    const textureSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#2D5E2D';
    ctx.fillRect(0, 0, textureSize, textureSize);

    // Add some noise/variations
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * textureSize;
        const y = Math.random() * textureSize;
        const size = 0.5 + Math.random() * 1.5;

        ctx.fillStyle = Math.random() > 0.5 ? '#1F4E1F' : '#3B6E3B';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Create texture from canvas
    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);

    // Create ground material
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.9,
        metalness: 0.1
    });

    // Create ground mesh
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to horizontal
    ground.receiveShadow = true;

    scene.add(ground);
}

function createTrees(scene) {
    // Create tree materials
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8,
        metalness: 0
    });

    // Place trees randomly around the scene
    for (let i = 0; i < TREE_COUNT; i++) {
        createTree(scene, trunkMaterial, leafMaterial);
    }
}

function createTree(scene, trunkMaterial, leafMaterial) {
    // Create tree group
    const tree = new THREE.Group();

    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75; // Half of trunk height
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Create foliage (2 cones stacked for fuller look)
    const treeGeometry = new THREE.ConeGeometry(0.7, 2, 8);
    const foliage1 = new THREE.Mesh(treeGeometry, leafMaterial);
    foliage1.position.y = 2.5;
    foliage1.castShadow = true;
    foliage1.receiveShadow = true;
    tree.add(foliage1);

    const foliage2 = new THREE.Mesh(treeGeometry, leafMaterial);
    foliage2.position.y = 3.1; // 2.5 + 0.6
    foliage2.scale.set(0.8, 0.7, 0.8);
    foliage2.castShadow = true;
    foliage2.receiveShadow = true;
    tree.add(foliage2);

    // Random position within world bounds
    const x = (Math.random() - 0.5) * (WORLD_SIZE - 5);
    const z = (Math.random() - 0.5) * (WORLD_SIZE - 5);

    // Random scale
    const scale = TREE_MIN_SCALE + Math.random() * (TREE_MAX_SCALE - TREE_MIN_SCALE);

    // Apply transformations
    tree.position.set(x, 0, z);
    tree.scale.set(scale, scale, scale);

    // Add to scene
    scene.add(tree);

    return tree;
}
