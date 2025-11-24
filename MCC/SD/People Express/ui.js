// Global Simulator Instance
let sim;
let charts = {};

// Configurable API URL (Default: Localhost for testing, change for prod)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' // Dev environment
    : 'https://gem.csaladen.es'; // Prod environment (Secure via Traefik)

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // Check for Instance ID
    const instanceId = localStorage.getItem('pe_instance_id');
    if (!instanceId) {
        document.getElementById('instance-modal').classList.remove('hidden');
    } else {
        document.getElementById('instance-modal').classList.add('hidden');
        updateInstanceDisplay(instanceId);
        loadLeaderboard(); // Load specific leaderboard
    }

    // Load Admin Settings (Max Quarters) - Default 20
    const savedQuarters = localStorage.getItem('pe_admin_quarters') || 20;
    
    sim = new PeopleExpressSim(parseInt(savedQuarters));
    
    // Chart.js Global Configuration for Responsiveness
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // Initialize empty chart objects
    createCharts();
    
    // Update with initial data
    updateUI(sim.history[0]);
    updateCharts(); 
    
    setupEventListeners();
    loadContent();
});

function initMermaid() {
    // Disabled for static image replacement
}

function saveInstanceId() {
    const input = document.getElementById('modal-instance-input').value.trim().toUpperCase();
    if (!input) return alert("Please enter a valid Class Code.");
    
    localStorage.setItem('pe_instance_id', input);
    document.getElementById('instance-modal').classList.add('hidden');
    updateInstanceDisplay(input);
    loadLeaderboard();
}

function clearInstanceId() {
    if(confirm("Change Class Code?")) {
        localStorage.removeItem('pe_instance_id');
        location.reload();
    }
}

function updateInstanceDisplay(id) {
    const display = document.getElementById('current-instance-display');
    const codeSpan = document.getElementById('display-code');
    const lbCode = document.getElementById('leaderboard-code');
    
    display.classList.remove('hidden');
    codeSpan.innerText = id;
    lbCode.innerText = id;
}

// Admin Panel Logic
function openAdminPanel() {
    if (!document.getElementById('admin-modal')) {
        // ... existing modal create logic ...
    }
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('setting-horizon').value = sim.maxQuarters;
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

function saveAdminSettings() {
    const q = document.getElementById('setting-horizon').value;
    if (q < 4 || q > 100) return alert("Quarters must be between 4 and 100");
    localStorage.setItem('pe_admin_quarters', q);
    closeAdminModal();
    if(confirm("Settings saved. Restart?")) location.reload();
}

// ==========================================
// CHARTS & VISUALIZATION
// ==========================================

function createCharts() {
    // --- Standard Charts ---
    const ctxMain = document.getElementById('mainChart').getContext('2d');
    charts.main = new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Cash ($M)', data: [], borderColor: 'green', yAxisID: 'y' },
                { label: 'RPM', data: [], borderColor: 'blue', yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Important for fixed container height
            scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    const ctxQual = document.getElementById('qualityChart').getContext('2d');
    charts.quality = new Chart(ctxQual, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Service Quality', data: [], borderColor: 'purple' },
                { label: 'Reputation', data: [], borderColor: 'orange', borderDash: [5, 5] }
            ]
        },
        options: { scales: { y: { min: 0, max: 1.2 } } }
    });
    
    const ctxRes = document.getElementById('resourceChart').getContext('2d');
    charts.resources = new Chart(ctxRes, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Fleet', data: [], borderColor: 'black' },
                { label: 'Staff (x10)', data: [], borderColor: 'gray' } 
            ]
        }
    });

    // --- Advanced Charts ---
    createAdvancedCharts();
}

function createAdvancedCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false, // Key fix for growing charts
        plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { x: { display: false }, y: { ticks: { font: { size: 10 } } } },
        elements: { point: { radius: 0 } }
    };

    charts.income = new Chart(document.getElementById('chart-income'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Rev', data: [], borderColor: 'blue', borderWidth: 2 },
            { label: 'Exp', data: [], borderColor: 'red', borderWidth: 2 },
            { label: 'Net', data: [], borderColor: 'green', borderWidth: 2 }
        ]},
        options: commonOptions
    });

    charts.growth = new Chart(document.getElementById('chart-growth'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Dem', data: [], borderColor: 'blue', borderWidth: 2 },
            { label: 'Cap', data: [], borderColor: 'green', borderWidth: 2 },
            { label: 'Rev', data: [], borderColor: 'cyan', borderWidth: 2 }
        ]},
        options: commonOptions
    });

    charts.load = new Chart(document.getElementById('chart-load'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'LF', data: [], borderColor: 'blue', borderWidth: 2 }
        ]},
        options: { ...commonOptions, scales: { y: { min: 0, max: 1 } } }
    });

    charts.comp = new Chart(document.getElementById('chart-competition'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Us', data: [], borderColor: 'green', borderWidth: 2 },
            { label: 'Them', data: [], borderColor: 'blue', borderWidth: 2 }
        ]},
        options: commonOptions
    });

    charts.service = new Chart(document.getElementById('chart-service'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Qual', data: [], borderColor: 'blue', borderWidth: 2 },
            { label: 'Rep', data: [], borderColor: 'green', borderWidth: 2 }
        ]},
        options: { ...commonOptions, scales: { y: { min: 0, max: 1.5 } } }
    });

    charts.prod = new Chart(document.getElementById('chart-productivity'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Miles/Emp', data: [], borderColor: 'blue', borderWidth: 2 }
        ]},
        options: commonOptions
    });

    charts.finance = new Chart(document.getElementById('chart-finance'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Asset', data: [], borderColor: 'blue', borderWidth: 2 },
            { label: 'Debt', data: [], borderColor: 'red', borderWidth: 2 },
            { label: 'Eqty', data: [], borderColor: 'green', borderWidth: 2 }
        ]},
        options: commonOptions
    });

    charts.work = new Chart(document.getElementById('chart-workweek'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Hrs', data: [], borderColor: 'orange', borderWidth: 2 }
        ]},
        options: { ...commonOptions, scales: { y: { min: 30, max: 70 } } }
    });
}

// Called on every tick (or stepBack)
function updateCharts() {
    const hist = sim.history;
    const labels = hist.map(h => `Q${h.quarter}`);

    // --- Update Standard Charts ---
    if (charts.main) {
        charts.main.data.labels = labels;
        charts.main.data.datasets[0].data = hist.map(h => h.cash / 1000000);
        charts.main.data.datasets[1].data = hist.map(h => h.passengers);
        charts.main.update();
    }
    if (charts.quality) {
        charts.quality.data.labels = labels;
        charts.quality.data.datasets[0].data = hist.map(h => h.serviceQuality);
        charts.quality.data.datasets[1].data = hist.map(h => h.reputation);
        charts.quality.update();
    }
    if (charts.resources) {
        charts.resources.data.labels = labels;
        charts.resources.data.datasets[0].data = hist.map(h => h.fleet);
        charts.resources.data.datasets[1].data = hist.map(h => h.staff / 10);
        charts.resources.update();
    }

    // --- Update Advanced Charts ---
    if (charts.income) {
        charts.income.data.labels = labels;
        charts.income.data.datasets[0].data = hist.map(h => h.revenue);
        charts.income.data.datasets[1].data = hist.map(h => h.expenses);
        charts.income.data.datasets[2].data = hist.map(h => h.profit);
        charts.income.update();
    }
    if (charts.growth) {
        charts.growth.data.labels = labels;
        charts.growth.data.datasets[0].data = hist.map(h => (h.passengers / 2000) * 100); 
        charts.growth.data.datasets[1].data = hist.map(h => (h.capacity / 30000000) * 100); 
        charts.growth.data.datasets[2].data = hist.map(h => (h.revenue / 5000000) * 100);
        charts.growth.update();
    }
    if (charts.load) {
        charts.load.data.labels = labels;
        charts.load.data.datasets[0].data = hist.map(h => h.loadFactor);
        charts.load.update();
    }
    if (charts.comp) {
        charts.comp.data.labels = labels;
        charts.comp.data.datasets[0].data = hist.map(h => h.price);
        charts.comp.data.datasets[1].data = hist.map(h => h.competitorPrice);
        charts.comp.update();
    }
    if (charts.service) {
        charts.service.data.labels = labels;
        charts.service.data.datasets[0].data = hist.map(h => h.serviceQuality);
        charts.service.data.datasets[1].data = hist.map(h => h.reputation);
        charts.service.update();
    }
    if (charts.prod) {
        charts.prod.data.labels = labels;
        charts.prod.data.datasets[0].data = hist.map(h => h.productivity);
        charts.prod.update();
    }
    if (charts.finance) {
        charts.finance.data.labels = labels;
        charts.finance.data.datasets[0].data = hist.map(h => h.assets);
        charts.finance.data.datasets[1].data = hist.map(h => h.debt);
        charts.finance.data.datasets[2].data = hist.map(h => h.equity);
        charts.finance.update();
    }
    if (charts.work) {
        charts.work.data.labels = labels;
        charts.work.data.datasets[0].data = hist.map(h => h.workweek);
        charts.work.update();
    }
}

