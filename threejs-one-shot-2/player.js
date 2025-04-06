import * as THREE from 'three';

// Player constants
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.3;
const GRAVITY = 9.8;
const JUMP_FORCE = 5;

class Player {
    constructor(scene) {
        // Create player geometry (capsule)
        const geometry = new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 4, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            wireframe: true,
            visible: false // Hide player model in first-person
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = PLAYER_HEIGHT / 2; // Position from bottom
        scene.add(this.mesh);

        // Player physics properties
        this.velocity = new THREE.Vector3();
        this.isOnGround = false;

        // Collision detection
        this.collider = new THREE.Sphere(
            new THREE.Vector3(0, PLAYER_HEIGHT / 2, 0),
            PLAYER_RADIUS * 1.5
        );
    }

    update(deltaTime, moveVector, colliders = []) {
        // Apply movement
        this.velocity.x = moveVector.x;
        this.velocity.z = moveVector.z;

        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y -= GRAVITY * deltaTime;
        }

        // Update position with velocity
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.z += this.velocity.z;
        this.mesh.position.y += this.velocity.y * deltaTime;

        // Update collider position
        this.collider.center.copy(this.mesh.position);
        this.collider.center.y = this.mesh.position.y + PLAYER_HEIGHT / 2 - PLAYER_RADIUS;

        // Ground detection
        this.isOnGround = false;
        if (this.mesh.position.y <= PLAYER_HEIGHT / 2) {
            this.isOnGround = true;
            this.velocity.y = 0;
            this.mesh.position.y = PLAYER_HEIGHT / 2;
        }

        // Check collisions with environment
        this.handleCollisions(colliders);

        // Update camera position
        return new THREE.Vector3(
            this.mesh.position.x,
            this.mesh.position.y + PLAYER_HEIGHT / 2 - PLAYER_RADIUS, // Eye height
            this.mesh.position.z
        );
    }

    handleCollisions(colliders) {
        // Simple collision handling with environment objects
        for (const collider of colliders) {
            if (this.collider.intersectsBox(collider)) {
                // Get collision normal
                const collisionNormal = new THREE.Vector3();
                const playerPos = this.collider.center.clone();

                // Find closest point on the box to the sphere
                const closestPoint = new THREE.Vector3().copy(playerPos);
                closestPoint.clamp(collider.min, collider.max);

                // Get direction from closest point to sphere center
                collisionNormal.subVectors(playerPos, closestPoint).normalize();

                // Calculate penetration depth
                const penetrationDepth = this.collider.radius - playerPos.distanceTo(closestPoint);

                // Resolve collision by moving player out of the object
                if (penetrationDepth > 0) {
                    this.mesh.position.add(collisionNormal.multiplyScalar(penetrationDepth));
                    this.collider.center.copy(this.mesh.position);
                    this.collider.center.y = this.mesh.position.y + PLAYER_HEIGHT / 2 - PLAYER_RADIUS;

                    // Zero velocity in the direction of collision
                    const vDot = this.velocity.dot(collisionNormal);
                    if (vDot < 0) {
                        this.velocity.sub(collisionNormal.multiplyScalar(vDot));
                    }
                }
            }
        }
    }

    jump() {
        if (this.isOnGround) {
            this.velocity.y = JUMP_FORCE;
            this.isOnGround = false;
        }
    }

    getPosition() {
        return this.mesh.position.clone();
    }
}

export { Player };
