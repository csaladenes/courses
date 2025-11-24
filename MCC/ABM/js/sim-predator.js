// ==========================================
// PART 1: PREDATOR-PREY ABM (Foxes & Rabbits)
// ==========================================

const PREDATOR_CANVAS_ID = 'predatorCanvas';
const CHART_TIME_ID = 'chart-pop-time';
const CHART_PHASE_ID = 'chart-phase';

// Simulation Constants & State
let ppState = {
    agents: [],
    width: 0,
    height: 0,
    running: true,
    tick: 0,
    history: { rabbits: [], foxes: [] },
    params: {
        rabbitBirthRate: 0.02,
        foxPredationRate: 0.04, // Chance to eat if touching
        foxDeathRate: 0.01,
        foxReproductionRate: 0.5, // Chance to reproduce after eating
        rabbitSpeed: 2,
        foxSpeed: 2.5
    }
};

class Agent {
    constructor(type, x, y) {
        this.type = type; // 'rabbit' or 'fox'
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.alive = true;
    }

    move(width, height, speed) {
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Bounce off walls
        if (this.x < 0 || this.x > width) { this.vx *= -1; this.x = Math.max(0, Math.min(width, this.x)); }
        if (this.y < 0 || this.y > height) { this.vy *= -1; this.y = Math.max(0, Math.min(height, this.y)); }
        
        // Random wiggle
        if (Math.random() < 0.1) {
            this.vx += (Math.random() - 0.5);
            this.vy += (Math.random() - 0.5);
            // Normalize speed roughly
            const mag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (mag > 0) { this.vx /= mag; this.vy /= mag; }
        }
    }
}

// Charts
let chartTime, chartPhase;

function initPredatorPrey() {
    const canvas = document.getElementById(PREDATOR_CANVAS_ID);
    if (!canvas) return;
    
    // Set canvas size resolution
    // Use offsetWidth/Height to get rendered size, then set internal width/height to match
    // This prevents "infinite growth" or scale mismatches
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ppState.width = canvas.width;
    ppState.height = canvas.height;

    // Initial Population
    resetPredatorPrey();

    // Setup Charts
    setupCharts();

    // Event Listeners for Controls
    const bRate = document.getElementById('param-birth');
    if(bRate) bRate.addEventListener('input', (e) => ppState.params.rabbitBirthRate = parseFloat(e.target.value));
    
    const pRate = document.getElementById('param-predation');
    if(pRate) pRate.addEventListener('input', (e) => ppState.params.foxPredationRate = parseFloat(e.target.value));
    
    const resetBtn = document.getElementById('btn-reset-predator');
    if(resetBtn) resetBtn.addEventListener('click', resetPredatorPrey);
    
    const pauseBtn = document.getElementById('btn-pause-predator');
    if(pauseBtn) pauseBtn.addEventListener('click', () => {
        ppState.running = !ppState.running;
        pauseBtn.textContent = ppState.running ? "Pause" : "Resume";
    });

    // Start Loop
    requestAnimationFrame(ppLoop);
}

function resetPredatorPrey() {
    ppState.agents = [];
    ppState.tick = 0;
    ppState.history.rabbits = [];
    ppState.history.foxes = [];
    
    // Add initial agents
    for(let i=0; i<100; i++) ppState.agents.push(new Agent('rabbit', Math.random()*ppState.width, Math.random()*ppState.height));
    for(let i=0; i<15; i++) ppState.agents.push(new Agent('fox', Math.random()*ppState.width, Math.random()*ppState.height));

    if(chartTime) { 
        chartTime.data.labels = []; 
        chartTime.data.datasets[0].data = []; 
        chartTime.data.datasets[1].data = []; 
        chartTime.update(); 
    }
    if(chartPhase) { 
        chartPhase.data.datasets[0].data = []; 
        chartPhase.update(); 
    }
}

