import * as THREE from 'three';
import { COLORS } from './constants.js';

// Generate a noise texture for ground
export function createGroundTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // Fill with base color
    const baseColor = new THREE.Color(COLORS.GROUND);
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, size, size);

    // Add noise
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2 + 0.5;

        // Vary color slightly
        const noise = Math.random() * 0.2 - 0.1;
        const r = clamp(baseColor.r + noise, 0, 1);
        const g = clamp(baseColor.g + noise, 0, 1);
        const b = clamp(baseColor.b + noise, 0, 1);

        const noiseColor = new THREE.Color(r, g, b);
        ctx.fillStyle = '#' + noiseColor.getHexString();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add some larger patches
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 50 + 20;

        // Darker patches
        const noise = -Math.random() * 0.1 - 0.05;
        const r = clamp(baseColor.r + noise, 0, 1);
        const g = clamp(baseColor.g + noise, 0, 1);
        const b = clamp(baseColor.b + noise, 0, 1);

        const patchColor = new THREE.Color(r, g, b);
        ctx.fillStyle = '#' + patchColor.getHexString();
        ctx.globalAlpha = 0.7;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;

    // Add some grass-like details
    ctx.strokeStyle = '#' + new THREE.Color(COLORS.GRASS).getHexString();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = Math.random() * 10 + 5;
        const angle = Math.random() * Math.PI;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(angle) * length,
            y + Math.sin(angle) * length
        );
        ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
}

// Create bark texture for trees
export function createBarkTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // Fill with base color
    const baseColor = new THREE.Color(COLORS.TREE_TRUNK);
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, size, size);

    // Add vertical stripes (bark texture)
    const stripeCount = 15;

    for (let i = 0; i < stripeCount; i++) {
        const x = i * (size / stripeCount);
        const width = Math.random() * 10 + 5;

        // Vary color slightly
        const noise = Math.random() * 0.1 - 0.05;
        const r = clamp(baseColor.r + noise, 0, 1);
        const g = clamp(baseColor.g + noise, 0, 1);
        const b = clamp(baseColor.b + noise, 0, 1);

        const stripeColor = new THREE.Color(r, g, b);
        ctx.fillStyle = '#' + stripeColor.getHexString();

        ctx.fillRect(x, 0, width, size);
    }

    // Add horizontal cracks and details
    const crackCount = 30;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;

    for (let i = 0; i < crackCount; i++) {
        const y = Math.random() * size;
        const length = Math.random() * 100 + 20;
        const x = Math.random() * (size - length);

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Create a wavy line
        const segments = 5;
        for (let j = 1; j <= segments; j++) {
            const nextX = x + (j * length / segments);
            const nextY = y + (Math.random() * 20 - 10);
            ctx.lineTo(nextX, nextY);
        }

        ctx.stroke();
    }

    ctx.globalAlpha = 1.0;

    return new THREE.CanvasTexture(canvas);
}

