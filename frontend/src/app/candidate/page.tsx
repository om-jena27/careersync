'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Resume, JobDescription, MatchReport } from '@/types';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  CheckSquare,
  User,
  LogOut,
  Upload,
  Lock,
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  ChevronDown,
  FileCode,
  Star,
  Wand2,
  Copy,
  Check
} from 'lucide-react';

export default function CandidateDashboard() {
  const { user, loading: authLoading, apiFetch, logout } = useAuth();
  const router = useRouter();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resumes' | 'reviews' | 'profile'>('dashboard');

  // Input State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<number | ''>('');
  const [jdText, setJdText] = useState('');

  // Results State
  const [activeReport, setActiveReport] = useState<MatchReport | null>(null);
  const [history, setHistory] = useState<MatchReport[]>([]);

  // AI Bullet Optimizer Modal State
  const [selectedMissingSkill, setSelectedMissingSkill] = useState<string | null>(null);
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Resume Inspector
  const [inspectResume, setInspectResume] = useState<Resume | null>(null);

  // Loading & Feedback
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?role=candidate');
      } else if (user.role !== 'candidate') {
        router.push('/recruiter');
      } else {
        loadInitialData();
      }
    }
  }, [user, authLoading]);

  const loadInitialData = async () => {
    try {
      setError(null);
      const [resumesData, jdsData, historyData] = await Promise.all([
        apiFetch('/resumes'),
        apiFetch('/job-descriptions'),
        apiFetch('/match/reports')
      ]);
      setResumes(resumesData);
      setJobDescriptions(jdsData);
      setHistory(historyData);

      if (resumesData.length > 0) setSelectedResumeId(resumesData[0].id);
      if (jdsData.length > 0) {
        setSelectedJdId(jdsData[0].id);
        setJdText(jdsData[0].raw_text || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load initial data.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && resumes.length === 0) {
      setError('Please upload a resume file first.');
      return;
    }
    if (!jdText.trim()) {
      setError('Please enter or select a job description.');
      return;
    }

    setIsMatching(true);
    setError(null);

    try {
      let targetResumeId: number;
      if (file) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const uploaded = await apiFetch('/resumes', { method: 'POST', body: formData });
        setResumes((prev) => [uploaded, ...prev]);
        targetResumeId = uploaded.id;
        setSelectedResumeId(uploaded.id);
        setIsUploading(false);
      } else {
        targetResumeId = selectedResumeId || resumes[0].id;
      }

      let targetJdId = selectedJdId;
      if (!targetJdId || (jobDescriptions.find((j) => j.id === selectedJdId)?.raw_text !== jdText)) {
        const createdJd = await apiFetch('/job-descriptions', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Custom Target Position',
            company: 'Target Role',
            raw_text: jdText
          })
        });
        setJobDescriptions((prev) => [createdJd, ...prev]);
        targetJdId = createdJd.id;
        setSelectedJdId(createdJd.id);
      }

      const report = await apiFetch('/match', {
        method: 'POST',
        body: JSON.stringify({
          resume_id: Number(targetResumeId),
          jd_id: Number(targetJdId)
        })
      });

      setActiveReport(report);
      setHistory((prev) => [report, ...prev]);
      setActiveTab('reviews');
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment report.');
    } finally {
      setIsMatching(false);
      setIsUploading(false);
    }
  };

  const handleOptimizeBulletForSkill = async (skill: string) => {
    if (!activeReport) return;
    setSelectedMissingSkill(skill);
    setIsGeneratingBullets(true);
    setGeneratedBullets([]);

    try {
      const res = await apiFetch('/match/optimize-bullet', {
        method: 'POST',
        body: JSON.stringify({
          resume_id: activeReport.resume_id,
          jd_id: activeReport.jd_id,
          target_skill: skill
        })
      });
      setGeneratedBullets(res.bullets || []);
    } catch (err) {
      console.error('Bullet optimization error:', err);
    } finally {
      setIsGeneratingBullets(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const wordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-500 text-sm">
        Authorizing Candidate Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 flex font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">CareerSync</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setActiveReport(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('resumes')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'resumes'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Resumes
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reviews'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              My Reviews
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </nav>
        </div>

        {/* Sidebar Logout Option */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-200"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with User Info & Logout Button */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
              Candidate Portal
            </span>
          </div>

          {/* User Profile & Top Bar Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-300">
                JD
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

        {/* Content Body */}
        <main className="p-8 max-w-6xl w-full mx-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs font-bold">✕</button>
            </div>
          )}

          {/* DASHBOARD INPUT FORM */}
          {(activeTab === 'dashboard' && !activeReport) && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">Analyze Your Resume</h1>
                <p className="text-sm text-slate-500">Upload your resume and paste the job description to get AI-powered feedback.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
                  <h3 className="font-semibold text-slate-900 text-sm mb-4">1. Upload Resume</h3>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all flex-1 min-h-[180px] ${
                      isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-medium text-slate-700 mb-1">
                      Drag & drop your file here <br /> or <span className="text-indigo-600 underline">click to browse</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">PDF, DOCX, TXT (Max 5MB)</span>
                  </div>

                  {(file || resumes.length > 0) && (
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">
                          {file ? file.name : resumes[0].filename}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {file ? `${(file.size / 1024).toFixed(0)} KB` : 'Uploaded'}
                        </span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 text-sm">2. Job Description</h3>
                    {jobDescriptions.length > 0 && (
                      <select
                        onChange={(e) => {
                          const found = jobDescriptions.find((j) => j.id === Number(e.target.value));
                          if (found) {
                            setSelectedJdId(found.id);
                            setJdText(found.raw_text);
                          }
                        }}
                        className="text-xs text-indigo-600 font-medium bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1"
                      >
                        <option value="">Select Saved JD</option>
                        {jobDescriptions.map((j) => (
                          <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-2">Paste the job description below</p>
                  <textarea
                    rows={7}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="We are looking for a Backend Developer with experience in Python, Flask, PostgreSQL, REST APIs, Git and Docker..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none flex-1"
                  />
                  <div className="mt-2 text-right text-[11px] text-slate-400 font-sans">
                    Total words: <span className="font-medium text-slate-600">{wordCount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isMatching || isUploading}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-sm hover:shadow transition-all disabled:bg-slate-300 disabled:cursor-not-allowed mb-8"
              >
                {isMatching ? 'Analyzing Resume & Match Fit...' : 'Analyze Resume'}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-4 border border-slate-200/60 rounded-xl bg-white/40">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Your data is secure and will not be shared with anyone.</span>
              </div>
            </div>
          )}

          {/* ANALYSIS RESULT VIEW */}
          {(activeTab === 'reviews' || activeReport) && activeReport && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">Analysis Result</h1>
                  <button
                    onClick={() => { setActiveReport(null); setActiveTab('dashboard'); }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-slate-500" /> Download Report
                </button>
              </div>

              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">MATCH SCORE</span>
                  <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-indigo-600" strokeDasharray={`${activeReport.match_score}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-bold font-mono text-indigo-900">{activeReport.match_score}%</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                    <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                    {activeReport.match_score >= 80 ? 'Excellent Match' : activeReport.match_score >= 60 ? 'Good Match' : 'Potential Match'}
                  </div>
                </div>

                <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">EXPERIENCE FIT</span>
                  <p className="text-slate-700 text-sm leading-relaxed">{activeReport.experience_fit}</p>
                </div>

                <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">MATCHED SKILLS</span>
                  <div className="flex flex-wrap gap-2">
                    {activeReport.matched_skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">MISSING SKILLS</span>
                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Wand2 className="w-3 h-3" /> Click skill to generate STAR bullet
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeReport.missing_skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptimizeBulletForSkill(skill)}
                        className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-medium border border-rose-100 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        {skill}
                        <Wand2 className="w-3 h-3 text-indigo-500 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMissingSkill && (
                  <div className="md:col-span-12 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-2 border-indigo-200 rounded-2xl p-6 shadow-md relative">
                    <button
                      onClick={() => setSelectedMissingSkill(null)}
                      className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      ✕ Close
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Wand2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">AI STAR-Method Bullet Optimizer</h3>
                        <p className="text-xs text-indigo-700">Tailored action points for <span className="font-bold underline">{selectedMissingSkill}</span> to copy into your resume:</p>
                      </div>
                    </div>

                    {isGeneratingBullets ? (
                      <div className="py-6 text-center text-xs font-mono text-indigo-600 animate-pulse">
                        Generating STAR-formatted bullet points for {selectedMissingSkill}...
                      </div>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {generatedBullets.map((bullet, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex justify-between items-start gap-4">
                            <p className="text-xs text-slate-800 leading-relaxed font-sans flex-1">
                              <span className="font-bold text-indigo-600 mr-2">•</span>
                              {bullet}
                            </p>
                            <button
                              onClick={() => copyToClipboard(bullet, idx)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all"
                            >
                              {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedIdx === idx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">RECOMMENDATIONS</span>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {activeReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">ATS ISSUES</span>
                  <ul className="space-y-2.5 text-xs text-amber-950">
                    {activeReport.ats_issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span className="leading-relaxed">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* MY RESUMES TAB */}
          {activeTab === 'resumes' && (
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">My Uploaded Resumes & AI Structured JSON</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setInspectResume(r)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{r.filename}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-100">
                      Inspect JSON →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-xl mx-auto">
              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">Candidate Profile</h1>
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
