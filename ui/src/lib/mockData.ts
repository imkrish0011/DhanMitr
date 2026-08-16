import {
  UserFinancialProfile,
  Transaction,
  FinancialGoal,
  SpendingCategorySummary,
} from "../../../shared/types/typescript";

export const MOCK_USER_PROFILE: UserFinancialProfile = {
  user_id: "usr_mock_123",
  currency: "INR",
  monthly_income: 125000,
  monthly_expenses: 58000,
  emergency_fund_balance: 360000,
  total_investments: 720000,
  total_liabilities: 95000,
  risk_tolerance: "moderate",
  employment_type: "salaried",
  tax_regime: "new",
  updated_at: new Date().toISOString(),
};

export const MOCK_SPENDING_BREAKDOWN: SpendingCategorySummary[] = [
  { category: "rent", amount: 28000, percentage: 48.2 },
  { category: "groceries", amount: 9500, percentage: 16.4 },
  { category: "dining", amount: 6200, percentage: 10.7 },
  { category: "utilities", amount: 4800, percentage: 8.3 },
  { category: "travel", amount: 4500, percentage: 7.8 },
  { category: "entertainment", amount: 3000, percentage: 5.2 },
  { category: "shopping", amount: 2000, percentage: 3.4 },
];

export const MOCK_CASHFLOW_HISTORY = [
  { month: "Mar", income: 120000, expenses: 56000, savings: 64000 },
  { month: "Apr", income: 120000, expenses: 62000, savings: 58000 },
  { month: "May", income: 120000, expenses: 54000, savings: 66000 },
  { month: "Jun", income: 125000, expenses: 59000, savings: 66000 },
  { month: "Jul", income: 125000, expenses: 61000, savings: 64000 },
  { month: "Aug", income: 125000, expenses: 58000, savings: 67000 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    title: "Salary Credit (Tech Corp)",
    amount: 125000,
    currency: "INR",
    type: "income",
    category: "salary",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    account_name: "HDFC Salary A/c",
  },
  {
    id: "tx-2",
    title: "Apartment Rent",
    amount: 28000,
    currency: "INR",
    type: "expense",
    category: "rent",
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    account_name: "HDFC Primary",
  },
  {
    id: "tx-3",
    title: "Nifty 50 Index Mutual Fund SIP",
    amount: 25000,
    currency: "INR",
    type: "investment",
    category: "investment_return",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    account_name: "Zerodha / Coin",
  },
  {
    id: "tx-4",
    title: "Nature's Basket Organic Groceries",
    amount: 3450,
    currency: "INR",
    type: "expense",
    category: "groceries",
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    account_name: "Credit Card (Infinia)",
  },
  {
    id: "tx-5",
    title: "Electricity & Fiber Internet Bill",
    amount: 2400,
    currency: "INR",
    type: "expense",
    category: "utilities",
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    account_name: "HDFC Primary",
  },
];

export const MOCK_GOALS: FinancialGoal[] = [
  {
    id: "g-1",
    title: "6-Month Emergency Cushion",
    target_amount: 360000,
    current_amount: 360000,
    target_date: "2026-12-31",
    category: "emergency_fund",
    monthly_contribution: 0,
    priority: "high",
    is_completed: true,
  },
  {
    id: "g-2",
    title: "House Down Payment Fund",
    target_amount: 1500000,
    current_amount: 520000,
    target_date: "2028-06-30",
    category: "home",
    monthly_contribution: 35000,
    priority: "high",
    is_completed: false,
  },
  {
    id: "g-3",
    title: "Euro Trip Vacation",
    target_amount: 250000,
    current_amount: 120000,
    target_date: "2027-05-15",
    category: "vacation",
    monthly_contribution: 10000,
    priority: "medium",
    is_completed: false,
  },
];