function updateUI(state) {
    // Standard UI Text Updates
    const fmtMoney = (n) => '$' + (n/1000000).toFixed(1) + 'M';
    document.getElementById('stat-cash').innerText = fmtMoney(state.cash);
    document.getElementById('stat-profit').innerText = fmtMoney(state.profit);
    document.getElementById('stat-profit').className = `text-xl font-bold font-mono ${state.profit >= 0 ? 'text-green-600' : 'text-red-600'}`;
    document.getElementById('stat-reputation').innerText = Math.round(state.reputation * 100) + '%';
    document.getElementById('stat-share').innerText = (state.loadFactor * 100).toFixed(1) + '%';
    document.getElementById('stat-staff-control').innerText = state.staff;
    document.getElementById('stat-fleet-control').innerText = state.fleet;

    // Alerts
    const alertBox = document.getElementById('alerts');
    if (state.serviceQuality < 0.7) {
        alertBox.classList.remove('hidden');
        alertBox.innerText = "⚠️ CRITICAL: Service quality is collapsing! Hire more staff or raise prices.";
    } else if (state.cash < 1000000) {
        alertBox.classList.remove('hidden');
        alertBox.innerText = "⚠️ WARNING: Cash reserves low.";
    } else {
        alertBox.classList.add('hidden');
    }

    // Advanced UI Text Updates (Report Table)
    const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(0)}k`;
    document.getElementById('rep-cash').innerText = fmt(state.cash);
    document.getElementById('rep-profit').innerText = fmt(state.profit);
    document.getElementById('rep-revenue').innerText = fmt(state.revenue);
    document.getElementById('rep-fleet').innerText = state.fleet;
    document.getElementById('rep-staff').innerText = state.staff;
    document.getElementById('rep-pax').innerText = (state.passengers/1000).toFixed(1) + 'k'; 
    document.getElementById('rep-qual').innerText = state.serviceQuality.toFixed(2);
    document.getElementById('rep-rep').innerText = state.reputation.toFixed(2);
    document.getElementById('rep-profit').className = state.profit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
}

// Clean Reset logic
function resetCharts() {
    // Destroy all existing chart instances to clear canvas and memory
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
        }
    });
    
    // Re-create them fresh
    createCharts();
    
    // Update with initial data
    updateUI(sim.history[0]);
    updateCharts();
}

function endGame(msg) {
    document.getElementById('btn-run').disabled = true;
    document.getElementById('btn-run').classList.add('opacity-50');
    document.getElementById('submit-score-area').classList.remove('hidden');
    document.getElementById('btn-restart').classList.remove('hidden');
    
    // Disable advanced buttons too
    document.getElementById('adv-btn-run').disabled = true;
    document.getElementById('adv-btn-run').classList.add('opacity-50');
    
    alert(msg);
}

async function submitScore() {
    const name = document.getElementById('student-name').value;
    const instanceId = localStorage.getItem('pe_instance_id') || 'default';
    if (!name) return alert("Please enter your name");
    
    const lastState = sim.history[sim.history.length - 1];
    const payload = {
        studentName: name,
        instanceId: instanceId,
        profit: lastState.cash - 5000000, 
        reputation: lastState.reputation,
        marketShare: (lastState.passengers / 200000), 
        fleetSize: lastState.fleet
    };

    saveLocalScore(payload);

    try {
        const res = await fetch(`${API_BASE_URL}/api/submit-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Score submitted to server!");
        } else {
            throw new Error("Server rejected score");
        }
    } catch (e) {
        console.error(e);
        alert("Note: Score saved to YOUR device only. (Server unreachable: " + e.message + ")");
    }
    loadLeaderboard();
    switchTab('leaderboard');
}

