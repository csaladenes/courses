// ==========================================
// PART 7: CLASSROOM GAMES
// ==========================================

// --- GAME 1: BEAUTY CONTEST (Guess 2/3 of Average) ---
let beautyData = {
    guesses: [],
    chart: null
};

function runBeautyContest(type) {
    let newGuesses = [];
    const N = 100;

    if (type === 'random') {
        // Level 0: Random [0, 100]
        for(let i=0; i<N; i++) newGuesses.push(Math.floor(Math.random() * 101));
        updateBeautyUI(newGuesses, "Random agents pick any number. Average is ~50. Target is ~33.");
    } 
    else if (type === 'rational') {
        // Level 1 & 2: Rational thinkers target 33 or 22
        for(let i=0; i<N; i++) {
            if(Math.random() < 0.5) newGuesses.push(33 + Math.floor(Math.random()*5));
            else newGuesses.push(22 + Math.floor(Math.random()*5));
        }
        updateBeautyUI(newGuesses, "Rational agents assume randoms pick 50, so they guess 33. Super-rationals guess 22.");
    } 
    else if (type === 'mixed') {
        // Realistic Class: Mix of L0, L1, L2, and Trolls
        for(let i=0; i<N; i++) {
            let r = Math.random();
            if (r < 0.3) newGuesses.push(Math.floor(Math.random() * 101)); // Randoms
            else if (r < 0.6) newGuesses.push(33 + Math.floor(Math.random()*10 - 5)); // Level 1
            else if (r < 0.9) newGuesses.push(22 + Math.floor(Math.random()*10 - 5)); // Level 2
            else newGuesses.push(0); // Nash Equilibrium / Trolls
        }
        updateBeautyUI(newGuesses, "A realistic mix of strategies. The winner usually guesses around 20-30.");
    }
}

function updateBeautyUI(guesses, comment) {
    const avg = guesses.reduce((a,b)=>a+b, 0) / guesses.length;
    const target = avg * (2/3);
    
    document.getElementById('beauty-result').classList.remove('hidden');
    document.getElementById('beauty-avg').innerText = avg.toFixed(2);
    document.getElementById('beauty-target').innerText = target.toFixed(2);
    document.getElementById('beauty-comment').innerText = comment;
}


// --- GAME 2: EL FAROL BAR (Minority Game) ---
let barHistory = [];

function runElFarol() {
    const N = 100;
    const CAPACITY = 60;
    let attendees = 0;

    // Agents use simple heuristic: "If it was crowded last time, don't go."
    // But if everyone thinks that, nobody goes!
    
    if (barHistory.length === 0) {
        // First night: Random
        attendees = Math.floor(Math.random() * N);
    } else {
        const lastAttendance = barHistory[barHistory.length - 1];
        if (lastAttendance > CAPACITY) {
            // It was crowded. Most people stay home.
            // But some contrarians go.
            attendees = 20 + Math.floor(Math.random() * 20); 
        } else {
            // It was empty. Everyone rushes in!
            attendees = 70 + Math.floor(Math.random() * 30);
        }
    }
    
    barHistory.push(attendees);
    updateBarUI(attendees, CAPACITY);
}

function updateBarUI(count, capacity) {
    const fillBar = document.getElementById('bar-fill');
    const countText = document.getElementById('bar-count');
    const outcomeText = document.getElementById('bar-outcome');
    
    const pct = Math.min(100, count);
    fillBar.style.width = pct + "%";
    countText.innerText = count;
    
    if (count > capacity) {
        fillBar.classList.remove('bg-emerald-500');
        fillBar.classList.add('bg-rose-600');
        outcomeText.innerText = "Too Crowded! Everyone had a bad time.";
        outcomeText.className = "text-center text-xs font-bold text-rose-600 mt-2";
    } else {
        fillBar.classList.remove('bg-rose-600');
        fillBar.classList.add('bg-emerald-500');
        outcomeText.innerText = "Perfect! Great night out.";
        outcomeText.className = "text-center text-xs font-bold text-emerald-600 mt-2";
    }
}


// --- GAME 3: WISDOM OF CROWDS ---
let wisdomChart = null;

function runWisdom(type) {
    const TRUE_VALUE = 842;
    const N = 50;
    let guesses = [];

    if (type === 'independent') {
        // Independent errors cancel out (Gaussian noise)
        for(let i=0; i<N; i++) {
            // Box-Muller transform for normal distribution
            let u = 0, v = 0;
            while(u === 0) u = Math.random(); 
            while(v === 0) v = Math.random();
            let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            
            let guess = TRUE_VALUE + (z * 200); // StdDev 200
            guesses.push(Math.max(0, Math.round(guess)));
        }
    } else if (type === 'anchored') {
        // Correlated errors (Social Influence / Bias)
        // Everyone hears a rumor that it's "around 500"
        for(let i=0; i<N; i++) {
            let guess = 500 + (Math.random() - 0.5) * 100;
            guesses.push(Math.round(guess));
        }
    }

    updateWisdomUI(guesses, TRUE_VALUE);
}

function updateWisdomUI(guesses, trueVal) {
    const avg = Math.round(guesses.reduce((a,b)=>a+b,0) / guesses.length);
    const sorted = [...guesses].sort((a,b)=>a-b);
    const min = sorted[0];
    const max = sorted[sorted.length-1];

    document.getElementById('wisdom-stats').classList.remove('hidden');
    document.getElementById('wis-best').innerText = sorted.reduce((prev, curr) => Math.abs(curr - trueVal) < Math.abs(prev - trueVal) ? curr : prev);
    document.getElementById('wis-worst').innerText = Math.abs(min - trueVal) > Math.abs(max - trueVal) ? min : max;
    document.getElementById('wis-avg').innerText = avg;

    // Update Chart
    if(!wisdomChart) {
        const ctx = document.getElementById('wisdomChart').getContext('2d');
        wisdomChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Guesses',
                    data: [],
                    backgroundColor: '#6366f1'
                }, {
                    label: 'True Value',
                    data: [{x: 25, y: trueVal}],
                    backgroundColor: '#10b981',
                    pointRadius: 8,
                    pointStyle: 'star'
                }, {
                    label: 'Average',
                    data: [],
                    backgroundColor: '#f59e0b',
                    pointRadius: 6,
                    pointStyle: 'rectRot'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Ensure fixed height
                scales: {
                    x: { display: false, min: 0, max: 50 },
                    y: { title: {display:true, text: 'Jellybean Guess'} }
                }
            }
        });
    }

    wisdomChart.data.datasets[0].data = guesses.map((g, i) => ({x: i, y: g}));
    wisdomChart.data.datasets[2].data = [{x: 25, y: avg}];
    wisdomChart.update();
}
