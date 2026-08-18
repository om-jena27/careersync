'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Resume, JobDescription, MatchReport } from '@/types';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  User,
  LogOut,
  Upload,
  ChevronDown,
  Download,
  FileCode,
  HelpCircle,
  Check,
  Copy,
  MailCheck,
  XCircle,
  CheckCircle2,
  Send
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user, loading: authLoading, apiFetch, logout } = useAuth();
  const router = useRouter();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jds' | 'candidates' | 'reports' | 'profile'>('dashboard');

  // Input State
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<number | ''>('');
  const [jobTitle, setJobTitle] = useState('Backend Developer');
  const [company, setCompany] = useState('TechSolutions Inc.');
  const [jobText, setJobText] = useState(
    'We are looking for a Backend Developer with experience in Python, Flask, PostgreSQL, REST APIs, Git and Docker. The candidate should have strong problem solving skills and experience building scalable web applications.'
  );

  // Files to upload
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [rankedReports, setRankedReports] = useState<MatchReport[]>([]);

  // AI Interview Questions Drawer State
  const [selectedCandidateReport, setSelectedCandidateReport] = useState<MatchReport | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [copiedQIdx, setCopiedQIdx] = useState<number | null>(null);

  // FEATURE: Email Candidate Modal State
  const [emailModalCandidate, setEmailModalCandidate] = useState<MatchReport | null>(null);
  const [emailDecisionStatus, setEmailDecisionStatus] = useState<'selected' | 'rejected'>('selected');
  const [customEmailNote, setCustomEmailNote] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Loading & Feedback
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter State
  const [minScore, setMinScore] = useState<number>(70);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?role=recruiter');
      } else if (user.role !== 'recruiter') {
        router.push('/candidate');
      } else {
        loadJobDescriptions();
      }
    }
  }, [user, authLoading]);

  const loadJobDescriptions = async () => {
    try {
      setError(null);
      const data = await apiFetch('/job-descriptions');
      setJobDescriptions(data);
      if (data.length > 0) {
        setSelectedJdId(data[0].id);
        setJobTitle(data[0].title);
        setCompany(data[0].company || '');
        setJobText(data[0].raw_text);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job descriptions.');
    }
  };

  const handleSaveJd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobText) return;

    setError(null);
    try {
      const createdJd = await apiFetch('/job-descriptions', {
        method: 'POST',
        body: JSON.stringify({
          title: jobTitle,
          company: company || undefined,
          raw_text: jobText
        })
      });
      setJobDescriptions((prev) => [createdJd, ...prev]);
      setSelectedJdId(createdJd.id);
      setSuccessMsg('Job description saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save job description.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const selected = Array.from(e.dataTransfer.files);
      setFilesToUpload((prev) => [...prev, ...selected]);
    }
  };

  const handleAnalyzeCandidates = async () => {
    let currentJdId = selectedJdId;

    if (!currentJdId) {
      try {
        const createdJd = await apiFetch('/job-descriptions', {
          method: 'POST',
          body: JSON.stringify({
            title: jobTitle || 'Target Position',
            company: company || undefined,
            raw_text: jobText
          })
        });
        setJobDescriptions((prev) => [createdJd, ...prev]);
        currentJdId = createdJd.id;
        setSelectedJdId(createdJd.id);
      } catch (err: any) {
        setError('Please save a valid job description first.');
        return;
      }
    }

    setIsUploading(true);
    setIsMatching(true);
    setError(null);

    try {
      const uploadedIds: number[] = [];

      if (filesToUpload.length > 0) {
        for (const f of filesToUpload) {
          const formData = new FormData();
          formData.append('file', f);
          try {
            const res = await apiFetch('/resumes', { method: 'POST', body: formData });
            uploadedIds.push(res.id);
          } catch (err) {
            console.error('File upload error:', err);
          }
        }
      }

      if (uploadedIds.length === 0) {
        const allResumes: Resume[] = await apiFetch('/resumes');
        if (allResumes.length === 0) {
          setError('No resumes found. Please upload at least one candidate resume.');
          setIsUploading(false);
          setIsMatching(false);
          return;
        }
        allResumes.forEach(r => uploadedIds.push(r.id));
      }

      const matchedReports: MatchReport[] = await apiFetch('/match/bulk', {
        method: 'POST',
        body: JSON.stringify({
          jd_id: Number(currentJdId),
          resume_ids: uploadedIds
        })
      });

      setRankedReports(matchedReports);
      setSuccessMsg(`Analyzed ${matchedReports.length} candidate(s) successfully!`);
    } catch (err: any) {
      setError(err.message || 'Bulk matching error.');
    } finally {
      setIsUploading(false);
      setIsMatching(false);
    }
  };

  const handleGenerateInterviewQuestions = async (report: MatchReport) => {
    setSelectedCandidateReport(report);
    setIsGeneratingQuestions(true);
    setInterviewQuestions([]);

    try {
      const res = await apiFetch('/match/interview-questions', {
        method: 'POST',
        body: JSON.stringify({
          resume_id: report.resume_id,
          jd_id: report.jd_id
        })
      });
      setInterviewQuestions(res.questions || []);
    } catch (err) {
      console.error('Interview questions error:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // FEATURE: SEND SELECTION / REJECTION EMAIL TO CANDIDATE
  const handleSendEmailSubmit = async () => {
    if (!emailModalCandidate) return;

    const candidateName = emailModalCandidate.candidate_name || 'Candidate';
    const candidateEmail = emailModalCandidate.resume_filename?.includes('john') ? 'john_doe@gmail.com' : candidateName.toLowerCase().replace(/\s+/g, '.') + '@gmail.com';

    setIsSendingEmail(true);
    setError(null);
    try {
      const res = await apiFetch('/match/send-candidate-email', {
        method: 'POST',
        body: JSON.stringify({
          candidate_email: candidateEmail,
          candidate_name: candidateName,
          job_title: jobTitle,
          status: emailDecisionStatus,
          custom_note: customEmailNote || undefined
        })
      });

      setSuccessMsg(`Email notification (${emailDecisionStatus.toUpperCase()}) dispatched to ${candidateEmail}!`);
      setEmailModalCandidate(null);
      setCustomEmailNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch email notification.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExportCSV = () => {
    if (rankedReports.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,Rank,Candidate Name,Match Score %,Matched Skills,Missing Skills\n';
    filteredReports.forEach((report, index) => {
      const name = report.candidate_name || 'Candidate ' + (index + 1);
      const score = report.match_score;
      const matched = report.matched_skills.join('; ');
      const missing = report.missing_skills.join('; ');
      csvContent += `${index + 1},"${name}",${score},"${matched}","${missing}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shortlist_${jobTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQIdx(idx);
    setTimeout(() => setCopiedQIdx(null), 2000);
  };

  const filteredReports = rankedReports.filter((r) => r.match_score >= minScore);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-500 text-sm">
        Authorizing Recruiter Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 flex font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">CareerSync</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('jds')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'jds'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Job Descriptions
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'candidates'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Candidates
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reports
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </nav>
        </div>

        {/* Sidebar Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-200"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with User Info & Logout Button */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
              Recruiter Portal
            </span>
          </div>

          {/* User Profile & Top Bar Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-300">
                RC
              </div>
              <span className="text-sm font-medium text-slate-700">{user.email}</span>
            </div>

            {/* TOP HEADER LOGOUT BUTTON */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="p-8 max-w-6xl w-full mx-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs font-bold">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold">✕</button>
            </div>
          )}

          {/* DASHBOARD INPUT FORM */}
          {activeTab === 'dashboard' && rankedReports.length === 0 && (
            <div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-4">1. Create / Select Job Description</h3>

                <form onSubmit={handleSaveJd} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Backend Developer"
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Company (Optional)</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. TechSolutions Inc."
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Job Description</label>
                    <textarea
                      rows={4}
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm transition-all"
                  >
                    Save Job Description
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-4">2. Upload Candidate Resumes</h3>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('bulk-file-input')?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <input
                    id="bulk-file-input"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFilesToUpload(prev => [...prev, ...Array.from(e.target.files || [])]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 mb-1">
                    Drag & drop multiple files here or <span className="text-teal-600 underline">click to browse</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">PDF, DOCX, TXT (Max 5MB each)</span>
                </div>

                {filesToUpload.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filesToUpload.map((f, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs">
                        <FileCode className="w-3.5 h-3.5 text-teal-600" />
                        <span className="font-medium text-slate-700 truncate max-w-[140px]">{f.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilesToUpload(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-400 hover:text-red-500 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyzeCandidates}
                disabled={isMatching || isUploading}
                className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-base shadow-sm hover:shadow transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isMatching ? 'Evaluating & Shortlisting Candidates...' : 'Analyze Candidates'}
              </button>
            </div>
          )}

          {/* MATCHED CANDIDATES RANKED TABLE VIEW */}
          {(activeTab === 'dashboard' || activeTab === 'candidates') && rankedReports.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">Matched Candidates</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranked results against: <span className="font-semibold text-slate-800">{jobTitle} {company ? `at ${company}` : ''}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs">
                    <span className="text-slate-500">Min Score:</span>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value={50}>50%</option>
                      <option value={60}>60%</option>
                      <option value={70}>70%</option>
                      <option value={80}>80%</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-500" /> Export CSV
                  </button>

                  <button
                    onClick={() => setRankedReports([])}
                    className="px-3 py-2 text-xs text-teal-600 font-medium hover:underline"
                  >
                    + New Search
                  </button>
                </div>
              </div>

              {/* FEATURE 2: EMAIL DISPATCH MODAL (SELECTION / REJECTION) */}
              {emailModalCandidate && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <MailCheck className="w-5 h-5 text-teal-600" />
                        <h3 className="font-bold text-slate-900 text-base">Send Candidate Email</h3>
                      </div>
                      <button onClick={() => setEmailModalCandidate(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Candidate</label>
                        <div className="p-2.5 bg-slate-50 rounded-xl font-semibold text-slate-800">
                          {emailModalCandidate.candidate_name || 'Candidate'} ({emailModalCandidate.resume_filename?.includes('john') ? 'john_doe@gmail.com' : 'candidate@example.com'})
                        </div>
                      </div>

                      {/* Decision Selection Tabs */}
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Select Decision Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEmailDecisionStatus('selected')}
                            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                              emailDecisionStatus === 'selected'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-100'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Select / Invite Candidate
                          </button>

                          <button
                            type="button"
                            onClick={() => setEmailDecisionStatus('rejected')}
                            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                              emailDecisionStatus === 'rejected'
                                ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-100'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <XCircle className="w-4 h-4 text-rose-500" />
                            Reject Candidate
                          </button>
                        </div>
                      </div>

                      {/* Optional Note */}
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Custom Note / Feedback (Optional)</label>
                        <textarea
                          rows={3}
                          value={customEmailNote}
                          onChange={(e) => setCustomEmailNote(e.target.value)}
                          placeholder={emailDecisionStatus === 'selected' ? "e.g. We loved your FastAPI background. Let's schedule an interview this Thursday!" : "e.g. We required 5+ years of production Next.js experience."}
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setEmailModalCandidate(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmailSubmit}
                        disabled={isSendingEmail}
                        className={`px-5 py-2 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 shadow-sm ${
                          emailDecisionStatus === 'selected' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSendingEmail ? 'Dispatching...' : `Send ${emailDecisionStatus === 'selected' ? 'Selection' : 'Rejection'} Email`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Interview Questions Drawer */}
              {selectedCandidateReport && (
                <div className="mb-6 bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border-2 border-teal-200 rounded-2xl p-6 shadow-md relative">
                  <button
                    onClick={() => setSelectedCandidateReport(null)}
                    className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ✕ Close
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        AI Tailored Interview Screening Questions: {selectedCandidateReport.candidate_name || 'Candidate'}
                      </h3>
                      <p className="text-xs text-teal-700">Custom technical questions targeting missing skills & gaps:</p>
                    </div>
                  </div>

                  {isGeneratingQuestions ? (
                    <div className="py-6 text-center text-xs font-mono text-teal-700 animate-pulse">
                      Analyzing candidate missing skills & generating interview questions...
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {interviewQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-semibold uppercase tracking-wider">
                              {q.focus}
                            </span>
                            <button
                              onClick={() => copyQToClipboard(q.question, idx)}
                              className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-medium"
                            >
                              {copiedQIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedQIdx === idx ? 'Copied' : 'Copy Question'}
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-800">"{q.question}"</p>
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <strong>Evaluation Criteria:</strong> {q.eval_criteria}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ranked Candidates Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-6">RANK</th>
                        <th className="py-3.5 px-6">CANDIDATE</th>
                        <th className="py-3.5 px-6">MATCH SCORE</th>
                        <th className="py-3.5 px-6">TOP MATCHED SKILLS</th>
                        <th className="py-3.5 px-6">TOP MISSING SKILLS</th>
                        <th className="py-3.5 px-6 text-center">EMAIL DECISION</th>
                        <th className="py-3.5 px-6 text-center">AI TOOLKIT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReports.map((report, index) => {
                        const rankNum = index + 1;
                        const candidateName = report.candidate_name || (index === 0 ? 'John Doe' : index === 1 ? 'Anita Sharma' : index === 2 ? 'Rahul Verma' : index === 3 ? 'Priya Singh' : 'Amit Patel');
                        const candidateEmail = report.resume_filename?.includes('john') ? 'john_doe@gmail.com' : candidateName.toLowerCase().replace(/\s+/g, '.') + '@gmail.com';

                        return (
                          <tr key={report.id} className="hover:bg-slate-50/60 transition-all">
                            <td className="py-4 px-6 font-semibold">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                rankNum === 1 ? 'bg-amber-400 shadow-sm' : rankNum === 2 ? 'bg-slate-400' : rankNum === 3 ? 'bg-amber-600' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {rankNum}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-300">
                                  {candidateName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800 text-xs">{candidateName}</div>
                                  <div className="text-[11px] text-slate-400 font-sans">{candidateEmail}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3 w-32">
                                <span className="font-bold font-mono text-xs text-slate-800">{report.match_score}%</span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      report.match_score >= 80 ? 'bg-emerald-500' : report.match_score >= 60 ? 'bg-teal-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${report.match_score}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="text-xs text-slate-700 max-w-[160px] truncate">
                                {report.matched_skills.slice(0, 4).join(', ')}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="text-xs text-slate-500 max-w-[140px] truncate">
                                {report.missing_skills.slice(0, 3).join(', ')}
                              </div>
                            </td>

                            {/* FEATURE: CANDIDATE SELECTION / REJECTION EMAIL DISPATCH BUTTONS */}
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEmailModalCandidate(report);
                                    setEmailDecisionStatus('selected');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200 transition-all flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Select
                                </button>

                                <button
                                  onClick={() => {
                                    setEmailModalCandidate(report);
                                    setEmailDecisionStatus('rejected');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-all flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3 text-rose-500" />
                                  Reject
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleGenerateInterviewQuestions(report)}
                                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium border border-teal-100 flex items-center gap-1.5 transition-all shadow-sm mx-auto"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                                Interview Qs
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400">
                  Showing 1 to {filteredReports.length} of {rankedReports.length} candidates
                </div>
              </div>
            </div>
          )}

          {/* JOB DESCRIPTIONS TAB */}
          {activeTab === 'jds' && (
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">Saved Job Descriptions</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {jobDescriptions.map((j) => (
                  <div key={j.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 text-sm">{j.title}</h4>
                    <p className="text-xs text-teal-600 font-medium mb-2">{j.company || 'Direct Hiring'}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{j.raw_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-xl mx-auto">
              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">Recruiter Profile</h1>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800">{user.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Account Role</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 capitalize">{user.role}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
