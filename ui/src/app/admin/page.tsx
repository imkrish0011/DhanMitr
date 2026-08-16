"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  IndianRupee, 
  ShoppingBag, 
  Home, 
  Shield, 
  Film, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Bell, 
  Zap,
  RotateCcw,
  Sliders
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserFinancialProfile, SubscriptionItem, InsuranceItem } from "@/types";
import { DEFAULT_DEMO_PROFILE, loadUserProfile, saveUserProfile, calculateFinancialSummary, generatePersonalizedInsights } from "@/lib/userProfile";
import { SpecularButton } from "@/components/ui/SpecularButton";

export default function AdminFinancePage() {
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_DEMO_PROFILE);
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "insurances" | "budget">("overview");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [income, setIncome] = useState<number>(65000);
  const [food, setFood] = useState<number>(12000);
  const [rent, setRent] = useState<number>(16000);
  const [otherDaily, setOtherDaily] = useState<number>(5000);

  // New sub form
  const [newSubName, setNewSubName] = useState("");
  const [newSubCost, setNewSubCost] = useState("");
  const [newSubCycle, setNewSubCycle] = useState<"monthly" | "yearly">("monthly");
  const [newSubRenewal, setNewSubRenewal] = useState("2026-08-25");
  const [newSubCategory, setNewSubCategory] = useState<SubscriptionItem["category"]>("ott");

  // New ins form
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

  const triggerSaveNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserFinancialProfile = {
      ...profile,
      monthlyIncome: Number(income) || 0,
      foodGroceries: Number(food) || 0,
      rentUtilities: Number(rent) || 0,
      otherDailyExpenses: Number(otherDaily) || 0,
    };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSaveNotification();
  };

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCost) return;
    const newItem: SubscriptionItem = {
      id: "sub-" + Date.now(),
      name: newSubName.trim(),
      category: newSubCategory,
      cost: Number(newSubCost),
      billingCycle: newSubCycle,
      renewalDate: newSubRenewal,
      active: true,
    };
    const updated: UserFinancialProfile = {
      ...profile,
      subscriptions: [newItem, ...profile.subscriptions],
    };
    setProfile(updated);
    saveUserProfile(updated);
    setNewSubName("");
    setNewSubCost("");
    triggerSaveNotification();
  };

  const handleDeleteSubscription = (id: string) => {
    const updated: UserFinancialProfile = {
      ...profile,
      subscriptions: profile.subscriptions.filter((s) => s.id !== id),
    };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSaveNotification();
  };

  const handleToggleSubscription = (id: string) => {
    const updated: UserFinancialProfile = {
      ...profile,
      subscriptions: profile.subscriptions.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      ),
    };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSaveNotification();
  };

  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsName.trim() || !newInsCost) return;
    const newItem: InsuranceItem = {
      id: "ins-" + Date.now(),
      name: newInsName.trim(),
      category: newInsCategory,
      amount: Number(newInsCost),
      frequency: "yearly",
      expiryDate: newInsExpiry,
      status: "expiring_soon",
    };
    const updated: UserFinancialProfile = {
      ...profile,
      insurances: [newItem, ...profile.insurances],
    };
    setProfile(updated);
    saveUserProfile(updated);
    setNewInsName("");
    setNewInsCost("");
    triggerSaveNotification();
  };

  const handleDeleteInsurance = (id: string) => {
    const updated: UserFinancialProfile = {
      ...profile,
      insurances: profile.insurances.filter((i) => i.id !== id),
    };
    setProfile(updated);
    saveUserProfile(updated);
    triggerSaveNotification();
  };

  const handleResetDemo = () => {
    saveUserProfile(DEFAULT_DEMO_PROFILE);
    setProfile(DEFAULT_DEMO_PROFILE);
    setIncome(DEFAULT_DEMO_PROFILE.monthlyIncome);
    setFood(DEFAULT_DEMO_PROFILE.foodGroceries);
    setRent(DEFAULT_DEMO_PROFILE.rentUtilities);
    setOtherDaily(DEFAULT_DEMO_PROFILE.otherDailyExpenses);
    triggerSaveNotification();
  };

  const summary = calculateFinancialSummary(profile);
  const insights = generatePersonalizedInsights(profile);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              prefetch={true}
              className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Logo size={24} showText={false} />
              <span className="text-sm font-extrabold text-slate-900">Finance Admin Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              type="button"
              onClick={handleResetDemo}
              className="h-8 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Reset data to Indian demo preset"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 max-w-lg">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Overview & Alerts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "subscriptions"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            OTT & Subscriptions ({profile.subscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("insurances")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "insurances"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Insurances ({profile.insurances.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("budget")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "budget"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Budget & Income
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ALERTS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Monthly Income
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
                  ₹{profile.monthlyIncome.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Take-home salary</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Outflow / mo
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
                  ₹{summary.totalOutflow.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Living + OTT + Insurance</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Net Monthly Surplus
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-0.5 block">
                  ₹{summary.netSurplus.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">{summary.savingsRate}% Savings Rate</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Services
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
                  {profile.subscriptions.filter((s) => s.active).length} OTT • {profile.insurances.length} Ins.
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Monitored by AI</span>
              </div>
            </div>

            {/* Upcoming Expiries & Notifications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Upcoming Expiry & Renewal Alerts</h3>
                    <p className="text-xs text-slate-400">Scheduled within the next 30-45 days</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {summary.upcomingRenewals.length} Due
                </span>
              </div>

              <div className="space-y-2">
                {summary.upcomingRenewals.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      item.urgent
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-slate-50/60 border-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.type === "insurance"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.type === "insurance" ? <Shield className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.urgent && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Due date: <strong>{item.date}</strong> ({item.daysLeft} days remaining)</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ₹{item.cost.toLocaleString()}
                      </span>
                      <span className="text-[9px] uppercase font-semibold text-slate-400">
                        {item.billingCycle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Strategic Advisory */}
              {insights.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider mb-0.5">
                      DhanMITR AI Recommendation
                    </span>
                    {insights[0]}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIPTIONS & OTT */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage Subscriptions & OTT Services</h3>
                  <p className="text-xs text-slate-400">
                    Total cost: ₹{summary.monthlySubCost.toLocaleString()}/month
                  </p>
                </div>
              </div>

              {/* Add Subscription Form */}
              <form onSubmit={handleAddSubscription} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Add New Platform or Club</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Platform (e.g. Netflix)"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                  <input
                    type="number"
                    placeholder="₹ Cost"
                    value={newSubCost}
                    onChange={(e) => setNewSubCost(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                  <select
                    value={newSubCycle}
                    onChange={(e) => setNewSubCycle(e.target.value as "monthly" | "yearly")}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <input
                    type="date"
                    value={newSubRenewal}
                    onChange={(e) => setNewSubRenewal(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subscription</span>
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-2">
                {profile.subscriptions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      s.active ? "bg-white border-slate-200/80" : "bg-slate-50 opacity-60 border-slate-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSubscription(s.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
                          s.active ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 bg-white"
                        }`}
                      >
                        {s.active && "✓"}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Next renewal: {s.renewalDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          ₹{s.cost.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          /{s.billingCycle}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubscription(s.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
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

        {/* TAB 3: INSURANCES */}
        {activeTab === "insurances" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Insurance & Protection Portfolio</h3>
                  <p className="text-xs text-slate-400">
                    Health, Term Life, PMSBY & Vehicle policies
                  </p>
                </div>
              </div>

              {/* Add Insurance Form */}
              <form onSubmit={handleAddInsurance} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Add Insurance Policy</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Policy Name (e.g. Star Health)"
                    value={newInsName}
                    onChange={(e) => setNewInsName(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                  <input
                    type="number"
                    placeholder="₹ Annual Premium"
                    value={newInsCost}
                    onChange={(e) => setNewInsCost(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                  <input
                    type="date"
                    value={newInsExpiry}
                    onChange={(e) => setNewInsExpiry(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Policy</span>
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-2">
                {profile.insurances.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{ins.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Expires: <strong>{ins.expiryDate}</strong> • {ins.policyNumber || "Standard Policy"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          ₹{ins.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          /{ins.frequency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteInsurance(ins.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
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

        {/* TAB 4: BUDGET & INCOME */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <form onSubmit={handleUpdateBudget} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Monthly Income & Living Budget</h3>
                <p className="text-xs text-slate-400">
                  Update your essential monthly expenses to keep AI financial calculations accurate
                </p>
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
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-600" /> Food & Groceries (Monthly)
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
                    <Home className="w-3.5 h-3.5 text-slate-600" /> Rent & House Utilities
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
                  className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95"
                >
                  Save Budget Updates
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
