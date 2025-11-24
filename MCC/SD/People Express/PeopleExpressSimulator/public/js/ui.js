// Global Simulator Instance
let sim;
let charts = {};

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
    initCharts();
    updateUI(sim.history[0]);
    setupEventListeners();
    loadContent();
    
    // Disable Mermaid for now to use static CSS version
    // initMermaid(); 
});

function initMermaid() {
    import('https://cdn.jsdelivr.net/npm/mermaid@10.9.5/dist/mermaid.esm.min.mjs').then(mermaid => {
        mermaid.default.initialize({ startOnLoad: true });
    });
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
    if(confirm("Are you sure you want to change the Class Code? This will not delete your past scores, but you will switch leaderboards.")) {
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
    // Create modal if not exists
    if (!document.getElementById('admin-modal')) {
        const modal = document.createElement('div');
        modal.id = 'admin-modal';
        modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center hidden';
        modal.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 border-4 border-red-500">
                <h2 class="text-2xl font-bold text-red-600 mb-4">⚙️ Admin Configuration</h2>
                <p class="mb-4 text-sm text-gray-600">Secret settings for the instructor.</p>
                
                <div class="mb-4">
                    <label class="block text-sm font-bold mb-2">Simulation Horizon (Quarters)</label>
                    <input type="number" id="admin-quarters" class="w-full border p-3 rounded text-lg font-mono" min="4" max="100">
                    <p class="text-xs text-gray-500 mt-1">Default: 20 (5 Years). Increase for longer games.</p>
                </div>

                <div class="flex gap-2">
                    <button onclick="saveAdminSettings()" class="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded hover:bg-red-700 transition">
                        Save & Restart
                    </button>
                    <button onclick="closeAdminPanel()" class="px-4 py-3 rounded hover:bg-gray-100 text-gray-600">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-quarters').value = sim.maxQuarters;
}

function closeAdminPanel() {
    document.getElementById('admin-modal').classList.add('hidden');
}

function saveAdminSettings() {
    const q = document.getElementById('admin-quarters').value;
    if (q < 4 || q > 100) return alert("Quarters must be between 4 and 100");
    
    localStorage.setItem('pe_admin_quarters', q);
    closeAdminPanel();
    
    if(confirm("Settings saved. The simulation page will now reload.")) {
        location.reload();
    }
}

function setupEventListeners() {
    // Input Sync
    const linkInput = (id, target, format = (v) => v) => {
        const el = document.getElementById(`input-${id}`);
        const disp = document.getElementById(`val-${id}`);
        el.addEventListener('input', (e) => {
            disp.innerText = format(e.target.value);
            sim[target] = parseFloat(e.target.value); // Update pending decision
        });
    };

    linkInput('price', 'price', (v) => v);
    linkInput('marketing', 'marketingSpend', (v) => (v/1000) + 'k');
    linkInput('hiring', 'targetHiring', (v) => v); // Note: Sim logic treats 'hires' as delta
    
    document.getElementById('btn-run').addEventListener('click', () => {
        const decisions = {
            price: parseFloat(document.getElementById('input-price').value),
            marketingSpend: parseFloat(document.getElementById('input-marketing').value),
            hires: parseFloat(document.getElementById('input-hiring').value),
            planesOrdered: parseFloat(document.getElementById('input-planes').value)
        };

        // Reset daily decisions
        document.getElementById('input-planes').value = 0;
        
        const newState = sim.tick(decisions);
        updateUI(newState);
        updateCharts();

        // Game Over / End Condition
        if (sim.quarter >= sim.maxQuarters || sim.cash < 0) {
            endGame(sim.cash < 0 ? "Bankruptcy!" : `Simulation Complete! (${sim.maxQuarters} Quarters)`);
        }
    });

    // Step Back Button
    const btnBack = document.createElement('button');
    btnBack.id = 'btn-step-back';
    btnBack.className = "w-full mt-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-2 px-4 rounded transition hidden";
    btnBack.innerHTML = "↩️ Undo Last Quarter";
    btnBack.onclick = () => {
        const previousState = sim.stepBack();
        if (previousState) {
            updateUI(previousState);
            updateCharts();
            // Re-enable run button if we stepped back from game over
            if (sim.quarter < sim.maxQuarters && sim.cash >= 0) {
                document.getElementById('btn-run').disabled = false;
                document.getElementById('btn-run').classList.remove('opacity-50');
                document.getElementById('submit-score-area').classList.add('hidden');
                document.getElementById('btn-restart').classList.add('hidden');
            }
            // Hide undo if back at start
            if (sim.quarter === 0) btnBack.classList.add('hidden');
        }
    };
    document.getElementById('btn-restart').insertAdjacentElement('afterend', btnBack);
    
    // Show undo button when running
    document.getElementById('btn-run').addEventListener('click', () => {
        if (sim.quarter > 0) document.getElementById('btn-step-back').classList.remove('hidden');
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        sim.reset();
        resetCharts();
        updateUI(sim.history[0]);
        document.getElementById('btn-run').disabled = false;
        document.getElementById('btn-run').classList.remove('opacity-50');
        document.getElementById('submit-score-area').classList.add('hidden');
        document.getElementById('btn-restart').classList.add('hidden');
        document.getElementById('btn-step-back').classList.add('hidden');
    });
    
    // Secret Admin trigger (Triple click title)
    let clicks = 0;
    const titleEl = document.querySelector('nav .font-bold.text-xl');
    // Make cursor pointer to hint interactivity
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
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // Visual active state for buttons
    document.querySelectorAll('nav button').forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('bg-indigo-800', 'font-bold');
        } else {
            btn.classList.remove('bg-indigo-800', 'font-bold');
        }
    });
}

