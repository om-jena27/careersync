from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserSignUp(BaseModel):
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(candidate|recruiter)$")

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str

# Resume Schemas
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    parsed_json: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ResumeDetailResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    raw_text: str
    parsed_json: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Job Description Schemas
class JobDescriptionCreate(BaseModel):
    title: str = Field(..., min_length=1)
    company: Optional[str] = None
    raw_text: str = Field(..., min_length=1)

class JobDescriptionResponse(BaseModel):
    id: int
    created_by_user_id: int
    title: str
    company: Optional[str] = None
    raw_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# Match Schemas
class MatchRequest(BaseModel):
    resume_id: int
    jd_id: int

class BulkMatchRequest(BaseModel):
    jd_id: int
    resume_ids: List[int]

class MatchReportResponse(BaseModel):
    id: int
    resume_id: int
    jd_id: int
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_fit: str
    recommendations: List[str]
    ats_issues: List[str]
    created_at: datetime
    resume_filename: Optional[str] = None
    candidate_name: Optional[str] = None

    class Config:
        from_attributes = True
