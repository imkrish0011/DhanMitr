'use client';
// beui.dev/components/blocks/signup-form

import React, {
  type FormEvent,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { StatefulButton, type ButtonState } from '@/components/motion/button';
import { Checkbox } from '@/components/motion/checkbox';
import { Input } from '@/components/motion/input';
import { EASE_OUT, SPRING_LAYOUT } from '@/lib/ease';
import { cn } from '@/lib/utils';

export type SignUpStatus = 'idle' | 'loading' | 'success' | 'error';
export type FormMode = 'signin' | 'signup';

export type SignUpValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

export type SignUpFormClassNames = {
  root?: string;
  header?: string;
  title?: string;
  description?: string;
  fields?: string;
  strength?: string;
  terms?: string;
  submit?: string;
  footer?: string;
};

export interface SignUpFormProps {
  /** Mode: 'signup' for full registration, 'signin' for quick login */
  mode?: FormMode;
  onModeChange?: (mode: FormMode) => void;
  /** Controlled values. Omit for uncontrolled. */
  values?: SignUpValues;
  defaultValues?: Partial<SignUpValues>;
  onValuesChange?: (values: SignUpValues) => void;
  /** Called with valid values only. Return a promise to drive the button state. */
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  /** Optional Google sign in handler */
  onGoogleSignIn?: () => void | Promise<void>;
  googleStatus?: ButtonState;
  /** Replace the built-in rules — return a message per invalid field. */
  validate?: (values: SignUpValues, mode: FormMode) => SignUpErrors;
  /** Controlled submit state. Omit to let the form track it. */
  status?: SignUpStatus;
  /** Form-level failure message, shown above the submit button. */
  errorMessage?: string;
  title?: ReactNode;
  description?: ReactNode;
  submitLabel?: string;
  footer?: ReactNode;
  /** Show the password strength meter in signup mode. */
  strengthMeter?: boolean;
  className?: string;
  classNames?: SignUpFormClassNames;
}

const EMPTY_VALUES: SignUpValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const;

// Green-themed strength progression: Red -> Amber -> Vibrant Emerald
const STRENGTH_COLORS = [
  'bg-rose-500',
  'bg-rose-500',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-emerald-500',
] as const;

export function passwordStrength(password: string): number {
  if (password.length < MIN_PASSWORD_LENGTH) return 0;

  let score = 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password)
  ).length;
  if (classes >= 3) score += 1;

  return Math.min(score, 4);
}

