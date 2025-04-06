// Input and camera control system
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false
};

let isLocked = false;
let yaw = 0;
let pitch = 0;
const pitchLimit = Math.PI / 2 - 0.01; // Slightly less than 90 degrees

/**
 * Setup player controls and camera movement
 * @param {THREE.Camera} camera - The camera to control
 * @param {HTMLElement} domElement - The DOM element to attach listeners to
 * @returns {Object} - Controls state and methods
 */
export function setupControls(camera, domElement) {
    // Set camera rotation order to YXZ to prevent gimbal lock
    camera.rotation.order = 'YXZ';

    // Set up pointer lock controls
    setupPointerLock(domElement);

    // Set up keyboard controls
    setupKeyboardControls();

    // Return controls API
    return {
        update,
        getMovementDirection,
        isRunning: () => keys.shift,
        isLocked: () => isLocked
    };
}

/**
 * Set up pointer lock for mouse look
 * @param {HTMLElement} domElement - Element to attach pointer lock to
 */
function setupPointerLock(domElement) {
    // Setup click to lock
    domElement.addEventListener('click', () => {
        if (!isLocked) {
            domElement.requestPointerLock();
        }
    });

    // Handle pointer lock state changes
    document.addEventListener('pointerlockchange', () => {
        isLocked = document.pointerLockElement === domElement;

        // Hide loading text when controls are active
        const loadingElement = document.querySelector('.loading');
        if (loadingElement && isLocked) {
            loadingElement.style.display = 'none';
        }
    });

    // Handle mouse movement for camera rotation
    document.addEventListener('mousemove', (event) => {
        if (!isLocked) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // Adjust sensitivity
        const sensitivity = 0.002;

        // Horizontal rotation (yaw)
        yaw -= movementX * sensitivity;

        // Vertical rotation (pitch) with limits
        pitch -= movementY * sensitivity;
        pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));
    });
}

/**
 * Set up keyboard controls for movement
 */
function setupKeyboardControls() {
    // Key down event
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW': keys.forward = true; break;
            case 'KeyS': keys.backward = true; break;
            case 'KeyA': keys.left = true; break;
            case 'KeyD': keys.right = true; break;
            case 'ShiftLeft': keys.shift = true; break;
        }
    });

    // Key up event
    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW': keys.forward = false; break;
            case 'KeyS': keys.backward = false; break;
            case 'KeyA': keys.left = false; break;
            case 'KeyD': keys.right = false; break;
            case 'ShiftLeft': keys.shift = false; break;
        }
    });
}

/**
 * Updates camera rotation based on current yaw and pitch
 * @param {THREE.Camera} camera - The camera to update
 */
function update(camera) {
    if (!camera) return;

    // Apply yaw (left/right) rotation
    camera.rotation.y = yaw;

    // Apply pitch (up/down) rotation
    camera.rotation.x = pitch;
}

/**
 * Get movement direction vector based on input and camera orientation
 * @returns {Object} - Direction vector with x, y, z components
 */
function getMovementDirection() {
    // Create empty direction vector
    const direction = { x: 0, y: 0, z: 0 };

    // CRITICAL: Forward in Three.js is NEGATIVE Z
    // We need to ensure W key results in forward (negative Z) movement
    // So forward is NEGATIVE, backward is POSITIVE
    direction.z = Number(keys.backward) - Number(keys.forward);
    direction.x = Number(keys.right) - Number(keys.left);

    // Normalize for diagonal movement
    if (direction.x !== 0 && direction.z !== 0) {
        const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        direction.x /= length;
        direction.z /= length;
    }

    return direction;
}
