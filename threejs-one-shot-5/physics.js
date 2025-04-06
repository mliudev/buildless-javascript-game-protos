import * as THREE from 'three';

// Constants
const GRAVITY = 20;

export function initPhysics(colliders) {
    return {
        colliders
    };
}

export function updatePhysics(player, physics, deltaTime) {
    // Apply gravity
    player.velocity.y -= GRAVITY * deltaTime;

    // Check for ground collision
    player.onGround = false;

    // Temporary position after velocity is applied
    const nextPos = new THREE.Vector3(
        player.mesh.position.x + player.velocity.x * deltaTime,
        player.mesh.position.y + player.velocity.y * deltaTime,
        player.mesh.position.z + player.velocity.z * deltaTime
    );

    // Check collisions with all colliders
    for (const collider of physics.colliders) {
        switch(collider.type) {
            case 'plane':
                // Ground collision (plane)
                if (nextPos.y - player.height / 2 <= collider.position.y &&
                    player.velocity.y < 0) {
                    nextPos.y = collider.position.y + player.height / 2;
                    player.velocity.y = 0;
                    player.onGround = true;
                }
                break;

            case 'cylinder':
                // Tree collision (simplified as cylinder)
                const dx = nextPos.x - collider.position.x;
                const dz = nextPos.z - collider.position.z;
                const distanceSquared = dx * dx + dz * dz;
                const minDistance = player.radius + collider.radius;

                if (distanceSquared < minDistance * minDistance) {
                    // Collision detected, calculate correction
                    const distance = Math.sqrt(distanceSquared);
                    const correction = (minDistance - distance) / distance;

                    // Push player away from collision
                    nextPos.x += dx * correction;
                    nextPos.z += dz * correction;

                    // Update velocity to prevent further movement into the collider
                    const dot = player.velocity.x * dx + player.velocity.z * dz;
                    if (dot < 0) {
                        player.velocity.x -= dx * dot / distanceSquared;
                        player.velocity.z -= dz * dot / distanceSquared;
                    }
                }
                break;

            case 'box':
                // Box collision (cabin)
                if (Math.abs(nextPos.x - collider.position.x) < collider.width / 2 + player.radius &&
                    Math.abs(nextPos.y - collider.position.y) < collider.height / 2 + player.height / 2 &&
                    Math.abs(nextPos.z - collider.position.z) < collider.depth / 2 + player.radius) {

                    // Find closest face
                    const overlapX = collider.width / 2 + player.radius - Math.abs(nextPos.x - collider.position.x);
                    const overlapY = collider.height / 2 + player.height / 2 - Math.abs(nextPos.y - collider.position.y);
                    const overlapZ = collider.depth / 2 + player.radius - Math.abs(nextPos.z - collider.position.z);

                    // Push out in direction of minimum overlap
                    if (overlapX < overlapY && overlapX < overlapZ) {
                        nextPos.x += overlapX * Math.sign(nextPos.x - collider.position.x);
                        player.velocity.x = 0;
                    } else if (overlapY < overlapX && overlapY < overlapZ) {
                        nextPos.y += overlapY * Math.sign(nextPos.y - collider.position.y);
                        player.velocity.y = 0;
                        if (nextPos.y < collider.position.y) player.onGround = true;
                    } else {
                        nextPos.z += overlapZ * Math.sign(nextPos.z - collider.position.z);
                        player.velocity.z = 0;
                    }
                }
                break;
        }
    }

    // Update player position after collision resolution
    player.mesh.position.copy(nextPos);
}
