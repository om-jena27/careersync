'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, User, Briefcase, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0919] flex flex-col justify-between font-sans text-purple-100 relative overflow-hidden">
      {/* Background Glow Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-bold font-mono shadow-lg shadow-violet-950">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
            CareerSync
          </span>
        </div>
        <button 
          onClick={() => alert('CareerSync matches candidate resumes to job descriptions using AI. Select Candidate or Recruiter portal to begin!')}
          className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white border border-violet-500/30 hover:border-pink-500/50 rounded-full bg-[#1a102f]/80 backdrop-blur-md transition-all shadow-sm"
        >
          How it works
        </button>
      </header>

      {/* Main Content Hero */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center z-10">
        <span className="text-xs font-mono tracking-widest text-pink-400 uppercase mb-3">Welcome to</span>
        <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight mb-4 bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-sm">
          CareerSync
        </h1>
        
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-950/70 border border-violet-500/30 text-pink-300 font-medium text-xs sm:text-sm mb-6 backdrop-blur-md violet-glow">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          <span>AI-Powered Resume & Job Matching</span>
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
        </div>

        <p className="text-purple-200/80 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-12">
          Analyze your resume against job descriptions, uncover hidden skill gaps, and get actionable AI career recommendations.
        </p>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {/* Candidate Card */}
          <div className="bg-[#1a102f]/75 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-purple-950/50 hover:border-violet-500/60 hover:bg-[#23153e]/80 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
              <User className="w-8 h-8" />
            </div>
            <h2 className="font-bold text-purple-100 text-lg uppercase tracking-wider mb-2">CANDIDATE</h2>
            <p className="text-purple-300/70 text-sm mb-8 leading-relaxed">
              Analyze my resume, calculate match score, and improve my career fit.
            </p>
            <Link
              href={user && user.role === 'candidate' ? '/candidate' : '/login?role=candidate'}
              className="mt-auto w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 hover:shadow-violet-800/60 transition-all"
            >
              Enter Candidate Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recruiter Card */}
          <div className="bg-[#1a102f]/75 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-purple-950/50 hover:border-pink-500/60 hover:bg-[#23153e]/80 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="font-bold text-purple-100 text-lg uppercase tracking-wider mb-2">RECRUITER</h2>
            <p className="text-purple-300/70 text-sm mb-8 leading-relaxed">
              Post jobs, evaluate candidates, and rank applicant resumes using AI.
            </p>
            <Link
              href={user && user.role === 'recruiter' ? '/recruiter' : '/login?role=recruiter'}
              className="mt-auto w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-900/40 hover:shadow-pink-800/60 transition-all"
            >
              Enter Recruiter Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-purple-400/60 text-xs font-mono z-10">
        © 2025 CareerSync • Powered by Gemini AI
      </footer>
    </div>
  );
}
