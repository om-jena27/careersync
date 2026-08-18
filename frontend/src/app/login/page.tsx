'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/GlassCard';

function LoginContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
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
          <h2 className="text-3xl font-serif font-semibold text-slate-900 mt-4">Welcome Back</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">LOG IN TO YOUR ASSESSMENT DESK</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'AUTHENTICATING...' : 'ACCESS PORTAL'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          New to CareerSync?{' '}
          <Link href="/signup" className="underline font-mono hover:text-slate-800">
            Create an account
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center min-h-screen">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
