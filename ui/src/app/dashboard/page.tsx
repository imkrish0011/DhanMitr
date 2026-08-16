"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MOCK_USER_PROFILE,
  MOCK_CASHFLOW_HISTORY,
  MOCK_SPENDING_BREAKDOWN,
  MOCK_TRANSACTIONS,
  MOCK_GOALS,
} from "@/lib/mockData";
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#6B7280"];

export default function DashboardPage() {
  const [profile, setProfile] = useState(MOCK_USER_PROFILE);
  const netWorth = profile.total_investments + profile.emergency_fund_balance - profile.total_liabilities;
  const savings = profile.monthly_income - profile.monthly_expenses;
  const savingsRate = Math.round((savings / profile.monthly_income) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here is your real-time financial health pulse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Sparkles className="h-4 w-4" /> Ask AI Advisor
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Net Worth"
          value={formatCurrency(netWorth)}
          subtitle="Assets minus liabilities"
          change={{ value: "+4.8% this month", isPositive: true }}
          icon={<Wallet className="h-5 w-5 text-emerald-600" />}
        />
        <MetricCard
          title="Monthly Surplus"
          value={formatCurrency(savings)}
          subtitle={`Income: ${formatCurrency(profile.monthly_income)}`}
          change={{ value: `${savingsRate}% savings rate`, isPositive: true }}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        />
        <MetricCard
          title="Emergency Cushion"
          value={formatCurrency(profile.emergency_fund_balance)}
          subtitle="6.2 months runway"
          change={{ value: "Fully Funded", isPositive: true }}
          icon={<ShieldCheck className="h-5 w-5 text-purple-600" />}
        />
        <MetricCard
          title="Total Liabilities"
          value={formatCurrency(profile.total_liabilities)}
          subtitle="Credit & loans"
          change={{ value: "Low DTI ratio (0.06)", isPositive: true }}
          icon={<Percent className="h-5 w-5 text-amber-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Cashflow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Cash Flow Trends</CardTitle>
              <p className="text-xs text-slate-500">6-Month Income, Expenses & Savings</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CASHFLOW_HISTORY}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Category Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Spending by Category</CardTitle>
            <p className="text-xs text-slate-500">Current month distribution</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_SPENDING_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {MOCK_SPENDING_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {MOCK_SPENDING_BREAKDOWN.slice(0, 3).map((item, idx) => (
                <div key={item.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="capitalize text-slate-700 dark:text-slate-300">{item.category}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Transactions & Financial Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/transactions" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(tx.date)} • {tx.account_name}</p>
                </div>
                <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-slate-900 dark:text-white"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Financial Goals</CardTitle>
            <Link href="/onboarding" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              Adjust Goals <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_GOALS.map((goal) => {
              const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{goal.title}</span>
                    <span className="text-slate-500">{progress}% ({formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
