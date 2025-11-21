// ... existing code ...

function drawChaos() {
    const canvas = document.getElementById(CHAOS_CANVAS_ID);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 12; // Increased from 8 to 12 to make butterfly larger
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 150; // Shifted down further (100 -> 150) to center the attractor

    chaosState.particles.forEach(p => {
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        if (p.trail.length > 1) {
            // Simple projection: x and z-y (isometric-ish look)
            for (let i = 0; i < p.trail.length - 1; i++) {
                const p1 = p.trail[i];
                const p2 = p.trail[i+1];
                ctx.moveTo(cx + p1.x * scale, cy - p1.z * scale); // plotting x vs z for standard butterfly look
                ctx.lineTo(cx + p2.x * scale, cy - p2.z * scale);
            }
            ctx.stroke();
        }
    });
}

// ... existing code ...
