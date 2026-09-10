---
trigger: always_on
---

# Deployment Workflow

Whenever the agent modifies code in this workspace, the agent MUST follow these steps before considering the task complete:

1. **Push to GitHub**: Commit the changes and push them to the user's GitHub repository (`Nihara D Aura`).
2. **Deploy to EC2**: Deploy the updated code to the AWS EC2 instance (`3.7.180.215`).
   - Use the SSH key located at: `D:\Backend live\kosmico-key.pem`
   - Use the SSH user: `ec2-user`
   - Target directory on EC2: `/home/ec2-user/nihara_backend/`
3. **Restart PM2**: SSH into the EC2 instance and restart the PM2 process named `nihara-backend` (which runs on port 3000) using the command: `pm2 restart nihara-backend`.