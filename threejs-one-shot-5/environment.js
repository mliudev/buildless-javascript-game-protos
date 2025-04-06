import * as THREE from 'three';

// Constants
const FOREST_SIZE = 50;
const TREES_COUNT = 50;

export function createEnvironment() {
    const forestGroup = new THREE.Group();
    const colliders = [];

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(FOREST_SIZE, FOREST_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x228833,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    forestGroup.add(ground);
    colliders.push({
        type: 'plane',
        normal: new THREE.Vector3(0, 1, 0),
        position: new THREE.Vector3(0, 0, 0)
    });

    // Tree geometries (reusable)
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);

    // Tree materials
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x00AA00,
        roughness: 0.8
    });

    // Create trees
    for (let i = 0; i < TREES_COUNT; i++) {
        // Random position within forest boundaries, keeping some margin from the edge
        const x = (Math.random() - 0.5) * (FOREST_SIZE - 5);
        const z = (Math.random() - 0.5) * (FOREST_SIZE - 5);

        // Tree trunk
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;

        // Tree leaves
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, 3, z);
        leaves.castShadow = true;
        leaves.receiveShadow = true;

        forestGroup.add(trunk);
        forestGroup.add(leaves);

        // Add tree as a cylinder collider
        colliders.push({
            type: 'cylinder',
            position: new THREE.Vector3(x, 1, z),
            radius: 0.3,
            height: 2
        });
    }

    // Add a cabin
    const cabinGroup = new THREE.Group();

    // Cabin base
    const cabinBaseGeometry = new THREE.BoxGeometry(4, 2, 3);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
    const cabinBase = new THREE.Mesh(cabinBaseGeometry, cabinMaterial);
    cabinBase.position.set(-10, 1, -10);
    cabinBase.castShadow = true;
    cabinBase.receiveShadow = true;
    cabinGroup.add(cabinBase);

    // Cabin roof
    const roofGeometry = new THREE.ConeGeometry(3, 1.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(-10, 2.75, -10);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    cabinGroup.add(roof);

    forestGroup.add(cabinGroup);

    // Add cabin collider
    colliders.push({
        type: 'box',
        position: new THREE.Vector3(-10, 1, -10),
        width: 4,
        height: 2,
        depth: 3
    });

    return { forestGroup, colliders };
}
