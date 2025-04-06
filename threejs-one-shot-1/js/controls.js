import * as THREE from 'three';
import { IS_MOBILE, CAMERA_SENSITIVITY, MOBILE_CAMERA_SENSITIVITY } from './constants.js';

// Set up keyboard and mouse controls for desktop
export function setupDesktopControls(player, camera) {
    const keyStates = {};
    let pointerLocked = false;

    // Set proper camera rotation order to prevent gimbal lock
    camera.rotation.order = 'YXZ';

    // Key down handler
    const onKeyDown = (event) => {
        keyStates[event.code] = true;

        // Handle specific key presses
        switch (event.code) {
            case 'Space':
                player.jump();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                player.sprint(true);
                break;
        }
    };

    // Key up handler
    const onKeyUp = (event) => {
        keyStates[event.code] = false;

        // Handle specific key releases
        switch (event.code) {
            case 'ShiftLeft':
            case 'ShiftRight':
                player.sprint(false);
                break;
            case 'Escape':
                togglePointerLock();
                break;
        }
    };

    // Mouse movement handler
    const onMouseMove = (event) => {
        if (!pointerLocked) return;

        // Apply mouse movement to camera rotation
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // Use negative multiplier for X to get correct movement direction
        camera.rotation.y -= movementX * CAMERA_SENSITIVITY;

        // Limit vertical rotation to avoid flipping
        camera.rotation.x -= movementY * CAMERA_SENSITIVITY;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    // Pointer lock change handler
    const onPointerLockChange = () => {
        pointerLocked = document.pointerLockElement === document.body;
    };

    // Pointer lock error handler
    const onPointerLockError = () => {
        console.error('Pointer lock error');
    };

    // Toggle pointer lock
    const togglePointerLock = () => {
        if (pointerLocked) {
            document.exitPointerLock();
        } else {
            document.body.requestPointerLock();
        }
    };

    // Click handler to request pointer lock
    const onClick = () => {
        if (!pointerLocked) {
            document.body.requestPointerLock();
        }
    };

    // Update player movement direction based on WASD keys
    const updateMovement = () => {
        // Update player movement state
        player.setMovementState(
            keyStates['KeyW'] || keyStates['ArrowUp'],
            keyStates['KeyS'] || keyStates['ArrowDown'],
            keyStates['KeyA'] || keyStates['ArrowLeft'],
            keyStates['KeyD'] || keyStates['ArrowRight']
        );

        // Reset direction
        const direction = new THREE.Vector3();

        // Forward/backward
        if (keyStates['KeyW'] || keyStates['ArrowUp']) {
            direction.z = -1;
        } else if (keyStates['KeyS'] || keyStates['ArrowDown']) {
            direction.z = 1;
        }

        // Left/right
        if (keyStates['KeyA'] || keyStates['ArrowLeft']) {
            direction.x = -1;
        } else if (keyStates['KeyD'] || keyStates['ArrowRight']) {
            direction.x = 1;
        }

        // Normalize for consistent movement speed in all directions
        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        // Transform direction vector by camera orientation
        if (direction.lengthSq() > 0) {
            // Get camera's forward direction (exclude vertical rotation)
            const forward = new THREE.Vector3(0, 0, -1);
            const right = new THREE.Vector3(1, 0, 0);

            // Critical: Apply camera quaternion to get world-relative directions
            forward.applyQuaternion(camera.quaternion);
            right.applyQuaternion(camera.quaternion);

            // Project vectors onto XZ plane
            forward.y = 0;
            right.y = 0;

            if (forward.lengthSq() > 0) forward.normalize();
            if (right.lengthSq() > 0) right.normalize();

            // Calculate movement direction
            const moveDirection = new THREE.Vector3(0, 0, 0);

            // Critical: Use negated Z value for forward direction from camera
            if (direction.z !== 0) {
                moveDirection.addScaledVector(forward, -direction.z);
            }

            if (direction.x !== 0) {
                moveDirection.addScaledVector(right, direction.x);
            }

            player.setDirection(moveDirection.x, moveDirection.z);
        } else {
            player.setDirection(0, 0);
        }
    };

    // Add event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);

    // Initial setup for game start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            const introScreen = document.getElementById('intro-screen');
            if (introScreen) {
                introScreen.style.display = 'none';
            }
            document.body.requestPointerLock();
        });
    }

    // Create control object
    const controls = {
        update: updateMovement,
        isPointerLocked: () => pointerLocked,

        // Clean up function to remove event listeners
        dispose: function() {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('click', onClick);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            document.removeEventListener('pointerlockerror', onPointerLockError);

            if (startButton) {
                startButton.removeEventListener('click', onClick);
            }
        }
    };

    return controls;
}

