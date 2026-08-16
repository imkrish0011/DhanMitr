import { UserFinancialProfile, SubscriptionItem, InsuranceItem } from "@/types";
export type { UserFinancialProfile, SubscriptionItem, InsuranceItem };

export const DEFAULT_DEMO_PROFILE: UserFinancialProfile = {
  name: "Rahul Sharma",
  email: "rahul.sharma@gmail.com",
  isLoggedIn: true,
  isSetupComplete: true,
  monthlyIncome: 65000,
  foodGroceries: 12000,
  rentUtilities: 16000,
  otherDailyExpenses: 5000,
  insurances: [
    {
      id: "ins-1",
      name: "Star Health Comprehensive",
      category: "health",
      amount: 14500,
      frequency: "yearly",
      expiryDate: "2026-08-28", // Expiring in ~12 days
      policyNumber: "POL-STAR-8821",
      status: "expiring_soon",
    },
    {
      id: "ins-2",
      name: "Pradhan Mantri Suraksha Bima (PMSBY)",
      category: "government",
      amount: 20,
      frequency: "yearly",
      expiryDate: "2027-05-31",
      policyNumber: "PMSBY-SBI-9921",
      status: "active",
    },
    {
      id: "ins-3",
      name: "HDFC Life Term Insurance",
      category: "life",
      amount: 8400,
      frequency: "yearly",
      expiryDate: "2026-11-15",
      policyNumber: "TERM-HDFC-4102",
      status: "active",
    },
  ],
  subscriptions: [
    {
      id: "sub-1",
      name: "Netflix Standard HD",
      category: "ott",
      cost: 499,
      billingCycle: "monthly",
      renewalDate: "2026-08-24", // Renews in 8 days
      active: true,
    },
    {
      id: "sub-2",
      name: "Amazon Prime Annual",
      category: "ott",
      cost: 1499,
      billingCycle: "yearly",
      renewalDate: "2026-09-12",
      active: true,
    },
    {
      id: "sub-3",
      name: "Disney+ Hotstar Super",
      category: "ott",
      cost: 899,
      billingCycle: "yearly",
      renewalDate: "2026-08-30",
      active: true,
    },
    {
      id: "sub-4",
      name: "Spotify Premium Individual",
      category: "music",
      cost: 119,
      billingCycle: "monthly",
      renewalDate: "2026-08-27",
      active: true,
    },
    {
      id: "sub-5",
      name: "Gym & Fitness Club",
      category: "fitness",
      cost: 1500,
      billingCycle: "monthly",
      renewalDate: "2026-09-01",
      active: true,
    },
  ],
  loans: [
    {
      id: "loan-1",
      name: "Two-Wheeler Bike Loan EMI",
      monthlyEmi: 2800,
      totalBalance: 28000,
      interestRate: 9.5,
    },
  ],
};

const STORAGE_KEY = "dhanmitr_user_financial_profile";

export function loadUserProfile(): UserFinancialProfile {
  if (typeof window === "undefined") return DEFAULT_DEMO_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not load financial profile from localStorage", e);
  }
  return DEFAULT_DEMO_PROFILE;
}

export function saveUserProfile(profile: UserFinancialProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Could not save financial profile to localStorage", e);
  }
}

export function calculateFinancialSummary(profile: UserFinancialProfile) {
  // Monthly subscription total
  const monthlySubCost = profile.subscriptions
    .filter((s) => s.active)
    .reduce((acc, s) => acc + (s.billingCycle === "yearly" ? Math.round(s.cost / 12) : s.cost), 0);

  // Monthly insurance normalized
  const monthlyInsuranceCost = profile.insurances.reduce(
    (acc, ins) => acc + (ins.frequency === "yearly" ? Math.round(ins.amount / 12) : ins.amount),
    0
  );

  // Monthly EMI
  const monthlyEmiTotal = profile.loans.reduce((acc, l) => acc + l.monthlyEmi, 0);

  // Total Outflow
  const totalOutflow =
    profile.foodGroceries +
    profile.rentUtilities +
    profile.otherDailyExpenses +
    monthlySubCost +
    monthlyInsuranceCost +
    monthlyEmiTotal;

  // Monthly Surplus / Net Savings
  const netSurplus = Math.max(0, profile.monthlyIncome - totalOutflow);
  const savingsRate = profile.monthlyIncome > 0 ? Math.round((netSurplus / profile.monthlyIncome) * 100) : 0;

  // Renewals & Expiries in the next 30 days
  const today = new Date("2026-08-16");

  const upcomingRenewals = [
    ...profile.subscriptions.map((s) => {
      const renewal = new Date(s.renewalDate);
      const diffTime = renewal.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        id: s.id,
        type: "subscription" as const,
        name: s.name,
        cost: s.cost,
        billingCycle: s.billingCycle,
        date: s.renewalDate,
        daysLeft: diffDays,
        urgent: diffDays <= 10 && diffDays >= 0,
      };
    }),
    ...profile.insurances.map((ins) => {
      const expiry = new Date(ins.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        id: ins.id,
        type: "insurance" as const,
        name: ins.name,
        cost: ins.amount,
        billingCycle: ins.frequency,
        date: ins.expiryDate,
        daysLeft: diffDays,
        urgent: diffDays <= 15 && diffDays >= 0,
      };
    }),
  ]
    .filter((r) => r.daysLeft >= 0 && r.daysLeft <= 45)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    monthlySubCost,
    monthlyInsuranceCost,
    monthlyEmiTotal,
    totalOutflow,
    netSurplus,
    savingsRate,
    upcomingRenewals,
  };
}

export function generatePersonalizedInsights(profile: UserFinancialProfile): string[] {
  const summary = calculateFinancialSummary(profile);
  const insights: string[] = [];

  // OTT optimization insight
  const otts = profile.subscriptions.filter((s) => s.category === "ott" && s.active);
  if (otts.length >= 3) {
    const totalOtt = otts.reduce((sum, s) => sum + (s.billingCycle === "yearly" ? s.cost / 12 : s.cost), 0);
    insights.push(
      `You have ${otts.length} active OTT platforms costing ₹${Math.round(totalOtt)}/mo. Rotating services can save up to ₹${Math.round(totalOtt * 0.4 * 12)} per year.`
    );
  }

  // Insurance expiry alert
  const expiringIns = profile.insurances.find((ins) => ins.status === "expiring_soon");
  if (expiringIns) {
    insights.push(
      `Action Needed: ${expiringIns.name} premium of ₹${expiringIns.amount.toLocaleString()} is due on ${expiringIns.expiryDate}. Renew on time to prevent waiting period reset.`
    );
  }

  // Savings rate recommendation
  if (summary.savingsRate < 20) {
    insights.push(
      `Your current savings rate is ${summary.savingsRate}%. Target at least 20% (₹${Math.round(profile.monthlyIncome * 0.2).toLocaleString()}/mo) to build a robust 6-month safety buffer.`
    );
  } else {
    insights.push(
      `Excellent! You save ₹${summary.netSurplus.toLocaleString()}/mo (${summary.savingsRate}%). Consider routing ₹${Math.round(summary.netSurplus * 0.6).toLocaleString()} into a diversified SIP.`
    );
  }

  return insights;
}