function setupCharts() {
    const ctxTimeEl = document.getElementById(CHART_TIME_ID);
    if(ctxTimeEl) {
        // Destroy existing instance if re-initializing
        if(chartTime) chartTime.destroy();
        
        const ctxTime = ctxTimeEl.getContext('2d');
        chartTime = new Chart(ctxTime, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Rabbits', data: [], borderColor: '#10b981', tension: 0.4, pointRadius: 0 },
                    { label: 'Foxes', data: [], borderColor: '#ef4444', tension: 0.4, pointRadius: 0 }
                ]
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                scales: { x: { display: false } },
                plugins: { legend: { display: true } }
            }
        });
    }

    const ctxPhaseEl = document.getElementById(CHART_PHASE_ID);
    if(ctxPhaseEl) {
        // Destroy existing instance if re-initializing
        if(chartPhase) chartPhase.destroy();

        const ctxPhase = ctxPhaseEl.getContext('2d');
        chartPhase = new Chart(ctxPhase, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Cycle',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: '#6366f1',
                    showLine: true,
                    pointRadius: 0,
                    borderWidth: 1
                }]
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Prey (Rabbits)' } },
                    y: { title: { display: true, text: 'Predator (Foxes)' } }
                }
            }
        });
    }
}

function ppLoop() {
    // Check if canvas exists and is visible (in active tab)
    const canvas = document.getElementById(PREDATOR_CANVAS_ID);
    if (ppState.running && canvas && canvas.offsetParent !== null) {
        updatePP();
        drawPP();
        updateChartsPP();
    }
    requestAnimationFrame(ppLoop);
}

function updatePP() {
    const rabbits = ppState.agents.filter(a => a.type === 'rabbit');
    const foxes = ppState.agents.filter(a => a.type === 'fox');
    
    // 1. Move & Rules
    ppState.agents.forEach(agent => {
        if (!agent.alive) return;

        if (agent.type === 'rabbit') {
            agent.move(ppState.width, ppState.height, ppState.params.rabbitSpeed);
            // Birth
            if (Math.random() < ppState.params.rabbitBirthRate && rabbits.length < 600) {
                ppState.agents.push(new Agent('rabbit', agent.x, agent.y));
            }
        } else {
            agent.move(ppState.width, ppState.height, ppState.params.foxSpeed);
            // Death (starvation)
            if (Math.random() < ppState.params.foxDeathRate) {
                agent.alive = false;
            }
        }
    });

    // 2. Interactions (Predation)
    // Naive O(N^2) is fine for N < 1000
    const livingFoxes = ppState.agents.filter(a => a.type === 'fox' && a.alive);
    const livingRabbits = ppState.agents.filter(a => a.type === 'rabbit' && a.alive);

    livingFoxes.forEach(fox => {
        // Find closest rabbit
        for (let rabbit of livingRabbits) {
            if (!rabbit.alive) continue;
            const dx = fox.x - rabbit.x;
            const dy = fox.y - rabbit.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 10) { // Catch range
                if (Math.random() < ppState.params.foxPredationRate) {
                    rabbit.alive = false;
                    // Reproduction (energy gain)
                    if (Math.random() < ppState.params.foxReproductionRate) {
                        ppState.agents.push(new Agent('fox', fox.x, fox.y));
                    }
                    break; // Only eat one per tick
                }
            }
        }
    });

    // Cleanup dead
    ppState.agents = ppState.agents.filter(a => a.alive);
    ppState.tick++;
}

