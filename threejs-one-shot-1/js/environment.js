import * as THREE from 'three';
import {
    WORLD_SIZE,
    GROUND_LEVEL,
    TREE_COUNT,
    BUSH_COUNT,
    GRASS_PATCH_COUNT,
    ARTIFACT_COUNT,
    COLORS,
    ARTIFACT_LIGHT_INTENSITY,
    ARTIFACT_LIGHT_DISTANCE
} from './constants.js';
import {
    createGroundTexture,
    createBarkTexture,
    createLeavesTexture,
    createArtifactTexture,
    getRandomPosition,
    generateHeightField
} from './utils.js';

// Create terrain ground
export function createGround(scene) {
    // Generate ground texture
    const groundTexture = createGroundTexture();

    // Create large plane for ground
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 64, 64);
    groundGeometry.rotateX(-Math.PI / 2); // Rotate to be flat on xz plane

    // Create material with the generated texture
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });

    // Create mesh and add to scene
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.y = GROUND_LEVEL;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Generate height field for terrain variations
    const heightFieldSize = 50; // Resolution of height field
    const heightField = generateHeightField(heightFieldSize, 1.5);

    return {
        mesh: groundMesh,
        heightField: heightField,
        heightFieldSize: heightFieldSize
    };
}

// Create a tree
export function createTree(scene, position, scale = 1) {
    // Create a group for the tree
    const treeGroup = new THREE.Group();

    // Generate tree trunk
    const trunkHeight = 3 * scale + Math.random() * 2 * scale;
    const trunkRadius = 0.2 * scale + Math.random() * 0.2 * scale;
    const trunkGeometry = new THREE.CylinderGeometry(
        trunkRadius * 0.7, // Top radius slightly smaller
        trunkRadius,       // Bottom radius
        trunkHeight,
        8,                 // Radial segments
        4                  // Height segments
    );

    // Create bark material with procedural texture
    const barkTexture = createBarkTexture();
    const trunkMaterial = new THREE.MeshStandardMaterial({
        map: barkTexture,
        roughness: 0.9,
        metalness: 0.1
    });

    // Create trunk mesh
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;

    // Position trunk bottom at ground level
    trunkMesh.position.y = trunkHeight / 2;
    treeGroup.add(trunkMesh);

    // Generate tree foliage (multiple layers of leaves)
    const leavesTexture = createLeavesTexture();
    const leavesMaterial = new THREE.MeshStandardMaterial({
        map: leavesTexture,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide,
        alphaTest: 0.2
    });

    // Add 2-3 layers of leaves
    const leafLayers = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < leafLayers; i++) {
        const layerHeight = trunkHeight * 0.6 + (i * trunkHeight * 0.15);
        const layerRadius = trunkRadius * 5 * (1 - i * 0.2);

        // Randomize leaf shape
        let leafGeometry;
        const shapeType = Math.floor(Math.random() * 3);

        switch (shapeType) {
            case 0: // Cone
                leafGeometry = new THREE.ConeGeometry(
                    layerRadius,
                    trunkHeight * 0.6,
                    8,
                    1,
                    true
                );
                break;
            case 1: // Sphere
                leafGeometry = new THREE.SphereGeometry(
                    layerRadius,
                    8,
                    6,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI / 2
                );
                break;
            case 2: // Cylinder
            default:
                leafGeometry = new THREE.CylinderGeometry(
                    layerRadius * 0.8,
                    layerRadius,
                    trunkHeight * 0.4,
                    8,
                    1
                );
                break;
        }

        // Create leaves mesh
        const leavesMesh = new THREE.Mesh(leafGeometry, leavesMaterial);
        leavesMesh.castShadow = true;
        leavesMesh.position.y = layerHeight;

        // Randomize rotation for variety
        leavesMesh.rotation.y = Math.random() * Math.PI * 2;

        treeGroup.add(leavesMesh);
    }

    // Position tree at specified location
    treeGroup.position.copy(position);

    // Add some random rotation for variety
    treeGroup.rotation.y = Math.random() * Math.PI * 2;

    // Add the tree to the scene
    scene.add(treeGroup);

    return treeGroup;
}

