export interface InsuranceItem {
  id: string;
  name: string;
  category: "health" | "life" | "vehicle" | "government";
  amount: number;
  frequency: "monthly" | "yearly";
  expiryDate: string; // YYYY-MM-DD
  policyNumber?: string;
  status: "active" | "expiring_soon" | "expired";
}

export interface SubscriptionItem {
  id: string;
  name: string;
  category: "ott" | "music" | "fitness" | "utility" | "other";
  cost: number;
  billingCycle: "monthly" | "yearly";
  renewalDate: string; // YYYY-MM-DD
  active: boolean;
}

export interface LoanItem {
  id: string;
  name: string;
  monthlyEmi: number;
  totalBalance?: number;
  interestRate?: number;
}

export interface UserFinancialProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
  isSetupComplete: boolean;
  monthlyIncome: number;
  foodGroceries: number;
  rentUtilities: number;
  otherDailyExpenses: number;
  insurances: InsuranceItem[];
  subscriptions: SubscriptionItem[];
  loans: LoanItem[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp?: string;
  suggestions?: string[];
}
