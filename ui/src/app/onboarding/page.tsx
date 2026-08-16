"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { saveFinancialProfile } from "@/lib/api";
import { UserFinancialProfile } from "../../../shared/types/typescript";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserFinancialProfile>({
    user_id: "usr-demo",
    currency: "INR",
    monthly_income: 125000,
    monthly_expenses: 55000,
    emergency_fund_balance: 350000,
    total_investments: 650000,
    total_liabilities: 80000,
    risk_tolerance: "moderate",
    employment_type: "salaried",
    tax_regime: "new",
  });

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await saveFinancialProfile(formData);
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Step {step} of 4: Personalized Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Financial Profile Onboarding</h1>
        <p className="text-sm text-slate-500 mt-1">This context enables DhanMITR to give mathematically sound advice.</p>
      </div>

      <Card>
        <CardHeader>
          {step === 1 && (
            <>
              <CardTitle>Income & Employment</CardTitle>
              <CardDescription>Tell us about your primary earnings and employment type.</CardDescription>
            </>
          )}
          {step === 2 && (
            <>
              <CardTitle>Living Expenses & Cashflow</CardTitle>
              <CardDescription>Estimate your mandatory monthly rent, utilities, and groceries.</CardDescription>
            </>
          )}
          {step === 3 && (
            <>
              <CardTitle>Assets, Savings & Debts</CardTitle>
              <CardDescription>Current liquid reserves, mutual funds/stocks, and liabilities.</CardDescription>
            </>
          )}
          {step === 4 && (
            <>
              <CardTitle>Tax Regime & Risk Profile</CardTitle>
              <CardDescription>Choose your risk tolerance and preferred tax structure.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Net In-Hand Income (₹)</label>
                <Input
                  type="number"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({ ...formData, monthly_income: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                  className="w-full mt-1 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                >
                  <option value="salaried">Salaried (Full-time)</option>
                  <option value="self_employed">Self-Employed / Business</option>
                  <option value="freelancer">Freelancer / Consultant</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estimated Total Monthly Expenses (₹)</label>
              <Input
                type="number"
                value={formData.monthly_expenses}
                onChange={(e) => setFormData({ ...formData, monthly_expenses: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
              <p className="text-xs text-slate-400 mt-1">Includes rent, utilities, food, transport, and leisure.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Emergency Fund / Bank Balance (₹)</label>
                <Input
                  type="number"
                  value={formData.emergency_fund_balance}
                  onChange={(e) => setFormData({ ...formData, emergency_fund_balance: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Investments (Mutual Funds, Stocks, PF) (₹)</label>
                <Input
                  type="number"
                  value={formData.total_investments}
                  onChange={(e) => setFormData({ ...formData, total_investments: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Outstanding Liabilities / Loans (₹)</label>
                <Input
                  type="number"
                  value={formData.total_liabilities}
                  onChange={(e) => setFormData({ ...formData, total_liabilities: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Risk Tolerance</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["conservative", "moderate", "aggressive"] as const).map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={formData.risk_tolerance === r ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, risk_tolerance: r })}
                      className="capitalize text-xs"
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Tax Regime</label>
                <select
                  value={formData.tax_regime}
                  onChange={(e) => setFormData({ ...formData, tax_regime: e.target.value as any })}
                  className="w-full mt-1 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                >
                  <option value="new">New Tax Regime (Lower slab rates)</option>
                  <option value="old">Old Tax Regime (With 80C, 80D, HRA deductions)</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <Button onClick={handleNext} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
            {step === 4 ? "Complete Setup" : "Next Step"} <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