function saveLocalScore(score) {
    const existing = JSON.parse(localStorage.getItem('pe_local_leaderboard') || '[]');
    existing.push(score);
    existing.sort((a, b) => b.profit - a.profit);
    localStorage.setItem('pe_local_leaderboard', JSON.stringify(existing.slice(0, 50)));
}

async function loadLeaderboard() {
    const instanceId = localStorage.getItem('pe_instance_id') || 'default';
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    let serverData = [];
    let localData = JSON.parse(localStorage.getItem('pe_local_leaderboard') || '[]');

    try {
        const res = await fetch(`${API_BASE_URL}/api/leaderboard?instanceId=${encodeURIComponent(instanceId)}`);
        if (res.ok) {
            const json = await res.json();
            serverData = json.data;
        }
    } catch (e) {
        console.log("Server leaderboard unreachable, showing local only.");
    }
    
    let displayData = serverData.length > 0 ? serverData : localData;
    
    if (displayData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No scores yet. Be the first!</td></tr>';
        return;
    }

    displayData.forEach((row, i) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="px-4 py-2">${i+1}</td>
            <td class="px-4 py-2 font-medium">${row.studentName} ${serverData.length===0 ? '(Local)' : ''}</td>
            <td class="px-4 py-2 text-right font-mono ${row.profit > 0 ? 'text-green-600' : 'text-red-600'}">$${(row.profit/1000000).toFixed(2)}M</td>
            <td class="px-4 py-2 text-right">${Math.round(row.reputation * 100)}%</td>
            <td class="px-4 py-2 text-right">${row.fleetSize}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupEventListeners() {
    // STANDARD SIMULATOR LISTENERS
    const linkInput = (id, target, format = (v) => v) => {
        const el = document.getElementById(`input-${id}`);
        const disp = document.getElementById(`val-${id}`);
        if(!el) return;
        el.addEventListener('input', (e) => {
            disp.innerText = format(e.target.value);
            // Sync with Advanced Inputs
            const advInput = document.getElementById(`adv-input-${id}`);
            if(advInput) advInput.value = e.target.value;
        });
    };

    linkInput('price', 'price', (v) => v);
    linkInput('marketing', 'marketingSpend', (v) => (v/1000) + 'k');
    linkInput('hiring', 'targetHiring', (v) => v);
    
    // Sync Advanced -> Simple
    const syncBack = (advId, simpleId) => {
        const advEl = document.getElementById(`adv-input-${advId}`);
        const simpleEl = document.getElementById(`input-${simpleId}`);
        const disp = document.getElementById(`val-${simpleId}`);
        if(!advEl || !simpleEl) return;
        
        advEl.addEventListener('input', (e) => {
            simpleEl.value = e.target.value;
            if(disp) disp.innerText = simpleId === 'marketing' ? (e.target.value/1000)+'k' : e.target.value;
        });
    };
    syncBack('price', 'price');
    syncBack('marketing', 'marketing');
    syncBack('hiring', 'hiring');

    // Scope Slider
    const scopeSlider = document.getElementById('adv-slider-scope');
    if(scopeSlider) {
        scopeSlider.addEventListener('input', (e) => {
            document.getElementById('adv-val-scope').innerText = e.target.value;
        });
    }

    document.getElementById('btn-run').addEventListener('click', () => {
        const decisions = {
            price: parseFloat(document.getElementById('input-price').value),
            marketingSpend: parseFloat(document.getElementById('input-marketing').value),
            hires: parseFloat(document.getElementById('input-hiring').value),
            planesOrdered: parseFloat(document.getElementById('input-planes').value),
            serviceScope: 0.6 // Default for simple mode
        };
        document.getElementById('input-planes').value = 0;
        
        const newState = sim.tick(decisions);
        updateUI(newState);
        updateCharts();
        if (sim.quarter >= sim.maxQuarters || sim.cash < 0) {
            endGame(sim.cash < 0 ? "Bankruptcy!" : `Simulation Complete!`);
        }
    });

    // ADVANCED SIMULATOR LISTENERS
    document.getElementById('adv-btn-run').addEventListener('click', () => {
        const decisions = {
            price: parseFloat(document.getElementById('adv-input-price').value),
            marketingSpend: parseFloat(document.getElementById('adv-input-marketing').value),
            hires: parseFloat(document.getElementById('adv-input-hiring').value),
            planesOrdered: parseFloat(document.getElementById('adv-input-planes').value),
            serviceScope: parseFloat(document.getElementById('adv-slider-scope').value)
        };
        
        document.getElementById('adv-input-planes').value = 0;
        // Sync back to simple
        document.getElementById('input-planes').value = 0;

        const newState = sim.tick(decisions);
        updateUI(newState);
        updateCharts();
        if (sim.quarter >= sim.maxQuarters || sim.cash < 0) {
            endGame(sim.cash < 0 ? "Bankruptcy!" : `Simulation Complete!`);
        }
    });

    // Global Undo (works for both)
    const advUndo = document.getElementById('adv-btn-back');
    if(advUndo) {
        advUndo.addEventListener('click', () => {
            const previousState = sim.stepBack();
            if (previousState) {
                updateUI(previousState);
                updateCharts();
                if (sim.quarter < sim.maxQuarters && sim.cash >= 0) {
                    // Re-enable buttons
                    document.getElementById('btn-run').disabled = false;
                    document.getElementById('btn-run').classList.remove('opacity-50');
                    document.getElementById('adv-btn-run').disabled = false;
                    document.getElementById('adv-btn-run').classList.remove('opacity-50');
                    document.getElementById('submit-score-area').classList.add('hidden');
                }
            }
        });
    }

    // Show/Hide Undo buttons based on turn
    const _origUpdate = updateUI;
    updateUI = function(state) {
        _origUpdate(state);
        const undoBtn = document.getElementById('btn-step-back');
        const advUndoBtn = document.getElementById('adv-btn-back');
        if(sim.quarter > 0) {
            if(undoBtn) undoBtn.classList.remove('hidden');
            if(advUndoBtn) advUndoBtn.classList.remove('hidden');
        } else {
            if(undoBtn) undoBtn.classList.add('hidden');
            if(advUndoBtn) advUndoBtn.classList.add('hidden');
        }
    };

    // Admin Secret
    let clicks = 0;
    const titleEl = document.querySelector('nav .font-bold.text-xl');
    titleEl.style.cursor = 'pointer';
    titleEl.title = 'Triple-click for Admin Settings';
    titleEl.addEventListener('click', () => {
        clicks++;
        if (clicks === 3) {
            openAdminPanel();
            clicks = 0;
        }
        setTimeout(() => clicks = 0, 1000);
    });
    
    // Restart Listeners
    const restartHandler = () => {
        sim.reset();
        resetCharts(); // This will destroy old charts, create new ones, and update
        document.querySelectorAll('button[id*="btn-run"]').forEach(b => {
            b.disabled = false;
            b.classList.remove('opacity-50');
        });
        document.getElementById('submit-score-area').classList.add('hidden');
        document.querySelectorAll('button[id*="btn-restart"]').forEach(b => b.classList.add('hidden'));
    };
    
    document.getElementById('btn-restart').addEventListener('click', restartHandler);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('bg-indigo-800', 'font-bold');
        } else {
            btn.classList.remove('bg-indigo-800', 'font-bold');
        }
    });
}

