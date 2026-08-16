"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "./ui/button";
import { Sparkles, MessageSquare, Mic, LayoutDashboard, Receipt, BarChart3, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span>Dhan<span className="text-emerald-600">MITR</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-600" />
              Dashboard
            </Link>

            <Link
              href="/chat"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/chat"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
              }`}
            >
              <MessageSquare className="h-4 w-4 text-blue-500" />
              AI Assistant
            </Link>

            <Link
              href="/voice"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/voice"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
              }`}
            >
              <Mic className="h-4 w-4 text-amber-500" />
              Voice Mode
            </Link>

            <Link
              href="/transactions"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/transactions"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
              }`}
            >
              <Receipt className="h-4 w-4 text-purple-500" />
              Transactions
            </Link>

            <Link
              href="/insights"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/insights"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Insights
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/onboarding">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                  Onboarding Wizard
                </Button>
              </Link>
              <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  {user.name ? user.name[0] : "U"}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
