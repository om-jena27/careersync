'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { User, Briefcase, Sparkles } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleParam === 'candidate') {
      setEmail('candidate@example.com');
      setPassword('password123');
    } else if (roleParam === 'recruiter') {
      setEmail('recruiter@example.com');
      setPassword('password123');
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'candidate' | 'recruiter') => {
    setError(null);
    setLoading(true);
    const demoEmail = demoRole === 'candidate' ? 'candidate@example.com' : 'recruiter@example.com';
    try {
      await login(demoEmail, 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[#0f0919] min-h-screen text-purple-100 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <GlassCard className="max-w-md w-full p-8 border border-violet-500/30 bg-[#1a102f]/80 backdrop-blur-xl shadow-2xl shadow-purple-950">
        <div className="text-center mb-6">
          <Link href="/" className="font-mono text-xs text-purple-400 hover:text-pink-300 transition-colors">
            ← BACK TO HOME
          </Link>
          <h2 className="text-3xl font-serif font-bold text-white mt-4 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-purple-300/70 font-mono mt-1 uppercase tracking-wider">
            {roleParam ? `${roleParam.toUpperCase()} PORTAL LOGIN` : 'LOG IN TO YOUR CAREERSYNC DESK'}
          </p>
        </div>

        {/* Quick Demo Credentials Switcher */}
        <div className="mb-6 p-3 bg-[#120a24] border border-violet-500/30 rounded-2xl">
          <div className="text-[11px] font-mono text-purple-300/70 mb-2 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>INSTANT DEMO ACCESS</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('candidate')}
              className="py-2 px-3 bg-violet-600/20 hover:bg-violet-600/40 text-purple-200 border border-violet-500/30 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-violet-400" />
              Candidate Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('recruiter')}
              className="py-2 px-3 bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border border-pink-500/30 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-pink-400" />
              Recruiter Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-purple-300/80 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 border border-violet-500/30 rounded-xl text-sm bg-[#120a24]/80 text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-purple-300/80 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-violet-500/30 rounded-xl text-sm bg-[#120a24]/80 text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-mono text-xs tracking-wider uppercase font-semibold transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS PORTAL'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-purple-300/70">
          New to CareerSync?{' '}
          <Link href={roleParam ? `/signup?role=${roleParam}` : '/signup'} className="underline font-mono text-pink-400 hover:text-pink-300">
            Create an account
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center min-h-screen text-purple-300">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
