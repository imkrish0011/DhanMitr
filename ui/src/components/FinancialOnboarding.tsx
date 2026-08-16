"use client";

import React, { useState } from "react";
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Trash2, 
  Film, 
  Shield, 
  IndianRupee, 
  ShoppingBag, 
  Home, 
  Calendar,
  Zap
} from "lucide-react";
import { UserFinancialProfile, SubscriptionItem, InsuranceItem } from "@/types";
import { DEFAULT_DEMO_PROFILE, saveUserProfile } from "@/lib/userProfile";
import { SpecularButton } from "./ui/SpecularButton";

interface FinancialOnboardingProps {
  initialProfile?: UserFinancialProfile;
  onComplete: (profile: UserFinancialProfile) => void;
  onCancel?: () => void;
}

const COMMON_SUBSCRIPTIONS = [
  { name: "Netflix Standard", category: "ott" as const, defaultCost: 499, defaultCycle: "monthly" as const },
  { name: "Amazon Prime", category: "ott" as const, defaultCost: 1499, defaultCycle: "yearly" as const },
  { name: "Disney+ Hotstar", category: "ott" as const, defaultCost: 899, defaultCycle: "yearly" as const },
  { name: "Spotify Premium", category: "music" as const, defaultCost: 119, defaultCycle: "monthly" as const },
  { name: "YouTube Premium", category: "ott" as const, defaultCost: 149, defaultCycle: "monthly" as const },
  { name: "Gym & Fitness Club", category: "fitness" as const, defaultCost: 1500, defaultCycle: "monthly" as const },
];

