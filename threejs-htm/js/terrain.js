import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { WORLD_SIZE, GROUND_LEVEL } from './constants.js';

// Create the ground plane
export function createGround(scene, world, groundMaterial, groundTexture) {
    // Create ground geometry
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 64, 64);
    groundGeometry.rotateX(-Math.PI / 2);

    // Flat ground with detailed texture
    const groundMeshMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(groundTexture),
        roughness: 0.8,
        metalness: 0.1,
        color: 0x547c53, // Darker green to add depth
    });

    // Set texture properties
    groundMeshMaterial.map.wrapS = groundMeshMaterial.map.wrapT = THREE.RepeatWrapping;
    groundMeshMaterial.map.repeat.set(25, 25);

    // Create ground mesh exactly at ground level
    const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
    ground.position.y = GROUND_LEVEL;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create physics for ground - explicitly at ground level
    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
        material: groundMaterial,
        position: new CANNON.Vec3(0, GROUND_LEVEL, 0)
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    return { mesh: ground, body: groundBody };
}

// Create a tree at the specified position
export function createTree(scene, world, position, barkTexture) {
    // Height variation
    const trunkHeight = 2 + Math.random() * 2;

    // Ensure the position is at ground level
    const groundPosition = new THREE.Vector3(position.x, GROUND_LEVEL, position.z);

    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(barkTexture),
        roughness: 0.9,
        metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.copy(groundPosition);
    // Position trunk so its bottom is exactly on the ground
    trunk.position.y = GROUND_LEVEL + trunkHeight/2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    // Create leaves
    const leavesGeometry = new THREE.SphereGeometry(1 + Math.random() * 0.5, 8, 8);

    // Create a noise-based color variation for leaves
    const leafColor = new THREE.Color().setHSL(
        0.3 + Math.random() * 0.1, // green hue with variation
        0.6 + Math.random() * 0.2, // saturation
        0.35 + Math.random() * 0.15 // lightness
    );

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: leafColor,
        roughness: 1,
        metalness: 0.1,
        flatShading: true
    });

    // Add some randomization to the leaf geometry
    const vertices = leavesGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i] += (Math.random() - 0.5) * 0.2;
        vertices[i + 1] += (Math.random() - 0.5) * 0.2;
        vertices[i + 2] += (Math.random() - 0.5) * 0.2;
    }
    leavesGeometry.computeVertexNormals();

    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = trunkHeight - 0.5; // Place leaves at top of trunk
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    trunk.add(leaves);

    // Add a grass/dirt mound at the base for better grounding
    const moundGeometry = new THREE.CircleGeometry(0.8, 16);
    const moundMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 1,
        metalness: 0
    });
    const mound = new THREE.Mesh(moundGeometry, moundMaterial);
    mound.rotation.x = -Math.PI/2; // Rotate to lie flat
    mound.position.y = 0.01; // Slightly above ground to avoid z-fighting
    trunk.add(mound);

    // Create physics for trunk
    const trunkBody = new CANNON.Body({
        mass: 0, // Static
        shape: new CANNON.Cylinder(0.2, 0.4, trunkHeight, 8),
        position: new CANNON.Vec3(groundPosition.x, GROUND_LEVEL + trunkHeight/2, groundPosition.z),
    });
    trunkBody.shapeOrientations[0].setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    world.addBody(trunkBody);

    scene.add(trunk);

    return { mesh: trunk, body: trunkBody };
}

// Create a rock at the specified position
export function createRock(scene, world, position) {
    // Random scale for variety
    const scale = 0.5 + Math.random() * 1.5;

    // Ensure the position is at ground level
    const groundPosition = new THREE.Vector3(position.x, GROUND_LEVEL, position.z);

    // Create rock geometry
    const rockGeometry = new THREE.SphereGeometry(scale, 6, 6);
    // Add random deformation for natural look
    const vertices = rockGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i] += (Math.random() - 0.5) * 0.3 * scale;
        vertices[i + 1] += (Math.random() - 0.5) * 0.3 * scale;
        vertices[i + 2] += (Math.random() - 0.5) * 0.3 * scale;
    }
    rockGeometry.computeVertexNormals();

    // Create rock material
    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x777788,
        roughness: 0.9,
        metalness: 0.1,
    });

    // Create rock mesh
    const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
    rockMesh.position.copy(groundPosition);
    // Position the rock so it's partially embedded in the ground
    rockMesh.position.y = GROUND_LEVEL + scale * 0.7; // Embed 30% in the ground
    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;

    // Add a small dirt circle at the base for better grounding
    const baseGeometry = new THREE.CircleGeometry(scale * 1.1, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 1,
        metalness: 0
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = -Math.PI/2; // Rotate to lie flat
    base.position.y = -scale * 0.7 + 0.02; // Position at the bottom of the rock
    rockMesh.add(base);

    scene.add(rockMesh);

    // Create rock physics
    const rockBody = new CANNON.Body({
        mass: 0, // Static
        shape: new CANNON.Sphere(scale * 0.8),
        position: new CANNON.Vec3(groundPosition.x, GROUND_LEVEL + scale * 0.7, groundPosition.z),
    });
    world.addBody(rockBody);

    return { mesh: rockMesh, body: rockBody };
}

// Create multiple trees in the world
export function createTrees(scene, world, count, barkTexture) {
    const trees = [];
    for (let i = 0; i < count; i++) {
        // Random position, avoiding the center where the player starts
        let x, z;
        do {
            x = (Math.random() - 0.5) * (WORLD_SIZE - 10);
            z = (Math.random() - 0.5) * (WORLD_SIZE - 10);
        } while (Math.sqrt(x * x + z * z) < 10);

        trees.push(createTree(scene, world, new THREE.Vector3(x, 0, z), barkTexture));
    }
    return trees;
}

// Create multiple rocks in the world
export function createRocks(scene, world, count) {
    const rocks = [];
    for (let i = 0; i < count; i++) {
        // Random position, avoiding the center where the player starts
        let x, z;
        do {
            x = (Math.random() - 0.5) * (WORLD_SIZE - 10);
            z = (Math.random() - 0.5) * (WORLD_SIZE - 10);
        } while (Math.sqrt(x * x + z * z) < 10);

        rocks.push(createRock(scene, world, new THREE.Vector3(x, 0, z)));
    }
    return rocks;
}
