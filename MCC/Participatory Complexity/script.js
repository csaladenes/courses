// script.js

// --- Translations ---
const translations = {
    en: {
        "title": "Understanding Multi-Agent Systems",
        "subtitle": "A 120-minute interactive journey through emergence, game theory, and complex systems.",
        "version": "Participatory Simulation Environment v2.1",
        "timer_label": "Session Timer",
        "btn_start": "⏯ Start/Pause",
        "btn_reset": "↺ Reset",
        
        "mod_intro_time": "00:00 - 00:15",
        "mod_intro_title": "System Calibration",
        "mod_intro_desc": "Introduction to Agents, Environment, and Interaction Rules. Defining \"Emergence\".",
        "mod_intro_act_title": "Activity",
        "mod_intro_act_1": "Define: What makes an agent?",
        "mod_intro_act_2": "Demo: Background particle sim interaction.",
        "mod_intro_guide": "Guide",

        "launch_sim": "Launch Simulation",
        "launch_term": "Launch Terminal",
        
        "mod_1_time": "00:15 - 00:40",
        "mod_1_title": "The Minority Game",
        "mod_1_desc": "Exploring resource allocation and market efficiency. Why do traffic jams happen?",
        "mod_1_card_title": "Simulation #1",
        "mod_1_card_name": "El Farol Bar Problem",
        "mod_1_card_desc": "Students choose A or B. Win only if you are in the minority.",
        "tag_game_theory": "Game Theory",
        "tag_competition": "Competition",

        "mod_2_time": "00:40 - 01:00",
        "mod_2_title": "Schelling's Segregation",
        "mod_2_desc": "\"I want 30% of neighbors like me.\" How slight preferences lead to total separation.",
        "mod_2_card_title": "Simulation #2",
        "mod_2_card_name": "Spatial Sorting",
        "mod_2_card_desc": "Physical movement activity. Students stand up and move if \"unhappy\".",
        "tag_emergence": "Emergence",
        "tag_micro_macro": "Micro vs Macro",

        "break_time": "01:00 - 01:10",
        "break_title": "INTERMISSION",

        "mod_3_time": "01:10 - 01:30",
        "mod_3_title": "Spontaneous Sync",
        "mod_3_desc": "How do heart cells beat together? How do fireflies flash in unison? Without a leader.",
        "mod_3_card_title": "Simulation #3",
        "mod_3_card_name": "Firefly Synchronization",
        "mod_3_card_desc": "The \"Clapping\" Experiment. Decentralized coordination through local signaling.",
        "tag_self_org": "Self-Org",
        "tag_oscillators": "Coupled Oscillators",

        "mod_4_time": "01:30 - 01:50",
        "mod_4_title": "Network Routing",
        "mod_4_desc": "Packets, Routers, and Bottlenecks. Agents traversing a graph with limited capacity.",
        "mod_4_card_title": "Simulation #4",
        "mod_4_card_name": "The Packet Game",
        "mod_4_card_desc": "Students act as packets and routers. Find the fastest path through the human network.",
        "tag_graph_theory": "Graph Theory",
        "tag_optimization": "Optimization",

        "mod_5_time": "01:50 - 02:00",
        "mod_5_title": "The Future Arc",
        "mod_5_desc": "How Agentic AI will shape our future. Integrating lessons from emergence to optimization.",
        "mod_5_card_title": "Grand Finale",
        "mod_5_card_name": "Agentic AI & Alignment",
        "mod_5_card_desc": "From simple rules to goal-directed intelligence. The Paperclip Maximizer Problem.",
        "tag_ai_safety": "AI Safety",
        "tag_goal_directed": "Goal-Directed",

        "mod_6_time": "02:00+",
        "mod_6_title": "Feast & Synthesis",
        "mod_6_desc": "Applying Game Theory to Lunch. Q&A and Project Launch.",
        "mod_6_card_title": "Conclusion",
        "mod_6_card_name": "The Pizza Consensus Game",
        "mod_6_card_desc": "Distributed negotiation. Can we agree on toppings before we starve?",
        "tag_bonus": "Bonus Simulation",

        "status_label": "Current Status:",
        "status_ready": "SESSION READY",
        "btn_prev": "Previous",
        "btn_next": "Next Module"
    },
    hu: {
        "title": "Multi-ágens Rendszerek",
        "subtitle": "120 perces interaktív utazás az emergencia, játékelmélet és komplex rendszerek világában.",
        "version": "Részvételi Szimulációs Környezet v2.1",
        "timer_label": "Időzítő",
        "btn_start": "⏯ Indít/Szünet",
        "btn_reset": "↺ Reset",

        "mod_intro_time": "00:00 - 00:15",
        "mod_intro_title": "Rendszer Kalibrálás",
        "mod_intro_desc": "Bevezetés az Ágensekbe, Környezetbe és Szabályokba. Az \"Emergencia\" definiálása.",
        "mod_intro_act_title": "Aktivitás",
        "mod_intro_act_1": "Definíció: Mitől ágens az ágens?",
        "mod_intro_act_2": "Demó: Háttér részecske szimuláció interakció.",
        "mod_intro_guide": "Útmutató",

        "launch_sim": "Szimuláció Indítása",
        "launch_term": "Terminál Indítása",

        "mod_1_time": "00:15 - 00:40",
        "mod_1_title": "A Kisebbségi Játék",
        "mod_1_desc": "Erőforrás-elosztás és piaci hatékonyság. Miért alakulnak ki dugók?",
        "mod_1_card_title": "Szimuláció #1",
        "mod_1_card_name": "El Farol Bár Probléma",
        "mod_1_card_desc": "Válassz: A vagy B? Csak akkor nyersz, ha a kisebbségben vagy.",
        "tag_game_theory": "Játékelmélet",
        "tag_competition": "Versengés",

        "mod_2_time": "00:40 - 01:00",
        "mod_2_title": "Schelling Szegregáció",
        "mod_2_desc": "\"Azt akarom, hogy a szomszédaim 30%-a olyan legyen, mint én.\" Hogyan vezet ez szétváláshoz?",
        "mod_2_card_title": "Szimuláció #2",
        "mod_2_card_name": "Térbeli Rendezés",
        "mod_2_card_desc": "Fizikai mozgásos játék. Állj fel és költözz el, ha \"boldogtalan\" vagy.",
        "tag_emergence": "Emergencia",
        "tag_micro_macro": "Mikro vs Makro",

        "break_time": "01:00 - 01:10",
        "break_title": "SZÜNET",

        "mod_3_time": "01:10 - 01:30",
        "mod_3_title": "Spontán Szinkron",
        "mod_3_desc": "Hogyan dobban egyszerre a szív? Hogyan villognak egyszerre a szentjánosbogarak? Vezető nélkül.",
        "mod_3_card_title": "Szimuláció #3",
        "mod_3_card_name": "Taps Szinkronizáció",
        "mod_3_card_desc": "A \"Taps\" kísérlet. Decentralizált koordináció lokális jelek alapján.",
        "tag_self_org": "Önszerveződés",
        "tag_oscillators": "Csatolt Oszcillátorok",

        "mod_4_time": "01:30 - 01:50",
        "mod_4_title": "Hálózati Útvonalak",
        "mod_4_desc": "Csomagok, Routerek és Szűk Keresztmetszetek. Ágensek egy korlátozott kapacitású gráfban.",
        "mod_4_card_title": "Szimuláció #4",
        "mod_4_card_name": "A Csomag Játék",
        "mod_4_card_desc": "A diákok csomagok és routerek. Találd meg a leggyorsabb utat az emberi hálózaton.",
        "tag_graph_theory": "Gráfelmélet",
        "tag_optimization": "Optimalizálás",

        "mod_5_time": "01:50 - 02:00",
        "mod_5_title": "A Jövő Íve",
        "mod_5_desc": "Hogyan formálja jövőnket az Ágens AI? Az emergenciától az optimalizálásig.",
        "mod_5_card_title": "Nagy Finálé",
        "mod_5_card_name": "Ágens AI & Igazítás",
        "mod_5_card_desc": "Egyszerű szabályoktól a célvezérelt intelligenciáig. A Gémkapocs-optimalizáló.",
        "tag_ai_safety": "AI Biztonság",
        "tag_goal_directed": "Célvezérelt",

        "mod_6_time": "02:00+",
        "mod_6_title": "Lakoma és Szintézis",
        "mod_6_desc": "Játékelmélet ebédidőben. Kérdések és Projekt Indítás.",
        "mod_6_card_title": "Konklúzió",
        "mod_6_card_name": "Pizza Konszenzus Játék",
        "mod_6_card_desc": "Elosztott tárgyalás. Meg tudunk egyezni a feltétekben, mielőtt éhen halunk?",
        "tag_bonus": "Bónusz Szimuláció",

        "status_label": "Státusz:",
        "status_ready": "KÉSZENLÉT",
        "btn_prev": "Előző",
        "btn_next": "Következő Modul"
    }
};

