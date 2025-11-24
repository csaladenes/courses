// ==========================================
// PART 6: NETWORK SCIENCE VISUALIZATION (D3.js)
// ==========================================

const NETWORK_SVG_ID = 'd3-network-svg';
const WIDTH = 800;
const HEIGHT = 500;
const NODE_COUNT = 50;

let netState = {
    nodes: [],
    links: [],
    simulation: null,
    svg: null,
    spreadRunning: false,
    spreadTimer: null,
    spreadStats: { infected: 0, ticks: 0 },
    spreadChart: null,
    currentTopology: 'random'
};

// Init
function initNetworks() {
    const svgElement = document.getElementById(NETWORK_SVG_ID);
    if (!svgElement) return;

    // Initialize SVG structure
    netState.svg = d3.select(`#${NETWORK_SVG_ID}`)
        .attr("viewBox", [0, 0, WIDTH, HEIGHT]);
    
    // Initialize Spread Controls
    const startBtn = document.getElementById('btn-start-spread');
    const resetBtn = document.getElementById('btn-reset-spread');
    
    if(startBtn) startBtn.addEventListener('click', startInfection);
    if(resetBtn) resetBtn.addEventListener('click', resetSpread);

    // Initial render
    renderNetwork('random');
    initSpreadChart();
}

// Generator Functions
function generateNetwork(type) {
    let nodes = d3.range(NODE_COUNT).map(i => ({ id: i, degree: 0, status: 'S' })); // S=Susceptible, I=Infected
    let links = [];

    switch(type) {
        case 'random': // Erdős-Rényi
            const p = 0.08;
            for (let i = 0; i < NODE_COUNT; i++) {
                for (let j = i + 1; j < NODE_COUNT; j++) {
                    if (Math.random() < p) links.push({ source: i, target: j });
                }
            }
            updateLabel("Random Graph (Erdős-Rényi)");
            updateAnalysisText("Random networks have short average path lengths, meaning infections spread rapidly and randomly. There are no safe corners.");
            break;

        case 'lattice': // 2D Grid
            const cols = Math.ceil(Math.sqrt(NODE_COUNT));
            for (let i = 0; i < NODE_COUNT; i++) {
                if ((i + 1) % cols !== 0 && i + 1 < NODE_COUNT) links.push({ source: i, target: i + 1 });
                if (i + cols < NODE_COUNT) links.push({ source: i, target: i + cols });
            }
            updateLabel("Lattice / Grid");
            updateAnalysisText("Lattices have high local clustering but long path lengths. Infections spread like a slow wave, easier to contain locally.");
            break;

        case 'smallworld': // Watts-Strogatz
            const k = 4;
            for (let i = 0; i < NODE_COUNT; i++) {
                for (let j = 1; j <= k/2; j++) {
                    let target = (i + j) % NODE_COUNT;
                    links.push({ source: i, target: target });
                }
            }
            const beta = 0.1;
            links.forEach(l => {
                if (Math.random() < beta) l.target = Math.floor(Math.random() * NODE_COUNT);
            });
            updateLabel("Small World (Watts-Strogatz)");
            updateAnalysisText("Small World networks combine local clustering with shortcuts. Infections spread surprisingly fast due to these 'shortcut' links.");
            break;

        case 'scale-free': // Barabási-Albert
            const m0 = 3;
            for(let i=0; i<m0; i++) {
                for(let j=i+1; j<m0; j++) links.push({ source: i, target: j });
            }
            for(let i=m0; i<NODE_COUNT; i++) {
                let targets = [];
                let m = 2;
                let degrees = new Array(i).fill(0);
                links.forEach(l => {
                    if(l.source < i) degrees[l.source]++;
                    if(l.target < i) degrees[l.target]++;
                });
                let totalDegree = degrees.reduce((a,b) => a+b, 0);
                
                for(let newLink=0; newLink<m; newLink++) {
                    let r = Math.random() * totalDegree;
                    let sum = 0;
                    for(let nodeIndex=0; nodeIndex<i; nodeIndex++) {
                        sum += degrees[nodeIndex];
                        if(sum >= r) {
                            if(!targets.includes(nodeIndex)) targets.push(nodeIndex);
                            break;
                        }
                    }
                }
                targets.forEach(t => links.push({ source: i, target: t }));
            }
            updateLabel("Scale-Free (Barabási-Albert)");
            updateAnalysisText("Scale-Free networks are dominated by Hubs. If a Hub gets infected, the entire network collapses instantly. Targeted immunization of Hubs is highly effective.");
            break;
    }

    return { nodes, links };
}

