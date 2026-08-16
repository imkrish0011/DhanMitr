"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Home as HomeIcon,
  Shield,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  Sliders,
  X,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { DonutChart, CashFlowLineChart, SpendingSegment } from "@/components/Charts";
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
  const [timeRange, setTimeRange] = useState<"month" | "3months" | "6months" | "year">("month");
  const [trendRange, setTrendRange] = useState<"3months" | "6months" | "year">("6months");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);
  const [editingIns, setEditingIns] = useState<InsuranceItem | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<SpendingSegment | null>(null);

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
    const updated = {
      ...profile,
      monthlyIncome: Number(income),
      foodGroceries: Number(food),
      rentUtilities: Number(rent),
      otherDailyExpenses: Number(otherDaily),
    };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSave();
  };

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCost) return;
    const item: SubscriptionItem = {
      id: "sub-" + Date.now(),
      name: newSubName.trim(),
      category: "ott",
      cost: Number(newSubCost),
      billingCycle: newSubCycle,
      renewalDate: newSubRenewal,
      active: true,
    };
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
    const updated = {
      ...profile,
      subscriptions: profile.subscriptions.map((s) => (s.id === editingSub.id ? editingSub : s)),
    };
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
    const updated = {
      ...profile,
      subscriptions: profile.subscriptions.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSave();
  };

  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsName.trim() || !newInsCost) return;
    const item: InsuranceItem = {
      id: "ins-" + Date.now(),
      name: newInsName.trim(),
      category: newInsCategory,
      amount: Number(newInsCost),
      frequency: "yearly",
      expiryDate: newInsExpiry,
      status: "expiring_soon",
    };
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
    const updated = {
      ...profile,
      insurances: profile.insurances.map((i) => (i.id === editingIns.id ? editingIns : i)),
    };
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

  // Spending Donut Segments
  const spendingSegments: SpendingSegment[] = [
    { label: "Housing & Rent", value: profile.rentUtilities, color: "#10b981" },
    { label: "Investments", value: 8500, color: "#6366f1" },
    { label: "Food & Groceries", value: profile.foodGroceries, color: "#f59e0b" },
    { label: "Subscriptions", value: summary.monthlySubCost, color: "#ef4444" },
    { label: "Insurance", value: summary.monthlyInsuranceCost, color: "#8b5cf6" },
    { label: "Other Living", value: profile.otherDailyExpenses, color: "#94a3b8" },
  ];

  // Trendline Chart Data based on range
  const cashFlowIncome =
    trendRange === "3months"
      ? [52000, 58000, profile.monthlyIncome]
      : trendRange === "year"
      ? [38000, 40000, 42000, 48000, 45000, 52000, 55000, 58000, 60000, 62000, 63000, profile.monthlyIncome]
      : [42000, 48000, 45000, 52000, 58000, profile.monthlyIncome];

  const cashFlowExpense =
    trendRange === "3months"
      ? [40000, 42000, summary.totalOutflow]
      : trendRange === "year"
      ? [32000, 33000, 35000, 38000, 36000, 40000, 41000, 42000, 39000, 41000, 40000, summary.totalOutflow]
      : [35000, 38000, 36000, 40000, 42000, summary.totalOutflow];

  const cashFlowLabels =
    trendRange === "3months"
      ? ["May", "Jun", "Jul"]
      : trendRange === "year"
      ? ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
      : ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  // Clean Sidebar Navigation (Without extra goals, insights, reports, documents)
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Finance Hub", active: true, href: "/admin" },
    { icon: MessageSquare, label: "AI Companion", active: false, href: "/" },
    { icon: Receipt, label: "Transactions", active: false, href: "/admin" },
  ];

  const subIconColors: Record<string, string> = {
    Netflix: "bg-red-600 text-white",
    "Amazon Prime": "bg-slate-900 text-white",
    Spotify: "bg-emerald-500 text-white",
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col">
      {/* Universal Top Navbar */}
      <Navbar
        onSync={handleResetDemo}
        userName={profile.name}
        showBack={true}
      />

      <div className="flex-1 flex">
        {/* ===== CLEAN DESKTOP SIDEBAR ===== */}
        <aside className="hidden lg:flex flex-col w-[230px] bg-white border-r border-slate-200/80 sticky top-15 h-[calc(100vh-60px)] z-20">
          <nav className="flex-1 px-3 py-5 space-y-1.5">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700 shadow-2xs"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.active ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Clean Settings Link at Bottom (No extra circle buttons) */}
          <div className="p-3 border-t border-slate-100">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>
          </div>
        </aside>

        {/* ===== MAIN CONTENT CONTAINER ===== */}
        <main className="flex-1 pb-24 lg:pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Finance Hub</span>
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Complete interactive overview and management of your personal finances
                </p>
              </div>

              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Data Updated
                </span>
              )}
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200">
              {[
                { key: "overview" as const, label: "Overview" },
                { key: "subscriptions" as const, label: "OTT & Subscriptions", count: profile.subscriptions.length },
                { key: "insurances" as const, label: "Insurances", count: profile.insurances.length },
                { key: "budget" as const, label: "Budget & Income" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === tab.key
                      ? "border-emerald-500 text-slate-900 font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ===== TAB 1: OVERVIEW ===== */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Mobile Hero Surplus Gradient Card */}
                <div className="lg:hidden bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-100">Net Monthly Surplus</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("budget")}
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="text-3xl font-black tracking-tight mt-1.5">
                    ₹{summary.netSurplus.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-100 font-medium mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{summary.savingsRate}% monthly savings rate</span>
                  </div>
                </div>

                {/* 4 Interactive Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Card 1: Monthly Income */}
                  <div
                    onClick={() => setActiveTab("budget")}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Monthly Income
                    </span>
                    <span className="text-lg lg:text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      ₹{profile.monthlyIncome.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">Take-home salary</span>
                  </div>

                  {/* Card 2: Total Outflow */}
                  <div
                    onClick={() => setActiveTab("budget")}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-red-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Total Outflow / Mo
                    </span>
                    <span className="text-lg lg:text-xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                      ₹{summary.totalOutflow.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">Living + Bills + Insurance</span>
                  </div>

                  {/* Card 3: Net Surplus */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                      Net Monthly Surplus
                    </span>
                    <span className="text-lg lg:text-xl font-extrabold text-emerald-700">
                      ₹{summary.netSurplus.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      {summary.savingsRate}% Savings Rate
                    </span>
                  </div>

                  {/* Card 4: Active Services */}
                  <div
                    onClick={() => setActiveTab("subscriptions")}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Active Services
                    </span>
                    <span className="text-lg lg:text-xl font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                      {profile.subscriptions.filter((s) => s.active).length} OTT • {profile.insurances.length} Ins.
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">Monitored by AI</span>
                  </div>
                </div>

                {/* ===== DATA VISUALIZATION SUITE (INTERACTIVE) ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* 1. Interactive Spending Overview Donut */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Spending Overview</h3>
                        <p className="text-[11px] text-slate-400">Hover or click segments to inspect</p>
                      </div>

                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      >
                        <option value="month">This Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                      <DonutChart
                        segments={spendingSegments}
                        total={summary.totalOutflow}
                        size={190}
                        onSelectSegment={setSelectedSegment}
                      />

                      <div className="space-y-2 flex-1 w-full">
                        {spendingSegments.map((seg) => {
                          const isSelected = selectedSegment?.label === seg.label;
                          return (
                            <button
                              key={seg.label}
                              type="button"
                              onClick={() => setSelectedSegment(isSelected ? null : seg)}
                              className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all text-left ${
                                isSelected ? "bg-slate-100 ring-1 ring-slate-300" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: seg.color }}
                                />
                                <span className="text-xs font-semibold text-slate-700 truncate">
                                  {seg.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs font-extrabold text-slate-900">
                                  ₹{seg.value.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold w-10 text-right">
                                  {((seg.value / summary.totalOutflow) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. Interactive Cash Flow Trendline */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Cash Flow Trend</h3>
                        <p className="text-[11px] text-slate-400">Scrub across line for monthly breakdown</p>
                      </div>

                      <select
                        value={trendRange}
                        onChange={(e) => setTrendRange(e.target.value as any)}
                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      >
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">This 6 Months</option>
                        <option value="year">Full Year</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-emerald-500 rounded-full" /> Income
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-3 h-0.5 bg-slate-400" style={{ borderBottom: "1px dashed #94a3b8" }} /> Expense
                      </span>
                    </div>

                    <div className="pt-1">
                      <CashFlowLineChart
                        incomeData={cashFlowIncome}
                        expenseData={cashFlowExpense}
                        labels={cashFlowLabels}
                        surplus={summary.netSurplus}
                        width={460}
                        height={200}
                      />
                    </div>
                  </div>
                </div>

                {/* Upcoming Renewals & Alerts Grid */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-extrabold text-slate-900">Upcoming Renewals & Alerts</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("subscriptions")}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      View All ({summary.upcomingRenewals.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {summary.upcomingRenewals.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-3 group cursor-pointer"
                        onClick={() => setActiveTab(item.type === "insurance" ? "insurances" : "subscriptions")}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            item.type === "subscription"
                              ? subIconColors[item.name] || "bg-slate-200 text-slate-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.type === "subscription" ? subIconLetters[item.name] || item.name[0] : <Shield className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                            {item.urgent && (
                              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600 flex-shrink-0">
                                Urgent
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Due: {item.date} (in {item.daysLeft}d)
                          </span>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-extrabold text-slate-900">
                              ₹{item.cost.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold capitalize">
                              {item.billingCycle}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB 2: SUBSCRIPTIONS ===== */}
            {activeTab === "subscriptions" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Manage OTT & Subscriptions</h3>
                      <p className="text-xs text-slate-400">
                        Active monthly outflow: <strong className="text-slate-800">₹{summary.monthlySubCost.toLocaleString()}/mo</strong>
                      </p>
                    </div>
                  </div>

                  {/* Add Subscription Form */}
                  <form onSubmit={handleAddSubscription} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Add New Platform or Club</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Platform (e.g. Netflix)"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="₹ Cost"
                        value={newSubCost}
                        onChange={(e) => setNewSubCost(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                      <select
                        value={newSubCycle}
                        onChange={(e) => setNewSubCycle(e.target.value as "monthly" | "yearly")}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <input
                        type="date"
                        value={newSubRenewal}
                        onChange={(e) => setNewSubRenewal(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Subscription
                      </button>
                    </div>
                  </form>

                  {/* Subscriptions List */}
                  <div className="space-y-2">
                    {profile.subscriptions.map((s) => (
                      <div
                        key={s.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          s.active
                            ? "bg-white border-slate-200/80 hover:border-slate-300"
                            : "bg-slate-50 opacity-60 border-slate-200/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSub(s.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
                              s.active ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 bg-white"
                            }`}
                            title={s.active ? "Pause Subscription" : "Resume Subscription"}
                          >
                            {s.active && "✓"}
                          </button>
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              subIconColors[s.name] || "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {subIconLetters[s.name] || s.name[0]}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Renewal: <strong className="text-slate-600">{s.renewalDate}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-900">₹{s.cost.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                              /{s.billingCycle}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingSub(s)}
                            className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Edit Subscription"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSub(s.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete Subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB 3: INSURANCES ===== */}
            {activeTab === "insurances" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Insurance & Protection Portfolio</h3>
                    <p className="text-xs text-slate-400">Health, Term Life, PMSBY & Vehicle policies</p>
                  </div>

                  {/* Add Insurance Form */}
                  <form onSubmit={handleAddInsurance} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Add Insurance Policy</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Policy Name"
                        value={newInsName}
                        onChange={(e) => setNewInsName(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="₹ Annual Premium"
                        value={newInsCost}
                        onChange={(e) => setNewInsCost(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                      <input
                        type="date"
                        value={newInsExpiry}
                        onChange={(e) => setNewInsExpiry(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Policy
                      </button>
                    </div>
                  </form>

                  {/* Insurances List */}
                  <div className="space-y-2">
                    {profile.insurances.map((ins) => (
                      <div
                        key={ins.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{ins.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Expires: <strong className="text-slate-600">{ins.expiryDate}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-900">
                              ₹{ins.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                              /{ins.frequency}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingIns(ins)}
                            className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Edit Insurance"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIns(ins.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete Insurance"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB 4: BUDGET ===== */}
            {activeTab === "budget" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <form onSubmit={handleUpdateBudget} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Monthly Income & Living Budget</h3>
                    <p className="text-xs text-slate-400">Keep AI calculations accurate with updated numbers</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Monthly Take-Home Income
                      </label>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-600" /> Food & Groceries
                      </label>
                      <input
                        type="number"
                        value={food}
                        onChange={(e) => setFood(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                        <HomeIcon className="w-3.5 h-3.5 text-slate-600" /> Rent & House Utilities
                      </label>
                      <input
                        type="number"
                        value={rent}
                        onChange={(e) => setRent(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                        <Sliders className="w-3.5 h-3.5 text-slate-600" /> Other Daily Expenses
                      </label>
                      <input
                        type="number"
                        value={otherDaily}
                        onChange={(e) => setOtherDaily(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      Save Budget Updates
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Universal Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab === "overview" ? "insights" : activeTab === "subscriptions" ? "transactions" : "profile"}
        onSelectTab={(tab) => {
          if (tab === "overview") setActiveTab("overview");
          if (tab === "subscriptions") setActiveTab("subscriptions");
          if (tab === "budget") setActiveTab("budget");
        }}
      />

      {/* ===== EDIT SUBSCRIPTION MODAL ===== */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Edit Subscription</h3>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="text-slate-400 hover:text-slate-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSub} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Name</label>
                <input
                  type="text"
                  value={editingSub.name}
                  onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={editingSub.cost}
                    onChange={(e) => setEditingSub({ ...editingSub, cost: Number(e.target.value) })}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cycle</label>
                  <select
                    value={editingSub.billingCycle}
                    onChange={(e) =>
                      setEditingSub({
                        ...editingSub,
                        billingCycle: e.target.value as "monthly" | "yearly",
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Renewal Date</label>
                <input
                  type="date"
                  value={editingSub.renewalDate}
                  onChange={(e) => setEditingSub({ ...editingSub, renewalDate: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteSub(editingSub.id)}
                  className="h-10 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSub(null)}
                    className="h-10 px-4 rounded-xl text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT INSURANCE MODAL ===== */}
      {editingIns && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Edit Insurance Policy</h3>
              <button
                type="button"
                onClick={() => setEditingIns(null)}
                className="text-slate-400 hover:text-slate-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedIns} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Policy Name</label>
                <input
                  type="text"
                  value={editingIns.name}
                  onChange={(e) => setEditingIns({ ...editingIns, name: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Annual Premium (₹)</label>
                  <input
                    type="number"
                    value={editingIns.amount}
                    onChange={(e) => setEditingIns({ ...editingIns, amount: Number(e.target.value) })}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingIns.category}
                    onChange={(e) =>
                      setEditingIns({
                        ...editingIns,
                        category: e.target.value as InsuranceItem["category"],
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="health">Health</option>
                    <option value="life">Term Life</option>
                    <option value="government">Government</option>
                    <option value="vehicle">Vehicle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={editingIns.expiryDate}
                  onChange={(e) => setEditingIns({ ...editingIns, expiryDate: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteIns(editingIns.id)}
                  className="h-10 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingIns(null)}
                    className="h-10 px-4 rounded-xl text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
