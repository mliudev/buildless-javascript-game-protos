import * as CANNON from 'cannon-es';
import { GRAVITY, GROUND_LEVEL } from './constants.js';

// Create physics world
export function createPhysicsWorld() {
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, GRAVITY, 0)
    });

    // Better collision detection
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;

    // Increase solver iterations for stability
    world.solver.iterations = 10;

    // Default contact material
    world.defaultContactMaterial.friction = 0.2;
    world.defaultContactMaterial.restitution = 0.3;

    return world;
}

// Create physics materials
export function createMaterials(world) {
    // Create materials
    const groundMaterial = new CANNON.Material('ground');
    const playerMaterial = new CANNON.Material('player');
    const platformMaterial = new CANNON.Material('platform');

    // Ground-player contact (slightly bouncy)
    const groundPlayerContact = new CANNON.ContactMaterial(
        groundMaterial,
        playerMaterial,
        {
            friction: 0.1,
            restitution: 0.1, // Slight bounce
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        }
    );
    world.addContactMaterial(groundPlayerContact);

    // Platform-player contact (more friction, less bounce)
    const platformPlayerContact = new CANNON.ContactMaterial(
        platformMaterial,
        playerMaterial,
        {
            friction: 0.3,
            restitution: 0.0, // No bounce
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        }
    );
    world.addContactMaterial(platformPlayerContact);

    return {
        groundMaterial,
        playerMaterial,
        platformMaterial
    };
}

// Create ground physics
export function createGround(world, groundMaterial) {
    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
        material: groundMaterial,
        position: new CANNON.Vec3(0, GROUND_LEVEL, 0)
    });

    // Rotate the ground plane to be flat
    groundBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        -Math.PI / 2
    );

    world.addBody(groundBody);

    return groundBody;
}

// Create a platform physics body
export function createPlatformBody(world, position, size, platformMaterial) {
    // Create a box body for the platform
    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
    const platformBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(halfExtents),
        material: platformMaterial,
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });

    world.addBody(platformBody);

    return platformBody;
}

// Create player physics body
export function createPlayerBody(world, playerMaterial, radius, height, mass) {
    // Use a cylinder for better character control
    const playerBody = new CANNON.Body({
        mass: mass,
        material: playerMaterial,
        shape: new CANNON.Cylinder(radius, radius, height, 16),
        linearDamping: 0.4,
        angularDamping: 0.99,
        fixedRotation: true, // Prevent tipping over
        position: new CANNON.Vec3(0, height/2 + GROUND_LEVEL + 0.1, 0)
    });

    // Orient the cylinder correctly
    playerBody.shapeOrientations[0].setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        Math.PI / 2
    );

    world.addBody(playerBody);

    return playerBody;
}

// Update physics world with fixed timestep
const fixedTimeStep = 1.0 / 60.0; // 60 Hz
let accumulator = 0;

export function updatePhysics(world, deltaTime) {
    // Use accumulator for stable physics with variable frame rate
    accumulator += deltaTime;

    // Step physics with fixed timestep
    while (accumulator >= fixedTimeStep) {
        world.step(fixedTimeStep);
        accumulator -= fixedTimeStep;
    }
}

// Create a trigger body for collectibles (no physical response)
export function createTriggerBody(world, position, radius) {
    const triggerBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Sphere(radius),
        isTrigger: true, // Trigger only, no physical response
        collisionResponse: false,
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });

    world.addBody(triggerBody);

    return triggerBody;
}
