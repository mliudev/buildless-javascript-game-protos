import * as THREE from 'three';

// Environment constants
const GROUND_SIZE = 50;
const FOREST_SIZE = 40;
const TREE_COUNT = 30;
const TREE_MIN_SCALE = 0.8;
const TREE_MAX_SCALE = 1.5;

class Environment {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];

        // Setup lighting
        this.setupLighting();

        // Create ground
        this.createGround();

        // Create forest
        this.createForest();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 10, 5);
        sunLight.castShadow = true;

        // Optimize shadow map
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;

        this.scene.add(sunLight);
    }

    createGround() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x447744,
            roughness: 0.9,
            metalness: 0.1,
        });

        // Create ground mesh and position it
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Ground collision box
        const groundCollider = new THREE.Box3().setFromObject(ground);
        this.colliders.push(groundCollider);
    }

    createForest() {
        // Geometry for tree trunks and foliage
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const foliageGeometry = new THREE.ConeGeometry(1, 2, 8);

        // Materials
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1,
        });

        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x228822,
            roughness: 0.9,
            metalness: 0,
        });

        // Create trees
        for (let i = 0; i < TREE_COUNT; i++) {
            // Random position within forest area
            const radius = FOREST_SIZE / 2 * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);

            // Random scale
            const scale = TREE_MIN_SCALE + Math.random() * (TREE_MAX_SCALE - TREE_MIN_SCALE);

            // Create tree group
            const tree = new THREE.Group();

            // Create trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.75 * scale;
            trunk.scale.set(scale, scale, scale);
            trunk.castShadow = true;
            tree.add(trunk);

            // Create foliage
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = (1.5 + 1) * scale;
            foliage.scale.set(scale, scale, scale);
            foliage.castShadow = true;
            tree.add(foliage);

            // Position tree
            tree.position.set(x, 0, z);
            this.scene.add(tree);

            // Add collision box for tree
            const treeCollider = new THREE.Box3();

            // Create a simplified collision box for the trunk only
            const trunkBox = new THREE.Box3().setFromObject(trunk);
            treeCollider.min.set(
                x - 0.3 * scale,
                0,
                z - 0.3 * scale
            );
            treeCollider.max.set(
                x + 0.3 * scale,
                1.5 * scale,
                z + 0.3 * scale
            );

            this.colliders.push(treeCollider);
        }
    }

    getColliders() {
        return this.colliders;
    }

    // Optional: Add fog
    addFog() {
        this.scene.fog = new THREE.FogExp2(0xcccccc, 0.02);
    }
}

export { Environment };
