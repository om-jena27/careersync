import os
import sys

# Add backend to python path to allow importing app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import User, Resume, JobDescription, MatchReport

def seed():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    # 1. Check if user already seeded
    existing_user = db.query(User).filter(User.email == "candidate@example.com").first()
    if existing_user:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding Users...")
    cand_pw = hash_password("password123")
    rec_pw = hash_password("password123")
    
    candidate = User(
        email="candidate@example.com",
        password_hash=cand_pw,
        role="candidate"
    )
    recruiter = User(
        email="recruiter@example.com",
        password_hash=rec_pw,
        role="recruiter"
    )
    
    db.add_all([candidate, recruiter])
    db.commit()
    db.refresh(candidate)
    db.refresh(recruiter)
    
    print(f"Created Candidate ID: {candidate.id}")
    print(f"Created Recruiter ID: {recruiter.id}")

    print("Seeding Resumes...")
    # Seed a backend-focused resume
    raw_text_1 = """
    JOHN DOE
    john.doe@example.com | +1 (555) 019-2834 | San Francisco, CA
    
    PROFESSIONAL SUMMARY
    Backend Software Engineer with 4 years of experience building high-throughput REST APIs and managing database architectures.
    
    SKILLS
    Programming: Python, JavaScript, SQL
    Backend Frameworks: FastAPI, Flask, Django
    Databases: PostgreSQL, Redis, SQLite
    DevOps & Tools: Docker, Git, Linux, GitHub Actions
    
    WORK EXPERIENCE
    Software Engineer II | TechCorp | Jan 2023 - Present
    - Developed high-performance backend microservices using FastAPI and python-jose for JWT auth.
    - Optimized database queries in PostgreSQL, reducing query latency by 35%.
    - Containerized development workflows using Docker Compose, decreasing onboarding time.
    
    Junior Developer | DevStudio | Jun 2021 - Dec 2022
    - Maintained backend systems written in Django and PostgreSQL.
    - Wrote clean unit tests achieving 90% code coverage.
    
    EDUCATION
    B.S. Computer Science | State University | 2021
    """
    
    parsed_json_1 = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 019-2834",
        "location": "San Francisco, CA",
        "summary": "Backend Software Engineer with 4 years of experience building high-throughput REST APIs and managing database architectures.",
        "skills": ["Python", "FastAPI", "Flask", "Django", "SQL", "PostgreSQL", "Redis", "Docker", "Git"],
        "experience": [
            {
                "role": "Software Engineer II",
                "company": "TechCorp",
                "duration": "Jan 2023 - Present",
                "description": "Developed high-performance backend microservices using FastAPI. Optimized PostgreSQL queries."
            },
            {
                "role": "Junior Developer",
                "company": "DevStudio",
                "duration": "Jun 2021 - Dec 2022",
                "description": "Maintained backend systems written in Django and PostgreSQL."
            }
        ],
        "education": [
            {
                "degree": "B.S. Computer Science",
                "institution": "State University",
                "year": "2021"
            }
        ],
        "certifications": [],
        "projects": []
    }
    
    resume_1 = Resume(
        user_id=candidate.id,
        filename="John_Doe_Backend_Resume.pdf",
        raw_text=raw_text_1,
        parsed_json=parsed_json_1
    )

    # Seed a frontend-focused resume (uploaded by recruiter for bulk-match testing)
    raw_text_2 = """
    JANE SMITH
    jane.smith@example.com | Seattle, WA
    
    SUMMARY
    Senior Frontend Engineer specializing in building responsive React and Next.js applications with Tailwind CSS.
    
    SKILLS
    Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS, TypeScript, JavaScript
    State & API: Redux, Axios, REST APIs
    Tools: Git, Webpack, Vercel
    
    EXPERIENCE
    Frontend Developer | UI Creators | Mar 2022 - Present
    - Architected Next.js App Router applications with strict SEO practices and Tailwind UI blocks.
    - Integrated auth microservices and client-side storage management.
    """
    
    parsed_json_2 = {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "Unknown",
        "location": "Seattle, WA",
        "summary": "Senior Frontend Engineer specializing in building responsive React and Next.js applications with Tailwind CSS.",
        "skills": ["React", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "TypeScript", "JavaScript", "Git"],
        "experience": [
            {
                "role": "Frontend Developer",
                "company": "UI Creators",
                "duration": "Mar 2022 - Present",
                "description": "Architected Next.js App Router applications with strict SEO practices and Tailwind UI blocks."
            }
        ],
        "education": [],
        "certifications": [],
        "projects": []
    }
    
    resume_2 = Resume(
        user_id=recruiter.id, # Uploaded by recruiter
        filename="Jane_Smith_Frontend.docx",
        raw_text=raw_text_2,
        parsed_json=parsed_json_2
    )
    
    db.add_all([resume_1, resume_2])
    db.commit()
    db.refresh(resume_1)
    db.refresh(resume_2)

    print("Seeding Job Descriptions...")
    jd_1 = JobDescription(
        created_by_user_id=recruiter.id,
        title="Senior Python Backend Developer",
        company="GlobalTech Inc",
        raw_text="""
        Position: Senior Python Backend Developer
        We are seeking a developer with extensive experience building API microservices in Python.
        Requirements:
        - Strong proficiency in Python and FastAPI (or Django/Flask)
        - Proficient in SQL database optimizations (PostgreSQL/MySQL)
        - Knowledge of containerization using Docker and Docker Compose
        - Experience deploying services to AWS or GCP (Kubernetes)
        - Strong version control using Git
        """
    )
    
    jd_2 = JobDescription(
        created_by_user_id=recruiter.id,
        title="Full Stack Software Engineer",
        company="Innovate Fast",
        raw_text="""
        Position: Full Stack Software Engineer
        We are looking for a generalist to bridge frontend and backend.
        Requirements:
        - React, TypeScript, and CSS/Tailwind
        - Python, FastAPI, and relational databases (SQL)
        - Git and Docker knowledge
        """
    )
    
    db.add_all([jd_1, jd_2])
    db.commit()
    db.refresh(jd_1)
    db.refresh(jd_2)

    print("Seeding Match Reports...")
    # John Doe against Senior Python Backend
    report_1 = MatchReport(
        resume_id=resume_1.id,
        jd_id=jd_1.id,
        match_score=85,
        matched_skills=["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "Git"],
        missing_skills=["AWS", "GCP", "Kubernetes", "Microservices architecture experience"],
        experience_fit="The candidate possesses 4 years of backend experience, which aligns perfectly with a senior backend developer profile, although they have not listed large-scale Kubernetes orchestrations.",
        recommendations=[
            "List any experience or tutorials completed on Kubernetes to bridge the infrastructure gap.",
            "Specifically highlight experience deploying FastAPI to cloud services like AWS EC2.",
            "Incorporate metrics on database speedups in the resume header summary."
        ],
        ats_issues=[
            "The resume lacks a distinct 'Projects' header, which some older scanners look for specifically.",
            "Do not include phone number labels inside the resume header."
        ]
    )

    # Jane Smith against Full Stack
    report_2 = MatchReport(
        resume_id=resume_2.id,
        jd_id=jd_2.id,
        match_score=68,
        matched_skills=["React", "Tailwind CSS", "TypeScript", "JavaScript", "Git"],
        missing_skills=["Python", "FastAPI", "Docker", "Relational Databases"],
        experience_fit="The candidate is a strong senior frontend engineer, but shows no current backend experience with Python or database layers, making them a partial fit for this Full Stack role.",
        recommendations=[
            "Add personal projects built with Python and FastAPI to show active learning in backend technologies.",
            "Include basic SQLite or relational database structures in your portfolios.",
            "Highlight any collaborations with backend engineers to integrate APIs."
        ],
        ats_issues=[]
    )

    db.add_all([report_1, report_2])
    db.commit()
    print("Seed complete! All tables populated.")
    db.close()

if __name__ == "__main__":
    seed()
