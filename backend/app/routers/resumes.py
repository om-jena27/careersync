from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Resume
from app.schemas.schemas import ResumeResponse, ResumeDetailResponse
from app.services.parser import parse_file
from app.services.gemini import parse_resume_with_gemini

router = APIRouter(prefix="/resumes", tags=["resumes"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file type extension
    filename = file.filename or ""
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt", "md"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: .{ext}. Supported formats: PDF, DOCX, TXT."
        )

    # Validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 5MB."
        )

    # Parse file contents to raw text
    try:
        raw_text = parse_file(filename, content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse resume file text: {str(e)}"
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parsed resume text is empty. Please ensure the file has readable text."
        )

    # Parse with LLM to get structured JSON
    try:
        parsed_json = parse_resume_with_gemini(raw_text)
    except Exception as e:
        parsed_json = {
            "name": "Unknown",
            "email": current_user.email,
            "skills": [],
            "experience": []
        }

    # Store in database
    db_resume = Resume(
        user_id=current_user.id,
        filename=filename,
        raw_text=raw_text,
        parsed_json=parsed_json
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Recruiters see ALL uploaded resumes (from both candidates and recruiters)
    if current_user.role == "recruiter":
        return db.query(Resume).order_by(Resume.uploaded_at.desc()).all()
        
    # Candidates only see their own resumes
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
    
    # Restrict candidate from accessing someone else's resumes
    if current_user.role == "candidate" and resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )
        
    return resume
