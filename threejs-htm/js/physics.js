import * as CANNON from 'cannon-es';
import { GRAVITY } from './constants.js';

// Create the physics world
export function createPhysicsWorld() {
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, GRAVITY, 0)
    });

    world.defaultContactMaterial.friction = 0.1;
    world.defaultContactMaterial.restitution = 0.0;
    world.solver.iterations = 10; // More solver iterations for stability
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;

    return world;
}

// Create contact materials
export function createContactMaterials(world) {
    // Create physics materials
    const groundMaterial = new CANNON.Material('ground');
    const playerMaterial = new CANNON.Material('player');

    // Contact material between ground and player
    const groundPlayerContactMaterial = new CANNON.ContactMaterial(
        groundMaterial,
        playerMaterial,
        {
            friction: 0.1,
            restitution: 0.0,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        }
    );
    world.addContactMaterial(groundPlayerContactMaterial);

    return { groundMaterial, playerMaterial };
}

// Step physics simulation with fixed timestep
let accumulator = 0;
const fixedTimeStep = 1.0 / 60.0;

export function updatePhysics(world, deltaTime) {
    // Use accumulator for stable physics simulation
    accumulator += deltaTime;

    // Update physics with fixed timestep
    while (accumulator >= fixedTimeStep) {
        world.step(fixedTimeStep);
        accumulator -= fixedTimeStep;
    }
}
