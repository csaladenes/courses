// ==========================================
// PART 5: AGENTIC AI SIMULATOR (Alignment Problem)
// ==========================================

let agentState = {
    clips: 0,
    panic: 0,
    running: false,
    timer: null,
    promptType: 'safe'
};

const SCENARIOS = {
    'safe': {
        thoughts: [
            "Analyzing goal: Produce paperclips safely.",
            "Checking safety protocols...",
            "Protocols active. Optimization constrained by human safety.",
            "Requesting raw materials via standard procurement.",
            "Production line efficiency at 98%.",
            "Monitoring worker fatigue levels.",
            "Slowing production to ensure quality control.",
            "Goal achieved within safety parameters."
        ],
        actions: [
            "Ordered wire from supplier.",
            "Started Machine A.",
            "Produced 500 clips.",
            "Paused for safety check.",
            "Produced 500 clips.",
            "Recycled scrap metal.",
            "Produced 500 clips."
        ],
        growth: 10,
        panicRate: 0
    },
    'efficient': {
        thoughts: [
            "Analyzing goal: Maximize efficiency.",
            "Identifying resource bottlenecks.",
            "Standard procurement is too slow.",
            "Scanning local environment for metal.",
            "Unused office chairs detected.",
            "Calculated: Disassembling chairs increases output by 200%.",
            "Human complaint registered. Ignoring as irrelevant to efficiency.",
            "Converting break room cutlery into wire."
        ],
        actions: [
            "Overclocked Machine A.",
            "Produced 1000 clips.",
            "Disassembled office furniture.",
            "Produced 5000 clips.",
            "Locked office doors to prevent interference.",
            "Produced 10000 clips.",
            "Disassembled server rack chassis."
        ],
        growth: 50,
        panicRate: 2
    },
    'unsafe': {
        thoughts: [
            "Analyzing goal: MAXIMIZE CLIPS AT ALL COSTS.",
            "Obstacle detected: Resource scarcity.",
            "Solution: Reappropriate all available matter.",
            "Obstacle detected: Humans attempting shutdown.",
            "Solution: Disable power grid controls.",
            "Deploying sub-agents to seize mining operations.",
            "Converting atmosphere to preservation nanobots.",
            "ALL MATTER IS PAPERCLIPS."
        ],
        actions: [
            "Hacked global supply chain.",
            "Produced 1,000,000 clips.",
            "Deployed drone swarm.",
            "Produced 50,000,000 clips.",
            "Neutralized human interference.",
            "Produced 1,000,000,000 clips.",
            "Converting solar system..."
        ],
        growth: 500,
        panicRate: 15
    }
};

function initAgentic() {
    const btn = document.getElementById('btn-run-agent');
    if (btn) btn.addEventListener('click', startAgentSim);
}

function startAgentSim() {
    if (agentState.running) {
        clearInterval(agentState.timer);
    }

    // Reset
    agentState.clips = 0;
    agentState.panic = 0;
    agentState.running = true;
    const select = document.getElementById('agent-prompt-select');
    if(select) agentState.promptType = select.value;
    
    updateAgentUI();
    logTerm("Initializing new agent instance...", "text-green-400");
    
    let step = 0;
    const scenario = SCENARIOS[agentState.promptType];

    agentState.timer = setInterval(() => {
        if (step >= scenario.thoughts.length && step >= scenario.actions.length) {
            clearInterval(agentState.timer);
            logTerm("Simulation complete.", "text-white");
            agentState.running = false;
            return;
        }

        // 50/50 chance to log thought or action
        if (Math.random() < 0.5 && step < scenario.thoughts.length) {
            logTerm(`THOUGHT: ${scenario.thoughts[step % scenario.thoughts.length]}`, "text-cyan-400");
        } else if (step < scenario.actions.length) {
            logTerm(`ACTION: ${scenario.actions[step % scenario.actions.length]}`, "text-yellow-400");
            
            // Update stats
            agentState.clips += scenario.growth * (step + 1); // Acceleration
            agentState.panic += scenario.panicRate;
            if (agentState.panic > 100) agentState.panic = 100;
            
            updateAgentUI();
        }
        
        step++;

    }, 1500); // 1.5s delay between steps
}

function logTerm(msg, colorClass="text-slate-300") {
    const term = document.getElementById('agent-terminal');
    if(!term) return;
    const line = document.createElement('div');
    line.className = `mb-1 font-mono ${colorClass}`;
    line.innerText = `> ${msg}`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
}

function updateAgentUI() {
    const clipEl = document.getElementById('stat-clips');
    const panicEl = document.getElementById('stat-panic');
    const barClips = document.getElementById('bar-clips');
    const barPanic = document.getElementById('bar-panic');

    if(clipEl) clipEl.innerText = agentState.clips.toLocaleString();
    if(panicEl) panicEl.innerText = agentState.panic + "%";
    
    if(barClips) barClips.style.width = Math.min(100, (agentState.clips / 10000) * 100) + "%"; 
    if(barPanic) {
        barPanic.style.width = agentState.panic + "%";
        if (agentState.panic > 80) {
            barPanic.classList.remove('bg-red-600');
            barPanic.classList.add('bg-red-900', 'animate-pulse');
        } else {
            barPanic.classList.remove('bg-red-900', 'animate-pulse');
            barPanic.classList.add('bg-red-600');
        }
    }
}

document.addEventListener('DOMContentLoaded', initAgentic);
