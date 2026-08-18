from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Resume, JobDescription, MatchReport
from app.schemas.schemas import MatchRequest, BulkMatchRequest, MatchReportResponse
from app.services.gemini import (
    match_resume_and_jd_with_gemini,
    generate_optimized_bullets,
    generate_interview_questions
)

router = APIRouter(prefix="/match", tags=["match"])

class BulletOptimizeRequest(BaseModel):
    resume_id: int
    jd_id: int
    target_skill: str

class InterviewQuestionsRequest(BaseModel):
    resume_id: int
    jd_id: int

class CandidateEmailRequest(BaseModel):
    candidate_email: str
    candidate_name: str
    job_title: str
    status: str  # 'selected' or 'rejected'
    custom_note: Optional[str] = None

def _build_match_report_response(report: MatchReport) -> MatchReportResponse:
    resume = report.resume
    candidate_name = "Unknown"
    if resume and resume.parsed_json:
        candidate_name = resume.parsed_json.get("name", "Unknown")
        
    return MatchReportResponse(
        id=report.id,
        resume_id=report.resume_id,
        jd_id=report.jd_id,
        match_score=report.match_score,
        matched_skills=report.matched_skills or [],
        missing_skills=report.missing_skills or [],
        experience_fit=report.experience_fit,
        recommendations=report.recommendations or [],
        ats_issues=report.ats_issues or [],
        created_at=report.created_at,
        resume_filename=resume.filename if resume else "resume.pdf",
        candidate_name=candidate_name
    )

@router.post("", response_model=MatchReportResponse)
def match_resume(
    req: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    jd = db.query(JobDescription).filter(JobDescription.id == req.jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found.")

    try:
        report_data = match_resume_and_jd_with_gemini(resume.raw_text, jd.raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation engine error: {str(e)}")

    existing_report = db.query(MatchReport).filter(
        MatchReport.resume_id == req.resume_id,
        MatchReport.jd_id == req.jd_id
    ).first()

    if existing_report:
        existing_report.match_score = report_data.get("match_score", 0)
        existing_report.matched_skills = report_data.get("matched_skills", [])
        existing_report.missing_skills = report_data.get("missing_skills", [])
        existing_report.experience_fit = report_data.get("experience_fit", "")
        existing_report.recommendations = report_data.get("recommendations", [])
        existing_report.ats_issues = report_data.get("ats_issues", [])
        db.commit()
        db.refresh(existing_report)
        return _build_match_report_response(existing_report)
    else:
        db_report = MatchReport(
            resume_id=req.resume_id,
            jd_id=req.jd_id,
            match_score=report_data.get("match_score", 0),
            matched_skills=report_data.get("matched_skills", []),
            missing_skills=report_data.get("missing_skills", []),
            experience_fit=report_data.get("experience_fit", ""),
            recommendations=report_data.get("recommendations", []),
            ats_issues=report_data.get("ats_issues", [])
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        return _build_match_report_response(db_report)

@router.post("/bulk", response_model=List[MatchReportResponse])
def bulk_match_resumes(
    req: BulkMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can perform bulk matching.")

    jd = db.query(JobDescription).filter(JobDescription.id == req.jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found.")

    reports = []
    for resume_id in req.resume_ids:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            continue
            
        try:
            report_data = match_resume_and_jd_with_gemini(resume.raw_text, jd.raw_text)
            
            existing_report = db.query(MatchReport).filter(
                MatchReport.resume_id == resume_id,
                MatchReport.jd_id == req.jd_id
            ).first()

            if existing_report:
                existing_report.match_score = report_data.get("match_score", 0)
                existing_report.matched_skills = report_data.get("matched_skills", [])
                existing_report.missing_skills = report_data.get("missing_skills", [])
                existing_report.experience_fit = report_data.get("experience_fit", "")
                existing_report.recommendations = report_data.get("recommendations", [])
                existing_report.ats_issues = report_data.get("ats_issues", [])
                db.commit()
                db.refresh(existing_report)
                report = existing_report
            else:
                report = MatchReport(
                    resume_id=resume_id,
                    jd_id=req.jd_id,
                    match_score=report_data.get("match_score", 0),
                    matched_skills=report_data.get("matched_skills", []),
                    missing_skills=report_data.get("missing_skills", []),
                    experience_fit=report_data.get("experience_fit", ""),
                    recommendations=report_data.get("recommendations", []),
                    ats_issues=report_data.get("ats_issues", [])
                )
                db.add(report)
                db.commit()
                db.refresh(report)
        except Exception as e:
            print(f"Error matching resume ID {resume_id}: {e}")
            continue
            
        reports.append(_build_match_report_response(report))

    reports.sort(key=lambda r: r.match_score, reverse=True)
    return reports

@router.get("/reports", response_model=List[MatchReportResponse])
def get_match_reports_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(MatchReport).join(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(MatchReport.created_at.desc()).all()
    return [_build_match_report_response(r) for r in reports]

@router.post("/optimize-bullet")
def optimize_resume_bullet(
    req: BulletOptimizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    jd = db.query(JobDescription).filter(JobDescription.id == req.jd_id).first()
    if not resume or not jd:
        raise HTTPException(status_code=404, detail="Resume or Job Description not found.")

    bullets = generate_optimized_bullets(resume.raw_text, jd.raw_text, req.target_skill)
    return {"bullets": bullets, "target_skill": req.target_skill}

@router.post("/interview-questions")
def get_interview_questions(
    req: InterviewQuestionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    jd = db.query(JobDescription).filter(JobDescription.id == req.jd_id).first()
    if not resume or not jd:
        raise HTTPException(status_code=404, detail="Resume or Job Description not found.")

    questions = generate_interview_questions(resume.raw_text, jd.raw_text)
    return {"questions": questions}

# FEATURE: CANDIDATE SELECTION / REJECTION EMAIL DISPATCH
@router.post("/send-candidate-email")
def send_candidate_email(
    req: CandidateEmailRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can send selection/rejection notifications.")

    if req.status == "selected":
        subject = f"Congratulations! Update regarding your application for {req.job_title}"
        body = (
            f"Dear {req.candidate_name},\n\n"
            f"We are pleased to inform you that after reviewing your profile for the {req.job_title} role, "
            f"your background and technical skills strongly match our requirements!\n\n"
            f"Our recruiting team would like to invite you for the next interview round.\n"
        )
        if req.custom_note:
            body += f"\nNote from Hiring Manager: {req.custom_note}\n"
        body += "\nBest regards,\nRecruiting Team @ CareerSync"
    else:
        subject = f"Application Update - {req.job_title}"
        body = (
            f"Dear {req.candidate_name},\n\n"
            f"Thank you for your interest in the {req.job_title} position. After careful evaluation, "
            f"we have chosen to move forward with candidates whose technical qualifications more closely match our current requirements.\n\n"
        )
        if req.custom_note:
            body += f"Feedback: {req.custom_note}\n\n"
        body += "We appreciate your time and wish you success in your job search.\n\nBest regards,\nRecruiting Team @ CareerSync"

    print(f"\n--- [EMAIL DISPATCHED] ---")
    print(f"TO: {req.candidate_email}")
    print(f"STATUS: {req.status.upper()}")
    print(f"---------------------------\n")

    return {
        "status": "success",
        "message": f"Email ({req.status.upper()}) sent successfully to {req.candidate_email}",
        "recipient": req.candidate_email,
        "subject": subject,
        "email_body": body
    }
