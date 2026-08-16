"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
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
    // Simulate auth and redirect to main assistant
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 600);
  };

  const handleGuestSignIn = () => {
    router.push("/");
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] overflow-hidden bg-white border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.07)] grid grid-cols-1 md:grid-cols-2 min-h-[580px] sm:min-h-[620px]">
      {/* LEFT PANEL: Generative Wave Visual & Brand Showcase */}
      <div className="relative p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[280px] md:min-h-full border-b md:border-b-0 md:border-r border-slate-100">
        {/* Procedural Wave Canvas */}
        <AuthWaveVisual />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Logo size={38} showText={true} />
          </Link>
        </div>

        {/* Bottom: Hero Tagline */}
        <div className="relative z-10 mt-auto pt-16 md:pt-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Your personal <br />
            financial intelligence & AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            Next-generation personal wealth advisory with voice and conversational intelligence.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Sign In / Sign Up Form */}
      <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
        <div className="max-w-sm w-full mx-auto space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === "signin"
                ? "Enter your credentials to access DhanMITR"
                : "Get started with AI-powered financial advisory"}
            </p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-2.5">
            {/* Sign in with Apple */}
            <button
              type="button"
              onClick={handleGuestSignIn}
              className="w-full h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98]"
            >
              {/* Apple SVG Icon */}
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.62-7.85-11.77-14.41-6.41-10.23-11.42-21.75-15.04-34.56-3.61-12.82-5.42-24.81-5.42-35.98 0-14.7 3.7-26.9 11.1-36.6 7.4-9.71 16.73-14.67 27.99-14.9 4.8 0 10.03 1.25 15.71 3.75 5.68 2.5 9.77 3.75 12.28 3.75 1.94 0 6.07-1.32 12.41-3.96 6.34-2.64 11.75-3.79 16.23-3.46 17.58 1.1 30.68 8.42 39.31 21.96-15.68 9.5-23.36 22.3-23.03 38.39.33 12.48 4.97 22.95 13.92 31.42 4.02 3.86 8.56 6.79 13.62 8.78-3.04 8.89-6.9 17.65-11.59 26.28zM119.22 31.84c0-7.72 2.76-14.93 8.27-21.64 5.51-6.71 12.38-10.2 20.61-10.47.11 1.09.16 2.06.16 2.92 0 7.6-2.92 15.02-8.76 22.26-5.84 7.24-12.89 11.12-21.14 11.64-.11-1.3-.14-2.87-.14-4.71z" />
              </svg>
              <span>Sign in with Apple</span>
            </button>

            {/* Sign in with Google */}
            <button
              type="button"
              onClick={handleGuestSignIn}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-[0.98]"
            >
              {/* Google Multi-color SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Thin Divider with "or" */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200/80 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <SpecularButton
                type="submit"
                size="md"
                radius={14}
                tint="#0f172a"
                tintOpacity={1}
                lineColor="#475569"
                textColor="#ffffff"
                disabled={loading}
                className="w-full h-11 font-bold text-xs sm:text-sm"
              >
                {loading
                  ? "Authenticating..."
                  : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              </SpecularButton>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center space-y-2 pt-1 text-xs">
            {mode === "signin" && (
              <div>
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your registered email.")}
                  className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="text-slate-500 font-medium">
              {mode === "signin" ? (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-slate-900 font-bold hover:underline ml-1"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-slate-900 font-bold hover:underline ml-1"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            {/* Quick Demo Guest Login */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGuestSignIn}
                className="text-[11px] text-slate-400 hover:text-emerald-700 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Continue as Guest Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