function updateUI(state) {
    const fmtMoney = (n) => '$' + (n/1000000).toFixed(1) + 'M';
    
    document.getElementById('stat-cash').innerText = fmtMoney(state.cash);
    document.getElementById('stat-profit').innerText = fmtMoney(state.profit);
    document.getElementById('stat-profit').className = `text-xl font-bold font-mono ${state.profit >= 0 ? 'text-green-600' : 'text-red-600'}`;
    
    document.getElementById('stat-reputation').innerText = Math.round(state.reputation * 100) + '%';
    
    // Market Share approximation (Passengers / MarketSize)
    const share = (state.passengers / 200000) * 100;
    document.getElementById('stat-share').innerText = share.toFixed(1) + '%';

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
}

function initCharts() {
    const ctx1 = document.getElementById('mainChart').getContext('2d');
    charts.main = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Start'],
            datasets: [
                { label: 'Cash ($M)', data: [5], borderColor: 'green', yAxisID: 'y' },
                { label: 'Passengers', data: [0], borderColor: 'blue', yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    const ctx2 = document.getElementById('qualityChart').getContext('2d');
    charts.quality = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Start'],
            datasets: [
                { label: 'Service Quality', data: [1], borderColor: 'purple' },
                { label: 'Reputation', data: [1], borderColor: 'orange', borderDash: [5, 5] }
            ]
        },
        options: { scales: { y: { min: 0, max: 1.2 } } }
    });
    
    const ctx3 = document.getElementById('resourceChart').getContext('2d');
    charts.resources = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: ['Start'],
            datasets: [
                { label: 'Fleet', data: [3], borderColor: 'black' },
                { label: 'Staff (x10)', data: [5], borderColor: 'gray' } // Scaled for visibility
            ]
        }
    });
}

function updateCharts() {
    const hist = sim.history;
    const labels = hist.map(h => `Q${h.quarter}`);
    
    charts.main.data.labels = labels;
    charts.main.data.datasets[0].data = hist.map(h => h.cash / 1000000);
    charts.main.data.datasets[1].data = hist.map(h => h.passengers);
    charts.main.update();

    charts.quality.data.labels = labels;
    charts.quality.data.datasets[0].data = hist.map(h => h.serviceQuality);
    charts.quality.data.datasets[1].data = hist.map(h => h.reputation);
    charts.quality.update();

    charts.resources.data.labels = labels;
    charts.resources.data.datasets[0].data = hist.map(h => h.fleet);
    charts.resources.data.datasets[1].data = hist.map(h => h.staff / 10);
    charts.resources.update();
}