function updateLabel(text) {
    const label = document.getElementById('network-type-label');
    if(label) label.innerText = text.toUpperCase();
}

function updateAnalysisText(text) {
    const box = document.getElementById('topology-outcome-text');
    if(box) box.innerText = text;
}

// Metric Calculations
function calculateMetrics(nodes, links) {
    // 1. Degree
    nodes.forEach(n => n.degree = 0);
    links.forEach(l => {
        // Handle both object references (d3) and raw indices
        const s = (typeof l.source === 'object') ? l.source.index : l.source;
        const t = (typeof l.target === 'object') ? l.target.index : l.target;
        nodes[s].degree++;
        nodes[t].degree++;
    });
    const avgDegree = d3.mean(nodes, n => n.degree);

    // 2. Clustering Coefficient (Local)
    let adj = Array.from({ length: nodes.length }, () => []);
    links.forEach(l => {
        const s = (typeof l.source === 'object') ? l.source.index : l.source;
        const t = (typeof l.target === 'object') ? l.target.index : l.target;
        adj[s].push(t);
        adj[t].push(s);
    });

    let totalClustering = 0;
    nodes.forEach((n, i) => {
        const neighbors = adj[i];
        const k = neighbors.length;
        if (k < 2) {
            n.clustering = 0; 
            return;
        }
        let linksBetweenNeighbors = 0;
        for (let j = 0; j < k; j++) {
            for (let m = j + 1; m < k; m++) {
                if (adj[neighbors[j]].includes(neighbors[m])) {
                    linksBetweenNeighbors++;
                }
            }
        }
        n.clustering = (2 * linksBetweenNeighbors) / (k * (k - 1));
        totalClustering += n.clustering;
    });
    const avgClustering = totalClustering / nodes.length;

    // 3. Avg Path Length (Sampled BFS)
    let totalPathLen = 0;
    let pathsCounted = 0;
    const sampleSize = Math.min(nodes.length, 10); 
    
    for(let i=0; i<sampleSize; i++) {
        let startNode = Math.floor(Math.random() * nodes.length);
        let q = [[startNode, 0]];
        let visited = new Set([startNode]);
        while(q.length > 0) {
            const [curr, dist] = q.shift();
            if (dist > 0) {
                totalPathLen += dist;
                pathsCounted++;
            }
            adj[curr].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    q.push([neighbor, dist + 1]);
                }
            });
        }
    }
    const avgPath = pathsCounted > 0 ? totalPathLen / pathsCounted : 0;

    return { avgDegree, avgClustering, avgPath };
}

function updateMetricsUI(metrics) {
    const elAvgDegree = document.getElementById('metric-avg-degree');
    const elClustering = document.getElementById('metric-clustering');
    const elPathLength = document.getElementById('metric-path-length');

    if (elAvgDegree) {
        elAvgDegree.innerText = metrics.avgDegree.toFixed(2);
        document.getElementById('bar-avg-degree').style.width = Math.min(100, metrics.avgDegree * 10) + "%";
    }
    
    if (elClustering) {
        elClustering.innerText = metrics.avgClustering.toFixed(3);
        document.getElementById('bar-clustering').style.width = (metrics.avgClustering * 100) + "%";
    }
    
    if (elPathLength) {
        elPathLength.innerText = metrics.avgPath.toFixed(2);
        document.getElementById('bar-path-length').style.width = Math.min(100, metrics.avgPath * 20) + "%";
    }
}

// Main Render Function
function renderNetwork(type) {
    if (netState.simulation) netState.simulation.stop();
    if (!netState.svg) return;
    
    netState.svg.selectAll("*").remove(); 
    netState.currentTopology = type;
    resetSpread();

    const data = generateNetwork(type);
    netState.nodes = data.nodes;
    netState.links = data.links;

    const metrics = calculateMetrics(netState.nodes, netState.links);
    updateMetricsUI(metrics);

    netState.simulation = d3.forceSimulation(netState.nodes)
        .force("link", d3.forceLink(netState.links).id(d => d.id).distance(30))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
        .force("collide", d3.forceCollide().radius(10));

    const link = netState.svg.append("g")
        .attr("class", "links")
        .attr("stroke", "#94a3b8")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(netState.links)
        .join("line")
        .attr("stroke-width", 1.5);

    const node = netState.svg.append("g")
        .attr("class", "nodes")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(netState.nodes)
        .join("circle")
        .attr("r", d => 5 + (d.degree || 1) * 1.5) 
        .attr("fill", getNodeColor)
        .call(drag(netState.simulation));

    node.append("title").text(d => `Node ${d.id}`);

    netState.simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

function getNodeColor(d) {
    if (d.status === 'I') return '#dc2626'; // Red Infected
    // Topology default colors
    switch(netState.currentTopology) {
        case 'scale-free': return '#ea580c'; // Orange
        case 'smallworld': return '#4f46e5'; // Indigo
        default: return '#0ea5e9'; // Sky
    }
}

// Drag Helper
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
}