// Replacer for Causal Loop Diagram
function loadContent() {
    // Intro Content with IMAGE replacement
    document.getElementById('intro-content').innerHTML = `
        <p class="mb-4">People Express Airlines was the "first" low-cost carrier in the US, founded in 1981 by Donald Burr. It grew faster than any other airline in history, reaching billion-dollar revenue within just a few years. But by 1986, it had collapsed and was sold to Continental.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">The Concept</h3>
        <ul class="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Low Fares:</strong> Often 50-70% lower than competitors.</li>
            <li><strong>No Frills:</strong> You paid for ticket, baggage, and food separately.</li>
            <li><strong>High Productivity:</strong> Employees were cross-utilized (pilots helped with bags!).</li>
            <li><strong>Employee Ownership:</strong> Every employee was required to buy stock.</li>
        </ul>

        <h3 class="text-xl font-bold mt-6 mb-2">The Problem</h3>
        <p class="mb-4">People Express grew <em>too fast</em>. The "Service Trap" killed them:
        <ol class="list-decimal pl-5 space-y-2">
            <li>Low prices created massive demand.</li>
            <li>They bought planes rapidly to meet demand.</li>
            <li>But they couldn't hire and train staff fast enough.</li>
            <li><strong>Service Quality collapsed.</strong> Phones weren't answered, bags were lost.</li>
            <li>Reputation fell, and when competitors (American, United) matched their prices with better service, customers fled.</li>
        </ol>
        </p>

        <h3 class="text-xl font-bold mt-8 mb-4">System Dynamics: The "Service Trap" Loop</h3>
        <div class="flex justify-center my-6">
            <img src="images/cld.jpg" alt="Causal Loop Diagram" class="max-w-full border rounded shadow-lg">
        </div>
        <p class="text-sm text-gray-500 italic text-center mt-2">Figure 1: The "Growth and Underinvestment" Archetype. Growth creates workload, which kills Quality if Staffing lags behind.</p>
    `;
    
    // Wizz Air Content
    document.getElementById('wizz-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">History Rhymes: Wizz Air (2025)</h2>
        <p class="mb-4">Wizz Air, the European ultra-low-cost carrier, shares striking similarities with People Express, but with modern twists.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div class="border p-4 rounded bg-gray-50">
                <h3 class="font-bold text-lg mb-2">People Express (1980s)</h3>
                <ul class="list-disc pl-4 text-sm space-y-1">
                    <li>Fleet: ~117 aircraft (at peak)</li>
                    <li>Strategy: "Growth at all costs"</li>
                    <li>Fatal Flaw: Human capital bottleneck (couldn't train staff fast enough).</li>
                    <li>Outcome: Bankruptcy/Acquisition.</li>
                </ul>
            </div>
            <div class="border p-4 rounded bg-pink-50">
                <h3 class="font-bold text-lg mb-2 text-pink-700">Wizz Air (2020s)</h3>
                <ul class="list-disc pl-4 text-sm space-y-1">
                    <li>Fleet: ~224 aircraft (Nov 2024)</li>
                    <li>Strategy: Aggressive expansion into Middle East & "All you can fly" passes.</li>
                    <li>Risk: Operational resilience (engine issues, delays).</li>
                    <li>Advantage: Better technology and automation than PE had.</li>
                </ul>
            </div>
        </div>

        <h3 class="text-xl font-bold mb-4">The Load Factor Obsession</h3>
        <p class="mb-4">Wizz Air's business model relies entirely on <strong>Asset Utilization</strong> (Load Factor). High load factors mean efficiency, but they also mean zero slack in the system—a classic System Dynamics fragility.</p>

        <div class="overflow-x-auto mb-6">
            <table class="min-w-full bg-white border border-gray-300">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-2 px-4 border-b">Period</th>
                        <th class="py-2 px-4 border-b">Load Factor</th>
                        <th class="py-2 px-4 border-b">Context</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="py-2 px-4 border-b">Aug 2017</td>
                        <td class="py-2 px-4 border-b font-bold text-green-600">95.4%</td>
                        <td class="py-2 px-4 border-b text-sm">Peak efficiency era.</td>
                    </tr>
                    <tr>
                        <td class="py-2 px-4 border-b">Dec 2022</td>
                        <td class="py-2 px-4 border-b font-bold text-yellow-600">84.5%</td>
                        <td class="py-2 px-4 border-b text-sm">Post-COVID recovery struggles.</td>
                    </tr>
                    <tr>
                        <td class="py-2 px-4 border-b">Nov 2023</td>
                        <td class="py-2 px-4 border-b font-bold text-green-600">88.4%</td>
                        <td class="py-2 px-4 border-b text-sm">Stabilizing operations.</td>
                    </tr>
                    <tr>
                        <td class="py-2 px-4 border-b">Jan 2025</td>
                        <td class="py-2 px-4 border-b font-bold text-green-600">86.0%</td>
                        <td class="py-2 px-4 border-b text-sm">Strong winter performance (+4% YoY).</td>
                    </tr>
                    <tr>
                        <td class="py-2 px-4 border-b">Feb 2025</td>
                        <td class="py-2 px-4 border-b font-bold text-green-600">91.8%</td>
                        <td class="py-2 px-4 border-b text-sm">Near-record efficiency levels.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 class="text-xl font-bold mb-2">System Dynamics Lesson</h3>
        <p>Like People Express, Wizz Air operates on a razor-thin margin. If a recession hits or reputation falls (due to delays), the high fixed costs of that massive fleet act as a "feedback loop from hell," draining cash exponentially.</p>
    `;

    // AI Content
    document.getElementById('ai-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Strategic AI: From Algorithms to Autonomy</h2>
        
        <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8">
            <p class="text-indigo-900 font-medium">"The 2025 Strategic AI Leader doesn't just build models—they design the systems in which those models operate."</p>
        </div>

        <p class="mb-6">As we move from <strong>Phase 2 (Forecasting & RL)</strong> to <strong>Phase 3 (Strategic Business Applications)</strong>, understanding System Dynamics is the "missing link" for deploying Agentic AI effectively.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            <!-- Micro vs Macro -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
                <h3 class="text-lg font-bold text-indigo-900 mb-3">Micro Level: The Agent</h3>
                <p class="text-sm text-gray-600 mb-4">
                    This is what you learned in RL class. An individual agent (e.g., a pricing bot) optimizing for immediate reward.
                </p>
                <ul class="list-disc pl-4 text-sm space-y-2">
                    <li><strong>Goal:</strong> Maximize $ Profit next quarter.</li>
                    <li><strong>Action:</strong> Buy more planes to sell more tickets.</li>
                    <li><strong>Blind Spot:</strong> Doesn't see the training bottleneck.</li>
                </ul>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 bg-indigo-50">
                <h3 class="text-lg font-bold text-indigo-900 mb-3">Macro Level: The System</h3>
                <p class="text-sm text-gray-600 mb-4">
                    This is System Dynamics. The environment that reacts to the agent's actions.
                </p>
                <ul class="list-disc pl-4 text-sm space-y-2">
                    <li><strong>Reality:</strong> Hiring takes time (Delay).</li>
                    <li><strong>Feedback:</strong> Unhappy customers tell friends (Reputation Loop).</li>
                    <li><strong>Outcome:</strong> The aggressive agent bankrupts the company.</li>
                </ul>
            </div>
        </div>

        <h3 class="text-xl font-bold mt-8 mb-4">The "Horizon Problem" in AI Planning</h3>
        <p class="mb-4">In our curriculum's <strong>Reinforcement Learning</strong> track, we discuss the "Horizon" (how far ahead an agent looks). </p>
        
        <ul class="space-y-4 mb-8">
            <li class="flex gap-3">
                <span class="text-2xl">🔭</span>
                <div>
                    <strong>Short Horizon (Greedy AI):</strong>
                    <p class="text-sm text-gray-600">Like Donald Burr at People Express, a greedy AI sees "Demand > Capacity" and immediately orders planes. It ignores the <em>delay</em> in staff training.</p>
                </div>
            </li>
            <li class="flex gap-3">
                <span class="text-2xl">🧠</span>
                <div>
                    <strong>Long Horizon (Model-Based AI):</strong>
                    <p class="text-sm text-gray-600">A strategic AI uses an internal <strong>System Dynamics Model</strong> (a "World Model") to simulate the future. It predicts that buying planes without hiring staff will crash reputation in Q+4, so it chooses to wait.</p>
                </div>
            </li>
        </ul>

        <h3 class="text-xl font-bold mt-6 mb-4">Why This Matters for Your Career</h3>
        <p class="mb-4">Whether you become a <strong>Chief AI Officer</strong> or a <strong>Strategy Consultant</strong>, your job isn't just to train the model. It's to:</p>
        <ol class="list-decimal pl-5 space-y-2 mb-6">
            <li><strong>Identify Feedback Loops:</strong> Where will your AI trigger a competitor response? (e.g., Price Wars)</li>
            <li><strong>Model Delays:</strong> Where will deployment lag behind strategy?</li>
            <li><strong>Design Governance:</strong> How do we stop an autonomous agent from optimizing itself into a "Service Trap"?</li>
        </ol>

        <div class="p-4 bg-gray-100 rounded text-sm text-center italic">
            This connects directly to the <strong>SIR Epidemic Case Study</strong>: Understanding individual behavior (Agents) within a larger policy framework (Systems).
        </div>
    `;
}
