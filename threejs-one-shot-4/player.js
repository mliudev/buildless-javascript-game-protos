import * as THREE from 'three';

// Player constants
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const GRAVITY = 9.8;
const JUMP_FORCE = 5;
const GROUND_FRICTION = 0.8;
const AIR_FRICTION = 0.05;

export function createPlayer(scene, camera) {
    // Create player object
    const player = {
        object: new THREE.Object3D(),
        height: PLAYER_HEIGHT,
        radius: PLAYER_RADIUS,
        velocity: new THREE.Vector3(0, 0, 0),
        isOnGround: false,
        jumpCooldown: 0,

        // Collision detection helpers
        raycaster: new THREE.Raycaster(),
        groundCheckRay: new THREE.Vector3(0, -1, 0),

        update,
        jump,
        applyForce
    };

    // Create player visual representation (capsule)
    createPlayerVisual(player.object);

    // Add player to scene
    scene.add(player.object);

    // Initial position (slightly above ground)
    player.object.position.set(0, 0.01, 0);

    return player;

    // Player methods
    function update(deltaTime) {
        // Apply gravity
        if (!player.isOnGround) {
            player.velocity.y -= GRAVITY * deltaTime;
        }

        // Apply friction
        const frictionFactor = player.isOnGround ? GROUND_FRICTION : AIR_FRICTION;
        player.velocity.x *= Math.pow(1 - frictionFactor, deltaTime * 60);
        player.velocity.z *= Math.pow(1 - frictionFactor, deltaTime * 60);

        // Update position based on velocity
        player.object.position.x += player.velocity.x * deltaTime;
        player.object.position.y += player.velocity.y * deltaTime;
        player.object.position.z += player.velocity.z * deltaTime;

        // Prevent falling below ground
        if (player.object.position.y < 0) {
            player.object.position.y = 0;
            player.velocity.y = 0;
            player.isOnGround = true;
        } else {
            // Check if player is on ground
            checkGround();
        }

        // Update jump cooldown
        if (player.jumpCooldown > 0) {
            player.jumpCooldown -= deltaTime;
        }

        // Update camera position to follow player
        if (camera) {
            camera.position.copy(player.object.position);
            camera.position.y += PLAYER_HEIGHT * 0.9; // Position camera at eye level
        }
    }

    function jump() {
        if (player.isOnGround && player.jumpCooldown <= 0) {
            player.velocity.y = JUMP_FORCE;
            player.isOnGround = false;
            player.jumpCooldown = 0.3; // 300ms cooldown
        }
    }

    function applyForce(force) {
        player.velocity.add(force);
    }

    function checkGround() {
        // Use raycaster to check if player is on ground
        player.raycaster.set(
            player.object.position,
            player.groundCheckRay
        );

        const intersects = player.raycaster.intersectObjects(scene.children, true);

        // If ray hits something within player height + small margin, player is on ground
        player.isOnGround = intersects.length > 0 &&
                          intersects[0].distance < PLAYER_HEIGHT * 0.1;
    }
}

// Create player visual as a group of meshes instead of merged geometry
function createPlayerVisual(parentObject) {
    // Create materials
    const playerMaterial = new THREE.MeshStandardMaterial({
        color: 0x3388ff,
        roughness: 0.7,
        metalness: 0.1
    });

    // Create cylinder for body
    const bodyHeight = PLAYER_HEIGHT - PLAYER_RADIUS * 2;
    const bodyGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, bodyHeight, 16);
    const bodyMesh = new THREE.Mesh(bodyGeometry, playerMaterial);
    bodyMesh.position.y = bodyHeight / 2;
    bodyMesh.castShadow = true;
    parentObject.add(bodyMesh);

    // Create sphere for head
    const headGeometry = new THREE.SphereGeometry(PLAYER_RADIUS, 16, 8);
    const headMesh = new THREE.Mesh(headGeometry, playerMaterial);
    headMesh.position.y = bodyHeight + PLAYER_RADIUS;
    headMesh.castShadow = true;
    parentObject.add(headMesh);

    // Create sphere for feet
    const feetGeometry = new THREE.SphereGeometry(PLAYER_RADIUS, 16, 8);
    const feetMesh = new THREE.Mesh(feetGeometry, playerMaterial);
    feetMesh.position.y = 0;
    feetMesh.castShadow = true;
    parentObject.add(feetMesh);
}
