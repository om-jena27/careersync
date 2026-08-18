'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  user: { email: string; role: 'candidate' | 'recruiter' } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; role: 'candidate' | 'recruiter' } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
    const storedRole = localStorage.getItem('role') as 'candidate' | 'recruiter' | null;

    if (storedToken && storedEmail && storedRole) {
      setToken(storedToken);
      setUser({ email: storedEmail, role: storedRole });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed. Please check your credentials.');
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    setToken(data.access_token);
    setUser({ email: data.email, role: data.role });

    // Navigate based on role
    if (data.role === 'recruiter') {
      router.push('/recruiter');
    } else {
      router.push('/candidate');
    }
  };

  const signup = async (email: string, password: string, role: 'candidate' | 'recruiter') => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Signup failed. Email might already be taken.');
    }

    // Auto log in after successful signup
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    
    // Inject auth token if available
    const activeToken = token || localStorage.getItem('token');
    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }

    // Default JSON Content-Type if not uploading form-data
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed with status ${response.status}`);
    }

    return response.json();
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
