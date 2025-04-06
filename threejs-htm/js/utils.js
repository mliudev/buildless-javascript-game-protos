// Create a noise pattern for the ground
export function createGroundTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fill with base color
    ctx.fillStyle = '#465b3d';
    ctx.fillRect(0, 0, size, size);

    // Add some noise
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2 + 0.5;

        // Vary colors slightly for a natural look
        const r = Math.floor(Math.random() * 20 + 60);
        const g = Math.floor(Math.random() * 30 + 90);
        const b = Math.floor(Math.random() * 20 + 50);

        ctx.beginPath();
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add some subtle highlights
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(220, 240, 200, 0.2)';
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvas;
}

// Create a bark texture procedurally
export function createBarkTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = '#6e4e37';
    ctx.fillRect(0, 0, size, size);

    // Add bark lines
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = 0;
        const width = Math.random() * 8 + 2;
        const height = size;

        // Vary colors for a natural look
        const r = Math.floor(Math.random() * 40 + 80);
        const g = Math.floor(Math.random() * 30 + 60);
        const b = Math.floor(Math.random() * 20 + 40);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, width, height);
    }

    // Add some knots and details
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 10 + 5;

        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, '#3d2817');
        grd.addColorStop(1, 'rgba(94, 66, 47, 0)');

        ctx.beginPath();
        ctx.fillStyle = grd;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvas;
}
