import * as THREE from 'three';
import {
    COLORS,
    WORLD_SIZE,
    PLATFORM_MIN_Y,
    PLATFORM_MAX_Y
} from './constants.js';

// Create a procedural ground texture with noise
export function createGroundTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color
    const baseColor = new THREE.Color(COLORS.GROUND);
    const baseColorHex = '#' + baseColor.getHexString();
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, size, size);

    // Create noise pattern
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2 + 0.5;

        // Vary colors slightly from base
        const hsl = {h: 0, s: 0, l: 0};
        baseColor.getHSL(hsl);
        const h = hsl.h;
        const s = hsl.s * (0.9 + Math.random() * 0.2);
        const l = hsl.l * (0.85 + Math.random() * 0.3);

        const noiseColor = new THREE.Color().setHSL(h, s, l);

        ctx.beginPath();
        ctx.fillStyle = '#' + noiseColor.getHexString();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

// Create a procedural platform texture
export function createPlatformTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color
    const baseColor = new THREE.Color(COLORS.PLATFORM);
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, size, size);

    // Create grid pattern
    const gridSize = 32;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;

    // Horizontal lines
    for (let y = 0; y <= size; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
    }

    // Vertical lines
    for (let x = 0; x <= size; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
}

// Create a procedural player texture
export function createPlayerTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color
    const baseColor = new THREE.Color(COLORS.PLAYER);
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, size, size);

    // Add some highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.3, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Add some geometric patterns
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 5;

    // Random number of stripes
    const stripes = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < stripes; i++) {
        const y = size * 0.2 + (size * 0.6 * i / stripes);
        ctx.beginPath();
        ctx.moveTo(size * 0.2, y);
        ctx.lineTo(size * 0.8, y);
        ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
}

// Create a procedural collectible texture with a star pattern
export function createCollectibleTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, size, size);

    // Draw a star
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.45;
    const innerRadius = size * 0.2;
    const spikes = 5;

    const baseColor = new THREE.Color(COLORS.COLLECTIBLE);
    ctx.fillStyle = '#' + baseColor.getHexString();

    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    ctx.moveTo(centerX, centerY - outerRadius);

    for(let i = 0; i < spikes; i++) {
        ctx.lineTo(
            centerX + Math.cos(rot) * outerRadius,
            centerY + Math.sin(rot) * outerRadius
        );
        rot += Math.PI / spikes;

        ctx.lineTo(
            centerX + Math.cos(rot) * innerRadius,
            centerY + Math.sin(rot) * innerRadius
        );
        rot += Math.PI / spikes;
    }

    ctx.lineTo(centerX, centerY - outerRadius);
    ctx.closePath();
    ctx.fill();

    // Add a highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.35, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

// Generate a random position for platforms
export function getRandomPlatformPosition(platformSize) {
    // Distribute platforms somewhat evenly
    const x = (Math.random() - 0.5) * WORLD_SIZE;
    const z = (Math.random() - 0.5) * WORLD_SIZE;

    // Random height within min/max range
    const y = PLATFORM_MIN_Y + Math.random() * (PLATFORM_MAX_Y - PLATFORM_MIN_Y);

    return new THREE.Vector3(x, y, z);
}

// Radians to degrees
export function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

// Degrees to radians
export function degToRad(deg) {
    return deg * Math.PI / 180;
}

// Lerp utility
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Clamp utility
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
