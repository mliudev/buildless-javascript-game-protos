import * as THREE from 'three';

// Constants
const MOVE_SPEED = 5;
const GRAVITY = 20;
const JUMP_FORCE = 10;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;

// Key states
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
};

// Mouse movement
let mouseSensitivity = 0.002;
let locked = false;

export function createPlayer(camera) {
    // Create player mesh (capsule)
    const geometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.y = PLAYER_HEIGHT / 2;

    // Set up pointer lock controls
    document.addEventListener('click', () => {
        if (!locked) {
            document.body.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        locked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (event) => {
        if (locked) {
            camera.rotation.y -= event.movementX * mouseSensitivity;
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
                camera.rotation.x - event.movementY * mouseSensitivity));
        }
    });

    // Key press handlers
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyW': keys.forward = true; break;
            case 'KeyS': keys.backward = true; break;
            case 'KeyA': keys.left = true; break;
            case 'KeyD': keys.right = true; break;
            case 'Space': keys.jump = true; break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'KeyW': keys.forward = false; break;
            case 'KeyS': keys.backward = false; break;
            case 'KeyA': keys.left = false; break;
            case 'KeyD': keys.right = false; break;
            case 'Space': keys.jump = false; break;
        }
    });

    // Player state
    return {
        mesh,
        velocity: new THREE.Vector3(0, 0, 0),
        onGround: false,
        height: PLAYER_HEIGHT,
        radius: PLAYER_RADIUS
    };
}

export function updatePlayer(player, camera, deltaTime) {
    // Get the camera's forward and right directions (with y component zeroed)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    // Reset movement vector
    const movement = new THREE.Vector3(0, 0, 0);

    // Add movement based on keys
    if (keys.forward) movement.add(forward.clone().multiplyScalar(MOVE_SPEED * deltaTime));
    if (keys.backward) movement.add(forward.clone().multiplyScalar(-MOVE_SPEED * deltaTime));
    if (keys.left) movement.add(right.clone().multiplyScalar(-MOVE_SPEED * deltaTime));
    if (keys.right) movement.add(right.clone().multiplyScalar(MOVE_SPEED * deltaTime));

    // Apply movement to velocity
    player.velocity.x += movement.x;
    player.velocity.z += movement.z;

    // Apply jumping
    if (keys.jump && player.onGround) {
        player.velocity.y = JUMP_FORCE;
        player.onGround = false;
    }

    // Update camera position (eye height slightly below top of capsule)
    camera.position.set(
        player.mesh.position.x,
        player.mesh.position.y + player.height / 2 - 0.1,
        player.mesh.position.z
    );

    // Apply friction to horizontal velocity
    player.velocity.x *= 0.9;
    player.velocity.z *= 0.9;
}
