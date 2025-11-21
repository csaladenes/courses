// ==========================================
// PART 3: EVOLUTIONARY GAMES (Blobs, Food, & Predators)
// ==========================================

const EVO_CANVAS_ID = 'evoGridCanvas';

let evoState = {
    blobs: [],
    predators: [],
    food: [],
    running: false,
    generation: 0,
    timer: null,
    width: 0,
    height: 0,
    params: {
        cost: 10,
        benefit: 30,
        blobSpeed: 1.5,
        predatorSpeed: 2.2,
        foodSpawnRate: 0.1,
        mutationRate: 0.01
    },
    scenario: 'greenbeard' // 'pure', 'greenbeard'
};

class BlobAgent {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'altruist' or 'freeloader'
        this.energy = 50;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 5;
        this.cooldown = 0;
    }

    move(width, height) {
        this.x += this.vx * evoState.params.blobSpeed;
        this.y += this.vy * evoState.params.blobSpeed;

        // Bounce
        if(this.x < 0 || this.x > width) { this.vx *= -1; this.x = Math.max(0, Math.min(width, this.x)); }
        if(this.y < 0 || this.y > height) { this.vy *= -1; this.y = Math.max(0, Math.min(height, this.y)); }

        // Wander
        if(Math.random() < 0.05) {
            this.vx += (Math.random() - 0.5);
            this.vy += (Math.random() - 0.5);
            // Normalize
            const mag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            this.vx /= mag; this.vy /= mag;
        }

        this.energy -= 0.1; // Metabolic cost
        if(this.cooldown > 0) this.cooldown--;
    }
}

class Predator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 8;
    }

    move(width, height, targets) {
        // Simple chase logic
        let closest = null;
        let minDst = 100000;

        targets.forEach(t => {
            const dx = t.x - this.x;
            const dy = t.y - this.y;
            const d = dx*dx + dy*dy;
            if(d < minDst) { minDst = d; closest = t; }
        });

        if(closest && minDst < 40000) { // Aggro range
            const dx = closest.x - this.x;
            const dy = closest.y - this.y;
            const mag = Math.sqrt(dx*dx + dy*dy);
            this.vx = (dx / mag);
            this.vy = (dy / mag);
        } else {
            // Wander
             if(Math.random() < 0.05) {
                this.vx += (Math.random() - 0.5);
                this.vy += (Math.random() - 0.5);
                const mag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                this.vx /= mag; this.vy /= mag;
            }
        }

        this.x += this.vx * evoState.params.predatorSpeed;
        this.y += this.vy * evoState.params.predatorSpeed;

        if(this.x < 0 || this.x > width) this.vx *= -1;
        if(this.y < 0 || this.y > height) this.vy *= -1;
    }
}

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.energy = 20;
        this.radius = 3;
    }
}

// UI Helpers
function changeEvoVideo(videoId, btn) {
    const iframe = document.getElementById('evo-video-frame');
    if (iframe) iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    document.querySelectorAll('.evo-video-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-100');
        b.classList.add('bg-white');
    });
    btn.classList.remove('bg-white');
    btn.classList.add('bg-indigo-100', 'ring-2', 'ring-indigo-500');
}

function initEvolution() {
    const canvas = document.getElementById(EVO_CANVAS_ID);
    if (!canvas) return;

    // Resize
    const resizeObserver = new ResizeObserver(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        evoState.width = canvas.width;
        evoState.height = canvas.height;
        if(evoState.blobs.length === 0) resetEvo();
    });
    resizeObserver.observe(canvas);

    // Controls
    const runBtn = document.getElementById('btn-run-evo');
    if(runBtn) runBtn.addEventListener('click', toggleAutoRun);
    
    const resetBtn = document.getElementById('btn-reset-evo');
    if(resetBtn) resetBtn.addEventListener('click', resetEvo);

    const stepBtn = document.getElementById('btn-step-evo');
    if(stepBtn) stepBtn.addEventListener('click', () => {
        if(evoState.running) toggleAutoRun();
        updateEvo();
        drawEvo();
    });

    // Scenario
    document.querySelectorAll('input[name="evo-scenario"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            evoState.scenario = e.target.value;
            resetEvo();
        });
    });

    window.changeEvoVideo = changeEvoVideo;

    resetEvo();
    requestAnimationFrame(evoDrawLoop);
}

function resetEvo() {
    evoState.blobs = [];
    evoState.predators = [];
    evoState.food = [];
    evoState.generation = 0;
    
    // Initial Population
    for(let i=0; i<30; i++) evoState.blobs.push(new BlobAgent(Math.random()*evoState.width, Math.random()*evoState.height, 'altruist'));
    for(let i=0; i<30; i++) evoState.blobs.push(new BlobAgent(Math.random()*evoState.width, Math.random()*evoState.height, 'freeloader'));
    
    // Predators
    for(let i=0; i<3; i++) evoState.predators.push(new Predator(Math.random()*evoState.width, Math.random()*evoState.height));

    // Initial Food
    for(let i=0; i<50; i++) evoState.food.push(new Food(Math.random()*evoState.width, Math.random()*evoState.height));

    updateStatsUI();
}

