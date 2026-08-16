"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, Mic, ShieldCheck, TrendingUp, ArrowRight, Zap, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Next-Gen AI Personal Finance Assistant
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Master Your Wealth with <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Intelligent AI Advisory
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          DhanMITR gives you real-time net worth tracking, automated tax optimization, budget insights, and conversational voice guidance tailored to your goals.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Launch Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/chat">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Try AI Chat
            </Button>
          </Link>

          <Link href="/voice">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
              <Mic className="h-4 w-4 text-amber-500" />
              Voice Demo
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <Card className="hover:border-emerald-500/50 transition-all">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Net Worth & Cashflow</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Track assets, liabilities, and monthly surplus automatically categorized with health scores.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/50 transition-all">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Tax Optimization</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Compare Old vs New Tax Regime deductions, 80C/80D allowances, and tax-saving investments.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/50 transition-all">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 mb-4">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Voice Financial Assistant</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Speak naturally with ultra low-latency STT/TTS pipeline for on-the-go financial inquiries.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/50 transition-all">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Goal Projections</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Automate monthly contributions toward emergency reserves, real estate, and retirement goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
