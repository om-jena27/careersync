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
      <div className="min-h-screen bg-[#0f0919] flex items-center justify-center font-sans text-purple-300 text-sm">
        Authorizing Candidate Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0919] flex font-sans text-purple-100 relative">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#140c26]/90 border-r border-violet-500/20 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl z-10">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-tight">CareerSync</span>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('dashboard'); setActiveReport(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/40 text-pink-300 font-semibold shadow-md'
                  : 'text-purple-300/70 hover:bg-violet-950/40 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-violet-400" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('resumes')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'resumes'
                  ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/40 text-pink-300 font-semibold shadow-md'
                  : 'text-purple-300/70 hover:bg-violet-950/40 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-violet-400" />
              My Resumes
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/40 text-pink-300 font-semibold shadow-md'
                  : 'text-purple-300/70 hover:bg-violet-950/40 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-violet-400" />
              My Reviews
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/40 text-pink-300 font-semibold shadow-md'
                  : 'text-purple-300/70 hover:bg-violet-950/40 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-violet-400" />
              Profile
            </button>
          </nav>
        </div>

        {/* Sidebar Logout Option */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/40 transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#140c26]/90 border-b border-violet-500/20 px-8 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-gradient-to-r from-violet-600/20 to-pink-600/20 text-pink-300 text-xs font-semibold rounded-full border border-violet-500/30">
              Candidate Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 overflow-hidden flex items-center justify-center text-pink-300 font-bold text-xs border border-violet-500/40">
                CP
              </div>
              <span className="text-sm font-medium text-purple-200">{user.email}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-500/30 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-6xl w-full mx-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl text-sm flex items-center justify-between shadow-lg">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs font-bold text-rose-300 hover:text-white">✕</button>
            </div>
          )}

          {/* DASHBOARD INPUT FORM */}
          {(activeTab === 'dashboard' && !activeReport) && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-white mb-1">Analyze Your Resume</h1>
                <p className="text-sm text-purple-300/70">Upload your resume and target job description to receive instant AI evaluation & match score.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Upload Resume Box */}
                <div className="bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/25 shadow-xl flex flex-col backdrop-blur-xl">
                  <h3 className="font-semibold text-purple-100 text-sm mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Upload Resume
                  </h3>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all flex-1 min-h-[180px] ${
                      isDragging ? 'border-pink-500 bg-pink-500/10' : 'border-violet-500/30 hover:border-pink-500/50 bg-[#120a24]/50'
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
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-pink-400 flex items-center justify-center mb-3 border border-violet-500/30">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-medium text-purple-200 mb-1">
                      Drag & drop file here <br /> or <span className="text-pink-400 underline font-semibold">click to browse</span>
                    </p>
                    <span className="text-[10px] text-purple-400/60 font-mono">PDF, DOCX, TXT (Max 5MB)</span>
                  </div>

                  {(file || resumes.length > 0) && (
                    <div className="mt-4 p-3 bg-[#120a24] border border-violet-500/30 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="font-medium text-purple-200 truncate">
                          {file ? file.name : resumes[0].filename}
                        </span>
                        <span className="text-[10px] text-purple-400/60 font-mono">
                          {file ? `${(file.size / 1024).toFixed(0)} KB` : 'Uploaded'}
                        </span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Job Description Box */}
                <div className="bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/25 shadow-xl flex flex-col backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-purple-100 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                      Job Description
                    </h3>
                    {jobDescriptions.length > 0 && (
                      <select
                        onChange={(e) => {
                          const found = jobDescriptions.find((j) => j.id === Number(e.target.value));
                          if (found) {
                            setSelectedJdId(found.id);
                            setJdText(found.raw_text);
                          }
                        }}
                        className="text-xs text-pink-300 font-medium bg-[#120a24] border border-violet-500/30 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="">Select Saved JD</option>
                        {jobDescriptions.map((j) => (
                          <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <p className="text-xs text-purple-300/60 mb-2">Paste the target job description text below</p>
                  <textarea
                    rows={7}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="We are looking for a Software Engineer with experience in Python, React, PostgreSQL, REST APIs..."
                    className="w-full p-3 border border-violet-500/30 rounded-xl text-xs text-purple-100 bg-[#120a24]/70 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none flex-1 placeholder-purple-400/30"
                  />
                  <div className="mt-2 text-right text-[11px] text-purple-400/60 font-mono">
                    Total words: <span className="font-medium text-pink-300">{wordCount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isMatching || isUploading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-medium text-base shadow-xl shadow-violet-950/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8"
              >
                {isMatching ? 'Analyzing Resume & Calculating Fit Score...' : 'Analyze Resume'}
              </button>

              <div className="flex items-center justify-center gap-2 text-purple-400/60 text-xs py-4 border border-violet-500/20 rounded-xl bg-[#140c26]/60">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Your uploaded data is processed securely via Google Gemini AI.</span>
              </div>
            </div>
          )}

          {/* ANALYSIS RESULT VIEW */}
          {(activeTab === 'reviews' || activeReport) && activeReport && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Analysis Result</h1>
                  <button
                    onClick={() => { setActiveReport(null); setActiveTab('dashboard'); }}
                    className="text-xs font-medium text-purple-300 hover:text-pink-300 flex items-center gap-1 mt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-violet-500/30 rounded-xl bg-[#1a102f] text-xs font-medium text-purple-200 hover:bg-[#23153e] hover:border-pink-500/40 shadow-md flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-pink-400" /> Download Report
                </button>
              </div>

              <div className="grid md:grid-cols-12 gap-6">
                {/* Score Card */}
                <div className="md:col-span-4 bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/30 shadow-xl flex flex-col justify-center items-center text-center backdrop-blur-xl">
                  <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest mb-4">MATCH SCORE</span>
                  <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-purple-950" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-pink-500 drop-shadow-md" strokeDasharray={`${activeReport.match_score}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-bold font-mono text-white">{activeReport.match_score}%</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 text-xs font-medium border border-pink-500/30">
                    <Star className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                    {activeReport.match_score >= 80 ? 'Excellent Match' : activeReport.match_score >= 60 ? 'Good Match' : 'Potential Match'}
                  </div>
                </div>

                {/* Experience Fit Card */}
                <div className="md:col-span-8 bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/30 shadow-xl flex flex-col justify-center backdrop-blur-xl">
                  <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest mb-2">EXPERIENCE FIT</span>
                  <p className="text-purple-100 text-sm leading-relaxed">{activeReport.experience_fit}</p>
                </div>

                {/* Matched Skills */}
                <div className="md:col-span-6 bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/30 shadow-xl backdrop-blur-xl">
                  <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest mb-4 block">MATCHED SKILLS</span>
                  <div className="flex flex-wrap gap-2">
                    {activeReport.matched_skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="md:col-span-6 bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/30 shadow-xl backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest block">MISSING SKILLS</span>
                    <span className="text-[10px] text-pink-300 font-medium bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20 flex items-center gap-1">
                      <Wand2 className="w-3 h-3 text-pink-400" /> Click to generate STAR bullet
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeReport.missing_skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptimizeBulletForSkill(skill)}
                        className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        {skill}
                        <Wand2 className="w-3 h-3 text-pink-400 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* STAR Bullet Optimizer Box */}
                {selectedMissingSkill && (
                  <div className="md:col-span-12 bg-gradient-to-r from-violet-950/90 to-purple-950/90 border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl relative backdrop-blur-xl">
                    <button
                      onClick={() => setSelectedMissingSkill(null)}
                      className="absolute top-4 right-4 text-xs font-bold text-purple-300 hover:text-white"
                    >
                      ✕ Close
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-900/50">
                        <Wand2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">AI STAR-Method Bullet Optimizer</h3>
                        <p className="text-xs text-purple-200">Action points for <span className="font-bold underline text-pink-300">{selectedMissingSkill}</span> ready to add to your resume:</p>
                      </div>
                    </div>

                    {isGeneratingBullets ? (
                      <div className="py-6 text-center text-xs font-mono text-pink-300 animate-pulse">
                        Generating STAR-formatted bullet points for {selectedMissingSkill}...
                      </div>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {generatedBullets.map((bullet, idx) => (
                          <div key={idx} className="bg-[#120a24]/90 p-4 rounded-xl border border-violet-500/30 shadow-md flex justify-between items-start gap-4">
                            <p className="text-xs text-purple-100 leading-relaxed font-sans flex-1">
                              <span className="font-bold text-pink-400 mr-2">•</span>
                              {bullet}
                            </p>
                            <button
                              onClick={() => copyToClipboard(bullet, idx)}
                              className="px-3 py-1.5 bg-violet-600/30 hover:bg-violet-600/50 text-pink-300 rounded-lg text-xs font-medium border border-violet-500/40 flex items-center gap-1.5 shrink-0 transition-all"
                            >
                              {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedIdx === idx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                <div className="md:col-span-6 bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/30 shadow-xl backdrop-blur-xl">
                  <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest mb-4 block">RECOMMENDATIONS</span>
                  <ul className="space-y-2.5 text-xs text-purple-200">
                    {activeReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-pink-400 font-bold">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ATS Issues */}
                <div className="md:col-span-6 bg-[#1a102f]/80 rounded-3xl p-6 border border-violet-500/30 shadow-xl backdrop-blur-xl">
                  <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest mb-4 block">ATS ISSUES</span>
                  <ul className="space-y-2.5 text-xs text-amber-200">
                    {activeReport.ats_issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
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
              <h1 className="text-3xl font-serif font-bold text-white mb-6">My Resumes & Extracted Data</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setInspectResume(r)}
                    className="bg-[#1a102f]/80 p-5 rounded-2xl border border-violet-500/30 shadow-lg hover:border-pink-500/40 cursor-pointer transition-all flex items-center justify-between backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-pink-400 flex items-center justify-center border border-violet-500/30">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{r.filename}</h4>
                        <p className="text-[11px] text-purple-400/60 font-mono">Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-pink-500/10 text-pink-300 text-xs rounded-full font-medium border border-pink-500/30">
                      View JSON →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-[#1a102f]/80 p-8 rounded-3xl border border-violet-500/30 max-w-xl mx-auto backdrop-blur-xl shadow-xl">
              <h1 className="text-2xl font-serif font-bold text-white mb-6">Candidate Profile</h1>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-mono uppercase text-purple-400 mb-1">Email Address</label>
                  <div className="p-3.5 bg-[#120a24] border border-violet-500/30 rounded-xl font-mono text-purple-100">{user.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-purple-400 mb-1">Account Role</label>
                  <div className="p-3.5 bg-[#120a24] border border-violet-500/30 rounded-xl font-mono text-purple-100 capitalize">{user.role}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
