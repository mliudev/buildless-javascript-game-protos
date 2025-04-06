import * as THREE from 'three';

// Environment constants
export const WORLD_SIZE = 50;
export const TREE_COUNT = 40;
export const GRASS_COUNT = 100;
export const ROCK_COUNT = 20;

// Create terrain
export const createTerrain = (scene) => {
    const terrain = {
        objects: [],
        getHeight: (x, z) => getTerrainHeight(x, z)
    };

    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE * 2, WORLD_SIZE * 2, 32, 32);
    groundGeometry.rotateX(-Math.PI / 2);

    // Custom vertex manipulation for slight terrain variation
    const position = groundGeometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getZ(i);

        // Generate subtle height variations
        if (x !== 0 && z !== 0) { // Keep edges flat
            position.setY(i, getTerrainHeight(x, z));
        }
    }

    groundGeometry.computeVertexNormals();

    // Ground material
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d5e3a,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: false,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    scene.add(ground);

    terrain.ground = ground;

    // Create trees
    const treeGeometries = createTreeGeometries();
    addTrees(scene, terrain, treeGeometries);

    // Add rocks
    addRocks(scene, terrain);

    // Add grass
    addGrass(scene, terrain);

    return terrain;
};

// Create reusable tree geometries
function createTreeGeometries() {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    trunkGeometry.translate(0, 0.75, 0); // Move pivot to bottom

    // Tree top geometries - different types of trees
    const pineTopGeometry = new THREE.ConeGeometry(0.7, 2, 8);
    pineTopGeometry.translate(0, 2.5, 0); // Position on top of trunk

    const leafyTopGeometry = new THREE.SphereGeometry(1, 8, 6);
    leafyTopGeometry.scale(1, 0.8, 1); // Slightly flatten
    leafyTopGeometry.translate(0, 2.25, 0); // Position on top of trunk

    // Materials
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
    });

    const pineLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d4c1e,
        roughness: 0.8,
        metalness: 0
    });

    const leafyLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a7e3c,
        roughness: 0.8,
        metalness: 0
    });

    return {
        trunk: { geometry: trunkGeometry, material: trunkMaterial },
        pineTop: { geometry: pineTopGeometry, material: pineLeafMaterial },
        leafyTop: { geometry: leafyTopGeometry, material: leafyLeafMaterial }
    };
}

// Add trees to the scene
function addTrees(scene, terrain, treeGeometries) {
    for (let i = 0; i < TREE_COUNT; i++) {
        // Random position within the world bounds (keeping away from center)
        let x, z;
        do {
            x = (Math.random() * 2 - 1) * (WORLD_SIZE - 2);
            z = (Math.random() * 2 - 1) * (WORLD_SIZE - 2);
        } while (Math.abs(x) < 5 && Math.abs(z) < 5); // Keep away from center

        const treeGroup = new THREE.Group();
        const treeType = Math.random() > 0.5 ? 'pine' : 'leafy';
        const scale = 0.8 + Math.random() * 0.8; // Random scale

        // Create trunk
        const trunk = new THREE.Mesh(
            treeGeometries.trunk.geometry,
            treeGeometries.trunk.material
        );
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Create top based on tree type
        const top = new THREE.Mesh(
            treeType === 'pine' ? treeGeometries.pineTop.geometry : treeGeometries.leafyTop.geometry,
            treeType === 'pine' ? treeGeometries.pineTop.material : treeGeometries.leafyTop.material
        );
        top.castShadow = true;
        top.receiveShadow = true;
        treeGroup.add(top);

        // Scale tree
        treeGroup.scale.set(scale, scale, scale);

        // Position on terrain
        const y = getTerrainHeight(x, z);
        treeGroup.position.set(x, y, z);

        // Add to scene
        scene.add(treeGroup);

        // Add to collision objects
        terrain.objects.push({
            position: new THREE.Vector3(x, y, z),
            radius: 0.3 * scale, // Collision radius
            height: 3 * scale,
            collision: true
        });
    }
}

// Add rocks to the scene
function addRocks(scene, terrain) {
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c7c7c,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
    });

    for (let i = 0; i < ROCK_COUNT; i++) {
        // Random position
        const x = (Math.random() * 2 - 1) * (WORLD_SIZE - 2);
        const z = (Math.random() * 2 - 1) * (WORLD_SIZE - 2);
        const y = getTerrainHeight(x, z);

        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        // Random scale and rotation
        const scale = 0.2 + Math.random() * 0.4;
        rock.scale.set(
            scale * (0.8 + Math.random() * 0.4),
            scale * (0.7 + Math.random() * 0.6),
            scale * (0.8 + Math.random() * 0.4)
        );

        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Position
        rock.position.set(x, y + scale * 0.5, z);
        rock.castShadow = true;
        rock.receiveShadow = true;

        scene.add(rock);

        // Add to collision objects if it's a large rock
        if (scale > 0.3) {
            terrain.objects.push({
                position: new THREE.Vector3(x, y, z),
                radius: scale * 0.9,
                height: scale * 1.5,
                collision: true
            });
        }
    }
}

// Add grass patches
function addGrass(scene, terrain) {
    // Simple grass as merged instanced meshes for better performance
    const grassGeometry = new THREE.PlaneGeometry(1, 1);
    grassGeometry.rotateX(-Math.PI / 3); // Tilt slightly

    const grassMaterial = new THREE.MeshBasicMaterial({
        color: 0x5d8a4f,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.5
    });

    // Create a merged grass geometry for better performance
    const grassGroup = new THREE.Group();

    for (let i = 0; i < GRASS_COUNT; i++) {
        const x = (Math.random() * 2 - 1) * (WORLD_SIZE - 1);
        const z = (Math.random() * 2 - 1) * (WORLD_SIZE - 1);
        const y = getTerrainHeight(x, z);

        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        const scale = 0.3 + Math.random() * 0.4;
        grass.scale.set(scale, scale, scale);
        grass.position.set(x, y + 0.1, z);
        grass.rotation.y = Math.random() * Math.PI;

        grassGroup.add(grass);
    }

    scene.add(grassGroup);
}

// Generate consistent height for a given x,z coordinate
function getTerrainHeight(x, z) {
    // Simple noise function for demo purposes
    const frequency = 0.05;
    const amplitude = 0.5;

    // Pseudo-noise based on coordinates
    const noiseValue = Math.sin(x * frequency) * Math.cos(z * frequency) * amplitude;

    // Fade out towards edges
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    const edgeFade = Math.max(0, 1 - (distanceFromCenter / WORLD_SIZE));

    return noiseValue * edgeFade;
}

// Create sky
export const createSky = (scene) => {
    // Simple gradient sky
    const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `;

    const uniforms = {
        topColor: { value: new THREE.Color(0x6ca6ff) },
        bottomColor: { value: new THREE.Color(0xc9e8ff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
    };

    const skyGeometry = new THREE.SphereGeometry(WORLD_SIZE, 32, 32);
    skyGeometry.scale(-1, 1, 1); // Invert so material renders on inside

    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    return sky;
};

// Setup lighting
export const setupLighting = (scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x6b7e8f, 0.5);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(-5, 10, 7.5);
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
    directionalLight.shadow.bias = -0.001;

    scene.add(directionalLight);

    return { ambientLight, directionalLight };
};