// Create a small bush
export function createBush(scene, position, scale = 1) {
    // Create a group for the bush
    const bushGroup = new THREE.Group();

    // Create bush foliage
    const bushRadius = 0.5 * scale + Math.random() * 0.3 * scale;
    const bushGeometry = new THREE.SphereGeometry(bushRadius, 8, 6);

    // Use the same leaves texture as trees but with different color tint
    const leavesTexture = createLeavesTexture();
    const bushMaterial = new THREE.MeshStandardMaterial({
        map: leavesTexture,
        roughness: 0.9,
        metalness: 0.1,
        color: new THREE.Color(COLORS.BUSH)
    });

    // Create the main bush mesh
    const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);
    bushMesh.castShadow = true;
    bushMesh.receiveShadow = true;

    // Position bush so bottom is at ground level
    bushMesh.position.y = bushRadius;
    bushGroup.add(bushMesh);

    // Add 1-3 smaller foliage clusters for shape variety
    const clusterCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < clusterCount; i++) {
        const clusterRadius = bushRadius * (0.5 + Math.random() * 0.3);
        const clusterGeometry = new THREE.SphereGeometry(clusterRadius, 6, 4);
        const clusterMesh = new THREE.Mesh(clusterGeometry, bushMaterial);

        // Position cluster randomly around the main bush
        const angle = Math.random() * Math.PI * 2;
        const distance = bushRadius * 0.7;
        clusterMesh.position.x = Math.cos(angle) * distance;
        clusterMesh.position.z = Math.sin(angle) * distance;
        clusterMesh.position.y = bushRadius * 0.8;

        clusterMesh.castShadow = true;
        clusterMesh.receiveShadow = true;
        bushGroup.add(clusterMesh);
    }

    // Position bush at specified location
    bushGroup.position.copy(position);

    // Add the bush to the scene
    scene.add(bushGroup);

    return bushGroup;
}

// Create a grass patch
export function createGrassPatch(scene, position, scale = 1) {
    // Create a group for the grass
    const grassGroup = new THREE.Group();

    // Number of grass blades
    const bladeCount = Math.floor(Math.random() * 5) + 5;

    // Create grass material
    const grassMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.GRASS,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    // Create multiple grass blades
    for (let i = 0; i < bladeCount; i++) {
        // Random blade height and width
        const bladeHeight = (0.3 + Math.random() * 0.7) * scale;
        const bladeWidth = (0.05 + Math.random() * 0.05) * scale;

        // Create a simple plane for each blade
        const bladeGeometry = new THREE.PlaneGeometry(bladeWidth, bladeHeight);
        const bladeMesh = new THREE.Mesh(bladeGeometry, grassMaterial);

        // Position randomly within the patch
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.5 * scale;
        bladeMesh.position.x = Math.cos(angle) * distance;
        bladeMesh.position.z = Math.sin(angle) * distance;

        // Position bottom of blade at ground level
        bladeMesh.position.y = bladeHeight / 2;

        // Random rotation
        bladeMesh.rotation.y = Math.random() * Math.PI;

        // Slight random tilt
        bladeMesh.rotation.x = (Math.random() * 0.2) - 0.1;
        bladeMesh.rotation.z = (Math.random() * 0.2) - 0.1;

        bladeMesh.castShadow = true;
        bladeMesh.receiveShadow = true;
        grassGroup.add(bladeMesh);
    }

    // Position grass at specified location
    grassGroup.position.copy(position);

    // Add the grass to the scene
    scene.add(grassGroup);

    return grassGroup;
}

