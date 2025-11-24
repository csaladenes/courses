# People Express Simulator & Educational Platform ✈️

A System Dynamics flight simulator designed for the "340 Automation" course. This platform bridges historical business lessons (People Express, 1980s) with modern parallels (Wizz Air, 2020s) and future AI strategy (Agentic AI Planning).

## 🌟 Features

### 1. Interactive Flight Simulator
*   **Core Mechanics**: Based on the classic John Sterman System Dynamics model.
*   **The Challenge**: Manage Growth, Pricing, and Hiring to avoid the "Service Trap."
*   **Key Feedback Loops**:
    *   *Reinforcing Loop*: Demand → Revenue → Fleet → Capacity → Demand.
    *   *Balancing Loop*: Demand → Workload → Poor Service → Reputation Crash → Lower Demand.
*   **Controls**: Quarterly decisions for Ticket Price, Marketing Spend, Hiring, and Plane Orders.
*   **Undo Capability**: "Undo Last Quarter" button allows students to recover from mistakes and experiment with "What-if" scenarios.

### 2. Real-Time Leaderboard
*   **Classroom Codes**: Supports multiple distinct classes via "Instance IDs" (e.g., `MCC2025`, `EVENING-CLASS`).
*   **Shared Backend**: Stores student scores (Profit, Reputation, Market Share) in a SQLite database.
*   **Filtering**: Leaderboard automatically filters to show only peers in the same class instance.

### 3. Educational Content Modules
*   **Introduction**: Deep dive into the Harvard Business School case study of People Express.
    *   *Visuals*: Mermaid.js Causal Loop Diagrams explaining the system structure.
*   **Wizz Air Analysis (Modern Parallel)**:
    *   Comparison of People Express's 1980s growth to Wizz Air's 2020s strategy.
    *   **Data Integration**: Real-world Load Factor data (2017-2025) showing the "Asset Utilization" trap.
*   **Agentic AI Context**:
    *   Connects System Dynamics to Model-Based Reinforcement Learning (MBRL).
    *   Explains "Micro" (Agent) vs "Macro" (System) perspectives.
    *   Illustrates "The Horizon Problem" in AI planning.

## 🛠 Technical Stack

*   **Backend**: Node.js + Express
*   **Database**: SQLite (Stored in `scores.db`)
*   **Frontend**: HTML5, Tailwind CSS (Styling), Chart.js (Visualization), Mermaid.js (Diagrams)
*   **Storage**: LocalStorage for persisting Class Instance IDs.

## 🚀 Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Server**:
    ```bash
    node server.js
    ```

3.  **Access the Simulator**:
    Open `http://localhost:3000` in your browser.

4.  **Deployment**:
    *   *Note*: Since this uses a local SQLite database and Node.js server, it cannot be hosted on static platforms like standard Netlify. Use Render, Heroku, or Railway for deployment.

## 📂 Project Structure

```
340 Automation/PeopleExpressSimulator/
├── server.js              # Express API & Database Logic
├── scores.db              # SQLite Database (Auto-created)
├── public/
│   ├── index.html         # Main SPA Interface
│   ├── js/
│   │   ├── simulator.js   # System Dynamics Math Engine & State Management
│   │   └── ui.js          # UI Logic, Charts, Content, & Event Listeners
│   └── css/               # (Optional custom styles)
└── README.md              # This file
```

## 🔄 Version History

*   **v1.0**: Initial System Dynamics model & Simulator UI.
*   **v1.1**: Added Leaderboard with SQLite backend.
*   **v1.2**: Added "Instance ID" system for multi-class support.
*   **v1.3**: Integrated Wizz Air real-world data & Mermaid.js diagrams.
*   **v1.4**: Added "Undo/Step Back" functionality for state restoration.
*   **v1.5**: Expanded "Agentic AI" curriculum content (Micro vs Macro, Horizon Problem).
