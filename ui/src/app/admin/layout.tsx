'use client';

import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  Lock
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, adminRole, isAdmin, isLoading, authError, adminSignOut } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login if unauthenticated
  React.useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isLoading, user, pathname, router]);

  // If on login page, render children directly without dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Authenticating धनMitr Admin Access...</p>
        <p className="text-xs text-slate-500 mt-1">Verifying cryptographic session and database RBAC policies</p>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return null;
  }

  // Logged in but not an authorized admin -> 403 Forbidden Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">403 — Forbidden: Access Denied</h2>
            <p className="text-xs text-rose-300/80 mt-1">Private धनMitr Administration Portal</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The authenticated user (<strong className="text-white">{user.email}</strong>) does not have administrative privileges in the धनMitr database RBAC directory.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={adminSignOut}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Sign Out & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin -> Render Full Admin Dashboard Shell
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col antialiased font-sans">
      {/* Top Admin Header Bar */}
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide">धनMitr</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 ml-2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Command Center
              </span>
            </div>
          </div>
        </div>

        {/* User Pill & Sign Out */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="text-right">
              <p className="font-semibold text-white">{user.email}</p>
              <p className="text-[10px] text-indigo-400 font-mono capitalize">{adminRole || 'admin'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-200 flex items-center justify-center text-xs">
              {(user.email?.charAt(0) || 'A').toUpperCase()}
            </div>
          </div>

          <button
            onClick={adminSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-xs font-semibold transition-colors"
            title="Sign out of Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
