export interface User {
  id: number;
  email: string;
  role: 'candidate' | 'recruiter';
  created_at: string;
}

export interface StructuredResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: string[];
  projects?: Array<{
    title: string;
    description: string;
  }>;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  parsed_json?: StructuredResume;
  uploaded_at: string;
}

export interface ResumeDetail extends Resume {
  raw_text: string;
}

export interface JobDescription {
  id: number;
  created_by_user_id: number;
  title: string;
  company?: string;
  raw_text: string;
  created_at: string;
}

export interface MatchReport {
  id: number;
  resume_id: number;
  jd_id: number;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_fit: string;
  recommendations: string[];
  ats_issues: string[];
  created_at: string;
  resume_filename?: string;
  candidate_name?: string;
}

export interface AuthState {
  token: string | null;
  user: {
    email: string;
    role: 'candidate' | 'recruiter';
  } | null;
}