// Set up touch controls for mobile
export function setupMobileControls(player, camera) {
    // Get UI elements for mobile controls
    const mobileControls = document.getElementById('mobile-controls');
    const movementJoystick = document.getElementById('movement-joystick');
    const movementKnob = document.getElementById('movement-knob');
    const cameraJoystick = document.getElementById('camera-joystick');
    const cameraKnob = document.getElementById('camera-knob');
    const interactionButton = document.getElementById('interaction-button');

    // Show mobile controls
    if (mobileControls) {
        mobileControls.style.display = 'block';
    }

    // Set proper camera rotation order
    camera.rotation.order = 'YXZ';

    // Joystick states
    const movementState = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        knobX: 0,
        knobY: 0
    };

    const cameraState = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        knobX: 0,
        knobY: 0
    };

    // Movement joystick handlers
    const onMovementStart = (event) => {
        event.preventDefault();
        movementState.active = true;

        const touch = event.touches[0];
        const rect = movementJoystick.getBoundingClientRect();

        movementState.startX = rect.left + rect.width / 2;
        movementState.startY = rect.top + rect.height / 2;
        movementState.currentX = touch.clientX;
        movementState.currentY = touch.clientY;

        updateMovementJoystick();
    };

    const onMovementMove = (event) => {
        if (!movementState.active) return;
        event.preventDefault();

        const touch = event.touches[0];
        movementState.currentX = touch.clientX;
        movementState.currentY = touch.clientY;

        updateMovementJoystick();
    };

    const onMovementEnd = () => {
        movementState.active = false;
        resetMovementJoystick();
        player.setDirection(0, 0);
    };

    // Camera joystick handlers
    const onCameraStart = (event) => {
        event.preventDefault();
        cameraState.active = true;

        const touch = event.touches[0];
        const rect = cameraJoystick.getBoundingClientRect();

        cameraState.startX = rect.left + rect.width / 2;
        cameraState.startY = rect.top + rect.height / 2;
        cameraState.currentX = touch.clientX;
        cameraState.currentY = touch.clientY;

        updateCameraJoystick();
    };

    const onCameraMove = (event) => {
        if (!cameraState.active) return;
        event.preventDefault();

        const touch = event.touches[0];
        cameraState.currentX = touch.clientX;
        cameraState.currentY = touch.clientY;

        updateCameraJoystick();
    };

    const onCameraEnd = () => {
        cameraState.active = false;
        resetCameraJoystick();
    };

    // Interaction button handler
    const onInteractionStart = (event) => {
        event.preventDefault();
        player.jump();
    };

    // Update movement joystick visuals and player direction
    const updateMovementJoystick = () => {
        const dx = movementState.currentX - movementState.startX;
        const dy = movementState.currentY - movementState.startY;

        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 40; // Maximum knob travel

        if (distance > maxDistance) {
            // Normalize to max distance
            const scale = maxDistance / distance;
            movementState.knobX = dx * scale;
            movementState.knobY = dy * scale;
        } else {
            movementState.knobX = dx;
            movementState.knobY = dy;
        }

        // Update knob position
        movementKnob.style.transform = `translate(${movementState.knobX}px, ${movementState.knobY}px)`;

        // Calculate normalized direction (-1 to 1)
        const normX = movementState.knobX / maxDistance;
        const normY = movementState.knobY / maxDistance;

        // Convert to player movement direction
        // Note: Forward is negative Z in Three.js
        const moveX = normX;
        const moveZ = normY;

        // Create world-space direction based on camera orientation
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);

        forward.applyQuaternion(camera.quaternion);
        right.applyQuaternion(camera.quaternion);

        // Project onto XZ plane and normalize
        forward.y = 0;
        right.y = 0;

        if (forward.lengthSq() > 0) forward.normalize();
        if (right.lengthSq() > 0) right.normalize();

        // Calculate movement direction
        const moveDirection = new THREE.Vector3(0, 0, 0);

        // Use negated Y for forward direction (joystick up = forward)
        if (normY !== 0) {
            moveDirection.addScaledVector(forward, -normY);
        }

        if (normX !== 0) {
            moveDirection.addScaledVector(right, normX);
        }

        // Set player direction
        if (moveDirection.lengthSq() > 0) {
            player.setDirection(moveDirection.x, moveDirection.z);
        } else {
            player.setDirection(0, 0);
        }
    };

    // Update camera joystick and rotate camera
    const updateCameraJoystick = () => {
        const dx = cameraState.currentX - cameraState.startX;
        const dy = cameraState.currentY - cameraState.startY;

        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 40; // Maximum knob travel

        if (distance > maxDistance) {
            // Normalize to max distance
            const scale = maxDistance / distance;
            cameraState.knobX = dx * scale;
            cameraState.knobY = dy * scale;
        } else {
            cameraState.knobX = dx;
            cameraState.knobY = dy;
        }

        // Update knob position
        cameraKnob.style.transform = `translate(${cameraState.knobX}px, ${cameraState.knobY}px)`;

        // Rotate camera based on joystick position
        camera.rotation.y -= cameraState.knobX * MOBILE_CAMERA_SENSITIVITY;
        camera.rotation.x -= cameraState.knobY * MOBILE_CAMERA_SENSITIVITY;

        // Limit vertical rotation
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    // Reset movement joystick position
    const resetMovementJoystick = () => {
        movementState.knobX = 0;
        movementState.knobY = 0;
        movementKnob.style.transform = 'translate(0px, 0px)';
    };

    // Reset camera joystick position
    const resetCameraJoystick = () => {
        cameraState.knobX = 0;
        cameraState.knobY = 0;
        cameraKnob.style.transform = 'translate(0px, 0px)';
    };

    // Add touch event listeners
    if (movementJoystick) {
        movementJoystick.addEventListener('touchstart', onMovementStart);
        movementJoystick.addEventListener('touchmove', onMovementMove);
        movementJoystick.addEventListener('touchend', onMovementEnd);
        movementJoystick.addEventListener('touchcancel', onMovementEnd);
    }

    if (cameraJoystick) {
        cameraJoystick.addEventListener('touchstart', onCameraStart);
        cameraJoystick.addEventListener('touchmove', onCameraMove);
        cameraJoystick.addEventListener('touchend', onCameraEnd);
        cameraJoystick.addEventListener('touchcancel', onCameraEnd);
    }

    if (interactionButton) {
        interactionButton.addEventListener('touchstart', onInteractionStart);
    }

    // Initial setup for game start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            const introScreen = document.getElementById('intro-screen');
            if (introScreen) {
                introScreen.style.display = 'none';
            }
        });
    }

    // Create control object
    const controls = {
        update: function() {
            // No need for continuous updates, joystick events handle everything
        },

        // Clean up function to remove event listeners
        dispose: function() {
            if (movementJoystick) {
                movementJoystick.removeEventListener('touchstart', onMovementStart);
                movementJoystick.removeEventListener('touchmove', onMovementMove);
                movementJoystick.removeEventListener('touchend', onMovementEnd);
                movementJoystick.removeEventListener('touchcancel', onMovementEnd);
            }

            if (cameraJoystick) {
                cameraJoystick.removeEventListener('touchstart', onCameraStart);
                cameraJoystick.removeEventListener('touchmove', onCameraMove);
                cameraJoystick.removeEventListener('touchend', onCameraEnd);
                cameraJoystick.removeEventListener('touchcancel', onCameraEnd);
            }

            if (interactionButton) {
                interactionButton.removeEventListener('touchstart', onInteractionStart);
            }

            if (mobileControls) {
                mobileControls.style.display = 'none';
            }

            if (startButton) {
                startButton.removeEventListener('click', onClick);
            }
        }
    };

    return controls;
}

// Create appropriate controls based on device
export function createControls(player, camera) {
    return IS_MOBILE ? setupMobileControls(player, camera) : setupDesktopControls(player, camera);
}