function toggleAutoRun() {
    evoState.running = !evoState.running;
    const btn = document.getElementById('btn-run-evo');
    if(btn) {
        btn.textContent = evoState.running ? "Pause" : "Auto Run";
        btn.classList.toggle('bg-red-600', evoState.running);
        btn.classList.toggle('bg-indigo-600', !evoState.running);
    }
    if(evoState.running) evoLoop();
}

function evoLoop() {
    if(!evoState.running) return;
    updateEvo();
    drawEvo(); // Draw strictly coupled to update for smoothness in physics sim
    requestAnimationFrame(evoLoop);
}

// Separate draw loop for idle state? No, coupled is better for physics.
function evoDrawLoop() {
    if(!evoState.running) {
        drawEvo();
        requestAnimationFrame(evoDrawLoop);
    }
}

function updateEvo() {
    // 1. Spawn Food
    if(Math.random() < evoState.params.foodSpawnRate * 5) { // Spawn clusters
        evoState.food.push(new Food(Math.random()*evoState.width, Math.random()*evoState.height));
    }

    // 2. Update Predators
    evoState.predators.forEach(p => {
        p.move(evoState.width, evoState.height, evoState.blobs);
        // Eat Blobs
        for(let i = evoState.blobs.length - 1; i >= 0; i--) {
            const b = evoState.blobs[i];
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            if(dx*dx + dy*dy < (p.radius + b.radius)**2) {
                evoState.blobs.splice(i, 1); // Eaten
            }
        }
    });

    // 3. Update Blobs
    evoState.blobs.forEach(b => {
        b.move(evoState.width, evoState.height);

        // Eat Food
        for(let i = evoState.food.length - 1; i >= 0; i--) {
            const f = evoState.food[i];
            const dx = b.x - f.x;
            const dy = b.y - f.y;
            if(dx*dx + dy*dy < (b.radius + f.radius + 5)**2) { // Suction range
                b.energy += f.energy;
                evoState.food.splice(i, 1);
            }
        }

        // ALTRUISM INTERACTION
        // Find neighbors
        if(b.type === 'altruist' && b.energy > 30 && b.cooldown === 0) {
            evoState.blobs.forEach(other => {
                if(b === other) return;
                const dx = b.x - other.x;
                const dy = b.y - other.y;
                if(dx*dx + dy*dy < 900) { // Proximity 30px
                    let willHelp = false;
                    if(evoState.scenario === 'pure') willHelp = true;
                    else if(evoState.scenario === 'greenbeard' && other.type === 'altruist') willHelp = true;

                    if(willHelp && other.energy < 80) {
                        b.energy -= evoState.params.cost;
                        other.energy += evoState.params.benefit;
                        b.cooldown = 20; // Prevent spam
                        // Visual flare handled in draw
                        b.interacting = true;
                        other.interacting = true;
                        setTimeout(() => { b.interacting = false; other.interacting = false; }, 200);
                    }
                }
            });
        }

        // Reproduction
        if(b.energy > 100) {
            b.energy -= 50;
            let childType = b.type;
            if(Math.random() < evoState.params.mutationRate) {
                childType = (b.type === 'altruist') ? 'freeloader' : 'altruist';
            }
            evoState.blobs.push(new BlobAgent(b.x, b.y, childType));
        }
    });

    // Death
    evoState.blobs = evoState.blobs.filter(b => b.energy > 0);

    updateStatsUI();
}

function drawEvo() {
    const canvas = document.getElementById(EVO_CANVAS_ID);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background (Environment)
    ctx.fillStyle = '#f0fdf4'; // Light green tint
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food (Trees/Bushes)
    ctx.fillStyle = '#16a34a';
    evoState.food.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI*2);
        ctx.fill();
    });

    // Draw Blobs
    evoState.blobs.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
        
        if(b.type === 'altruist') {
            ctx.fillStyle = '#3b82f6'; // Blue
            if(evoState.scenario === 'greenbeard') {
                ctx.strokeStyle = '#16a34a'; // Green Beard
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        } else {
            ctx.fillStyle = '#94a3b8'; // Gray/Pinkish
        }
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000'; // Outline

        // Interaction Flare
        if(b.interacting) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius + 5, 0, Math.PI*2);
            ctx.strokeStyle = '#fbbf24'; // Gold glow
            ctx.stroke();
        }
    });

    // Draw Predators
    ctx.fillStyle = '#dc2626'; // Red
    evoState.predators.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();
        // Teeth
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.x-3, p.y-2, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x+3, p.y-2, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#dc2626';
    });
}

function updateStatsUI() {
    const alt = evoState.blobs.filter(b => b.type === 'altruist').length;
    const free = evoState.blobs.filter(b => b.type === 'freeloader').length;
    
    const elAlt = document.getElementById('stat-alt');
    const elFree = document.getElementById('stat-free');
    
    if(elAlt) elAlt.innerText = alt;
    if(elFree) elFree.innerText = free;
}

document.addEventListener('DOMContentLoaded', initEvolution);
