"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  IndianRupee,
  ShoppingBag,
  Home as HomeIcon,
  Shield,
  Film,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Bell,
  Zap,
  RotateCcw,
  Sliders,
  X,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Lightbulb,
  Target,
  FileText,
  Settings,
  RefreshCw,
  ChevronRight,
  User,
  MoreHorizontal,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { DonutChart, CashFlowLineChart } from "@/components/Charts";
import { UserFinancialProfile, SubscriptionItem, InsuranceItem } from "@/types";
import {
  DEFAULT_DEMO_PROFILE,
  loadUserProfile,
  saveUserProfile,
  calculateFinancialSummary,
  generatePersonalizedInsights,
} from "@/lib/userProfile";

export default function AdminFinancePage() {
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_DEMO_PROFILE);
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "insurances" | "budget">("overview");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);
  const [editingIns, setEditingIns] = useState<InsuranceItem | null>(null);
  const [mobileNav, setMobileNav] = useState<"home" | "insights" | "transactions" | "profile">("home");

  // Budget form
  const [income, setIncome] = useState<number>(65000);
  const [food, setFood] = useState<number>(12000);
  const [rent, setRent] = useState<number>(16000);
  const [otherDaily, setOtherDaily] = useState<number>(5000);

  // New sub form
  const [newSubName, setNewSubName] = useState("");
  const [newSubCost, setNewSubCost] = useState("");
  const [newSubCycle, setNewSubCycle] = useState<"monthly" | "yearly">("monthly");
  const [newSubRenewal, setNewSubRenewal] = useState("2026-08-25");

  // New insurance form
  const [newInsName, setNewInsName] = useState("");
  const [newInsCost, setNewInsCost] = useState("");
  const [newInsExpiry, setNewInsExpiry] = useState("2026-08-28");
  const [newInsCategory, setNewInsCategory] = useState<InsuranceItem["category"]>("health");

  useEffect(() => {
    const loaded = loadUserProfile();
    setProfile(loaded);
    setIncome(loaded.monthlyIncome);
    setFood(loaded.foodGroceries);
    setRent(loaded.rentUtilities);
    setOtherDaily(loaded.otherDailyExpenses);
  }, []);

  const triggerSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...profile, monthlyIncome: Number(income), foodGroceries: Number(food), rentUtilities: Number(rent), otherDailyExpenses: Number(otherDaily) };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSave();
  };

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCost) return;
    const item: SubscriptionItem = { id: "sub-" + Date.now(), name: newSubName.trim(), category: "ott", cost: Number(newSubCost), billingCycle: newSubCycle, renewalDate: newSubRenewal, active: true };
    const updated = { ...profile, subscriptions: [item, ...profile.subscriptions] };
    setProfile(updated);
    saveUserProfile(updated);
    setNewSubName("");
    setNewSubCost("");
    triggerSave();
  };

  const handleSaveEditedSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    const updated = { ...profile, subscriptions: profile.subscriptions.map((s) => (s.id === editingSub.id ? editingSub : s)) };
    setProfile(updated);
    saveUserProfile(updated);
    setEditingSub(null);
    triggerSave();
  };

  const handleDeleteSub = (id: string) => {
    const updated = { ...profile, subscriptions: profile.subscriptions.filter((s) => s.id !== id) };
    setProfile(updated);
    saveUserProfile(updated);
    if (editingSub?.id === id) setEditingSub(null);
    triggerSave();
  };

  const handleToggleSub = (id: string) => {
    const updated = { ...profile, subscriptions: profile.subscriptions.map((s) => (s.id === id ? { ...s, active: !s.active } : s)) };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSave();
  };

  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsName.trim() || !newInsCost) return;
    const item: InsuranceItem = { id: "ins-" + Date.now(), name: newInsName.trim(), category: newInsCategory, amount: Number(newInsCost), frequency: "yearly", expiryDate: newInsExpiry, status: "expiring_soon" };
    const updated = { ...profile, insurances: [item, ...profile.insurances] };
    setProfile(updated);
    saveUserProfile(updated);
    setNewInsName("");
    setNewInsCost("");
    triggerSave();
  };

  const handleSaveEditedIns = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIns) return;
    const updated = { ...profile, insurances: profile.insurances.map((i) => (i.id === editingIns.id ? editingIns : i)) };
    setProfile(updated);
    saveUserProfile(updated);
    setEditingIns(null);
    triggerSave();
  };

  const handleDeleteIns = (id: string) => {
    const updated = { ...profile, insurances: profile.insurances.filter((i) => i.id !== id) };
    setProfile(updated);
    saveUserProfile(updated);
    if (editingIns?.id === id) setEditingIns(null);
    triggerSave();
  };

  const handleResetDemo = () => {
    saveUserProfile(DEFAULT_DEMO_PROFILE);
    setProfile(DEFAULT_DEMO_PROFILE);
    setIncome(DEFAULT_DEMO_PROFILE.monthlyIncome);
    setFood(DEFAULT_DEMO_PROFILE.foodGroceries);
    setRent(DEFAULT_DEMO_PROFILE.rentUtilities);
    setOtherDaily(DEFAULT_DEMO_PROFILE.otherDailyExpenses);
    triggerSave();
  };

  const summary = calculateFinancialSummary(profile);
  const insights = generatePersonalizedInsights(profile);

  // Chart data
  const spendingSegments = [
    { label: "Housing", value: profile.rentUtilities, color: "#10b981" },
    { label: "Investments", value: 8500, color: "#6366f1" },
    { label: "Bills & Utilities", value: 6200, color: "#f59e0b" },
    { label: "Subscriptions", value: summary.monthlySubCost, color: "#ef4444" },
    { label: "Insurance", value: summary.monthlyInsuranceCost, color: "#8b5cf6" },
    { label: "Others", value: profile.otherDailyExpenses, color: "#94a3b8" },
  ];

  const cashFlowIncome = [42000, 48000, 45000, 52000, 58000, 65000];
  const cashFlowExpense = [35000, 38000, 36000, 40000, 42000, summary.totalOutflow];
  const cashFlowLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Finance Hub", active: true, href: "/admin" },
    { icon: MessageSquare, label: "AI Companion", active: false, href: "/" },
    { icon: Receipt, label: "Transactions", active: false, href: "/admin" },
    { icon: Lightbulb, label: "Insights", active: false, href: "/admin" },
    { icon: Target, label: "Goals", active: false, href: "/admin" },
    { icon: FileText, label: "Reports", active: false, href: "/admin" },
    { icon: FileText, label: "Documents", active: false, href: "/admin" },
  ];

  const subIconColors: Record<string, string> = {
    Netflix: "bg-red-600 text-white",
    "Amazon Prime": "bg-slate-900 text-white",
    Spotify: "bg-emerald-500 text-white",
    "Disney+": "bg-blue-700 text-white",
    "Disney+ Hotstar": "bg-blue-700 text-white",
    "JioCinema": "bg-pink-600 text-white",
    Gym: "bg-orange-500 text-white",
  };
  const subIconLetters: Record<string, string> = {
    Netflix: "N",
    "Amazon Prime": "a",
    Spotify: "S",
    "Disney+ Hotstar": "D",
    "JioCinema": "J",
    Gym: "G",
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-white border-r border-slate-200/80 fixed inset-y-0 left-0 z-20">
        {/* Brand */}
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-100">
          <Logo size={28} showText={false} />
          <span className="text-base font-extrabold tracking-tight text-slate-900">DhanMITR</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                item.active
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.active ? "text-emerald-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Premium Insights Card */}
        <div className="mx-3 mb-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-900">Premium Insights</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
            You&apos;re saving ₹6,500 more than last month. Keep it up!
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[28, 22, 18, 24, 30, 26, 34].map((h, i) => (
                <div key={i} className="w-3 rounded-full bg-emerald-300" style={{ height: h }} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">+18%</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-2">
          <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>
          <div className="flex items-center gap-2 px-3">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
              <Settings className="w-3 h-3 text-slate-500" />
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 lg:ml-[220px] pb-24 lg:pb-6">
        {/* ===== TOP HEADER ===== */}
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="p-1 -ml-1">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <Logo size={24} showText={false} />
            <span className="text-sm font-extrabold text-slate-900">DhanMITR</span>
          </div>
          <button className="relative p-1.5">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-slate-200/80 px-6 h-16 items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Finance Hub <Sparkles className="w-5 h-5 text-emerald-500" />
            </h1>
            <p className="text-xs text-slate-400 font-medium -mt-0.5">Complete overview of your financial life</p>
          </div>
          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button onClick={handleResetDemo} className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-all">
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Sync</span>
            </button>
            <button className="relative p-1.5">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">R</div>
              <span className="text-xs font-bold text-slate-900">{profile.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 lg:px-6 py-4 lg:py-5 space-y-5 max-w-[1100px]">
          {/* Mobile Title */}
          <div className="lg:hidden">
            <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
              Finance Hub <Sparkles className="w-4 h-4 text-emerald-500" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Your complete financial overview</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar border-b border-slate-200">
            {[
              { key: "overview" as const, label: "Overview" },
              { key: "subscriptions" as const, label: `OTT & Subscriptions`, count: profile.subscriptions.length },
              { key: "insurances" as const, label: "Insurances", count: profile.insurances.length },
              { key: "budget" as const, label: "Budget & Income" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 lg:px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Mobile: Hero surplus card */}
              <div className="lg:hidden bg-emerald-500 rounded-2xl p-4 text-white relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-90">Net Monthly Surplus</span>
                  <button className="p-1 rounded-lg bg-white/15"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <div className="text-2xl font-extrabold mt-1">₹{summary.netSurplus.toLocaleString()}</div>
                <div className="text-[11px] opacity-80 mt-0.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{summary.savingsRate}% vs last month</span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Monthly Income</span>
                  <span className="text-lg lg:text-xl font-extrabold text-slate-900">₹{profile.monthlyIncome.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">Take-home salary</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-2">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Total Outflow / Mo</span>
                  <span className="text-lg lg:text-xl font-extrabold text-slate-900">₹{summary.totalOutflow.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">Living + Bills + Insurance</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Net Monthly Surplus</span>
                  <span className="text-lg lg:text-xl font-extrabold text-emerald-700">₹{summary.netSurplus.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">{summary.savingsRate}% Savings Rate</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Active Services</span>
                  <span className="text-lg lg:text-xl font-extrabold text-slate-900">
                    {profile.subscriptions.filter((s) => s.active).length} OTT • {profile.insurances.length} Ins.
                  </span>
                  <span className="text-[10px] text-slate-400 block">Monitored by AI</span>
                </div>
              </div>

              {/* Charts Row: Donut + Line */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Spending Overview */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Spending Overview</h3>
                    <span className="text-[11px] text-slate-400 font-medium border border-slate-200 rounded-lg px-2 py-0.5">This Month</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <DonutChart segments={spendingSegments} total={summary.totalOutflow} size={180} />
                    <div className="space-y-2 flex-1">
                      {spendingSegments.map((seg) => (
                        <div key={seg.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-xs text-slate-600 font-medium">{seg.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">₹{seg.value.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 w-10 text-right">{((seg.value / summary.totalOutflow) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cash Flow Trend */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Cash Flow Trend</h3>
                    <span className="text-[11px] text-slate-400 font-medium border border-slate-200 rounded-lg px-2 py-0.5">This 6 Months</span>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span className="w-3 h-0.5 bg-emerald-500 rounded" /> Income
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span className="w-3 h-0.5 bg-slate-400 rounded border-dashed" style={{ borderBottom: "1px dashed #94a3b8" }} /> Expense
                    </span>
                  </div>
                  <CashFlowLineChart
                    incomeData={cashFlowIncome}
                    expenseData={cashFlowExpense}
                    labels={cashFlowLabels}
                    surplus={summary.netSurplus}
                    width={420}
                    height={200}
                  />
                </div>
              </div>

              {/* AI Insight (mobile) */}
              <div className="lg:hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">AI Insight</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">+18%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                    Great job! You saved ₹6,500 more than last month. Keep it up!
                  </p>
                </div>
              </div>

              {/* Upcoming Renewals & Alerts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Renewals & Alerts</h3>
                  <button onClick={() => setActiveTab("subscriptions")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {summary.upcomingRenewals.slice(0, 4).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        item.type === "subscription"
                          ? (subIconColors[item.name] || "bg-slate-200 text-slate-700")
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {item.type === "subscription" ? (subIconLetters[item.name] || item.name[0]) : <Shield className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                          {item.urgent && (
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Urgent</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          Due: {item.date} (in {item.daysLeft} days)
                        </span>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-extrabold text-slate-900">₹{item.cost.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-medium capitalize">{item.billingCycle}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== SUBSCRIPTIONS TAB ===== */}
          {activeTab === "subscriptions" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Manage Subscriptions & OTT</h3>
                    <p className="text-xs text-slate-400">Active monthly outflow: <strong className="text-slate-700">₹{summary.monthlySubCost.toLocaleString()}/mo</strong></p>
                  </div>
                </div>

                <form onSubmit={handleAddSubscription} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Add New Subscription</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input type="text" placeholder="Platform name" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900" />
                    <input type="number" placeholder="₹ Cost" value={newSubCost} onChange={(e) => setNewSubCost(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900" />
                    <select value={newSubCycle} onChange={(e) => setNewSubCycle(e.target.value as "monthly" | "yearly")} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900">
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input type="date" value={newSubRenewal} onChange={(e) => setNewSubRenewal(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
                  </div>
                </form>

                <div className="space-y-2">
                  {profile.subscriptions.map((s) => (
                    <div key={s.id} className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${s.active ? "bg-white border-slate-200/80" : "bg-slate-50 opacity-60 border-slate-200/50"}`}>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => handleToggleSub(s.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${s.active ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 bg-white"}`}>
                          {s.active && "✓"}
                        </button>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${subIconColors[s.name] || "bg-slate-200 text-slate-700"}`}>
                          {subIconLetters[s.name] || s.name[0]}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{s.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">Renewal: <strong className="text-slate-600">{s.renewalDate}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">₹{s.cost.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 uppercase block">/{s.billingCycle}</span>
                        </div>
                        <button type="button" onClick={() => setEditingSub(s)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"><Edit3 className="w-4 h-4" /></button>
                        <button type="button" onClick={() => handleDeleteSub(s.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== INSURANCES TAB ===== */}
          {activeTab === "insurances" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Insurance & Protection Portfolio</h3>
                  <p className="text-xs text-slate-400">Health, Term Life, PMSBY & Vehicle policies</p>
                </div>

                <form onSubmit={handleAddInsurance} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Add Insurance Policy</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" placeholder="Policy Name" value={newInsName} onChange={(e) => setNewInsName(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900" />
                    <input type="number" placeholder="₹ Annual Premium" value={newInsCost} onChange={(e) => setNewInsCost(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900" />
                    <input type="date" value={newInsExpiry} onChange={(e) => setNewInsExpiry(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Policy</button>
                  </div>
                </form>

                <div className="space-y-2">
                  {profile.insurances.map((ins) => (
                    <div key={ins.id} className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4" /></div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{ins.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">Expires: <strong className="text-slate-600">{ins.expiryDate}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">₹{ins.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 uppercase block">/{ins.frequency}</span>
                        </div>
                        <button type="button" onClick={() => setEditingIns(ins)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"><Edit3 className="w-4 h-4" /></button>
                        <button type="button" onClick={() => handleDeleteIns(ins.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== BUDGET TAB ===== */}
          {activeTab === "budget" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <form onSubmit={handleUpdateBudget} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Monthly Income & Living Budget</h3>
                  <p className="text-xs text-slate-400">Keep AI calculations accurate with updated numbers</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Monthly Income</label>
                    <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><ShoppingBag className="w-3.5 h-3.5 text-slate-600" /> Food & Groceries</label>
                    <input type="number" value={food} onChange={(e) => setFood(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><HomeIcon className="w-3.5 h-3.5 text-slate-600" /> Rent & Utilities</label>
                    <input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><Sliders className="w-3.5 h-3.5 text-slate-600" /> Other Daily Expenses</label>
                    <input type="number" value={otherDaily} onChange={(e) => setOtherDaily(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-sm">Save Budget</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200/80">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          {[
            { key: "home" as const, icon: HomeIcon, label: "Home" },
            { key: "insights" as const, icon: Lightbulb, label: "Insights" },
            { key: "transactions" as const, icon: Receipt, label: "Transactions" },
            { key: "profile" as const, icon: User, label: "Profile" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMobileNav(item.key);
                if (item.key === "home") setActiveTab("overview");
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                mobileNav === item.key ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {item.key === "insights" ? (
                <div className={`w-10 h-10 -mt-4 rounded-full flex items-center justify-center shadow-md ${mobileNav === item.key ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"}`}>
                  <item.icon className="w-5 h-5" />
                </div>
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ===== EDIT SUBSCRIPTION MODAL ===== */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Subscription</h3>
              <button type="button" onClick={() => setEditingSub(null)} className="text-slate-400 hover:text-slate-900 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveEditedSub} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Name</label>
                <input type="text" value={editingSub.name} onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })} required className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost (₹)</label>
                  <input type="number" value={editingSub.cost} onChange={(e) => setEditingSub({ ...editingSub, cost: Number(e.target.value) })} required className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cycle</label>
                  <select value={editingSub.billingCycle} onChange={(e) => setEditingSub({ ...editingSub, billingCycle: e.target.value as "monthly" | "yearly" })} className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Renewal Date</label>
                <input type="date" value={editingSub.renewalDate} onChange={(e) => setEditingSub({ ...editingSub, renewalDate: e.target.value })} className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900" />
              </div>
              <div className="pt-2 flex justify-between">
                <button type="button" onClick={() => handleDeleteSub(editingSub.id)} className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingSub(null)} className="h-10 px-4 rounded-lg text-slate-500 text-xs font-semibold">Cancel</button>
                  <button type="submit" className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-sm">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT INSURANCE MODAL ===== */}
      {editingIns && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Insurance Policy</h3>
              <button type="button" onClick={() => setEditingIns(null)} className="text-slate-400 hover:text-slate-900 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveEditedIns} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Policy Name</label>
                <input type="text" value={editingIns.name} onChange={(e) => setEditingIns({ ...editingIns, name: e.target.value })} required className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Annual Premium (₹)</label>
                  <input type="number" value={editingIns.amount} onChange={(e) => setEditingIns({ ...editingIns, amount: Number(e.target.value) })} required className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select value={editingIns.category} onChange={(e) => setEditingIns({ ...editingIns, category: e.target.value as InsuranceItem["category"] })} className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900">
                    <option value="health">Health</option>
                    <option value="life">Term Life</option>
                    <option value="government">Government</option>
                    <option value="vehicle">Vehicle</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
                <input type="date" value={editingIns.expiryDate} onChange={(e) => setEditingIns({ ...editingIns, expiryDate: e.target.value })} className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900" />
              </div>
              <div className="pt-2 flex justify-between">
                <button type="button" onClick={() => handleDeleteIns(editingIns.id)} className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingIns(null)} className="h-10 px-4 rounded-lg text-slate-500 text-xs font-semibold">Cancel</button>
                  <button type="submit" className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-sm">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