export function FinancialOnboarding({
  initialProfile = DEFAULT_DEMO_PROFILE,
  onComplete,
  onCancel,
}: FinancialOnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [income, setIncome] = useState<number>(initialProfile.monthlyIncome || 65000);
  const [food, setFood] = useState<number>(initialProfile.foodGroceries || 12000);
  const [rent, setRent] = useState<number>(initialProfile.rentUtilities || 16000);
  const [otherDaily, setOtherDaily] = useState<number>(initialProfile.otherDailyExpenses || 5000);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialProfile.subscriptions || []);
  const [insurances, setInsurances] = useState<InsuranceItem[]>(initialProfile.insurances || []);

  // Form states for new additions
  const [newSubName, setNewSubName] = useState("");
  const [newSubCost, setNewSubCost] = useState("");
  const [newSubCycle, setNewSubCycle] = useState<"monthly" | "yearly">("monthly");
  const [newSubRenewal, setNewSubRenewal] = useState("2026-08-25");

  const [newInsName, setNewInsName] = useState("");
  const [newInsCost, setNewInsCost] = useState("");
  const [newInsCategory, setNewInsCategory] = useState<InsuranceItem["category"]>("health");
  const [newInsExpiry, setNewInsExpiry] = useState("2026-08-28");

  const togglePresetSubscription = (preset: typeof COMMON_SUBSCRIPTIONS[0]) => {
    const existingIndex = subscriptions.findIndex((s) => s.name === preset.name);
    if (existingIndex >= 0) {
      setSubscriptions(subscriptions.filter((_, idx) => idx !== existingIndex));
    } else {
      setSubscriptions([
        ...subscriptions,
        {
          id: "sub-" + Date.now() + Math.random(),
          name: preset.name,
          category: preset.category,
          cost: preset.defaultCost,
          billingCycle: preset.defaultCycle,
          renewalDate: "2026-08-25",
          active: true,
        },
      ]);
    }
  };

  const handleAddCustomSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCost) return;
    setSubscriptions([
      ...subscriptions,
      {
        id: "sub-" + Date.now(),
        name: newSubName.trim(),
        category: "ott",
        cost: Number(newSubCost),
        billingCycle: newSubCycle,
        renewalDate: newSubRenewal,
        active: true,
      },
    ]);
    setNewSubName("");
    setNewSubCost("");
  };

  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsName.trim() || !newInsCost) return;
    setInsurances([
      ...insurances,
      {
        id: "ins-" + Date.now(),
        name: newInsName.trim(),
        category: newInsCategory,
        amount: Number(newInsCost),
        frequency: "yearly",
        expiryDate: newInsExpiry,
        status: "expiring_soon",
      },
    ]);
    setNewInsName("");
    setNewInsCost("");
  };

  const handleSaveAndFinish = () => {
    const updatedProfile: UserFinancialProfile = {
      ...initialProfile,
      isLoggedIn: true,
      isSetupComplete: true,
      monthlyIncome: Number(income) || 0,
      foodGroceries: Number(food) || 0,
      rentUtilities: Number(rent) || 0,
      otherDailyExpenses: Number(otherDaily) || 0,
      subscriptions,
      insurances,
    };
    saveUserProfile(updatedProfile);
    onComplete(updatedProfile);
  };

  const handleUseDemoPreset = () => {
    saveUserProfile(DEFAULT_DEMO_PROFILE);
    onComplete(DEFAULT_DEMO_PROFILE);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] p-4 sm:p-8 space-y-6">
      {/* Header & Steps Navigator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
            DhanMITR Financial Setup
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
            {step === 1 && "1. Monthly Income & Living Expenses"}
            {step === 2 && "2. OTT & Streaming Subscriptions"}
            {step === 3 && "3. Insurances & Policy Expiries"}
            {step === 4 && "4. AI Financial Plan Summary"}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleUseDemoPreset}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Demo Data</span>
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= i ? "bg-slate-900" : "bg-slate-100"
            }`}
          />
        ))}
      </div>

      {/* STEP 1: Income & Living */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 font-medium">
            Enter your typical monthly take-home salary and mandatory family living expenses.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Monthly Take-Home Income
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  placeholder="65000"
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500" /> Food & Groceries (Monthly)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={food}
                    onChange={(e) => setFood(Number(e.target.value))}
                    placeholder="12000"
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Home className="w-3.5 h-3.5 text-slate-500" /> Rent & House Utilities
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    placeholder="16000"
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Next: Subscriptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Subscriptions & OTT */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 font-medium">
            Tap the services you currently pay for. DhanMITR tracks upcoming renewals and identifies duplicate spending.
          </p>

          {/* Quick preset chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_SUBSCRIPTIONS.map((preset) => {
              const isSelected = subscriptions.some((s) => s.name === preset.name);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => togglePresetSubscription(preset)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 hover:bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight line-clamp-1">{preset.name}</span>
                    <span className={`text-[10px] font-medium ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      ₹{preset.defaultCost} /{preset.defaultCycle === "yearly" ? "yr" : "mo"}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Active Subscriptions List */}
          {subscriptions.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Selected Subscriptions ({subscriptions.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subscriptions.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-semibold">
                        ₹{s.cost} <span className="text-[10px] text-slate-400">/{s.billingCycle}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubscriptions(subscriptions.filter((item) => item.id !== s.id))}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Add Sub Form */}
          <form onSubmit={handleAddCustomSubscription} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add other OTT / Club..."
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400"
            />
            <input
              type="number"
              placeholder="₹ Cost"
              value={newSubCost}
              onChange={(e) => setNewSubCost(e.target.value)}
              className="w-20 h-9 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
            <button
              type="submit"
              className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-11 px-4 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Next: Insurances</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Insurance & Expiries */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 font-medium">
            Add your health, term, vehicle, or government insurance policies. DhanMITR alerts you before expiry so you never lose coverage.
          </p>

          {/* Existing Insurances list */}
          <div className="space-y-2">
            {insurances.map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{ins.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Expiry date: <strong className="text-slate-700">{ins.expiryDate}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">₹{ins.amount.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setInsurances(insurances.filter((item) => item.id !== ins.id))}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Insurance Form */}
          <form onSubmit={handleAddInsurance} className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">Add New Insurance Policy</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Policy Name (e.g. Star Health)"
                value={newInsName}
                onChange={(e) => setNewInsName(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
              />
              <input
                type="number"
                placeholder="₹ Annual Premium"
                value={newInsCost}
                onChange={(e) => setNewInsCost(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newInsExpiry}
                onChange={(e) => setNewInsExpiry(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Add Policy
              </button>
            </div>
          </form>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 px-4 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Preview Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Finish */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Personalized Cashflow Summary
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-white/90">
                <span className="text-[10px] text-slate-400 block font-semibold">Monthly Income</span>
                <span className="text-sm font-extrabold text-slate-900">₹{income.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90">
                <span className="text-[10px] text-slate-400 block font-semibold">Living Outflow</span>
                <span className="text-sm font-extrabold text-slate-900">₹{(food + rent + otherDaily).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90">
                <span className="text-[10px] text-slate-400 block font-semibold">Active Subscriptions</span>
                <span className="text-sm font-extrabold text-slate-900">{subscriptions.length} Services</span>
              </div>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              DhanMITR AI will continuously monitor your renewal dates, optimize subscription combos, and answer all financial questions tailored to your exact budget.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-11 px-4 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-bold"
            >
              Back
            </button>
            <SpecularButton
              size="md"
              radius={14}
              tint="#0f172a"
              tintOpacity={1}
              lineColor="#475569"
              textColor="#ffffff"
              onClick={handleSaveAndFinish}
              className="h-12 px-6 font-extrabold text-xs sm:text-sm shadow-md"
            >
              <div className="flex items-center gap-2">
                <span>Save & Launch DhanMITR AI</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </SpecularButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialOnboarding;
