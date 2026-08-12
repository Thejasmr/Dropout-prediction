# 🌟 EduPulse AI - Step-by-Step Setup Guide

Welcome! This guide is designed for beginners ("basic persons") to set up and run **EduPulse AI** on a local computer. Follow these steps sequentially to get everything up and running.

---

## 📋 Table of Contents
1. [Prerequisites (What to Install First)](#1-prerequisites-what-to-install-first)
2. [Method A: Quick Start with Docker (Easiest & Recommended)](#method-a-quick-start-with-docker-easiest--recommended)
3. [Method B: Local Setup without Docker (For Modifying Code)](#method-b-local-setup-without-docker-for-modifying-code)
4. [🔑 Creating Your Admin Account](#-creating-your-admin-account)
5. [🛠️ Troubleshooting (Common Issues)](#️-troubleshooting-common-issues)

---

## 1. Prerequisites (What to Install First)

Before you begin, you need to download and install a few free tools on your computer.

| Tool | Why we need it | Download Link |
| :--- | :--- | :--- |
| **Git** | To download and manage the code | [Download Git](https://git-scm.com/downloads) |
| **Docker Desktop** | Automatically runs the database, cache, and services in containers (highly recommended) | [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Node.js** (v20+) | Required to run the Frontend website locally | [Download Node.js](https://nodejs.org/) |
| **Python** (v3.11+) | Required to run the Backend and ML services locally | [Download Python](https://www.python.org/downloads/) |
| **VS Code** | A great free text editor to view and edit files | [Download VS Code](https://code.visualstudio.com/) |

> [!NOTE]
> Make sure to check the box that says **"Add to PATH"** during the Python and Node.js installations!

---

## Method A: Quick Start with Docker (Easiest & Recommended)

Docker sets up all databases (PostgreSQL, Redis, MinIO) and services automatically, so you don't have to install them one by one.

### Step 1: Start Docker Desktop
Make sure the **Docker Desktop** application is running on your computer.

### Step 2: Copy the Configuration Files
We need to copy the template configuration files (`.env.example`) to actual configuration files (`.env`).
Open your terminal (PowerShell on Windows, or Terminal on macOS/Linux) in the project folder and run:

**On Windows (PowerShell):**
```powershell
copy .env.example .env
copy frontend\.env.example frontend\.env.local
copy backend\.env.example backend\.env
copy ml_service\.env.example ml_service\.env
```

**On macOS / Linux:**
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp ml_service/.env.example ml_service/.env
```

### Step 3: Start the Application
In your terminal, run this command to build and launch all services:
```bash
docker-compose up --build
```
*Note: The first time you run this, it will take 5-10 minutes to download and build everything. Once finished, you will see a stream of logs in your terminal.*

### Step 4: Run Database Migrations
Open a **new terminal tab or window** in the same folder and run this command to set up the database tables:
```bash
docker-compose exec backend alembic upgrade head
```

### Step 5: Seed the Admin User
To create your first login account, run:
```bash
docker-compose exec backend python -m app.utils.seed_admin
```

🎉 **All done!** Go to [http://localhost:3000](http://localhost:3000) in your web browser to open the application!

---

## Method B: Local Setup without Docker (For Modifying Code)

If you prefer to run services manually on your machine without using Docker, follow these steps. You will need **three terminal windows** open.

### Step 1: Copy Environment Files
*(If you already did this in Method A, skip this step).*
Make copies of the `.env` files as explained in **Method A, Step 2**.

---

### Step 2: Set Up and Run the Backend API (Terminal 1)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment (a sandbox to install python libraries):
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   * **Windows:** `venv\Scripts\activate`
   * **macOS / Linux:** `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the Backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

### Step 3: Set Up and Run the ML Service (Terminal 2)
1. Open a second terminal and navigate to the ML service folder:
   ```bash
   cd ml_service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   ```
   * **Windows:** `venv\Scripts\activate`
   * **macOS / Linux:** `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the ML Service:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

---

### Step 4: Set Up and Run the Frontend (Terminal 3)
1. Open a third terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node packages:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```

---

### Step 5: Start Celery Workers & Beat (Optional - for Notifications/Alerts)
Celery runs background jobs like sending emails or running model recalculations.

**For Windows (Powershell):**
```powershell
cd backend
venv\Scripts\activate
# Start the worker with solo execution pool (required for Windows)
celery -A app.tasks.celery_app worker --loglevel=info -P solo
# Open another terminal to start the beat scheduler
celery -A app.tasks.celery_app beat --loglevel=info
```

**For macOS / Linux:**
```bash
cd backend
source venv/bin/activate
celery -A app.tasks.celery_app worker --loglevel=info
# Open another terminal to start the beat scheduler
celery -A app.tasks.celery_app beat --loglevel=info
```

---

## 🔑 Creating Your Admin Account

When you start the backend, it will automatically look for the **default administrator credentials** configured in `backend/.env`.

1. Open `backend/.env` in VS Code.
2. Look for the default admin settings (or you can use the ones seeded by the script).
3. The default seeded admin email and password are:
   * **Email:** `admin@edupulse.ai`
   * **Password:** `AdminPassword123` (Make sure to change this password in settings after logging in!)

---

## 🛠️ Troubleshooting (Common Issues)

### 🔴 Error: "Port 3000 is already in use"
* **Why:** You have another project or terminal running on port 3000.
* **Fix:** Find and close that terminal, or edit the port in `package.json` to something else (e.g., `3001`).

### 🔴 Error: "Docker Desktop is not running"
* **Why:** The Docker engine hasn't started.
* **Fix:** Double-click the Docker Desktop icon on your computer, wait for the bottom-left indicator to turn green, and try running `docker-compose up` again.

### 🔴 Error: "Pip command not found" or "Python not found"
* **Why:** Python was not added to your system environment variables.
* **Fix:** Re-run the Python installer, select **Modify**, and make sure **"Add Python to PATH"** is checked.

### 🔴 Celery fails to start on Windows
* **Why:** Celery has compatibility issues with Windows default multiprocessing.
* **Fix:** Always add `-P solo` at the end of the celery command on Windows:
  `celery -A app.tasks.celery_app worker --loglevel=info -P solo`
