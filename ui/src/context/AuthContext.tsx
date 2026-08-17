'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserFinancialProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserFinancialProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authModalReason: string | null;
  isOnboardingOpen: boolean;
  freeChatCount: number;
  remainingFreeChats: number;
  canChat: boolean;
  
  // Actions
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'signup', reason?: string) => void;
  closeAuthModal: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  incrementFreeChatCount: () => boolean;
  saveOnboardingProfile: (data: Partial<UserFinancialProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_FREE_CHATS = 3;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserFinancialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Free chat counter for guests
  const [freeChatCount, setFreeChatCount] = useState<number>(0);

  // Load guest chat counter from localStorage
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('dhanmitr_free_chats');
      if (savedCount !== null) {
        setFreeChatCount(parseInt(savedCount, 10) || 0);
      }
    } catch (e) {
      console.warn('Could not read free chat count from localStorage', e);
    }
  }, []);

  // Fetch profile for authenticated user
  const fetchProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: any) => {
    if (!isSupabaseConfigured) {
      // Local fallback profile if supabase not configured
      const fallbackName = userMeta?.full_name || userMeta?.name || userEmail?.split('@')[0] || 'User';
      const fallbackProfile: UserFinancialProfile = {
        user_id: userId,
        name: fallbackName,
        email: userEmail,
        avatar_initial: fallbackName.charAt(0).toUpperCase() || 'U',
        is_premium: false,
        currency: 'INR',
        monthly_income: 0,
        monthly_expenses: 0,
        emergency_fund_balance: 0,
        total_investments: 0,
        total_liabilities: 0,
        risk_tolerance: 'moderate',
        employment_type: 'salaried',
        tax_regime: 'new',
        is_onboarded: false,
      };
      setProfile(fallbackProfile);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile found yet, create one
        const fallbackName = userMeta?.full_name || userMeta?.name || userEmail?.split('@')[0] || 'User';
        const newProfile = {
          id: userId,
          name: fallbackName,
          email: userEmail,
          avatar_initial: fallbackName.charAt(0).toUpperCase() || 'U',
          is_onboarded: false,
        };

        const { data: createdData } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createdData) {
          setProfile({
            user_id: createdData.id,
            name: createdData.name,
            email: createdData.email,
            avatar_initial: createdData.avatar_initial || 'U',
            is_premium: false,
            currency: (createdData.currency as any) || 'INR',
            monthly_income: Number(createdData.monthly_income || 0),
            monthly_expenses: Number(createdData.monthly_expenses || 0),
            emergency_fund_balance: Number(createdData.emergency_fund_balance || 0),
            total_investments: Number(createdData.total_investments || 0),
            total_liabilities: Number(createdData.total_liabilities || 0),
            risk_tolerance: createdData.risk_tolerance || 'moderate',
            employment_type: createdData.employment_type || 'salaried',
            tax_regime: createdData.tax_regime || 'new',
            is_onboarded: createdData.is_onboarded || false,
          });
          if (!createdData.is_onboarded) {
            setIsOnboardingOpen(true);
          }
        }
      } else if (data) {
        setProfile({
          user_id: data.id,
          name: data.name,
          email: data.email,
          avatar_initial: data.avatar_initial || (data.name ? data.name.charAt(0).toUpperCase() : 'U'),
          is_premium: false,
          currency: (data.currency as any) || 'INR',
          monthly_income: Number(data.monthly_income || 0),
          monthly_expenses: Number(data.monthly_expenses || 0),
          emergency_fund_balance: Number(data.emergency_fund_balance || 0),
          total_investments: Number(data.total_investments || 0),
          total_liabilities: Number(data.total_liabilities || 0),
          risk_tolerance: data.risk_tolerance || 'moderate',
          employment_type: data.employment_type || 'salaried',
          tax_regime: data.tax_regime || 'new',
          is_onboarded: data.is_onboarded || false,
        });

        // If user is not onboarded, prompt onboarding modal
        if (!data.is_onboarded) {
          setIsOnboardingOpen(true);
        }
      }
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
    }
  }, []);

  // Initialize Supabase Auth Listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Auth Actions
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet. Please add your credentials in .env.local') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet. Please add your credentials in .env.local') };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
        setIsAuthModalOpen(false);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet. Please add your credentials in .env.local') };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });
      if (error) return { error };
      if (data.user) {
        setIsAuthModalOpen(false);
        setIsOnboardingOpen(true);
      }
      return { error: null, user: data.user };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login', reason?: string) => {
    setAuthModalMode(mode);
    setAuthModalReason(reason || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  // Free Chat Counter for Logged-Out Guests
  const incrementFreeChatCount = (): boolean => {
    if (user) return true; // Authenticated users have unlimited chats

    if (freeChatCount >= MAX_FREE_CHATS) {
      openAuthModal('signup', "You've used your 3 free AI queries! Create a free account or sign in to continue chatting with DhanMITR and unlock the Finance Hub.");
      return false;
    }

    const nextCount = freeChatCount + 1;
    setFreeChatCount(nextCount);
    try {
      localStorage.setItem('dhanmitr_free_chats', String(nextCount));
    } catch (e) {}

    return true;
  };

  // Save onboarding details
  const saveOnboardingProfile = async (data: Partial<UserFinancialProfile>) => {
    if (!user && !profile) return;
    const userId = user?.id || profile?.user_id;
    if (!userId) return;

    const updatedProfile: UserFinancialProfile = {
      user_id: userId,
      name: data.name || profile?.name || 'User',
      email: user?.email || profile?.email,
      avatar_initial: (data.name || profile?.name || 'U').charAt(0).toUpperCase(),
      is_premium: false,
      currency: data.currency || 'INR',
      monthly_income: data.monthly_income ?? (profile?.monthly_income || 0),
      monthly_expenses: data.monthly_expenses ?? (profile?.monthly_expenses || 0),
      emergency_fund_balance: data.emergency_fund_balance ?? (profile?.emergency_fund_balance || 0),
      total_investments: data.total_investments ?? (profile?.total_investments || 0),
      total_liabilities: data.total_liabilities ?? (profile?.total_liabilities || 0),
      risk_tolerance: data.risk_tolerance || profile?.risk_tolerance || 'moderate',
      employment_type: data.employment_type || profile?.employment_type || 'salaried',
      tax_regime: data.tax_regime || profile?.tax_regime || 'new',
      is_onboarded: true,
    };

    setProfile(updatedProfile);
    setIsOnboardingOpen(false);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          name: updatedProfile.name,
          email: updatedProfile.email,
          avatar_initial: updatedProfile.avatar_initial,
          currency: updatedProfile.currency,
          monthly_income: updatedProfile.monthly_income,
          monthly_expenses: updatedProfile.monthly_expenses,
          emergency_fund_balance: updatedProfile.emergency_fund_balance,
          total_investments: updatedProfile.total_investments,
          total_liabilities: updatedProfile.total_liabilities,
          risk_tolerance: updatedProfile.risk_tolerance,
          employment_type: updatedProfile.employment_type,
          tax_regime: updatedProfile.tax_regime,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Error saving profile to Supabase:', e);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email, user.user_metadata);
    }
  };

  const isAuthenticated = Boolean(user);
  const remainingFreeChats = Math.max(0, MAX_FREE_CHATS - freeChatCount);
  const canChat = isAuthenticated || freeChatCount < MAX_FREE_CHATS;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        authModalReason,
        isOnboardingOpen,
        freeChatCount,
        remainingFreeChats,
        canChat,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        openAuthModal,
        closeAuthModal,
        openOnboarding,
        closeOnboarding,
        incrementFreeChatCount,
        saveOnboardingProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
