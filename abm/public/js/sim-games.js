// ==========================================
// PART 4: PRISONER'S DILEMMA (Game Theory)
// ==========================================

// Payoff Matrix
const PAYOFFS = {
    'CC': [3, 3],
    'CD': [0, 5],
    'DC': [5, 0],
    'DD': [1, 1]
};

let gameState = {
    playerScore: 0,
    opponentScore: 0,
    history: [], // Array of {player: 'C'|'D', opponent: 'C'|'D'}
    opponentStrategy: 'random' // random, tft, devil, angel
};

function initGameTheory() {
    const btnC = document.getElementById('btn-cooperate');
    const btnD = document.getElementById('btn-defect');
    const selectOpp = document.getElementById('select-opponent');

    if(btnC) btnC.addEventListener('click', () => playRound('C'));
    if(btnD) btnD.addEventListener('click', () => playRound('D'));
    
    if(selectOpp) {
        selectOpp.addEventListener('change', (e) => {
            gameState.opponentStrategy = e.target.value;
            resetGame();
            updateGameUI();
        });
    }
}

function resetGame() {
    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.history = [];
    const resultDisplay = document.getElementById('game-result-display');
    if(resultDisplay) resultDisplay.innerHTML = '<span class="text-slate-400 italic">New opponent. Start playing!</span>';
    const historyLog = document.getElementById('game-history-log');
    if(historyLog) historyLog.innerHTML = '';
    updateGameUI();
}

function getOpponentMove() {
    const hist = gameState.history;
    
    switch(gameState.opponentStrategy) {
        case 'random':
            return Math.random() < 0.5 ? 'C' : 'D';
        
        case 'devil': // Always Defect
            return 'D';
            
        case 'angel': // Always Cooperate
            return 'C';
            
        case 'tft': // Tit-for-Tat
            // First move: Cooperate
            if (hist.length === 0) return 'C';
            // Subsequent moves: Copy player's last move
            return hist[hist.length - 1].player;
            
        default:
            return 'C';
    }
}

function playRound(playerMove) {
    const opponentMove = getOpponentMove();
    const key = playerMove + opponentMove;
    const [pScore, oScore] = PAYOFFS[key];

    // Update State
    gameState.playerScore += pScore;
    gameState.opponentScore += oScore;
    gameState.history.push({ player: playerMove, opponent: opponentMove, pScore, oScore });

    // Visual Feedback
    displayRoundResult(playerMove, opponentMove, pScore, oScore);
    updateGameHistory(); // Update log
    updateGameUI();
}

function displayRoundResult(pMove, oMove, pPoints, oPoints) {
    const display = document.getElementById('game-result-display');
    if(!display) return;
    
    let msg = "";
    let colorClass = "";
    
    if (pMove === 'C' && oMove === 'C') {
        msg = "Both Cooperated! Mutual Gain.";
        colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (pMove === 'D' && oMove === 'D') {
        msg = "Both Defected. Mutual Destruction.";
        colorClass = "text-orange-600 bg-orange-50 border-orange-200";
    } else if (pMove === 'D' && oMove === 'C') {
        msg = "You betrayed them! Big Win.";
        colorClass = "text-blue-600 bg-blue-50 border-blue-200";
    } else {
        msg = "You were betrayed! Sucker's Payoff.";
        colorClass = "text-red-600 bg-red-50 border-red-200";
    }

    display.innerHTML = `
        <div class="${colorClass} p-4 rounded w-full border animate-fadeIn">
            <h4 class="font-bold text-lg">${msg}</h4>
            <div class="flex justify-center gap-8 mt-2 text-sm">
                <div>You: <span class="font-mono font-bold text-xl">${pMove}</span> (+${pPoints})</div>
                <div>Opponent: <span class="font-mono font-bold text-xl">${oMove}</span> (+${oPoints})</div>
            </div>
        </div>
    `;
}

function updateGameHistory() {
    const log = document.getElementById('game-history-log');
    if (!log) return;

    const round = gameState.history[gameState.history.length - 1];
    const roundNum = gameState.history.length;
    
    const entry = document.createElement('div');
    entry.className = "flex justify-between items-center p-2 bg-white rounded border border-slate-100 text-xs";
    
    let icon = '';
    if (round.player === 'C' && round.opponent === 'C') icon = '🤝';
    else if (round.player === 'D' && round.opponent === 'D') icon = '⚔️';
    else if (round.player === 'C' && round.opponent === 'D') icon = '💔';
    else icon = '💰'; // You betrayed

    entry.innerHTML = `
        <span class="text-slate-400 w-6">#${roundNum}</span>
        <span class="font-bold">${icon}</span>
        <span class="font-mono">You:${round.player} vs Opp:${round.opponent}</span>
        <span class="font-bold text-slate-600">+${round.pScore} / +${round.oScore}</span>
    `;
    
    log.insertBefore(entry, log.firstChild); // Add to top
}

function updateGameUI() {
    const scorePlayer = document.getElementById('score-player');
    const scoreOpponent = document.getElementById('score-opponent');
    const selectOpp = document.getElementById('select-opponent');
    const stratDisplay = document.getElementById('opponent-strategy');

    if(scorePlayer) scorePlayer.innerText = gameState.playerScore;
    if(scoreOpponent) scoreOpponent.innerText = gameState.opponentScore;
    
    if(selectOpp && stratDisplay) {
        const stratName = selectOpp.options[selectOpp.selectedIndex].text;
        stratDisplay.innerText = stratName; // If element exists in DOM
    }
}

document.addEventListener('DOMContentLoaded', initGameTheory);
