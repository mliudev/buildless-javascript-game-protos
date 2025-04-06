import * as THREE from 'three';
import { IS_MOBILE } from './constants.js';

// Set up keyboard controls
export function setupKeyboardControls(player, camera) {
    const keyStates = {};

    // Key down event
    const onKeyDown = (event) => {
        keyStates[event.code] = true;

        // Jump on space or W
        if (event.code === 'Space' || event.code === 'KeyW') {
            player.jump();
        }
    };

    // Key up event
    const onKeyUp = (event) => {
        keyStates[event.code] = false;
    };

    // Mouse events for camera control
    const onMouseMove = (event) => {
        if (document.pointerLockElement === document.body) {
            // Rotate camera based on mouse movement
            camera.rotation.y -= event.movementX * 0.002;
            camera.rotation.x -= event.movementY * 0.002;

            // Limit the vertical rotation to avoid flipping
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        }
    };

    // Request pointer lock on click
    const onMouseDown = () => {
        if (document.pointerLockElement !== document.body) {
            document.body.requestPointerLock();
        }
    };

    // Add event listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);

    // Function to update player movement based on key states
    function updatePlayerMovement() {
        // Reset movement flags
        player.moveForward = false;
        player.moveBackward = false;
        player.moveLeft = false;
        player.moveRight = false;

        // Set movement flags based on key states
        if (keyStates['KeyW'] || keyStates['ArrowUp']) player.moveForward = true;
        if (keyStates['KeyS'] || keyStates['ArrowDown']) player.moveBackward = true;
        if (keyStates['KeyA'] || keyStates['ArrowLeft']) player.moveLeft = true;
        if (keyStates['KeyD'] || keyStates['ArrowRight']) player.moveRight = true;

        // Calculate movement direction
        updateMovementDirection(player, camera);
    }

    // Clean up function to remove event listeners
    function cleanUp() {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);
    }

    return {
        update: updatePlayerMovement,
        cleanUp: cleanUp
    };
}