// ==========================================
// SPREAD SIMULATION LOGIC
// ==========================================

function startInfection() {
    if (netState.spreadRunning) return;

    // Pick random node to infect
    const victim = netState.nodes[Math.floor(Math.random() * netState.nodes.length)];
    if(victim) victim.status = 'I';
    
    // Update Visuals
    if(netState.svg) netState.svg.selectAll("circle").attr("fill", getNodeColor);
    
    netState.spreadRunning = true;
    netState.spreadStats.ticks = 0;
    netState.spreadStats.infected = 1;
    
    // Reset chart for new run
    if(netState.spreadChart) {
        netState.spreadChart.data.labels = [0];
        netState.spreadChart.data.datasets[0].data = [1];
        netState.spreadChart.update();
    }

    updateSpreadStats();
    spreadLoop();
}

function resetSpread() {
    netState.spreadRunning = false;
    clearTimeout(netState.spreadTimer);
    netState.nodes.forEach(n => n.status = 'S');
    if (netState.svg) netState.svg.selectAll("circle").attr("fill", getNodeColor);
    
    netState.spreadStats = { infected: 0, ticks: 0 };
    updateSpreadStats();
}

function spreadLoop() {
    if (!netState.spreadRunning) return;

    const probEl = document.getElementById('net-trans-prob');
    const prob = probEl ? parseFloat(probEl.value) : 0.15;
    let newInfections = [];

    // Simple SI Model
    netState.nodes.forEach(node => {
        if (node.status === 'I') {
            // Find neighbors
            // D3 force links store node objects in source/target
            const neighbors = netState.links
                .filter(l => l.source.id === node.id || l.target.id === node.id)
                .map(l => (l.source.id === node.id ? l.target : l.source));
            
            neighbors.forEach(neighbor => {
                if (neighbor.status === 'S' && Math.random() < prob) {
                    if (!newInfections.includes(neighbor)) newInfections.push(neighbor);
                }
            });
        }
    });

    // Apply infections
    newInfections.forEach(n => n.status = 'I');
    
    // Update Visuals
    if (newInfections.length > 0 && netState.svg) {
        netState.svg.selectAll("circle").transition().duration(200).attr("fill", getNodeColor);
    }

    // Stats
    const totalInfected = netState.nodes.filter(n => n.status === 'I').length;
    netState.spreadStats.infected = totalInfected;
    netState.spreadStats.ticks++;
    updateSpreadStats();
    updateSpreadChart(netState.spreadStats.ticks, totalInfected);

    // Stop if all infected
    if (totalInfected >= netState.nodes.length) {
        netState.spreadRunning = false;
    } else {
        netState.spreadTimer = setTimeout(spreadLoop, 500);
    }
}

function updateSpreadStats() {
    const infEl = document.getElementById('stat-infected-count');
    const tickEl = document.getElementById('stat-tick-count');
    if(infEl) infEl.innerText = netState.spreadStats.infected;
    if(tickEl) tickEl.innerText = netState.spreadStats.ticks;
}

function initSpreadChart() {
    const ctxEl = document.getElementById('spreadChart');
    if(!ctxEl) return;
    
    const ctx = ctxEl.getContext('2d');
    netState.spreadChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Infected Nodes',
                data: [],
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false, // Ensure fixed height
            scales: {
                y: { min: 0, max: NODE_COUNT }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateSpreadChart(tick, count) {
    if (netState.spreadChart) {
        netState.spreadChart.data.labels.push(tick);
        netState.spreadChart.data.datasets[0].data.push(count);
        netState.spreadChart.update();
    }
}

document.addEventListener('DOMContentLoaded', initNetworks);
