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
  Edit3,
  Calendar, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Bell, 
  Zap,
  RotateCcw,
  Sliders,
  X,
  Check,
  CreditCard,
  Layers,
  ChevronRight
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserFinancialProfile, SubscriptionItem, InsuranceItem } from "@/types";
import { DEFAULT_DEMO_PROFILE, loadUserProfile, saveUserProfile, calculateFinancialSummary, generatePersonalizedInsights } from "@/lib/userProfile";

export default function AdminFinancePage() {
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_DEMO_PROFILE);
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "insurances" | "budget">("overview");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit Subscription Modal State
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  // Edit Insurance Modal State
  const [editingIns, setEditingIns] = useState<InsuranceItem | null>(null);

  // Form states for Budget
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

  const handleSaveEditedSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    const updated: UserFinancialProfile = {
      ...profile,
      subscriptions: profile.subscriptions.map((s) => (s.id === editingSub.id ? editingSub : s)),
    };
    setProfile(updated);
    saveUserProfile(updated);
    setEditingSub(null);
    triggerSaveNotification();
  };

  const handleDeleteSubscription = (id: string) => {
    const updated: UserFinancialProfile = {
      ...profile,
      subscriptions: profile.subscriptions.filter((s) => s.id !== id),
    };
    setProfile(updated);
    saveUserProfile(updated);
    if (editingSub?.id === id) setEditingSub(null);
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

  const handleSaveEditedInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIns) return;
    const updated: UserFinancialProfile = {
      ...profile,
      insurances: profile.insurances.map((i) => (i.id === editingIns.id ? editingIns : i)),
    };
    setProfile(updated);
    saveUserProfile(updated);
    setEditingIns(null);
    triggerSaveNotification();
  };

  const handleDeleteInsurance = (id: string) => {
    const updated: UserFinancialProfile = {
      ...profile,
      insurances: profile.insurances.filter((i) => i.id !== id),
    };
    setProfile(updated);
    saveUserProfile(updated);
    if (editingIns?.id === id) setEditingIns(null);
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
    <div className="min-h-screen bg-slate-50/60 text-slate-900 selection:bg-slate-100 pb-12">
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
              <span>AI Companion</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Logo size={24} showText={false} />
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">Finance Management Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-in fade-in">
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

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Switcher Tabs */}
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
            Overview
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
            OTT & Subs ({profile.subscriptions.length})
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage Subscriptions & OTT Services</h3>
                  <p className="text-xs text-slate-400">
                    Total active monthly outflow: <strong className="text-slate-700">₹{summary.monthlySubCost.toLocaleString()}/mo</strong>
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

              {/* Subscriptions List with Edit / Delete */}
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
                        title={s.active ? "Pause Subscription" : "Resume Subscription"}
                      >
                        {s.active && "✓"}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Next renewal: <strong className="text-slate-600">{s.renewalDate}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          ₹{s.cost.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          /{s.billingCycle}
                        </span>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingSub(s)}
                        className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Subscription"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSubscription(s.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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

        {/* TAB 3: INSURANCES */}
        {activeTab === "insurances" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Insurance & Protection Portfolio</h3>
                  <p className="text-xs text-slate-400">
                    Health, Term Life, PMSBY & Vehicle policies with expiry tracking
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

              {/* Insurance List with Edit / Delete */}
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
                          Expires: <strong className="text-slate-600">{ins.expiryDate}</strong> • {ins.policyNumber || "Policy Active"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          ₹{ins.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          /{ins.frequency}
                        </span>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingIns(ins)}
                        className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Insurance"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteInsurance(ins.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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

        {/* TAB 4: BUDGET & INCOME */}
        {activeTab === "budget" && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
                  className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  Save Budget Updates
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* EDIT SUBSCRIPTION MODAL */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Subscription</h3>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSubscription} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Name</label>
                <input
                  type="text"
                  value={editingSub.name}
                  onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSubscription(editingSub.id)}
                  className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSub(null)}
                    className="h-10 px-4 rounded-lg text-slate-500 hover:text-slate-900 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INSURANCE MODAL */}
      {editingIns && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Insurance Policy</h3>
              <button
                type="button"
                onClick={() => setEditingIns(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedInsurance} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Policy Name</label>
                <input
                  type="text"
                  value={editingIns.name}
                  onChange={(e) => setEditingIns({ ...editingIns, name: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="health">Health</option>
                    <option value="life">Term Life</option>
                    <option value="government">Government Scheme</option>
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
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteInsurance(editingIns.id)}
                  className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingIns(null)}
                    className="h-10 px-4 rounded-lg text-slate-500 hover:text-slate-900 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-sm"
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