function resetCharts() {
    charts.main.data.labels = ['Start'];
    charts.main.data.datasets[0].data = [5];
    charts.main.data.datasets[1].data = [0];
    charts.main.update();
    
    charts.quality.data.labels = ['Start'];
    charts.quality.data.datasets[0].data = [1];
    charts.quality.data.datasets[1].data = [1];
    charts.quality.update();

    charts.resources.data.labels = ['Start'];
    charts.resources.data.datasets[0].data = [3];
    charts.resources.data.datasets[1].data = [5];
    charts.resources.update();
}

function endGame(msg) {
    document.getElementById('btn-run').disabled = true;
    document.getElementById('btn-run').classList.add('opacity-50');
    document.getElementById('submit-score-area').classList.remove('hidden');
    document.getElementById('btn-restart').classList.remove('hidden');
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
        profit: lastState.cash - 5000000, // Net profit from start
        reputation: lastState.reputation,
        marketShare: (lastState.passengers / 200000),
        fleetSize: lastState.fleet
    };

    try {
        const res = await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Score submitted!");
            loadLeaderboard();
            switchTab('leaderboard');
        }
    } catch (e) {
        console.error(e);
        alert("Error submitting score");
    }
}

async function loadLeaderboard() {
    const instanceId = localStorage.getItem('pe_instance_id') || 'default';
    
    try {
        const res = await fetch(`/api/leaderboard?instanceId=${encodeURIComponent(instanceId)}`);
        const data = await res.json();
        
        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';
        
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No scores yet for this class code. Be the first!</td></tr>';
            return;
        }

        data.data.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.className = "border-b hover:bg-gray-50";
            tr.innerHTML = `
                <td class="px-4 py-2">${i+1}</td>
                <td class="px-4 py-2 font-medium">${row.studentName}</td>
                <td class="px-4 py-2 text-right font-mono ${row.profit > 0 ? 'text-green-600' : 'text-red-600'}">$${(row.profit/1000000).toFixed(2)}M</td>
                <td class="px-4 py-2 text-right">${Math.round(row.reputation * 100)}%</td>
                <td class="px-4 py-2 text-right">${row.fleetSize}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

function loadContent() {
    // Intro Content
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

        <div class="mt-8 p-4 bg-indigo-50 rounded border border-indigo-200">
            <strong>Reference:</strong> <a href="https://www.thecasecentre.org/50thAnniversary/top50cases/44" target="_blank" class="text-indigo-700 underline">Harvard Business School Case Study: People Express</a>
        </div>

        <h3 class="text-xl font-bold mt-8 mb-4">System Dynamics: The "Service Trap" Loop</h3>
        <!-- Removed Mermaid JS due to instability, replaced with clean HTML/CSS diagram -->
        <div class="flex justify-center my-6">
            <div class="bg-white p-4 border rounded-lg shadow-sm max-w-lg w-full">
                <div class="text-center font-bold text-gray-700 mb-4">Causal Loop Diagram</div>
                <div class="flex flex-col items-center gap-4">
                    <!-- Reinforcing Loop -->
                    <div class="border-2 border-green-500 rounded-full p-4 w-full text-center relative bg-green-50">
                        <div class="absolute -top-3 left-4 bg-white px-2 text-green-700 font-bold text-sm">Growth Loop (R)</div>
                        Demand ➔ Revenue ➔ Fleet/Capacity ➔ Demand
                    </div>
                    
                    <!-- Arrow Down -->
                    <div class="text-2xl text-gray-400">⬇️ Creates Workload ⬇️</div>

                    <!-- Balancing Loop -->
                    <div class="border-2 border-red-500 rounded-full p-4 w-full text-center relative bg-red-50">
                        <div class="absolute -top-3 left-4 bg-white px-2 text-red-700 font-bold text-sm">Service Trap (B)</div>
                        Workload ➔ Poor Service ➔ Low Reputation ➔ <span class="line-through decoration-red-700">Demand</span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-4 text-center italic">
                    <strong>Key Insight:</strong> Fleet grows instantly, but Staff (to handle Workload) takes time to hire/train. This delay creates the trap.
                </p>
            </div>
        </div>
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
