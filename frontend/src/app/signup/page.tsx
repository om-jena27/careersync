'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/GlassCard';

function SignupContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const { signup } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleParam === 'recruiter') {
      setRole('recruiter');
    } else if (roleParam === 'candidate') {
      setRole('candidate');
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
      await signup(email, password, role);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[#0f0919] min-h-screen text-purple-100 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <GlassCard className="max-w-md w-full p-8 border border-violet-500/30 bg-[#1a102f]/80 backdrop-blur-xl shadow-2xl shadow-purple-950">
        <div className="text-center mb-6">
          <Link href="/" className="font-mono text-xs text-purple-400 hover:text-pink-300 transition-colors">
            ← BACK TO HOME
          </Link>
          <h2 className="text-3xl font-serif font-bold text-white mt-4 tracking-tight">Create Account</h2>
          <p className="text-xs text-purple-300/70 font-mono mt-1 uppercase tracking-wider">
            REGISTER NEW {role.toUpperCase()} ACCOUNT
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-purple-300/80 mb-1">Select Role</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#120a24] border border-violet-500/20 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2 text-xs font-mono rounded-lg transition-all ${
                  role === 'candidate'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-md'
                    : 'text-purple-300/60 hover:text-white'
                }`}
              >
                CANDIDATE
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 text-xs font-mono rounded-lg transition-all ${
                  role === 'recruiter'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold shadow-md'
                    : 'text-purple-300/60 hover:text-white'
                }`}
              >
                RECRUITER
              </button>
            </div>
          </div>

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
            {loading ? 'CREATING...' : `REGISTER & ENTER ${role.toUpperCase()} PORTAL`}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-purple-300/70">
          Already have an account?{' '}
          <Link href={role ? `/login?role=${role}` : '/login'} className="underline font-mono text-pink-400 hover:text-pink-300">
            Log in here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center min-h-screen text-purple-300">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
