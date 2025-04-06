import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PLAYER_HEIGHT, PLAYER_RADIUS, GROUND_LEVEL, PLAYER_JUMP_FORCE } from './constants.js';

// Create the player and its physics body
export function createPlayer(scene, world, playerMaterial) {
    // Create the main group that will represent the player
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Create player mesh
    const playerGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 16, 1);
    const playerMeshMaterial = new THREE.MeshStandardMaterial({
        color: 0x3366ff,
        roughness: 0.5,
        metalness: 0.2,
    });

    // Create the mesh and add to group
    const playerMesh = new THREE.Mesh(playerGeometry, playerMeshMaterial);
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;

    // Position WITHIN the group - making the bottom of cylinder at exactly y=0
    playerMesh.position.y = PLAYER_HEIGHT / 2;
    playerGroup.add(playerMesh);

    // Add a shadow disc at the feet
    const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(PLAYER_RADIUS * 0.9, 32),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
        })
    );
    shadowDisc.rotation.x = -Math.PI / 2; // Make it flat on the ground
    shadowDisc.position.y = 0.01; // Tiny bit above ground to avoid z-fighting
    playerGroup.add(shadowDisc);

    // Make sure the entire player is correctly positioned with bottom at ground level
    playerGroup.position.y = GROUND_LEVEL;

    // Create physics body
    const playerBody = new CANNON.Body({
        mass: 80, // kg
        shape: new CANNON.Cylinder(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 16),
        material: playerMaterial,
        position: new CANNON.Vec3(0, GROUND_LEVEL + PLAYER_HEIGHT/2, 0),
        fixedRotation: true,
        linearDamping: 0.5,
        angularDamping: 0.99
    });

    // Configure physics shape orientation
    playerBody.shapeOrientations[0].setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    world.addBody(playerBody);

    // Create debug mesh if needed
    let debugMesh = null;
    if (window.params && window.params.debugPhysics) {
        const debugGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8);
        const debugMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
            opacity: 0.5,
            transparent: true
        });
        debugMesh = new THREE.Mesh(debugGeometry, debugMaterial);
        debugMesh.rotation.x = Math.PI / 2;
        scene.add(debugMesh);
    }

    // Player data
    const playerData = {
        group: playerGroup,
        mesh: playerMesh,
        body: playerBody,
        debugMesh: debugMesh,
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        canJump: false,
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jumping: false,
        onGround: false,

        // Update ground check
        checkGroundContact: function() {
            // Distance from bottom of player to ground
            const bottomY = this.body.position.y - PLAYER_HEIGHT/2;
            const distanceToGround = bottomY - GROUND_LEVEL;

            // Player is on ground if bottom is very close to ground level
            const isOnGround = distanceToGround < 0.05;

            this.onGround = isOnGround;
            this.canJump = isOnGround;

            // Prevent sinking or floating by forcing exact position when on ground
            if (isOnGround && this.body.velocity.y <= 0) {
                this.body.position.y = GROUND_LEVEL + PLAYER_HEIGHT/2;
                this.body.velocity.y = 0;
            }

            return isOnGround;
        },

        // Update the visual representation based on physics body
        updateVisual: function() {
            // Calculate the position where the BOTTOM of the player should be at ground level
            const bottomY = this.body.position.y - PLAYER_HEIGHT/2;

            // Position the group so its origin (which is at the bottom of the player) matches physics
            this.group.position.set(
                this.body.position.x,
                bottomY, // This ensures the bottom of the player is at the correct height
                this.body.position.z
            );

            // Rotation
            if (this.direction.lengthSq() > 0.1) {
                const targetRotation = Math.atan2(this.direction.x, this.direction.z);
                this.group.rotation.y = targetRotation;
            }
        },

        // Handle jumping
        tryJump: function() {
            if (this.canJump && this.onGround) {
                this.body.velocity.y = PLAYER_JUMP_FORCE;
                this.canJump = false;
                return true;
            }
            return false;
        },

        // Update debug mesh
        updateDebug: function() {
            if (this.debugMesh) {
                this.debugMesh.position.copy(this.body.position);
                this.debugMesh.quaternion.copy(this.body.quaternion);
            }
        }
    };

    return playerData;
}
