import * as THREE from 'three';

// Camera rotation state
const cameraRotation = {
    horizontal: 0,
    vertical: 0,
    // Limit vertical rotation to prevent flipping
    verticalMin: -Math.PI / 2 + 0.1,
    verticalMax: Math.PI / 2 - 0.1
};

// Set up player controls
export function setupControls(player, renderer) {
    let pointerLock = false;

    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW':
                player.moveForward = true;
                break;
            case 'KeyS':
                player.moveBackward = true;
                break;
            case 'KeyA':
                player.moveLeft = true;
                break;
            case 'KeyD':
                player.moveRight = true;
                break;
            case 'Space':
                player.jumping = true;
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW':
                player.moveForward = false;
                break;
            case 'KeyS':
                player.moveBackward = false;
                break;
            case 'KeyA':
                player.moveLeft = false;
                break;
            case 'KeyD':
                player.moveRight = false;
                break;
            case 'Space':
                player.jumping = false;
                break;
        }
    });

    // Mouse look controls with error handling
    renderer.domElement.addEventListener('click', () => {
        if (!pointerLock) {
            try {
                renderer.domElement.requestPointerLock().catch(error => {
                    console.log('Pointer lock request failed: ', error);
                });
            } catch (error) {
                console.log('Pointer lock error: ', error);
            }
        }
    });

    document.addEventListener('pointerlockchange', () => {
        pointerLock = document.pointerLockElement === renderer.domElement;
    });

    document.addEventListener('pointerlockerror', (event) => {
        console.log('Pointer lock error:', event);
    });

    document.addEventListener('mousemove', (event) => {
        if (pointerLock) {
            try {
                // Update camera rotation based on mouse movement
                cameraRotation.horizontal -= event.movementX * 0.002;
                cameraRotation.vertical += event.movementY * 0.002;

                // Clamp vertical rotation to prevent flipping
                cameraRotation.vertical = Math.max(
                    cameraRotation.verticalMin,
                    Math.min(cameraRotation.verticalMax, cameraRotation.vertical)
                );
            } catch (error) {
                console.log('Mouse movement error: ', error);
            }
        }
    });

    return { pointerLock, cameraRotation };
}

// Update player movement based on inputs and camera orientation
export function updatePlayerMovement(player, speed, cameraRotation) {
    // Set up movement direction vectors based on camera orientation
    const cameraForward = new THREE.Vector3(
        Math.sin(cameraRotation.horizontal),
        0,
        Math.cos(cameraRotation.horizontal)
    ).normalize();

    const cameraRight = new THREE.Vector3(
        Math.sin(cameraRotation.horizontal + Math.PI/2),
        0,
        Math.cos(cameraRotation.horizontal + Math.PI/2)
    ).normalize();

    // Reset movement direction
    player.direction.set(0, 0, 0);

    // Apply movement based on key presses
    if (player.moveForward) player.direction.sub(cameraForward);
    if (player.moveBackward) player.direction.add(cameraForward);
    if (player.moveRight) player.direction.add(cameraRight);
    if (player.moveLeft) player.direction.sub(cameraRight);

    // Normalize movement direction if we have input
    if (player.direction.lengthSq() > 0) {
        player.direction.normalize();

        // Apply movement
        player.body.velocity.x = player.direction.x * speed;
        player.body.velocity.z = player.direction.z * speed;
    } else {
        // Gradually slow down when no input
        player.body.velocity.x *= 0.9;
        player.body.velocity.z *= 0.9;
    }

    // Handle jumping
    if (player.jumping) {
        player.tryJump();
        player.jumping = false;
    }
}

// Update camera based on player position and rotation
export function updateCamera(camera, player, cameraRotation, cameraDistance, cameraHeight) {
    // Calculate ideal camera position based on player position and camera rotation
    const offsetDistance = cameraDistance;
    const offsetHeight = cameraHeight;

    // Position camera based on rotation angles (spherical coordinates)
    const phi = cameraRotation.vertical; // Vertical angle
    const theta = cameraRotation.horizontal; // Horizontal angle

    // Camera position in local space
    const cameraLocalOffset = new THREE.Vector3(
        offsetDistance * Math.sin(theta) * Math.cos(phi),
        offsetDistance * Math.sin(phi) + offsetHeight,
        offsetDistance * Math.cos(theta) * Math.cos(phi)
    );

    // Add player position to get world space
    const targetPosition = player.group.position.clone();
    targetPosition.y += 1; // Aim at player's head

    // Set camera position and look at player
    camera.position.copy(player.group.position).add(cameraLocalOffset);
    camera.lookAt(targetPosition);
}

export { cameraRotation };
