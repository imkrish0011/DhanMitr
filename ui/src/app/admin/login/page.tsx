'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { adminSignIn, adminSignInWithGoogle, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // If already authenticated as admin, redirect to dashboard
  React.useEffect(() => {
    if (isAdmin && !authLoading) {
      router.push('/admin');
    }
  }, [isAdmin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await adminSignIn(email.trim(), password);
      if (error) {
        setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-4">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative z-10 backdrop-blur-sm">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">DhanMITR Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized Administrator Portal</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={async () => {
            setIsSubmitting(true);
            setErrorMessage(null);
            const { error } = await adminSignInWithGoogle();
            if (error) {
              setErrorMessage(error.message);
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-3 shadow-md mb-4 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold absolute">
            Or with password
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dhanmitr.internal"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating Privileges...</span>
              </>
            ) : (
              <span>Sign In to Admin Console</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Access strictly restricted to authorized DhanMITR administrators with active RBAC credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
