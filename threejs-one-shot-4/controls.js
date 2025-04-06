import * as THREE from 'three';

// Controls state
const keys = {
    forward: false,  // W
    backward: false, // S
    left: false,     // A
    right: false,    // D
    jump: false      // Space
};

// Mouse control variables
const mouse = {
    x: 0,
    y: 0,
    movementX: 0,
    movementY: 0,
    isLocked: false
};

// Control constants
const MOUSE_SENSITIVITY = 0.002;
const MOVEMENT_SPEED = 4;

// References
let camera;
let player;
let canvas;

// Direction vector for movement calculations
const direction = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();

export function initControls(_camera, _canvas, _player) {
    camera = _camera;
    canvas = _canvas;
    player = _player;

    // Setup key event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Setup mouse lock for first person controls
    canvas.addEventListener('click', requestPointerLock);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    // Show instructions
    showInstructions();
}

export function updateControls() {
    if (!player || !camera || !mouse.isLocked) return;

    // Update camera rotation from mouse movement
    camera.rotation.y -= mouse.movementX * MOUSE_SENSITIVITY;
    camera.rotation.x -= mouse.movementY * MOUSE_SENSITIVITY;

    // Clamp vertical rotation to prevent flipping
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));

    // Reset mouse movement for next frame
    mouse.movementX = 0;
    mouse.movementY = 0;

    // Get movement direction from keys
    direction.x = Number(keys.right) - Number(keys.left);
    direction.z = Number(keys.backward) - Number(keys.forward);

    // Normalize direction vector to prevent faster diagonal movement
    if (direction.length() > 0) {
        direction.normalize();
    }

    // Calculate movement direction relative to camera orientation
    cameraDirection.set(0, 0, 1).applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

    const moveX = direction.x * MOVEMENT_SPEED;
    const moveZ = direction.z * MOVEMENT_SPEED;

    // Apply movement force to player
    if (moveX !== 0 || moveZ !== 0) {
        // Calculate force vector in world space
        const force = new THREE.Vector3();

        // Forward/backward movement (aligned with camera z-axis)
        if (moveZ !== 0) {
            // Remember: In Three.js, forward is -Z, backward is +Z
            force.x += cameraDirection.x * moveZ;
            force.z += cameraDirection.z * moveZ;
        }

        // Left/right movement (perpendicular to camera z-axis)
        if (moveX !== 0) {
            force.x += cameraDirection.z * moveX;
            force.z -= cameraDirection.x * moveX;
        }

        player.applyForce(force);
    }

    // Handle jumping
    if (keys.jump) {
        player.jump();
        keys.jump = false; // Require re-press for next jump
    }
}

// Key event handlers
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            keys.forward = true;
            break;
        case 'KeyS':
            keys.backward = true;
            break;
        case 'KeyA':
            keys.left = true;
            break;
        case 'KeyD':
            keys.right = true;
            break;
        case 'Space':
            keys.jump = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            keys.forward = false;
            break;
        case 'KeyS':
            keys.backward = false;
            break;
        case 'KeyA':
            keys.left = false;
            break;
        case 'KeyD':
            keys.right = false;
            break;
        case 'Space':
            keys.jump = false;
            break;
    }
}

// Mouse event handlers
function onMouseMove(event) {
    if (!mouse.isLocked) return;

    mouse.movementX += event.movementX;
    mouse.movementY += event.movementY;
}

function requestPointerLock() {
    canvas.requestPointerLock();
}

function onPointerLockChange() {
    if (document.pointerLockElement === canvas) {
        mouse.isLocked = true;
        hideInstructions();
    } else {
        mouse.isLocked = false;
        showInstructions();
    }
}

// UI instructions
function showInstructions() {
    let instructions = document.getElementById('instructions');

    if (!instructions) {
        instructions = document.createElement('div');
        instructions.id = 'instructions';
        instructions.style.position = 'absolute';
        instructions.style.top = '50%';
        instructions.style.left = '50%';
        instructions.style.transform = 'translate(-50%, -50%)';
        instructions.style.textAlign = 'center';
        instructions.style.color = 'white';
        instructions.style.backgroundColor = 'rgba(0,0,0,0.5)';
        instructions.style.padding = '20px';
        instructions.style.borderRadius = '5px';
        instructions.style.fontFamily = 'Arial, sans-serif';
        instructions.innerHTML = `
            <h2>Forest Explorer</h2>
            <p>Click to start exploring</p>
            <p>WASD - Move</p>
            <p>Mouse - Look around</p>
            <p>Space - Jump</p>
        `;
        document.body.appendChild(instructions);
    } else {
        instructions.style.display = 'block';
    }
}

function hideInstructions() {
    const instructions = document.getElementById('instructions');
    if (instructions) {
        instructions.style.display = 'none';
    }
}
