'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export type AdminRole = 'superadmin' | 'admin' | 'moderator';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminRole: AdminRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  adminSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  adminSignInWithGoogle: () => Promise<{ error: Error | null }>;
  adminSignOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Helper for authenticated API calls to /api/admin/*
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = session?.access_token;
    
    // If token not currently in memory, retrieve fresh session
    if (!token && isSupabaseConfigured) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }

    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }, [session]);

  // Verify admin authorization against server-side API
  const verifyWithServer = useCallback(async (currentSession: Session | null): Promise<boolean> => {
    if (!currentSession?.access_token) {
      setIsAdmin(false);
      setAdminRole(null);
      return false;
    }

    try {
      const res = await fetch('/api/admin/auth/verify', {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAdmin(true);
          setAdminRole(data.role || 'admin');
          setAuthError(null);
          return true;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setAuthError(errData.error || 'Access Denied: Administrator role required.');
      }
    } catch (e: any) {
      console.error('Error verifying admin permissions:', e);
      setAuthError('Connection failed while verifying administrator credentials.');
    }

    setIsAdmin(false);
    setAdminRole(null);
    return false;
  }, []);

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      const isAuthorized = await verifyWithServer(currentSession);
      setIsLoading(false);
      return isAuthorized;
    } catch (err) {
      console.error('Failed to get session:', err);
      setIsLoading(false);
      return false;
    }
  }, [verifyWithServer]);

  // Initial Auth Listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession) {
        verifyWithServer(currentSession).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession) {
        await verifyWithServer(currentSession);
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [verifyWithServer]);

  // Admin Sign In
  const adminSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      const err = new Error('Supabase credentials are not configured.');
      setAuthError(err.message);
      return { error: err };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        setAuthError(error.message);
        return { error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        const authorized = await verifyWithServer(data.session);
        setIsLoading(false);

        if (!authorized) {
          const deniedErr = new Error('Access denied: You do not possess DhanMITR administrator privileges.');
          setAuthError(deniedErr.message);
          return { error: deniedErr };
        }

        return { error: null };
      }

      setIsLoading(false);
      return { error: new Error('Failed to establish session.') };
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Login failed');
      return { error: err };
    }
  };

  // Admin Google Sign In
  const adminSignInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase credentials are not configured.') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Admin Sign Out
  const adminSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminRole(null);
    setAuthError(null);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        adminRole,
        isAdmin,
        isLoading,
        authError,
        adminSignIn,
        adminSignInWithGoogle,
        adminSignOut,
        checkAdminStatus,
        adminFetch,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