function drawPP() {
    const canvas = document.getElementById(PREDATOR_CANVAS_ID);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ppState.agents.forEach(a => {
        if (a.type === 'rabbit') {
            ctx.fillStyle = '#10b981'; // emerald-500
            ctx.beginPath(); ctx.arc(a.x, a.y, 3, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillStyle = '#ef4444'; // red-500
            ctx.beginPath(); ctx.arc(a.x, a.y, 5, 0, Math.PI*2); ctx.fill();
        }
    });
}

function updateChartsPP() {
    if (ppState.tick % 10 !== 0) return; // Update charts every 10 ticks

    const rCount = ppState.agents.filter(a => a.type === 'rabbit').length;
    const fCount = ppState.agents.filter(a => a.type === 'fox').length;

    // Update DOM Stats
    const elR = document.getElementById('stat-rabbits');
    const elF = document.getElementById('stat-foxes');
    if(elR) elR.innerText = rCount;
    if(elF) elF.innerText = fCount;

    // Time Series
    if(chartTime) {
        if (chartTime.data.labels.length > 100) {
            chartTime.data.labels.shift();
            chartTime.data.datasets[0].data.shift();
            chartTime.data.datasets[1].data.shift();
        }
        chartTime.data.labels.push(ppState.tick);
        chartTime.data.datasets[0].data.push(rCount);
        chartTime.data.datasets[1].data.push(fCount);
        chartTime.update('none');
    }

    // Phase Plot
    if(chartPhase) {
        if (chartPhase.data.datasets[0].data.length > 200) {
            chartPhase.data.datasets[0].data.shift();
        }
        chartPhase.data.datasets[0].data.push({ x: rCount, y: fCount });
        chartPhase.update('none');
    }
}


// ==========================================
// PART 2: LORENTZ ATTRACTOR (Chaos)
// ==========================================
const CHAOS_CANVAS_ID = 'chaosCanvas';
let chaosState = {
    particles: [],
    sigma: 10,
    rho: 28,
    beta: 8/3,
    dt: 0.01,
    running: false
};

class ChaosParticle {
    constructor(x, y, z, color) {
        this.x = x; this.y = y; this.z = z;
        this.color = color;
        this.trail = [];
    }
    update(s, r, b, dt) {
        let dx = s * (this.y - this.x) * dt;
        let dy = (this.x * (r - this.z) - this.y) * dt;
        let dz = (this.x * this.y - b * this.z) * dt;
        this.x += dx; this.y += dy; this.z += dz;
        
        this.trail.push({x: this.x, y: this.y, z: this.z});
        if (this.trail.length > 500) this.trail.shift();
    }
}

function initChaos() {
    const canvas = document.getElementById(CHAOS_CANVAS_ID);
    if (!canvas) return;
    
    // Ensure correct sizing
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 400;
    canvas.height = rect.height || 300;

    const btn = document.getElementById('btn-launch-chaos');
    if(btn) btn.addEventListener('click', launchChaos);
    
    // Start render loop
    requestAnimationFrame(chaosLoop);
}

function launchChaos() {
    chaosState.particles = [];
    // Create two nearly identical particles
    chaosState.particles.push(new ChaosParticle(0.1, 0, 0, '#22d3ee')); // Cyan
    chaosState.particles.push(new ChaosParticle(0.1001, 0, 0, '#f472b6')); // Pink
    chaosState.running = true;
}

function chaosLoop() {
    // Check visibility
    const canvas = document.getElementById(CHAOS_CANVAS_ID);
    if (chaosState.running && canvas && canvas.offsetParent !== null) {
        chaosState.particles.forEach(p => p.update(chaosState.sigma, chaosState.rho, chaosState.beta, chaosState.dt));
        drawChaos();
    }
    requestAnimationFrame(chaosLoop);
}

function drawChaos() {
    const canvas = document.getElementById(CHAOS_CANVAS_ID);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 12;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 150;

    chaosState.particles.forEach(p => {
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        if (p.trail.length > 1) {
            for (let i = 0; i < p.trail.length - 1; i++) {
                const p1 = p.trail[i];
                const p2 = p.trail[i+1];
                ctx.moveTo(cx + p1.x * scale, cy - p1.z * scale);
                ctx.lineTo(cx + p2.x * scale, cy - p2.z * scale);
            }
            ctx.stroke();
        }
    });
}

// Init both on load
document.addEventListener('DOMContentLoaded', () => {
    initPredatorPrey();
    initChaos();
});
