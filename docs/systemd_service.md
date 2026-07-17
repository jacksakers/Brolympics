[Unit]
Description=Brolympics Web Application
After=network.target

[Service]

Ensure you change these to match your actual paths and username

User=your_linux_username
WorkingDirectory=/path/to/your/brolympics/project

Assuming you build the frontend and serve it via your Node.js backend

ExecStart=/usr/bin/node /path/to/your/brolympics/project/server/index.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target