function defaultValidate(values: SignUpValues, mode: FormMode): SignUpErrors {
  const errors: SignUpErrors = {};

  if (mode === 'signup' && !values.name.trim()) {
    errors.name = 'Enter your full name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "Invalid email format.";
  }

  if (!values.password) {
    errors.password = 'Enter your password.';
  } else if (mode === 'signup' && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Min ${MIN_PASSWORD_LENGTH} chars.`;
  }

  if (mode === 'signup') {
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords don't match.";
    }

    if (!values.terms) {
      errors.terms = 'Please accept the terms.';
    }
  }

  return errors;
}

export function SignUpForm({
  mode = 'signup',
  onModeChange,
  values: valuesProp,
  defaultValues,
  onValuesChange,
  onSubmit,
  onGoogleSignIn,
  googleStatus = 'idle',
  validate,
  status: statusProp,
  errorMessage,
  title,
  description,
  submitLabel,
  footer,
  strengthMeter = true,
  className,
  classNames,
}: SignUpFormProps) {
  const reduce = useReducedMotion();
  const baseId = useId();

  const controlled = valuesProp !== undefined;
  const [internalValues, setInternalValues] = useState<SignUpValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
  });
  const values = controlled ? valuesProp : internalValues;

  const [internalStatus, setInternalStatus] = useState<SignUpStatus>('idle');
  const status = statusProp ?? internalStatus;

  const [revealPassword, setRevealPassword] = useState(false);
  const [revealConfirmPassword, setRevealConfirmPassword] = useState(false);

  // "Reward early, punish late"
  const [touched, setTouched] = useState<Partial<Record<keyof SignUpValues, boolean>>>({});

  const errors = useMemo(
    () => (validate ?? defaultValidate)(values, mode),
    [values, validate, mode]
  );

  const setValue = useCallback(
    <K extends keyof SignUpValues>(key: K, next: SignUpValues[K]) => {
      const nextValues = { ...values, [key]: next };
      if (!controlled) {
        setInternalValues(nextValues);
        if (statusProp === undefined) {
          setInternalStatus((current) =>
            current === 'success' || current === 'error' ? 'idle' : current
          );
        }
      }
      onValuesChange?.(nextValues);
    },
    [controlled, onValuesChange, statusProp, values]
  );

  const touch = useCallback((key: keyof SignUpValues) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const shownError = (key: keyof SignUpValues) =>
    touched[key] ? errors[key] : undefined;

  const isValid = (key: keyof SignUpValues) =>
    Boolean(touched[key]) && !errors[key] && Boolean(values[key]);

  const strength = passwordStrength(values.password);
  const showStrength = mode === 'signup' && strengthMeter && values.password.length > 0;
  const isSubmitting = status === 'loading';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.keys(errors).length > 0) return;
    if (!onSubmit) return;

    if (statusProp === undefined) setInternalStatus('loading');
    try {
      await onSubmit(values);
      if (statusProp === undefined) setInternalStatus('success');
    } catch {
      if (statusProp === undefined) setInternalStatus('error');
    }
  };

  const termsErrorId = `${baseId}-terms-error`;
  const formErrorId = `${baseId}-form-error`;

  const defaultTitle = mode === 'signup' ? 'Create your account' : 'Welcome back';
  const defaultDesc =
    mode === 'signup'
      ? 'Start managing your wealth in under a minute.'
      : 'Sign in to access your sovereign Finance Hub.';
  const defaultSubmit = mode === 'signup' ? 'Create free account' : 'Sign in to धनMitr';

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full flex-col gap-3 sm:gap-3.5 transition-colors duration-200',
        className,
        classNames?.root
      )}
    >
      {/* Header with Smooth Animated Title & Description */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          className={cn('flex flex-col gap-0.5 text-center sm:text-left', classNames?.header)}
        >
          <h2
            className={cn(
              'text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white',
              classNames?.title
            )}
          >
            {title !== undefined ? title : defaultTitle}
          </h2>
          <p
            className={cn(
              'text-xs text-slate-500 dark:text-slate-400 font-medium',
              classNames?.description
            )}
          >
            {description !== undefined ? description : defaultDesc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Mode Switcher Tabs with Animated Sliding Pill */}
      {onModeChange && (
        <div className="relative grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => onModeChange('signin')}
            className={cn(
              'relative py-1.5 px-3 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 z-10',
              mode === 'signin'
                ? 'text-emerald-700 dark:text-emerald-300 font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {mode === 'signin' && (
              <motion.div
                layoutId="activeAuthModeTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200/60 dark:border-slate-700/60 -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            Sign In
          </button>
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className={cn(
              'relative py-1.5 px-3 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 z-10',
              mode === 'signup'
                ? 'text-emerald-700 dark:text-emerald-300 font-black'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="activeAuthModeTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200/60 dark:border-slate-700/60 -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            Create Account
          </button>
        </div>
      )}

      {/* Sign in with Google (Compact, High-Polish Green-Accent Button) */}
      {onGoogleSignIn && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={googleStatus === 'loading' || isSubmitting}
            className={cn(
              'group relative w-full flex items-center justify-center gap-2.5 px-3.5 py-2 sm:py-2.5',
              'rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.99]',
              'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200',
              'border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60',
              'hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs hover:shadow-emerald-500/10 hover:shadow-xs',
              (googleStatus === 'loading' || isSubmitting) && 'opacity-60 pointer-events-none'
            )}
          >
            {googleStatus === 'loading' ? (
              <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {googleStatus === 'loading'
                ? 'Connecting to Google...'
                : mode === 'signup'
                ? 'Sign up with Google'
                : 'Sign in with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2.5 my-0.5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* Form Fields with Smooth Directional Slide-Fade Animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'signup' ? 14 : -14, filter: 'blur(3px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: mode === 'signup' ? -14 : 14, filter: 'blur(3px)' }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn('flex flex-col gap-2', classNames?.fields)}
        >
          {mode === 'signup' && (
            <Input
              label="Full Name"
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              leftIcon={<User />}
              disabled={isSubmitting}
              value={values.name}
              onChange={(next: any) =>
                setValue('name', typeof next === 'string' ? next : next?.target?.value)
              }
              onBlur={() => touch('name')}
              error={shownError('name')}
              success={isValid('name')}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail />}
            disabled={isSubmitting}
            value={values.email}
            onChange={(next: any) =>
              setValue('email', typeof next === 'string' ? next : next?.target?.value)
            }
            onBlur={() => touch('email')}
            error={shownError('email')}
            success={isValid('email')}
          />

          {mode === 'signup' ? (
            /* Compact side-by-side Password and Confirm Password in Signup Mode */
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  label="Password"
                  type={revealPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 6 chars"
                  leftIcon={<Lock />}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      disabled={isSubmitting}
                      onClick={() => setRevealPassword((prev) => !prev)}
                      aria-label={revealPassword ? 'Hide password' : 'Show password'}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none"
                    >
                      {revealPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                  disabled={isSubmitting}
                  value={values.password}
                  onChange={(next: any) =>
                    setValue('password', typeof next === 'string' ? next : next?.target?.value)
                  }
                  onBlur={() => touch('password')}
                  error={shownError('password')}
                />

                <Input
                  label="Confirm"
                  type={revealConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  leftIcon={<Lock />}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      disabled={isSubmitting}
                      onClick={() => setRevealConfirmPassword((prev) => !prev)}
                      aria-label={revealConfirmPassword ? 'Hide password' : 'Show password'}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none"
                    >
                      {revealConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                  disabled={isSubmitting}
                  value={values.confirmPassword}
                  onChange={(next: any) =>
                    setValue('confirmPassword', typeof next === 'string' ? next : next?.target?.value)
                  }
                  onBlur={() => touch('confirmPassword')}
                  error={shownError('confirmPassword')}
                  success={isValid('confirmPassword')}
                />
              </div>

              {/* Compact Password Strength Meter */}
              <AnimatePresence initial={false}>
                {showStrength && (
                  <motion.div
                    initial={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
                    transition={{ duration: 0.16, ease: EASE_OUT }}
                    className={cn('flex flex-col gap-1 px-0.5 pt-0.5 overflow-hidden', classNames?.strength)}
                  >
                    <div className="flex gap-1" aria-hidden>
                      {[0, 1, 2, 3].map((index) => (
                        <span
                          key={index}
                          className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                        >
                          <motion.span
                            initial={false}
                            animate={{ scaleX: index < strength ? 1 : 0 }}
                            transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                            className={cn(
                              'block h-full w-full origin-left rounded-full transition-colors',
                              STRENGTH_COLORS[strength]
                            )}
                          />
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>Password strength:</span>
                      <span
                        className={cn(
                          'font-bold',
                          strength <= 1 && 'text-rose-500',
                          strength === 2 && 'text-amber-500',
                          strength >= 3 && 'text-emerald-500 dark:text-emerald-400'
                        )}
                      >
                        {STRENGTH_LABELS[strength]}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Single Password input in Sign In mode */
            <Input
              label="Password"
              type={revealPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              leftIcon={<Lock />}
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isSubmitting}
                  onClick={() => setRevealPassword((prev) => !prev)}
                  aria-label={revealPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none"
                >
                  {revealPassword ? <EyeOff /> : <Eye />}
                </button>
              }
              disabled={isSubmitting}
              value={values.password}
              onChange={(next: any) =>
                setValue('password', typeof next === 'string' ? next : next?.target?.value)
              }
              onBlur={() => touch('password')}
              error={shownError('password')}
            />
          )}

          {/* Terms and Conditions (Signup Mode only) */}
          {mode === 'signup' && (
            <div className={cn('flex flex-col gap-1 pt-0.5', classNames?.terms)}>
              <Checkbox
                checked={values.terms}
                disabled={isSubmitting}
                onCheckedChange={(next) => {
                  setValue('terms', next);
                  touch('terms');
                }}
                label={
                  <span className="text-[11px] leading-tight">
                    I agree to{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">
                      Terms
                    </span>{' '}
                    &{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">
                      Privacy Policy
                    </span>
                  </span>
                }
                aria-describedby={shownError('terms') ? termsErrorId : undefined}
              />
              <AnimatePresence initial={false}>
                {shownError('terms') && (
                  <motion.p
                    id={termsErrorId}
                    role="alert"
                    initial={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
                    transition={{ duration: 0.16 }}
                    className="px-0.5 text-[10px] font-semibold text-rose-500 dark:text-rose-400 overflow-hidden"
                  >
                    {shownError('terms')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Form Error Message */}
      <AnimatePresence initial={false}>
        {errorMessage && (
          <motion.p
            id={formErrorId}
            role="alert"
            initial={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
            transition={{ duration: 0.16 }}
            className="rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 overflow-hidden"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Stateful Green Submit Button */}
      <StatefulButton
        type="submit"
        size="md"
        state={status}
        loadingText={mode === 'signup' ? 'Creating account...' : 'Signing in...'}
        successText={mode === 'signup' ? 'Account created!' : 'Signed in!'}
        errorText="Try again"
        aria-describedby={errorMessage ? formErrorId : undefined}
        className={cn(
          'w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer select-none transition-all duration-200 mt-1',
          'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
          'shadow-md shadow-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99]',
          classNames?.submit
        )}
      >
        {submitLabel || defaultSubmit}
      </StatefulButton>

      {/* Footer Switcher */}
      {footer !== undefined ? (
        footer
      ) : onModeChange ? (
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signin')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signup')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Create one free
              </button>
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
