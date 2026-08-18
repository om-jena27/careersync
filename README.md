# CareerSync 🤖

<div align="center">

![CareerSync Banner](https://img.shields.io/badge/CareerSync-AI%20Resume%20Matcher-6366F1?style=for-the-badge&logo=robot&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

> **An AI-powered full-stack platform that parses resumes, matches them to job descriptions, calculates fit scores, and generates actionable improvement recommendations.**

</div>

---

## ✨ Features

- 📄 **Resume Parsing** — Supports PDF, Word (.docx), and plain text formats
- 🤖 **AI Matching Engine** — Uses Google Gemini to compare resumes against job descriptions
- 📊 **Fit Score Calculation** — Dynamic scoring with skill-gap analysis
- 💡 **Actionable Recommendations** — AI-generated resume improvement tips
- 🔐 **JWT Authentication** — Secure candidate and recruiter portals
- 🎨 **Glassmorphic UI** — Clean "document review desk" aesthetic with Next.js & Tailwind CSS v4
- 🐳 **Docker Support** — Full multi-container orchestration via Docker Compose
- 🗄️ **PostgreSQL + SQLite Fallback** — Production-ready DB with easy local dev

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React, TypeScript, Tailwind CSS v4 |
| **Backend** | Python 3, FastAPI, SQLAlchemy ORM |
| **Database** | PostgreSQL (prod) / SQLite (local dev) |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash` / `gemini-1.5-pro`) |
| **Parsers** | `pdfplumber` (PDF), `python-docx` (Word) |
| **Auth** | JWT (JSON Web Tokens) |
| **DevOps** | Docker, Docker Compose |

---

## 📁 Project Structure

```
careersync/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── core/             # DB settings, security, JWT, configs
│   │   ├── models/           # SQLAlchemy DB tables
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── routers/          # Auth, Resumes, Jobs, Matching endpoints
│   │   ├── services/         # Document parsers & Gemini AI integrations
│   │   └── main.py           # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Pages: Home, Login, Signup, Candidate, Recruiter
│   │   ├── components/       # UI elements (GlassCard, etc.)
│   │   ├── context/          # JWT auth state & API fetch wrapper
│   │   └── types/            # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Multi-container orchestration
├── .env.example              # Environment variables template
├── seed_data.py              # Mock data database seeder
└── verify_api.py             # Built-in API verification script
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or use SQLite for local dev)
- Docker & Docker Compose (optional)
- Google Gemini API key

### Option 1 — Quick Start (Windows)

```bash
# Clone the repo
git clone https://github.com/om-jena27/careersync.git
cd careersync

# Copy env file and fill in your keys
cp .env.example .env

# Run everything with one command
start.bat
```

### Option 2 — Docker Compose

```bash
git clone https://github.com/om-jena27/careersync.git
cd careersync
cp .env.example .env
# Edit .env with your credentials
docker-compose up --build
```

### Option 3 — Manual Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🔐 Configuration (`.env`)

Copy `.env.example` to `.env` and fill in:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/careersync

# JWT Secret
SECRET_KEY=your-super-secret-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Usage

| Portal | URL | Description |
|---|---|---|
| Frontend App | `http://localhost:3000` | Main web interface |
| API Docs | `http://localhost:8000/docs` | Swagger UI |
| API Redoc | `http://localhost:8000/redoc` | ReDoc interface |

1. **Sign up** as a Candidate or Recruiter
2. **Upload your resume** (PDF/Word/Text)
3. **Paste a job description**
4. Get your **AI-powered fit score + recommendations** instantly

---

## 🧪 Testing

```bash
# Verify API endpoints
python verify_api.py

# Test Groq model integration
python test_groq_match.py

# Test email feature
python test_email_feature.py

# Seed mock data
python seed_data.py
```

---

## 👨‍💻 Author

**Om Prakash Jena** — B.Tech CSE (AI & ML), Centurion University

[![GitHub](https://img.shields.io/badge/GitHub-om--jena27-181717?style=flat-square&logo=github)](https://github.com/om-jena27)

---

## 📄 License

This project is open-source. Feel free to explore and learn from it!