// Set up mobile controls
export function setupMobileControls(player, camera) {
    // Get control elements
    const mobileControls = document.getElementById('mobile-controls');
    const movementJoystick = document.getElementById('movement-joystick');
    const movementKnob = document.getElementById('movement-knob');
    const jumpButton = document.getElementById('jump-button');

    // Show mobile controls
    mobileControls.style.display = 'flex';

    // Joystick state
    const joystickState = {
        active: false,
        startX: 0,
        startY: 0,
        moveX: 0,
        moveY: 0,
        // Max distance the knob can move from center
        maxDistance: 35
    };

    // Touch start on movement joystick
    const onJoystickStart = (event) => {
        event.preventDefault();

        joystickState.active = true;
        const touch = event.touches[0];
        const rect = movementJoystick.getBoundingClientRect();

        // Starting position relative to joystick center
        joystickState.startX = rect.left + rect.width / 2;
        joystickState.startY = rect.top + rect.height / 2;

        updateJoystickPosition(touch.clientX, touch.clientY);
    };

    // Touch move on movement joystick
    const onJoystickMove = (event) => {
        if (!joystickState.active) return;
        event.preventDefault();

        const touch = event.touches[0];
        updateJoystickPosition(touch.clientX, touch.clientY);
    };

    // Touch end on movement joystick
    const onJoystickEnd = (event) => {
        event.preventDefault();
        joystickState.active = false;
        joystickState.moveX = 0;
        joystickState.moveY = 0;

        // Reset knob position
        movementKnob.style.transform = `translate(0px, 0px)`;
    };

    // Update joystick knob position
    function updateJoystickPosition(touchX, touchY) {
        // Calculate distance from center
        let deltaX = touchX - joystickState.startX;
        let deltaY = touchY - joystickState.startY;

        // Limit to maxDistance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > joystickState.maxDistance) {
            const scale = joystickState.maxDistance / distance;
            deltaX *= scale;
            deltaY *= scale;
        }

        // Update knob position
        movementKnob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Store normalized movement values (-1 to 1)
        joystickState.moveX = deltaX / joystickState.maxDistance;
        joystickState.moveY = deltaY / joystickState.maxDistance;
    }

    // Handle jump button
    const onJumpTouchStart = (event) => {
        event.preventDefault();
        player.jump();
    };

    // Add touch event listeners
    movementJoystick.addEventListener('touchstart', onJoystickStart);
    movementJoystick.addEventListener('touchmove', onJoystickMove);
    movementJoystick.addEventListener('touchend', onJoystickEnd);
    movementJoystick.addEventListener('touchcancel', onJoystickEnd);
    jumpButton.addEventListener('touchstart', onJumpTouchStart);

    // Setup device orientation for camera control
    let deviceOrientationEnabled = false;

    // Try to enable device orientation API
    const enableDeviceOrientation = () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            DeviceOrientationEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        deviceOrientationEnabled = true;
                        window.addEventListener('deviceorientation', onDeviceOrientation);
                    }
                })
                .catch(console.error);
        } else if (window.DeviceOrientationEvent) {
            // Other devices
            deviceOrientationEnabled = true;
            window.addEventListener('deviceorientation', onDeviceOrientation);
        }
    };

    // Handle device orientation for camera
    let initialBeta = null;
    let initialGamma = null;

    const onDeviceOrientation = (event) => {
        if (initialBeta === null || initialGamma === null) {
            initialBeta = event.beta;
            initialGamma = event.gamma;
            return;
        }

        // Use beta (x-axis) and gamma (y-axis) for camera rotation
        const deltaX = (event.gamma - initialGamma) * 0.01;
        const deltaY = (event.beta - initialBeta) * 0.01;

        camera.rotation.y -= deltaX;
        camera.rotation.x -= deltaY;

        // Limit the vertical rotation
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    // Try to enable orientation on first touch
    window.addEventListener('touchstart', enableDeviceOrientation, {once: true});

    // Function to update player movement based on joystick state
    function updatePlayerMovement() {
        // Reset movement flags
        player.moveForward = false;
        player.moveBackward = false;
        player.moveLeft = false;
        player.moveRight = false;

        // Set movement flags based on joystick position
        if (joystickState.moveY < -0.1) player.moveForward = true;
        if (joystickState.moveY > 0.1) player.moveBackward = true;
        if (joystickState.moveX < -0.1) player.moveLeft = true;
        if (joystickState.moveX > 0.1) player.moveRight = true;

        // Calculate movement direction
        updateMovementDirection(player, camera);
    }

    // Clean up function
    function cleanUp() {
        movementJoystick.removeEventListener('touchstart', onJoystickStart);
        movementJoystick.removeEventListener('touchmove', onJoystickMove);
        movementJoystick.removeEventListener('touchend', onJoystickEnd);
        movementJoystick.removeEventListener('touchcancel', onJoystickEnd);
        jumpButton.removeEventListener('touchstart', onJumpTouchStart);

        if (deviceOrientationEnabled) {
            window.removeEventListener('deviceorientation', onDeviceOrientation);
        }

        // Hide mobile controls
        mobileControls.style.display = 'none';
    }

    return {
        update: updatePlayerMovement,
        cleanUp: cleanUp
    };
}

// Update player movement direction based on camera orientation
function updateMovementDirection(player, camera) {
    player.direction.set(0, 0, 0);

    // Forward/backward - Fix inversion by changing the sign
    if (player.moveForward) {
        player.direction.z = -1; // This is correct for forward in Three.js
    } else if (player.moveBackward) {
        player.direction.z = 1; // This is correct for backward in Three.js
    }

    // Left/right
    if (player.moveLeft) {
        player.direction.x = -1;
    } else if (player.moveRight) {
        player.direction.x = 1;
    }

    // Normalize for consistent speed in all directions
    if (player.direction.lengthSq() > 0) {
        player.direction.normalize();
    }

    // Apply camera rotation to direction
    const cameraDirection = new THREE.Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);

    // Project onto xz plane
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Camera right
    const cameraRight = new THREE.Vector3(1, 0, 0);
    cameraRight.applyQuaternion(camera.quaternion);
    cameraRight.y = 0;
    cameraRight.normalize();

    // Combine direction with camera orientation
    const moveZ = player.direction.z;
    const moveX = player.direction.x;
    player.direction.set(0, 0, 0);

    if (moveZ !== 0) {
        player.direction.addScaledVector(cameraDirection, -moveZ);
    }

    if (moveX !== 0) {
        player.direction.addScaledVector(cameraRight, moveX);
    }

    // Normalize again
    if (player.direction.lengthSq() > 0) {
        player.direction.normalize();
    }
}

// Create controls based on device
export function createControls(player, camera) {
    // Use mobile controls on mobile devices, keyboard on desktop
    return IS_MOBILE ? setupMobileControls(player, camera) : setupKeyboardControls(player, camera);
}
