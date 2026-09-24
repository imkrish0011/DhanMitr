'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DhanMitrLogo, SparkleSmallIcon } from '@/components/icons/CustomIcons';
import { SignUpForm, type SignUpValues, type FormMode } from '@/components/motion/signup-form';
import { X } from 'lucide-react';
import { type ButtonState } from '@/components/motion/button';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalReason,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<FormMode>(authModalMode === 'signup' ? 'signup' : 'signin');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [googleButtonState, setGoogleButtonState] = useState<ButtonState>('idle');

  // Sync mode whenever prop changes
  React.useEffect(() => {
    setMode(authModalMode === 'signup' ? 'signup' : 'signin');
    setErrorMessage(undefined);
    setButtonState('idle');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (values: SignUpValues) => {
    setErrorMessage(undefined);
    setButtonState('loading');

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(values.email, values.password);
        if (error) {
          setButtonState('error');
          setErrorMessage(error.message || 'Invalid email or password.');
        } else {
          setButtonState('success');
          setTimeout(() => {
            setButtonState('idle');
            closeAuthModal();
          }, 400);
        }
      } else {
        const { error } = await signUpWithEmail(values.email, values.password, values.name);
        if (error) {
          setButtonState('error');
          setErrorMessage(error.message || 'Could not sign up. Please try again.');
        } else {
          setButtonState('success');
          setTimeout(() => {
            setButtonState('idle');
            closeAuthModal();
          }, 400);
        }
      }
    } catch (err: any) {
      setButtonState('error');
      setErrorMessage(err.message || 'An unexpected error occurred.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(undefined);
    setGoogleButtonState('loading');
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleButtonState('error');
      setErrorMessage(error.message || 'Google sign in failed. Please check configuration.');
    } else {
      setGoogleButtonState('success');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Sticky Header with DhanMitr Brand and Close Button */}
        <div className="sticky top-0 z-20 px-5 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <DhanMitrLogo className="w-6 h-5.5 shrink-0" />
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              धन<span className="text-emerald-500 font-black">Mitr</span>
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason banner if triggered */}
        {authModalReason && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200 shrink-0">
            <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-snug font-semibold text-[11px]">{authModalReason}</p>
          </div>
        )}

        {/* Compact, Animated Green-Themed Sign In / Sign Up Form */}
        <div className="p-4 sm:p-5 pt-3 sm:pt-3.5 flex-1">
          <SignUpForm
            mode={mode}
            onModeChange={(newMode) => {
              setMode(newMode);
              setErrorMessage(undefined);
            }}
            onSubmit={handleSubmit}
            onGoogleSignIn={handleGoogleSignIn}
            googleStatus={googleButtonState}
            status={buttonState}
            errorMessage={errorMessage}
            className="border-none shadow-none bg-transparent p-0"
          />
        </div>
      </div>
    </div>
  );
};
