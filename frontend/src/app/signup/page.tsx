'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/GlassCard';

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-slate-50 min-h-screen">
      <GlassCard className="max-w-md w-full p-8 border border-slate-200">
        <div className="text-center mb-6">
          <Link href="/" className="font-mono text-xs text-slate-400 hover:text-slate-600">
            ← BACK TO HOME
          </Link>
          <h2 className="text-3xl font-serif font-semibold text-slate-900 mt-4">Create Account</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">REGISTER NEW USER DESK</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Select Role</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-1.5 text-xs font-mono rounded-md transition-all ${
                  role === 'candidate'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                CANDIDATE
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-1.5 text-xs font-mono rounded-md transition-all ${
                  role === 'recruiter'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                RECRUITER
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-950 text-white font-mono text-xs hover:bg-slate-800 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING...' : 'REGISTER & LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="underline font-mono hover:text-slate-800">
            Log in here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
