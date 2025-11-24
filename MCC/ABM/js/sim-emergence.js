// ==========================================
// PART 1: EMERGENCE (SIR Model)
// ==========================================

const SIR_CANVAS_ID = 'sirCanvas';
const SIR_CHART_ID = 'sirChart';

let sirState = {
    agents: [],
    width: 0,
    height: 0,
    running: false, // Start paused
    tick: 0,
    chart: null,
    animationId: null,
    params: {
        radius: 15,
        transmissionProb: 0.2,
        recoveryRate: 0.005,
        speed: 1
    }
};

class SirAgent {
    constructor(x, y, status) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.status = status; // 0=S, 1=I, 2=R
        this.recoveryTimer = 0;
    }

    move(width, height, speed) {
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Bounce
        if (this.x < 0 || this.x > width) { this.vx *= -1; this.x = Math.max(0, Math.min(width, this.x)); }
        if (this.y < 0 || this.y > height) { this.vy *= -1; this.y = Math.max(0, Math.min(height, this.y)); }
    }
}

function initEmergence() {
    const canvas = document.getElementById(SIR_CANVAS_ID);
    if (!canvas) return;

    // Resize observer to handle tab switching layout changes
    const resizeObserver = new ResizeObserver(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        sirState.width = canvas.width;
        sirState.height = canvas.height;
        if(sirState.agents.length === 0) resetSir(); // Init if empty
    });
    resizeObserver.observe(canvas);

    // Controls
    const radEl = document.getElementById('sir-radius');
    if(radEl) radEl.addEventListener('input', (e) => sirState.params.radius = parseInt(e.target.value));
    
    const probEl = document.getElementById('sir-prob');
    if(probEl) probEl.addEventListener('input', (e) => sirState.params.transmissionProb = parseFloat(e.target.value));
    
    const recEl = document.getElementById('sir-recovery');
    if(recEl) recEl.addEventListener('input', (e) => sirState.params.recoveryRate = parseFloat(e.target.value));
    
    const resetBtn = document.getElementById('btn-sir-reset');
    if(resetBtn) resetBtn.addEventListener('click', resetSir);

    initSirChart();
    resetSir();
    sirState.running = true;
    requestAnimationFrame(sirLoop);
}

function resetSir() {
    sirState.agents = [];
    sirState.tick = 0;
    
    // Create 200 agents
    for (let i = 0; i < 200; i++) {
        // Start with 1 infected (patient zero)
        const status = (i === 0) ? 1 : 0;
        sirState.agents.push(new SirAgent(
            Math.random() * sirState.width, 
            Math.random() * sirState.height, 
            status
        ));
    }

    // Reset Chart
    if(sirState.chart) {
        sirState.chart.data.labels = [];
        sirState.chart.data.datasets[0].data = []; // S
        sirState.chart.data.datasets[1].data = []; // I
        sirState.chart.data.datasets[2].data = []; // R
        sirState.chart.update();
    }
}

function initSirChart() {
    const ctx = document.getElementById(SIR_CHART_ID).getContext('2d');
    sirState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Susceptible', data: [], borderColor: '#3b82f6', pointRadius: 0, borderWidth: 2 },
                { label: 'Infected', data: [], borderColor: '#ef4444', pointRadius: 0, borderWidth: 2 },
                { label: 'Recovered', data: [], borderColor: '#22c55e', pointRadius: 0, borderWidth: 2 }
            ]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false, // Key for fitting in small containers
            scales: {
                x: { display: false },
                y: { min: 0, max: 200, display: true }
            },
            plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } }
        }
    });
}

function sirLoop() {
    if (sirState.running && document.getElementById(SIR_CANVAS_ID)) {
        updateSir();
        drawSir();
    }
    requestAnimationFrame(sirLoop);
}

function updateSir() {
    const agents = sirState.agents;
    const rSq = sirState.params.radius * sirState.params.radius;

    // 1. Move
    agents.forEach(a => a.move(sirState.width, sirState.height, sirState.params.speed));

    // 2. Interact (Infection)
    // O(N^2) naive check is fine for N=200
    for (let i = 0; i < agents.length; i++) {
        if (agents[i].status !== 1) continue; // Only Infected spread

        for (let j = 0; j < agents.length; j++) {
            if (i === j || agents[j].status !== 0) continue; // Only affect Susceptible

            const dx = agents[i].x - agents[j].x;
            const dy = agents[i].y - agents[j].y;
            
            // Check distance squared
            if (dx*dx + dy*dy < rSq) {
                if (Math.random() < sirState.params.transmissionProb) {
                    agents[j].status = 1; // Infect
                }
            }
        }
    }

    // 3. Recover
    agents.forEach(a => {
        if (a.status === 1) {
            if (Math.random() < sirState.params.recoveryRate) {
                a.status = 2; // Recovered
            }
        }
    });

    sirState.tick++;
    if(sirState.tick % 5 === 0) updateSirStats(); // Update stats every 5 frames
}

function drawSir() {
    const canvas = document.getElementById(SIR_CANVAS_ID);
    const ctx = canvas.getContext('2d');
    
    // Fade trail effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Slate-900 with opacity
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    sirState.agents.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
        
        if (a.status === 0) ctx.fillStyle = '#3b82f6'; // Blue (Susceptible)
        else if (a.status === 1) {
            ctx.fillStyle = '#ef4444'; // Red (Infected)
            // Draw infection radius
            ctx.beginPath();
            ctx.arc(a.x, a.y, sirState.params.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.stroke();
            // Redraw agent dot
            ctx.beginPath();
            ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
        }
        else ctx.fillStyle = '#22c55e'; // Green (Recovered)
        
        ctx.fill();
    });
}

function updateSirStats() {
    const s = sirState.agents.filter(a => a.status === 0).length;
    const i = sirState.agents.filter(a => a.status === 1).length;
    const r = sirState.agents.filter(a => a.status === 2).length;

    const elS = document.getElementById('sir-s-count');
    const elI = document.getElementById('sir-i-count');
    const elR = document.getElementById('sir-r-count');

    if(elS) elS.innerText = s;
    if(elI) elI.innerText = i;
    if(elR) elR.innerText = r;

    // Update Chart
    if (sirState.chart) {
        if (sirState.chart.data.labels.length > 100) {
            sirState.chart.data.labels.shift();
            sirState.chart.data.datasets.forEach(d => d.data.shift());
        }
        sirState.chart.data.labels.push(sirState.tick);
        sirState.chart.data.datasets[0].data.push(s);
        sirState.chart.data.datasets[1].data.push(i);
        sirState.chart.data.datasets[2].data.push(r);
        sirState.chart.update('none');
    }
}

document.addEventListener('DOMContentLoaded', initEmergence);