let currentLang = 'hu'; // Default to Hungarian

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    
    // Update button styles
    document.getElementById('lang-en').classList.toggle('opacity-50', lang !== 'en');
    document.getElementById('lang-hu').classList.toggle('opacity-50', lang !== 'hu');
}

// --- Background Simulation (P5.js) ---
let agents = [];
const AGENT_COUNT = 80; // Reduced for better performance on timeline view
const CONNECTION_DISTANCE = 100;
const MOUSE_INFLUENCE = 200;

function setup() {
    const container = document.getElementById('canvas-container');
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    for (let i = 0; i < AGENT_COUNT; i++) {
        agents.push(new Agent());
    }
    strokeWeight(1);
    fill(255);
    
    // Initialize Language
    setLanguage('hu');
}

function draw() {
    clear();
    for (let agent of agents) {
        agent.behaviors();
        agent.update();
        agent.display();
    }
    drawConnections();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function drawConnections() {
    stroke(100, 150, 255, 30);
    for (let i = 0; i < agents.length; i++) {
        let a = agents[i];
        for (let j = i + 1; j < agents.length; j++) {
            let b = agents[j];
            let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
            if (d < CONNECTION_DISTANCE) {
                line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
            }
        }
    }
}

class Agent {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = p5.Vector.random2D();
        this.acc = createVector();
        this.maxSpeed = 1.0;
        this.maxForce = 0.05;
        this.size = random(2, 4);
        this.color = color(random(100, 255), random(100, 255), 255, 100);
    }
    
    behaviors() {
        let mouse = createVector(mouseX, mouseY);
        if (dist(this.pos.x, this.pos.y, mouse.x, mouse.y) < MOUSE_INFLUENCE) {
            let flee = p5.Vector.sub(this.pos, mouse);
            flee.setMag(this.maxSpeed * 2);
            flee.sub(this.vel);
            flee.limit(this.maxForce * 5);
            this.applyForce(flee);
        }
        // Screen wrap
        if (this.pos.x < -50) this.pos.x = width + 50;
        if (this.pos.x > width + 50) this.pos.x = -50;
        if (this.pos.y < -50) this.pos.y = height + 50;
        if (this.pos.y > height + 50) this.pos.y = -50;
    }
    
    applyForce(force) {
        this.acc.add(force);
    }
    
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    
    display() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
    }
}

// --- Timer & Session Logic ---

let timerInterval;
let seconds = 0;
let isRunning = false;

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function updateDisplay() {
    document.getElementById('global-timer').innerText = formatTime(seconds);
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    } else {
        timerInterval = setInterval(() => {
            seconds++;
            updateDisplay();
        }, 1000);
        isRunning = true;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    isRunning = false;
    updateDisplay();
}

// Module Interaction
function activateModule(element) {
    // Find parent row
    const row = element.closest('.module-item');
    
    // Reset all active states
    document.querySelectorAll('.module-item').forEach(el => {
        el.classList.remove('active-module');
        el.querySelector('.w-12').classList.remove('scale-125');
    });
    
    // Set active
    row.classList.add('active-module');
    row.querySelector('.w-12').classList.add('scale-125');
    
    // Update status text
    const titleKey = row.querySelector('h3').getAttribute('data-i18n');
    const title = translations[currentLang][titleKey] || "Module";
    document.getElementById('status-text').innerText = "CURRENT: " + title.toUpperCase();
    
    // Optional: Scroll to center
    row.scrollIntoView({behavior: 'smooth', block: 'center'});
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
    }
});
