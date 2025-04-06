import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPlayerBody } from './physics.js';
import { createPlayerTexture } from './utils.js';
import {
    PLAYER_HEIGHT, PLAYER_RADIUS, PLAYER_MASS,
    PLAYER_JUMP_FORCE, GROUND_LEVEL, RESPAWN_HEIGHT,
    COLORS
} from './constants.js';

// Create the player
export function createPlayer(scene, world, playerMaterial) {
    // Create player visuals - using a cylinder for better shape
    const playerGeometry = new THREE.CylinderGeometry(
        PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 16, 1
    );

    // Create material with procedural texture
    const playerTexture = createPlayerTexture();
    const playerMeshMaterial = new THREE.MeshStandardMaterial({
        map: playerTexture,
        roughness: 0.5,
        metalness: 0.2,
    });

    // Create player group to handle positioning
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Create player mesh and add to group
    const playerMesh = new THREE.Mesh(playerGeometry, playerMeshMaterial);
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;

    // Center the mesh vertically in the group, so the bottom is at y=0
    playerMesh.position.y = PLAYER_HEIGHT / 2;
    playerGroup.add(playerMesh);

    // Add a shadow disc at the bottom
    const shadowDiscGeometry = new THREE.CircleGeometry(PLAYER_RADIUS * 0.9, 32);
    const shadowDiscMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
    });
    const shadowDisc = new THREE.Mesh(shadowDiscGeometry, shadowDiscMaterial);
    shadowDisc.rotation.x = -Math.PI / 2; // Make it flat on the ground
    shadowDisc.position.y = 0.01; // Just above ground to avoid z-fighting
    playerGroup.add(shadowDisc);

    // Add some eyes to give the player character personality
    const eyeGeometry = new THREE.SphereGeometry(PLAYER_RADIUS * 0.2, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left eye
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(PLAYER_RADIUS * 0.5, PLAYER_HEIGHT * 0.75, PLAYER_RADIUS * 0.7);
    playerMesh.add(leftEye);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-PLAYER_RADIUS * 0.5, PLAYER_HEIGHT * 0.75, PLAYER_RADIUS * 0.7);
    playerMesh.add(rightEye);

    // Add pupils
    const pupilGeometry = new THREE.SphereGeometry(PLAYER_RADIUS * 0.1, 8, 8);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, PLAYER_RADIUS * 0.2);
    leftEye.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, PLAYER_RADIUS * 0.2);
    rightEye.add(rightPupil);

    // Create physics body
    const playerBody = createPlayerBody(
        world,
        playerMaterial,
        PLAYER_RADIUS,
        PLAYER_HEIGHT,
        PLAYER_MASS
    );

    // Player state
    const playerState = {
        group: playerGroup,
        mesh: playerMesh,
        body: playerBody,
        direction: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        onGround: false,
        canJump: false,
        isDead: false,
        isJumping: false,
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        leftEye,
        rightEye,
        leftPupil,
        rightPupil,

        // Check if player is on ground
        checkGroundContact: function() {
            // Distance from bottom of player to ground
            const bottomY = this.body.position.y - PLAYER_HEIGHT/2;
            const distanceToGround = bottomY;

            // Player is on ground if bottom is very close to any surface
            this.onGround = this.body.velocity.y >= -0.1 && this.body.velocity.y <= 0.1;
            this.canJump = this.onGround;

            return this.onGround;
        },

        // Update visual based on physics
        updateVisual: function() {
            // Set position - bottom of player is at the physics body bottom
            const bottomY = this.body.position.y - PLAYER_HEIGHT/2;

            this.group.position.set(
                this.body.position.x,
                bottomY,
                this.body.position.z
            );

            // Apply rotation from physics body
            this.group.quaternion.copy(this.body.quaternion);

            // Look in movement direction by rotating the mesh (not the physics body)
            if (this.direction.lengthSq() > 0.1) {
                const targetRotation = Math.atan2(this.direction.x, this.direction.z);
                this.mesh.rotation.y = targetRotation;
            }

            // Animate eyes based on jumping/movement
            if (this.isJumping) {
                // Look up when jumping
                this.leftPupil.position.y = PLAYER_RADIUS * 0.1;
                this.rightPupil.position.y = PLAYER_RADIUS * 0.1;
            } else if (this.onGround && this.direction.lengthSq() > 0.1) {
                // Look in movement direction
                this.leftPupil.position.y = 0;
                this.rightPupil.position.y = 0;
            } else {
                // Default look
                this.leftPupil.position.y = 0;
                this.rightPupil.position.y = 0;
            }
        },

        // Handle jumping with proper ground contact
        jump: function() {
            if (this.canJump && this.onGround) {
                this.isJumping = true;
                this.body.velocity.y = PLAYER_JUMP_FORCE;
                this.canJump = false;

                // Reset jumping state after a short delay
                setTimeout(() => {
                    this.isJumping = false;
                }, 300);

                return true;
            }
            return false;
        },

        // Reset player to initial position
        respawn: function() {
            // Reset position to starting point
            this.body.position.set(0, PLAYER_HEIGHT/2 + GROUND_LEVEL + 1, 0);
            this.body.velocity.set(0, 0, 0);
            this.body.angularVelocity.set(0, 0, 0);
            this.isDead = false;
        },

        // Check if player fell off the world
        checkDeath: function() {
            if (this.body.position.y < RESPAWN_HEIGHT && !this.isDead) {
                this.isDead = true;
                this.respawn();
                return true;
            }
            return false;
        }
    };

    return playerState;
}
