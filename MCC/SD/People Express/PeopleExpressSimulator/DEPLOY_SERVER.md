# 🚀 Deploying the Backend to Amazon Linux 2

This guide will help you set up the Node.js backend (Leaderboard API) on your Amazon Linux 2 server.

## 1. Prerequisites
*   **SSH Access** to your Amazon Linux 2 instance.
*   **Security Group (Firewall)**: Ensure **Port 80 (HTTP)** and **22 (SSH)** are open inbound.

## 2. Automated Setup (The Easy Way)
I have created a script `setup_server.sh` that installs Node.js 20 (LTS), Nginx, and PM2 automatically.

1.  **Upload the script** to your server:
    ```bash
    scp -i your-key.pem setup_server.sh ec2-user@your-server-ip:/home/ec2-user/
    ```
2.  **Run the script**:
    ```bash
    ssh -i your-key.pem ec2-user@your-server-ip
    chmod +x setup_server.sh
    ./setup_server.sh
    ```

## 3. Deploying Your Code
Once the server is set up, you need to put your backend code there.

1.  **Prepare local files**:
    *   `server.js` (The one from `PeopleExpressSimulator`)
    *   `package.json`
2.  **Upload them**:
    ```bash
    scp -i your-key.pem server.js package.json ec2-user@your-server-ip:/home/ec2-user/people-express-backend/
    ```

## 4. Starting the Server
SSH into your server again and run:

```bash
cd /home/ec2-user/people-express-backend
npm install
pm2 start server.js --name people-express
pm2 save
pm2 startup
```

## 5. Verify
Your API should now be accessible at:
`http://your-server-ip/api/leaderboard`

## 6. Connect Frontend
1.  Open `PeopleExpressStatic/ui.js`.
2.  Change `const API_BASE_URL` to `http://your-server-ip` (or your domain name).
3.  Commit and push the static site to GitHub.
