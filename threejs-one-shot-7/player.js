import * as THREE from 'three';

// Player constants
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const MOVEMENT_SPEED = 5;
const JUMP_FORCE = 8;
const GRAVITY = 20;
const FRICTION = 0.92;
const MOUSE_SENSITIVITY = 0.002;

// Player state
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const rotation = new THREE.Vector2();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let onGround = false;
let canJump = false;

export function createPlayer(scene) {
    // Create player mesh
    const geometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 4, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00, visible: false });
    const playerMesh = new THREE.Mesh(geometry, material);

    // Position the bottom of the player at y=0
    playerMesh.position.y = PLAYER_HEIGHT / 2;
    scene.add(playerMesh);

    return {
        mesh: playerMesh,
        height: PLAYER_HEIGHT,
        radius: PLAYER_RADIUS
    };
}

export function setupPlayerControls(camera, canvas) {
    // Set rotation order to prevent gimbal lock
    camera.rotation.order = 'YXZ';

    // Key event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Mouse control with pointer lock
    document.addEventListener('pointerlockchange', onPointerLockChange);
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    // Return a cleanup function
    return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
}

function onPointerLockChange() {
    if (document.pointerLockElement) {
        document.addEventListener('mousemove', onMouseMove);
    } else {
        document.removeEventListener('mousemove', onMouseMove);
    }
}

function onMouseMove(event) {
    // BOTH signs must be negative for intuitive controls
    rotation.y -= event.movementX * MOUSE_SENSITIVITY;
    rotation.x -= event.movementY * MOUSE_SENSITIVITY;

    // Clamp vertical rotation to avoid flipping
    rotation.x = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, rotation.x));
}

function onKeyDown(event) {
    switch(event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': if(canJump) { velocity.y = JUMP_FORCE; canJump = false; } break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

export function updatePlayer(player, camera, delta, checkCollisions) {
    // Apply gravity
    velocity.y -= GRAVITY * delta;

    // Calculate movement direction from input
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    // Get camera's forward and right vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    // Zero out Y component and normalize
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    // Calculate movement vector
    const moveX = right.multiplyScalar(direction.x);
    const moveZ = forward.multiplyScalar(direction.z);
    const movement = new THREE.Vector3().addVectors(moveX, moveZ);

    // Apply movement to velocity
    if (moveForward || moveBackward || moveLeft || moveRight) {
        velocity.x = movement.x * MOVEMENT_SPEED;
        velocity.z = movement.z * MOVEMENT_SPEED;
    } else {
        // Apply friction when not actively moving
        velocity.x *= FRICTION;
        velocity.z *= FRICTION;
    }

    // Calculate next position
    const nextPos = player.mesh.position.clone().add(velocity.clone().multiplyScalar(delta));

    // Check for collisions and adjust position
    const collisionResult = checkCollisions(player, nextPos);

    // Update player position
    player.mesh.position.copy(collisionResult.position);

    // Update player state based on collision
    onGround = collisionResult.onGround;
    canJump = onGround;

    if (onGround && velocity.y < 0) {
        velocity.y = 0;
    }

    // Update camera
    camera.position.x = player.mesh.position.x;
    camera.position.z = player.mesh.position.z;
    camera.position.y = player.mesh.position.y + player.height * 0.85 - player.height / 2;

    // Apply rotation to camera
    camera.rotation.y = rotation.y;
    camera.rotation.x = rotation.x;
}
