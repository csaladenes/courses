const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const dbPath = path.join(__dirname, 'scores.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Migration: Check if instanceId column exists, if not add it (simplified for dev: just try to add)
        // For a fresh run, we just update CREATE TABLE
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                studentName TEXT,
                instanceId TEXT,
                profit REAL,
                reputation REAL,
                marketShare REAL,
                fleetSize INTEGER,
                date TEXT
            )`);
            
            // Attempt to add column if table exists but column doesn't (simple migration)
            db.run("ALTER TABLE scores ADD COLUMN instanceId TEXT", (err) => {
                // Ignore error if column exists
            });
        });
    }
});

// API Routes

// Submit Score
app.post('/api/submit-score', (req, res) => {
    const { studentName, instanceId, profit, reputation, marketShare, fleetSize } = req.body;
    const date = new Date().toISOString();
    const safeInstanceId = instanceId || 'default';

    const sql = `INSERT INTO scores (studentName, instanceId, profit, reputation, marketShare, fleetSize, date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [studentName, safeInstanceId, profit, reputation, marketShare, fleetSize, date];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": req.body,
            "id": this.lastID
        });
    });
});

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
    const instanceId = req.query.instanceId || 'default';
    const sql = "SELECT * FROM scores WHERE instanceId = ? ORDER BY profit DESC LIMIT 20";
    
    db.all(sql, [instanceId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "instanceId": instanceId,
            "data": rows
        });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`People Express Simulator running at http://localhost:${port}`);
});
