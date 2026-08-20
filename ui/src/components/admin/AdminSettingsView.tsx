'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  Settings, 
  Database, 
  Server, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Code,
  Copy,
  Check
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { adminFetch, user } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error loading admin settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const promoSql = `-- Supabase Admin Promotion Script
DO $$
DECLARE
    target_email TEXT := '${user?.email || 'ks9875277@gmail.com'}';
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email LIMIT 1;
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.admin_users (user_id, role, is_active)
        VALUES (target_user_id, 'superadmin', true)
        ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin', is_active = true;
        RAISE NOTICE 'User % successfully promoted to superadmin.', target_email;
    ELSE
        RAISE NOTICE 'User % does not exist in auth.users yet.', target_email;
    END IF;
END $$;`;

  const copySql = () => {
    navigator.clipboard.writeText(promoSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const sys = data?.system || {};
  const supabase = sys.supabaseStatus || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Diagnostics</h1>
          <p className="text-sm text-slate-400">Environment telemetry and database administrative status</p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Telemetry */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase Infrastructure</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Supabase Endpoint</span>
              <span className="font-mono text-emerald-400">{supabase.maskedUrl || 'Checking...'}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Public Anon Key</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                {supabase.anonKeyPresent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Configured
                  </>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Missing
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Service Role Key (Server-side)</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                {supabase.serviceKeyPresent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Active & Verified
                  </>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Using Anon Fallback
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Server & RBAC Diagnostics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Administrative Session & RBAC</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Current Admin User</span>
              <span className="font-semibold text-white">{user?.email || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Active Role</span>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-semibold">
                {data?.requester?.role?.toUpperCase() || 'SUPERADMIN'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Environment Mode</span>
              <span className="font-mono text-slate-300">{sys.nodeEnv || 'development'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Promotion Helper Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Code className="w-4 h-4 text-indigo-400" />
            <span>Admin Promotion SQL Query (For Supabase SQL Editor)</span>
          </div>
          <button
            onClick={copySql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSql ? 'Copied to Clipboard' : 'Copy Query'}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Run this snippet in your Supabase SQL editor whenever promoting a new administrator account:
        </p>
        <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto">
          {promoSql}
        </pre>
      </div>
    </div>
  );
};
