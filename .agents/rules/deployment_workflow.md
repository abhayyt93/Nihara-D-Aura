# Automated Deployment Workflow for Nihara D Aura

Har baar jab bhi code modify ho:
1. **Local Test & Documentation**:
   - Changes ko locally test karein.
   - Nayi ya modified APIs ko `API_DOCUMENTATION.md` me update karein.

2. **Git Commit & Push**:
   - `git add .`
   - `git commit -m "<Clear descriptive message>"`
   - `git push origin main`

3. **AWS EC2 Sync & PM2 Reload**:
   - SSH se AWS EC2 (`32.236.58.112`) me pull aur restart karein:
     ```bash
     ssh -i Nihara-key.pem ubuntu@32.236.58.112 "cd /home/ubuntu/Nihara-D-Aura && git pull origin main && npm install --production && pm2 reload nihara-backend"
     ```
   - Nginx already port 80 to 3000 proxy kar raha hai, isliye zero-downtime reload hoga.
