"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInAsGuest();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your DhanMITR financial dashboard</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={signInWithGoogle}
            className="w-full gap-2 border-slate-300 dark:border-slate-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
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
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase">Or</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">
              Sign In
            </Button>
          </form>

          <Button
            variant="secondary"
            onClick={() => {
              signInAsGuest();
              router.push("/dashboard");
            }}
            className="w-full text-xs"
          >
            ⚡ One-Click Demo Guest Sign In
          </Button>
        </CardContent>

        <CardFooter className="text-center justify-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-emerald-600 font-semibold ml-1 hover:underline">
            Sign Up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
