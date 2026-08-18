from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, JobDescription
from app.schemas.schemas import JobDescriptionCreate, JobDescriptionResponse

router = APIRouter(prefix="/job-descriptions", tags=["job-descriptions"])

@router.post("", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_job_description(
    jd_in: JobDescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_jd = JobDescription(
        created_by_user_id=current_user.id,
        title=jd_in.title,
        company=jd_in.company,
        raw_text=jd_in.raw_text
    )
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    return db_jd

@router.get("", response_model=List[JobDescriptionResponse])
def list_job_descriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Recruiters and candidates can see all job descriptions to match against, 
    # but let's query either all or user's specific depending on preference.
    # To keep it simple, we retrieve all job descriptions so they can be reused across users.
    jds = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    return jds
