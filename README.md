# CareerSync: AI Resume-to-Job Matching Platform

CareerSync is a full-stack AI-powered resume analyzer and job matching dashboard. It parses PDF, Word, and text resumes into structured JSON profiles, compares them against target job descriptions, identifies skill gaps, calculates fit scores, and generates actionable resume formatting/improvement recommendations.

The platform provides a distinctive **"document review desk"** aesthetic: a clean white glassmorphic theme with distinct candidate and recruiter workspace windows, a serif display typeface for headers, monospace indicators for scores/data, and sans-serif for body.

---

## Technical Stack
* **Frontend**: Next.js 15 (App Router) + React + TypeScript + Tailwind CSS v4
* **Backend**: Python 3 + FastAPI
* **Database**: PostgreSQL (SQLAlchemy ORM) with a transparent SQLite fallback for local development
* **AI Engine**: Google Gemini API (`gemini-1.5-flash` or `gemini-1.5-pro`)
* **Parsers**: `pdfplumber` (PDF text extraction) and `python-docx` (Microsoft Word extraction)

---

## Project Structure
```
careersync/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── core/             # DB settings, security, JWT helper, configs
│   │   ├── models/           # SQLAlchemy DB Tables
│   │   ├── schemas/          # Pydantic schemas (validation)
│   │   ├── routers/          # Auth, Resumes, Jobs, Matching endpoints
│   │   ├── services/         # Document parsers & Google Gemini API integrations
│   │   └── main.py           # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Portal pages: Home, Login, Signup, Candidate, Recruiter
│   │   ├── components/       # UI Elements (GlassCard)
│   │   ├── context/          # JWT auth state manager & API fetch wrapper
│   │   └── types/            # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json          # Node dependencies
├── docker-compose.yml        # Multi-container orchestration
├── .env.example              # Variables template
├── seed_data.py              # Mock data database seeder
└── verify_api.py             # Built-in API verification script
```

---

## Configuration (`.env`)

Create a `.env` file at the root of the project (copy from `.env.example`):
```env
# Database connection string (PostgreSQL)
# Note: If database is left blank or cannot connect, the backend automatically 
# falls back to creating and using a local SQLite file (careersync.db) at the root!
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careersync

# Secret key used for JWT signing and verification
JWT_SECRET=super-secret-key-change-in-production-123456

# Google Gemini API Key
# Note: If no API key is specified, the matching engine uses mock analysis patterns 
# so you can fully explore the dashboard and candidate portal features immediately.
GEMINI_API_KEY=AIzaSy...

# Public API URL that frontend contacts
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Execution Methods

### Option 1: Docker Compose (Fully Automated)
If you have Docker and Docker Compose installed:
1. Define your environment variables in `.env` (make sure to set `GEMINI_API_KEY`).
2. Build and start the containers from the root directory:
   ```bash
   docker-compose up --build
   ```
3. The platform will be live at:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **Swagger Docs**: http://localhost:8000/docs

### Option 2: Local Manual Running (Developer Dev)

#### Step A: Run the Backend
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Step B: Populate Mock Seed Data
While the backend server is running in a virtual environment, populate it with mock data immediately:
```bash
# Navigate back to root and run the seed script
python seed_data.py
```
This inserts two default test accounts:
* **Candidate Account**: `candidate@example.com` / `password123`
* **Recruiter Account**: `recruiter@example.com` / `password123`
* Prepopulated with default jobs, candidate resume uploads, and parsed reports!

#### Step C: Run the Frontend
1. Open a separate terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard: http://localhost:3000

---

## Portals & Features

1. **Sign-up / Log-in Dashboard**: Choose role as either `candidate` or `recruiter`. Role-based routes are protected and redirect users automatically.
2. **Candidate Desk**: Parse PDF/DOCX resumes, paste target positions, trigger matching reviews, inspect recommendations and compliance issues, and view historical archive sheets.
3. **Recruiter Desk**: Add job definitions, bulk-upload multiple resumes, sort a score-ranked list of candidates, filter by thresholds, and export shortlists to `.csv`.
4. **API Verification**: Running `python verify_api.py` while the backend is running tests all main endpoints programmatically.
