#!/bin/bash

# Update System
sudo yum update -y

# Install Node.js (v20 LTS - Amazon Linux 2 compatible)
# Using NodeSource repo for newer versions
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup Project Directory
mkdir -p /home/ec2-user/people-express-backend
# (You will copy your server.js and package.json here manually via SCP or Git)

# Configure Nginx Proxy (to forward port 80 -> 3000)
echo "Configuring Nginx..."
sudo bash -c 'cat > /etc/nginx/conf.d/people-express.conf <<EOF
server {
    listen 80;
    server_name _;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

# Restart Nginx to apply changes
sudo systemctl restart nginx

echo "✅ Server Setup Complete!"
echo "Next Steps:"
echo "1. Copy your server.js, package.json, and package-lock.json to /home/ec2-user/people-express-backend"
echo "2. Run 'npm install' in that folder."
echo "3. Start the app with: 'pm2 start server.js --name people-express'"
echo "4. Save PM2 list: 'pm2 save' and 'pm2 startup'"