// Create a glowing artifact
export function createArtifact(scene, position) {
    // Create a group for the artifact
    const artifactGroup = new THREE.Group();

    // Create crystal geometry
    const artifactGeometry = new THREE.OctahedronGeometry(0.5, 1);

    // Create crystal material with glow effect
    const artifactTexture = createArtifactTexture();
    const artifactMaterial = new THREE.MeshStandardMaterial({
        map: artifactTexture,
        emissive: COLORS.ARTIFACT,
        emissiveMap: artifactTexture,
        emissiveIntensity: 0.8,
        transparent: true,
        roughness: 0.2,
        metalness: 0.9
    });

    // Create artifact mesh
    const artifactMesh = new THREE.Mesh(artifactGeometry, artifactMaterial);
    artifactMesh.castShadow = true;

    // Add light source to create glow effect
    const artifactLight = new THREE.PointLight(
        COLORS.ARTIFACT,
        ARTIFACT_LIGHT_INTENSITY,
        ARTIFACT_LIGHT_DISTANCE
    );
    artifactLight.position.set(0, 0, 0);
    artifactGroup.add(artifactLight);

    // Position crystal slightly above the ground
    artifactMesh.position.y = 1;
    artifactGroup.add(artifactMesh);

    // Animation state for floating and rotation
    const animationState = {
        rotationSpeed: 0.5 + Math.random() * 0.5,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatHeight: 0.2 + Math.random() * 0.2,
        initialY: 1,
        collected: false
    };

    // Position artifact at specified location
    artifactGroup.position.copy(position);

    // Add the artifact to the scene
    scene.add(artifactGroup);

    // Return mesh and animation state
    return {
        group: artifactGroup,
        mesh: artifactMesh,
        light: artifactLight,
        animation: animationState,
        collected: false,

        // Update artifact animation
        update: function(time) {
            if (this.collected) return;

            // Rotate artifact
            this.mesh.rotation.y += this.animation.rotationSpeed * 0.01;

            // Float up and down
            const floatOffset = Math.sin(time * this.animation.floatSpeed) * this.animation.floatHeight;
            this.mesh.position.y = this.animation.initialY + floatOffset;

            // Pulse light intensity
            this.light.intensity = ARTIFACT_LIGHT_INTENSITY * (0.8 + Math.sin(time * 2) * 0.2);
        },

        // Handle collection
        collect: function() {
            if (this.collected) return false;

            this.collected = true;

            // Create collection animation
            const duration = 500; // ms
            const startTime = Date.now();
            const startScale = this.mesh.scale.x;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Scale down and fade out
                const scale = startScale * (1 - progress);
                this.mesh.scale.set(scale, scale, scale);

                this.light.intensity = ARTIFACT_LIGHT_INTENSITY * (1 - progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    scene.remove(this.group);
                }
            };

            animate();

            return true;
        }
    };
}

// Create the entire forest environment
export function createForest(scene) {
    // Create ground
    const ground = createGround(scene);

    // Create trees
    const trees = [];
    for (let i = 0; i < TREE_COUNT; i++) {
        // Get random position
        const radius = 5 + Math.random() * (WORLD_SIZE / 2 - 10);
        const angle = Math.random() * Math.PI * 2;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Random scale for variety
        const scale = 0.7 + Math.random() * 0.6;

        const tree = createTree(scene, new THREE.Vector3(x, GROUND_LEVEL, z), scale);
        trees.push(tree);
    }

    // Create bushes
    const bushes = [];
    for (let i = 0; i < BUSH_COUNT; i++) {
        // Random position
        const radius = 3 + Math.random() * (WORLD_SIZE / 2 - 8);
        const angle = Math.random() * Math.PI * 2;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Random scale
        const scale = 0.5 + Math.random() * 0.8;

        const bush = createBush(scene, new THREE.Vector3(x, GROUND_LEVEL, z), scale);
        bushes.push(bush);
    }

    // Create grass patches
    const grassPatches = [];
    for (let i = 0; i < GRASS_PATCH_COUNT; i++) {
        // Random position
        const radius = Math.random() * (WORLD_SIZE / 2 - 5);
        const angle = Math.random() * Math.PI * 2;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Random scale
        const scale = 0.8 + Math.random() * 0.7;

        const grass = createGrassPatch(scene, new THREE.Vector3(x, GROUND_LEVEL, z), scale);
        grassPatches.push(grass);
    }

    // Create artifacts
    const artifacts = [];
    for (let i = 0; i < ARTIFACT_COUNT; i++) {
        // Position artifacts in semi-random locations that players can find
        const radius = 15 + (i * 10) + Math.random() * 10;
        const angle = (i / ARTIFACT_COUNT) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const artifact = createArtifact(scene, new THREE.Vector3(x, GROUND_LEVEL, z));
        artifacts.push(artifact);
    }

    return {
        ground: ground,
        trees: trees,
        bushes: bushes,
        grassPatches: grassPatches,
        artifacts: artifacts,

        // Update method for animations
        update: function(time) {
            // Update artifacts
            for (const artifact of this.artifacts) {
                if (!artifact.collected) {
                    artifact.update(time);
                }
            }
        },

        // Check if player collected an artifact
        checkArtifactCollection: function(playerPosition, collectionRadius = 2) {
            let collected = false;

            for (const artifact of this.artifacts) {
                if (artifact.collected) continue;

                // Calculate distance to player
                const artifactPosition = artifact.group.position;
                const distance = playerPosition.distanceTo(artifactPosition);

                // If player is close enough, collect the artifact
                if (distance < collectionRadius) {
                    artifact.collect();
                    collected = true;
                }
            }

            return collected;
        },

        // Get count of remaining artifacts
        getRemainingArtifacts: function() {
            return this.artifacts.filter(a => !a.collected).length;
        }
    };
}
