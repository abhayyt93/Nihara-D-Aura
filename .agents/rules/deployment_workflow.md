---
trigger: always_on
---

# Deployment Workflow

Whenever the agent modifies code in this workspace, the agent MUST follow these steps before considering the task complete:

1. **Push to GitHub**: Commit the changes and push them to the user's GitHub repository (`Nihara D Aura`).
2. **Update Endpoints Documentation**: Any new or modified API endpoints MUST be documented in `d:\Nihara D Aura\Documentation.md` with their method, URL, and sample JSON payload.