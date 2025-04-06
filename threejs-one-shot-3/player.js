import * as THREE from 'three';

// Player constants
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const GRAVITY = 9.8;
const GROUND_FRICTION = 0.8;

// Player physics state
const velocity = { x: 0, y: 0, z: 0 };
const position = { x: 0, y: PLAYER_HEIGHT / 2, z: 0 };
let isGrounded = false;

// Collision objects
let groundObject = null;
let treeObjects = [];

/**
 * Creates player mesh and sets up physics
 * @param {THREE.Scene} scene - The scene to add player to
 * @param {Object} environment - Environment objects for collision
 * @returns {Object} - Player object with mesh and methods
 */
export function createPlayer(scene, environment) {
    // Store collision objects
    groundObject = environment.ground;
    treeObjects = environment.trees;

    // Create player mesh
    const playerGeometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 4, 8);
    const playerMaterial = new THREE.MeshStandardMaterial({
        color: 0x2194ce,
        roughness: 0.7
    });

    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    playerMesh.castShadow = true;

    // Position from bottom of capsule
    playerMesh.position.y = PLAYER_HEIGHT / 2;
    scene.add(playerMesh);

    // Create simple collision detection helpers
    const collisionObjects = createCollisionDetectors();

    return {
        mesh: playerMesh,
        update,
        getPosition: () => ({ ...position }),
        setPosition: (x, y, z) => {
            position.x = x;
            position.y = y;
            position.z = z;
            playerMesh.position.set(x, y, z);
        },
        isGrounded: () => isGrounded,
        collisionObjects
    };
}

/**
 * Creates simple collision detection helpers
 * @returns {Object} - Collision helper objects
 */
function createCollisionDetectors() {
    // Create a raycaster for ground detection
    const groundRaycaster = new THREE.Raycaster();

    // Create cylinder geometry for tree collision
    const collisionGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8);
    const collisionMaterial = new THREE.MeshBasicMaterial({
        visible: false
    });

    const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);

    return {
        groundRaycaster,
        collisionMesh
    };
}

/**
 * Updates player physics and handles collisions
 * @param {Object} playerMesh - The player mesh
 * @param {Object} direction - Movement direction vector
 * @param {Object} camera - The camera to follow player
 * @param {Number} deltaTime - Time since last update
 * @param {Boolean} isRunning - Whether the player is running
 */
export function update(playerMesh, direction, camera, deltaTime, isRunning) {
    // Apply movement based on camera rotation
    applyMovement(direction, camera, isRunning, deltaTime);

    // Apply gravity
    applyGravity(deltaTime);

    // Apply ground collision
    detectGround();

    // Apply tree collisions
    detectTreeCollisions(playerMesh);

    // Apply friction when on ground
    if (isGrounded) {
        velocity.x *= GROUND_FRICTION;
        velocity.z *= GROUND_FRICTION;
    }

    // Apply velocity to position
    position.x += velocity.x * deltaTime;
    position.y += velocity.y * deltaTime;
    position.z += velocity.z * deltaTime;

    // Update mesh position
    playerMesh.position.set(position.x, position.y, position.z);

    // Update camera position to follow player
    camera.position.set(position.x, position.y + (PLAYER_HEIGHT / 2) - 0.2, position.z);
}

/**
 * Applies movement based on input direction
 * @param {Object} direction - Direction vector from controls
 * @param {Object} camera - Camera for direction reference
 * @param {Boolean} isRunning - Whether player is running (shift key)
 * @param {Number} deltaTime - Time since last update
 */
function applyMovement(direction, camera, isRunning, deltaTime) {
    // Base and sprint speeds
    const walkSpeed = 5.0;
    const runSpeed = 8.0;
    const speed = isRunning ? runSpeed : walkSpeed;

    // Only apply movement input when touching ground
    if (isGrounded) {
        // Calculate movement direction relative to camera
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Keep movement on xz plane
        cameraDirection.normalize();

        // Calculate camera's right vector
        const cameraRight = new THREE.Vector3(
            Math.sin(camera.rotation.y - Math.PI/2),
            0,
            Math.cos(camera.rotation.y - Math.PI/2)
        );

        // Apply forward/backward movement
        if (direction.z !== 0) {
            // FIXED: Need to negate direction.z to match Three.js conventions
            // Without this negation, controls are inverted
            velocity.x += cameraDirection.x * -direction.z * speed * deltaTime;
            velocity.z += cameraDirection.z * -direction.z * speed * deltaTime;
        }

        // Apply left/right movement
        if (direction.x !== 0) {
            velocity.x += cameraRight.x * direction.x * speed * deltaTime;
            velocity.z += cameraRight.z * direction.x * speed * deltaTime;
        }

        // Limit horizontal velocity
        const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        if (horizontalSpeed > speed) {
            const ratio = speed / horizontalSpeed;
            velocity.x *= ratio;
            velocity.z *= ratio;
        }
    }
}

/**
 * Applies gravity to vertical velocity
 * @param {Number} deltaTime - Time since last update
 */
function applyGravity(deltaTime) {
    velocity.y -= GRAVITY * deltaTime;
}

/**
 * Detects ground collision and adjusts player position
 */
function detectGround() {
    // Detect ground collision
    if (position.y <= PLAYER_HEIGHT / 2) {
        position.y = PLAYER_HEIGHT / 2;
        velocity.y = 0;
        isGrounded = true;
    } else {
        isGrounded = false;
    }
}

/**
 * Detects collisions with trees and prevents player movement
 * @param {Object} playerMesh - The player mesh
 */
function detectTreeCollisions(playerMesh) {
    // Basic collision detection with trees
    for (const tree of treeObjects) {
        // Get only the trunk part (first child)
        const trunk = tree.children[0];
        if (!trunk) continue;

        // Get tree position in world space
        const treePos = new THREE.Vector3();
        trunk.getWorldPosition(treePos);

        // Check distance to tree trunk (simple cylinder collision)
        const dx = position.x - treePos.x;
        const dz = position.z - treePos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // If too close to tree (collision detected)
        const minDistance = PLAYER_RADIUS + 0.3;  // Player radius + trunk radius
        if (distance < minDistance) {
            // Push player away from tree
            const pushDirection = new THREE.Vector3(dx, 0, dz).normalize();
            const pushAmount = minDistance - distance;

            position.x += pushDirection.x * pushAmount;
            position.z += pushDirection.z * pushAmount;

            // Stop velocity in collision direction
            const dot = velocity.x * pushDirection.x + velocity.z * pushDirection.z;
            if (dot < 0) {
                velocity.x -= pushDirection.x * dot;
                velocity.z -= pushDirection.z * dot;
            }
        }
    }
}
