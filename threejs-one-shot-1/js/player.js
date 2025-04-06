import * as THREE from 'three';
import {
    PLAYER_HEIGHT,
    PLAYER_RADIUS,
    PLAYER_MASS,
    PLAYER_MOVE_SPEED,
    PLAYER_SPRINT_SPEED,
    PLAYER_JUMP_FORCE,
    GROUND_FRICTION,
    AIR_FRICTION,
    GRAVITY,
    GROUND_LEVEL
} from './constants.js';
import { getHeightAt } from './utils.js';

// Create the player
export function createPlayer(scene) {
    // Player mesh container (group)
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Physics properties
    const velocity = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(0, 0, 0);

    // Player state
    let isOnGround = false;
    let canJump = false;
    let isSprinting = false;

    // Movement flags
    const moveState = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        sprint: false
    };

    // Initialize player properties
    const player = {
        group: playerGroup,
        position: playerGroup.position,
        velocity: velocity,
        direction: direction,
        moveState: moveState,
        height: PLAYER_HEIGHT,
        radius: PLAYER_RADIUS,
        mass: PLAYER_MASS,
        isOnGround: isOnGround,
        canJump: canJump,
        isSprinting: isSprinting,

        // Method to update player physics
        update: function(deltaTime, heightField, worldSize, heightFieldSize) {
            // Apply gravity
            if (!this.isOnGround) {
                this.velocity.y -= GRAVITY * deltaTime;
            }

            // Get move speed (sprint or normal)
            const currentSpeed = this.isSprinting ? PLAYER_SPRINT_SPEED : PLAYER_MOVE_SPEED;

            // Apply movement based on direction
            if (this.direction.lengthSq() > 0) {
                this.velocity.x = this.direction.x * currentSpeed;
                this.velocity.z = this.direction.z * currentSpeed;
            } else {
                // Apply friction to slow down when not moving
                const friction = this.isOnGround ? GROUND_FRICTION : AIR_FRICTION;
                this.velocity.x *= friction;
                this.velocity.z *= friction;
            }

            // Apply jump if requested and possible
            if (this.moveState.jump && this.canJump) {
                this.velocity.y = PLAYER_JUMP_FORCE;
                this.isOnGround = false;
                this.canJump = false;
                this.moveState.jump = false; // Consume the jump request
            }

            // Update position based on velocity
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;

            // Check for ground contact
            this.checkGroundContact(heightField, worldSize, heightFieldSize);

            // Reset sprint state (must be held down)
            this.isSprinting = this.moveState.sprint;
        },

        // Method to check ground contact
        checkGroundContact: function(heightField, worldSize, heightFieldSize) {
            if (!heightField) {
                // If no height field, use flat ground at GROUND_LEVEL
                const groundHeight = GROUND_LEVEL;
                const playerBottom = this.position.y - this.height / 2;

                if (playerBottom <= groundHeight + 0.1) {
                    if (this.velocity.y <= 0) {
                        this.position.y = groundHeight + this.height / 2;
                        this.velocity.y = 0;
                        this.isOnGround = true;
                        this.canJump = true;
                    }
                } else {
                    this.isOnGround = false;
                }

                return;
            }

            // Get terrain height at player position
            const terrainHeight = getHeightAt(
                heightField,
                this.position.x,
                this.position.z,
                worldSize,
                heightFieldSize
            );

            // Calculate player's bottom position
            const playerBottom = this.position.y - this.height / 2;

            // Check if player is on ground (with small threshold)
            if (playerBottom <= terrainHeight + 0.1) {
                if (this.velocity.y <= 0) {
                    // Snap to ground
                    this.position.y = terrainHeight + this.height / 2;
                    this.velocity.y = 0;
                    this.isOnGround = true;
                    this.canJump = true;
                }
            } else {
                this.isOnGround = false;
            }
        },

        // Method to handle jumping
        jump: function() {
            this.moveState.jump = true;
        },

        // Method to handle sprinting
        sprint: function(sprinting) {
            this.moveState.sprint = sprinting;
        },

        // Method to set movement direction
        setDirection: function(x, z) {
            this.direction.set(x, 0, z);

            // Normalize if non-zero
            if (this.direction.lengthSq() > 0) {
                this.direction.normalize();
            }
        },

        // Method to set movement state
        setMovementState: function(forward, backward, left, right) {
            this.moveState.forward = forward;
            this.moveState.backward = backward;
            this.moveState.left = left;
            this.moveState.right = right;
        }
    };

    // Set initial position
    player.position.set(0, PLAYER_HEIGHT / 2 + GROUND_LEVEL, 0);

    return player;
}
