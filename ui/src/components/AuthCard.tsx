"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { AuthWaveVisual } from "./AuthWaveVisual";
import { SpecularButton } from "./ui/SpecularButton";

interface AuthCardProps {
  initialMode?: "signin" | "signup";
}

export function AuthCard({ initialMode = "signin" }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 600);
  };

  const handleGuestSignIn = () => {
    router.push("/");
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] grid grid-cols-1 md:grid-cols-2 min-h-[540px] sm:min-h-[600px]">
      {/* LEFT PANEL — Dark with particle wave and bright white text */}
      <div className="relative p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[240px] md:min-h-full">
        <AuthWaveVisual />

        {/* Brand Logo on dark bg — white text */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
            <Logo size={36} showText={false} />
            <span className="text-lg font-extrabold tracking-tight text-white">DhanMITR</span>
          </Link>
        </div>

        {/* Hero Tagline — bright white on dark */}
        <div className="relative z-10 mt-auto pt-12 md:pt-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Your personal <br />
            finance companion
          </h2>
          <p className="text-sm text-slate-300 mt-2.5 font-medium leading-relaxed">
            AI-powered voice & chat advisory for savings, loans, and government schemes.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Sign In / Sign Up Form */}
      <div className="p-6 sm:p-10 flex flex-col justify-center bg-white">
        <div className="max-w-sm w-full mx-auto space-y-5">
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {mode === "signin"
                ? "Enter your credentials to access DhanMITR"
                : "Start your AI financial advisory journey"}
            </p>
          </div>

          {/* Sign in with Google */}
          <button
            type="button"
            onClick={handleGuestSignIn}
            className="w-full h-12 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98] touch-manipulation"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="absolute bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">or</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-4 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            <div className="pt-1">
              <SpecularButton
                type="submit"
                size="md"
                radius={14}
                tint="#0f172a"
                tintOpacity={1}
                lineColor="#475569"
                textColor="#ffffff"
                disabled={loading}
                className="w-full h-12 font-bold text-sm"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              </SpecularButton>
            </div>
          </form>

          {/* Footer links */}
          <div className="text-center space-y-2.5 pt-1 text-sm">
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => alert("Password reset link will be sent to your registered email.")}
                className="text-slate-500 hover:text-slate-900 font-medium transition-colors text-xs"
              >
                Forgot password?
              </button>
            )}

            <div className="text-slate-500 text-xs font-medium">
              {mode === "signin" ? (
                <>
                  No account?{" "}
                  <button type="button" onClick={() => setMode("signup")} className="text-slate-900 font-bold hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("signin")} className="text-slate-900 font-bold hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleGuestSignIn}
                className="text-xs text-slate-400 hover:text-emerald-700 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Continue as Guest Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