// Create leaves texture
export function createLeavesTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // Fill with base color
    const baseColor = new THREE.Color(COLORS.TREE_LEAVES);
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, size, size);

    // Add leaf patterns
    const leafCount = 300;

    for (let i = 0; i < leafCount; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 15 + 5;

        // Vary color slightly
        let noise = Math.random() * 0.2 - 0.1;
        // More variation in green channel
        let r = clamp(baseColor.r + noise * 0.5, 0, 1);
        let g = clamp(baseColor.g + noise, 0, 1);
        let b = clamp(baseColor.b + noise * 0.5, 0, 1);

        const leafColor = new THREE.Color(r, g, b);
        ctx.fillStyle = '#' + leafColor.getHexString();
        ctx.globalAlpha = 0.7;

        // Draw oval-shaped leaves
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 2, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add vein patterns
    ctx.strokeStyle = '#' + new THREE.Color(COLORS.TREE_LEAVES).multiplyScalar(0.8).getHexString();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = Math.random() * 40 + 20;
        const angle = Math.random() * Math.PI;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Main vein
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Side veins
        const sideVeins = Math.floor(Math.random() * 5) + 3;
        for (let j = 1; j <= sideVeins; j++) {
            const segX = x + Math.cos(angle) * (length * j / sideVeins);
            const segY = y + Math.sin(angle) * (length * j / sideVeins);

            const sideLength = length * 0.3;
            const sideAngle1 = angle + Math.PI / 4;
            const sideAngle2 = angle - Math.PI / 4;

            ctx.beginPath();
            ctx.moveTo(segX, segY);
            ctx.lineTo(
                segX + Math.cos(sideAngle1) * sideLength,
                segY + Math.sin(sideAngle1) * sideLength
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(segX, segY);
            ctx.lineTo(
                segX + Math.cos(sideAngle2) * sideLength,
                segY + Math.sin(sideAngle2) * sideLength
            );
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1.0;

    return new THREE.CanvasTexture(canvas);
}

// Create artifact texture (glowing crystal)
export function createArtifactTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createRadialGradient(
        size/2, size/2, 0,
        size/2, size/2, size/2
    );

    const baseColor = new THREE.Color(COLORS.ARTIFACT);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#' + baseColor.getHexString());
    gradient.addColorStop(1, '#' + baseColor.multiplyScalar(0.5).getHexString());

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add crystal facets
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;

    const centerX = size / 2;
    const centerY = size / 2;
    const facets = 8;

    for (let i = 0; i < facets; i++) {
        const angle = (i / facets) * Math.PI * 2;
        const nextAngle = ((i + 1) / facets) * Math.PI * 2;

        const x1 = centerX + Math.cos(angle) * (size * 0.4);
        const y1 = centerY + Math.sin(angle) * (size * 0.4);

        const x2 = centerX + Math.cos(nextAngle) * (size * 0.4);
        const y2 = centerY + Math.sin(nextAngle) * (size * 0.4);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }

    // Add glow effect
    const glowGradient = ctx.createRadialGradient(
        size/2, size/2, size * 0.3,
        size/2, size/2, size
    );

    glowGradient.addColorStop(0, 'rgba(' + Math.round(baseColor.r * 255) + ',' +
                              Math.round(baseColor.g * 255) + ',' +
                              Math.round(baseColor.b * 255) + ',0.5)');
    glowGradient.addColorStop(1, 'rgba(' + Math.round(baseColor.r * 255) + ',' +
                              Math.round(baseColor.g * 255) + ',' +
                              Math.round(baseColor.b * 255) + ',0)');

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}

// Generate a random position within the world
export function getRandomPosition(minDistance = 0, maxDistance = Infinity) {
    const radius = Math.random() * (maxDistance - minDistance) + minDistance;
    const angle = Math.random() * Math.PI * 2;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    return new THREE.Vector3(x, 0, z);
}

// Utility function to clamp a value
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Utility function to calculate linear interpolation
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Utility to create height field for subtle ground variations
export function generateHeightField(size, scale = 1) {
    const field = [];
    // Simple noise function
    for (let x = 0; x < size; x++) {
        field[x] = [];
        for (let z = 0; z < size; z++) {
            const nx = x / size - 0.5;
            const nz = z / size - 0.5;

            // Simple noise formula
            let height = Math.sin(nx * 5) * Math.cos(nz * 5) * 0.5;
            height += Math.sin(nx * 20) * Math.cos(nz * 20) * 0.2;
            height += Math.sin(nx * 50) * Math.cos(nz * 50) * 0.05;

            // Scale and normalize to 0-1 range
            height = (height + 0.75) * scale;

            field[x][z] = height;
        }
    }
    return field;
}

// Get height at a specific world position
export function getHeightAt(heightField, worldX, worldZ, worldSize, fieldSize) {
    const halfWorld = worldSize / 2;

    // Map world coordinates to height field indices
    const fx = Math.floor(((worldX + halfWorld) / worldSize) * (fieldSize - 1));
    const fz = Math.floor(((worldZ + halfWorld) / worldSize) * (fieldSize - 1));

    // Clamp to valid indices
    const x = clamp(fx, 0, fieldSize - 1);
    const z = clamp(fz, 0, fieldSize - 1);

    return heightField[x][z];
}
