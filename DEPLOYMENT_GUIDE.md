# Solvant Proof-to-Scale OS — Cloud Deployment Guide

This project is configured as a **Unified Fullstack Web Application**: the FastAPI backend natively serves both the REST API (`/api/*`) and the compiled React SPA (`/`), enabling 1-click single-service deployment to **Render**, **Railway**, or **Docker** with zero CORS issues.

---

## Option A: Deploy Free on Render (Recommended, ~2 Minutes)

Render provides free hosting for web services with automated GitHub deployments.

### Steps:
1. **Push this code to GitHub**:
   - Create a new repository on GitHub (e.g. `solvant-proof-to-scale-os`).
   - Run these commands in this directory:
     ```bash
     git init
     git add .
     git commit -m "Deploy: Solvant Proof-to-Scale OS"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/solvant-proof-to-scale-os.git
     git push -u origin main
     ```
2. **Create Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** $\to$ **Web Service**.
   - Connect your GitHub repository.
   - Fill in the settings (Render will auto-detect from `render.yaml` or you can paste these):
     - **Name**: `solvant-os`
     - **Environment**: `Python`
     - **Build Command**:
       ```bash
       cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
       ```
     - **Start Command**:
       ```bash
       cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
       ```
3. **Environment Variables (Optional)**:
   - `GROQ_API_KEY`: Your Groq API key (optional — if omitted, the app runs in verified deterministic cache mode).
   - `GROQ_MODEL`: `llama-3.3-70b-versatile` (default).
4. Click **Create Web Service**.
   - Render will build the Vite frontend, install backend requirements, and give you a public URL like `https://solvant-os.onrender.com`!

---

## Option B: Deploy on Railway (1-Click Dockerfile)

Railway automatically detects the root `Dockerfile` and builds both frontend and backend in isolated stages.

### Steps:
1. Go to [railway.com](https://railway.com/) $\to$ Click **New Project** $\to$ **Deploy from GitHub repo**.
2. Select your repository.
3. Railway will build using the multi-stage `Dockerfile`.
4. Under **Settings** $\to$ **Networking**, click **Generate Domain** (e.g. `solvant-os.up.railway.app`).
5. Your app is live!

---

## Option C: Instant Public Demo URL via Tunnel (0-Signup, Live in 15s)

If you need a live public URL right now on the stage without pushing to GitHub or signing up for cloud hosts:

1. Open a terminal in the project directory.
2. Run:
   ```bash
   npx localtunnel --port 8000
   ```
3. Localtunnel will output a public URL like:
   `https://curly-lions-jump.loca.lt`
4. Anyone on the internet (including judges) can access the full app immediately!
