'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, User, Briefcase, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold font-mono shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-slate-900">CareerSync</span>
        </div>
        <button 
          onClick={() => alert('CareerSync matches candidate resumes to job descriptions using AI. Select Candidate or Recruiter portal to begin!')}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-full bg-white transition-all shadow-sm"
        >
          How it works
        </button>
      </header>

      {/* Main Content Hero */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <span className="text-sm font-medium text-slate-500 mb-2">Welcome to</span>
        <h1 className="text-5xl sm:text-6xl font-serif font-bold text-slate-900 tracking-tight mb-4">
          CareerSync
        </h1>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs sm:text-sm mb-6 border border-indigo-100">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI-Powered Resume & Job Matching
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>

        <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-12">
          Analyze your resume against a job description, discover skill gaps, and receive actionable career feedback.
        </p>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {/* Candidate Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
              <User className="w-8 h-8" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg uppercase tracking-wider mb-2">CANDIDATE</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Analyze my resume and improve my career fit.
            </p>
            <Link
              href={user && user.role === 'candidate' ? '/candidate' : '/login?role=candidate'}
              className="mt-auto w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
            >
              Enter Candidate Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recruiter Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-6">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg uppercase tracking-wider mb-2">RECRUITER</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Find the best candidates for my job openings.
            </p>
            <Link
              href={user && user.role === 'recruiter' ? '/recruiter' : '/login?role=recruiter'}
              className="mt-auto w-full py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
            >
              Enter Recruiter Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs font-sans">
        © 2025 CareerSync. All rights reserved.
      </footer>
    </div>
  );
}
