# How to Run the Simulator for Your Class (Using ngrok)

You have chosen the **ngrok** method. This runs the simulation on your laptop and creates a secure public tunnel so students can access it.

## Step 1: Start the Simulator Server
1.  Open a terminal in this folder (`340 Automation/PeopleExpressSimulator`).
2.  Run the server:
    ```bash
    node server.js
    ```
    *(Keep this terminal open! If you close it, the site goes down.)*

## Step 2: Create the Public Link
1.  Open a **NEW** terminal window.
2.  Run ngrok pointing to your server's port (3000):
    ```bash
    ngrok http 3000
    ```
    *Note: If it asks for an authtoken, sign up for free at [dashboard.ngrok.com](https://dashboard.ngrok.com), copy your token, and run: `ngrok config add-authtoken <YOUR_TOKEN>`*

## Step 3: Share with Students
1.  Look at the ngrok terminal output. Find the line that says **Forwarding**.
2.  It will look like this: `https://a1b2-c3d4.ngrok-free.app -> http://localhost:3000`
3.  Copy that `https://...` link.
4.  **Share it with your students.** They can now open the simulator on their phones or laptops.

## ⚠️ Important Notes
*   **Don't Close Your Laptop**: The server is running on your machine.
*   **Database is Local**: All student scores are saved to `scores.db` on your laptop. You won't lose them unless you delete that file.
*   **New Link**: If you stop ngrok and restart it, the link **will change** (unless you have a paid ngrok plan).

