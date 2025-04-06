import * as THREE from 'three';

// Environment constants
const FOREST_SIZE = 50;
const TREE_COUNT = 20;
const GROUND_HEIGHT = 0;
const EPSILON = 0.001;

// Reusable geometries
let treeGeometry;
let leavesGeometry;

export function createEnvironment(scene) {
    // Create objects collection
    const objects = [];

    // Create ground
    const ground = createGround(scene);
    objects.push(ground);

    // Create trees
    const trees = createTrees(scene);
    objects.push(...trees);

    // Create fog for atmosphere
    scene.fog = new THREE.FogExp2(0x94b08c, 0.02);

    // Create lighting
    createLighting(scene);

    return {
        ground,
        trees,
        objects,
        forestSize: FOREST_SIZE
    };
}

function createGround(scene) {
    const groundGeometry = new THREE.PlaneGeometry(FOREST_SIZE, FOREST_SIZE, 1, 1);
    groundGeometry.rotateX(-Math.PI / 2);

    // Create textured material with a grass-like appearance
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b5323,
        roughness: 0.8,
        metalness: 0.1
    });

    // Create pattern using vertex colors
    const count = groundGeometry.attributes.position.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const x = groundGeometry.attributes.position.getX(i);
        const z = groundGeometry.attributes.position.getZ(i);

        // Add some color variation based on position
        const r = 0.2 + 0.05 * Math.sin(x * 0.5) * Math.sin(z * 0.5);
        const g = 0.35 + 0.1 * Math.cos(x * 0.25) * Math.cos(z * 0.5);
        const b = 0.1 + 0.05 * Math.sin(x * 0.35) * Math.cos(z * 0.1);

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
    }

    groundGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    groundMaterial.vertexColors = true;

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = GROUND_HEIGHT;
    ground.receiveShadow = true;
    scene.add(ground);

    return {
        mesh: ground,
        isGround: true,
        height: 0,
        type: 'ground'
    };
}

function createTrees(scene) {
    const trees = [];

    // Create reusable geometries
    treeGeometry = new THREE.CylinderGeometry(0.2, 0.4, 4, 8);
    leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);

    // Materials
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        metalness: 0.1
    });

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.8,
        metalness: 0.2
    });

    // Create trees
    for (let i = 0; i < TREE_COUNT; i++) {
        // Random position within forest bounds, but not at the center
        let x, z;
        do {
            x = (Math.random() - 0.5) * (FOREST_SIZE - 4);
            z = (Math.random() - 0.5) * (FOREST_SIZE - 4);
        } while (Math.sqrt(x*x + z*z) < 5); // Keep away from center

        // Create tree group
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x, 0, z);

        // Tree trunk
        const trunk = new THREE.Mesh(treeGeometry, trunkMaterial);
        trunk.position.y = 2; // Half of trunk height
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Tree leaves
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 5; // Position on top of trunk
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        treeGroup.add(leaves);

        scene.add(treeGroup);

        // Add collision object
        trees.push({
            mesh: treeGroup,
            radius: 0.8,
            height: 7,
            position: treeGroup.position,
            type: 'tree'
        });
    }

    return trees;
}

function createLighting(scene) {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffe5b5, 1);
    directionalLight.position.set(FOREST_SIZE/2, 30, FOREST_SIZE/2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -FOREST_SIZE/2;
    directionalLight.shadow.camera.right = FOREST_SIZE/2;
    directionalLight.shadow.camera.top = FOREST_SIZE/2;
    directionalLight.shadow.camera.bottom = -FOREST_SIZE/2;
    scene.add(directionalLight);
}

export function checkCollisions(player, nextPos) {
    // Default result assumes no collision
    const result = {
        position: nextPos.clone(),
        onGround: false
    };

    // Check ground collision
    if (nextPos.y - player.height/2 < GROUND_HEIGHT + EPSILON) {
        result.position.y = GROUND_HEIGHT + player.height/2 + EPSILON;
        result.onGround = true;
    }

    // Check forest boundaries
    const halfSize = FOREST_SIZE / 2 - player.radius;
    if (nextPos.x > halfSize) result.position.x = halfSize;
    if (nextPos.x < -halfSize) result.position.x = -halfSize;
    if (nextPos.z > halfSize) result.position.z = halfSize;
    if (nextPos.z < -halfSize) result.position.z = -halfSize;

    return result;
}

export function checkTreeCollisions(player, nextPos, trees) {
    for (const tree of trees) {
        const treePos = tree.position;

        // Calculate horizontal distance between player and tree
        const dx = nextPos.x - treePos.x;
        const dz = nextPos.z - treePos.z;
        const distance = Math.sqrt(dx*dx + dz*dz);

        // Check if player is colliding with tree (simplify tree as cylinder)
        if (distance < player.radius + tree.radius) {
            // Calculate collision normal
            const normal = new THREE.Vector3(dx, 0, dz).normalize();

            // Push the player away from the tree
            const pushDistance = player.radius + tree.radius - distance;
            nextPos.x += normal.x * pushDistance;
            nextPos.z += normal.z * pushDistance;
        }
    }

    return nextPos;
}
