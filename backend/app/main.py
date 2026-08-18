from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth, resumes, jobs, match

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerSync API",
    description="AI-Powered Resume Parsing and Matching Engine API",
    version="1.0.0"
)

# Set up CORS middleware for Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to specific origins (e.g. http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(jobs.router)
app.include_router(match.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the CareerSync AI Resume-to-Job Matching API!"}
