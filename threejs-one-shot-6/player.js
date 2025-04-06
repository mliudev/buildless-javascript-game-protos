import * as THREE from 'three';

// Player constants
export const PLAYER_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.3;
export const PLAYER_MASS = 80;
export const PLAYER_SPEED = 15.0;
export const PLAYER_JUMP_FORCE = 8.0;
export const GRAVITY = 20.0;
export const MOUSE_SENSITIVITY = 0.002;
export const FRICTION = 0.92;

// Player state
export const createPlayer = (scene) => {
    // Create player mesh
    const geometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 4, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00, visible: false }); // Invisible in first-person
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = PLAYER_HEIGHT / 2; // Position from bottom
    mesh.castShadow = true;
    scene.add(mesh);

    // Player state
    const player = {
        mesh,
        velocity: new THREE.Vector3(),
        onGround: false,
        keys: {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        },
        mouseX: 0,
        mouseY: 0
    };

    return player;
};

// Movement and physics
export const updatePlayer = (player, camera, terrain, deltaTime) => {
    // Apply gravity if not on ground
    if (!player.onGround) {
        player.velocity.y -= GRAVITY * deltaTime;
    }

    // Handle jumping
    if (player.keys.jump && player.onGround) {
        player.velocity.y = PLAYER_JUMP_FORCE;
        player.onGround = false;
    }

    // Get movement direction from camera
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    // Zero out Y component and normalize
    forward.y = 0;
    forward.normalize();
    right.y = 0;
    right.normalize();

    // Calculate movement vector
    const moveDirection = new THREE.Vector3(0, 0, 0);
    if (player.keys.forward) moveDirection.add(forward);
    if (player.keys.backward) moveDirection.sub(forward);
    if (player.keys.right) moveDirection.add(right);
    if (player.keys.left) moveDirection.sub(right);

    // Normalize movement vector if it's not zero
    if (moveDirection.lengthSq() > 0) {
        moveDirection.normalize();

        // Apply movement to velocity
        player.velocity.x += moveDirection.x * PLAYER_SPEED * deltaTime;
        player.velocity.z += moveDirection.z * PLAYER_SPEED * deltaTime;
    }

    // Apply friction to horizontal movement
    player.velocity.x *= FRICTION;
    player.velocity.z *= FRICTION;

    // Calculate next position using temporary vector
    const nextPos = new THREE.Vector3().copy(player.mesh.position);
    nextPos.x += player.velocity.x * deltaTime;
    nextPos.y += player.velocity.y * deltaTime;
    nextPos.z += player.velocity.z * deltaTime;

    // Ground collision detection
    const groundHeight = getGroundHeight(nextPos.x, nextPos.z, terrain);
    const bottomY = nextPos.y - PLAYER_HEIGHT / 2;

    if (bottomY < groundHeight) {
        // Player is below ground, correct position
        nextPos.y = groundHeight + PLAYER_HEIGHT / 2 + 0.001; // Add small epsilon
        player.velocity.y = 0;
        player.onGround = true;
    } else {
        // Check if player should still be considered on ground (small distance tolerance)
        player.onGround = (bottomY - groundHeight < 0.1);
    }

    // Collision with objects (trees, etc)
    handleObjectCollisions(nextPos, player, terrain);

    // Update player mesh position
    player.mesh.position.copy(nextPos);

    // Update camera position to follow player
    const eyeHeight = PLAYER_HEIGHT * 0.85;
    camera.position.x = player.mesh.position.x;
    camera.position.y = player.mesh.position.y + eyeHeight - PLAYER_HEIGHT / 2;
    camera.position.z = player.mesh.position.z;

    // Update camera rotation based on mouse
    camera.rotation.x = player.mouseY;
    camera.rotation.y = player.mouseX;
};

// Input handlers
export const setupPlayerControls = (player, camera) => {
    // Set proper camera rotation order to prevent gimbal lock
    camera.rotation.order = 'YXZ';

    // Keyboard controls
    window.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW': player.keys.forward = true; break;
            case 'KeyS': player.keys.backward = true; break;
            case 'KeyA': player.keys.left = true; break;
            case 'KeyD': player.keys.right = true; break;
            case 'Space': player.keys.jump = true; break;
        }
    });

    window.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW': player.keys.forward = false; break;
            case 'KeyS': player.keys.backward = false; break;
            case 'KeyA': player.keys.left = false; break;
            case 'KeyD': player.keys.right = false; break;
            case 'Space': player.keys.jump = false; break;
        }
    });

    // Mouse controls
    const canvas = document.getElementById('canvas');

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            document.addEventListener('mousemove', handleMouseMove);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
        }
    });

    function handleMouseMove(event) {
        player.mouseX -= event.movementX * MOUSE_SENSITIVITY; // Invert X axis
        player.mouseY -= event.movementY * MOUSE_SENSITIVITY; // Invert Y axis

        // Clamp vertical look to avoid flipping
        player.mouseY = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, player.mouseY));
    }
};

// Helper functions
function getGroundHeight(x, z, terrain) {
    // Use the terrain's height function if available
    if (terrain && terrain.getHeight) {
        return terrain.getHeight(x, z);
    }
    return 0; // Default to flat ground if terrain not yet loaded
}

function handleObjectCollisions(nextPos, player, terrain) {
    if (!terrain.objects) return;

    // Simple collision detection with trees and other objects
    for (const obj of terrain.objects) {
        if (!obj.collision) continue;

        const dx = nextPos.x - obj.position.x;
        const dz = nextPos.z - obj.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < PLAYER_RADIUS + obj.radius) {
            // Collision detected, push player away
            const pushDirection = new THREE.Vector3(dx, 0, dz).normalize();
            const pushDistance = PLAYER_RADIUS + obj.radius - distance;

            nextPos.x += pushDirection.x * pushDistance;
            nextPos.z += pushDirection.z * pushDistance;
        }
    }
}
