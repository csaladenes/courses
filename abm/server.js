const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3001; // Different port from PeopleExpress (3000)

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup (for future leaderboards/state persistence if needed)
const dbPath = path.join(__dirname, 'sim_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS game_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scenario TEXT,
            score REAL,
            timestamp TEXT
        )`);
    }
});

// Basic API Routes
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
});

// Start Server
app.listen(port, () => {
    console.log(`Agent System Simulator running at http://localhost:${port}`);
});

