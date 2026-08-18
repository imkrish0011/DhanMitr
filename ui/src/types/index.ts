export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export type EmploymentType = 'salaried' | 'self_employed' | 'freelancer' | 'student' | 'retired';

export type TaxRegime = 'new' | 'old' | 'not_applicable';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';

export type TransactionCategory =
  | 'housing'
  | 'investments'
  | 'utilities'
  | 'subscriptions'
  | 'insurance'
  | 'dining'
  | 'groceries'
  | 'shopping'
  | 'travel'
  | 'healthcare'
  | 'education'
  | 'entertainment'
  | 'salary'
  | 'freelance'
  | 'other';

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'weekly';

export type InsuranceType = 'health' | 'term_life' | 'motor' | 'home' | 'critical_illness' | 'other';

export type GoalCategory =
  | 'emergency_fund'
  | 'home'
  | 'retirement'
  | 'vehicle'
  | 'education'
  | 'vacation'
  | 'wedding'
  | 'other';

export type GoalPriority = 'low' | 'medium' | 'high';

export interface UserFinancialProfile {
  user_id: string;
  name: string;
  email?: string;
  avatar_initial: string;
  is_premium: boolean;
  currency: CurrencyCode;
  monthly_income: number;
  monthly_expenses: number;
  emergency_fund_balance: number;
  total_investments: number;
  total_liabilities: number;
  risk_tolerance: RiskTolerance;
  employment_type: EmploymentType;
  tax_regime: TaxRegime;
  is_onboarded?: boolean;
}

export interface SpendingCategorySummary {
  id: string;
  category: string;
  categoryKey: TransactionCategory;
  amount: number;
  percentage: number;
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  account_name?: string;
  is_recurring?: boolean;
  note?: string;
}

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  logoKey: 'netflix' | 'amazon_prime' | 'spotify' | 'hotstar' | 'youtube' | 'apple' | 'chatgpt' | 'claude' | 'sonyliv' | 'google' | 'other';
  planName: string;
  amount: number;
  currency: CurrencyCode;
  billing_cycle: BillingCycle;
  category: string;
  next_renewal_date: string;
  days_remaining: number;
  is_urgent?: boolean;
  is_active: boolean;
}

export interface Insurance {
  id: string;
  policy_name: string;
  provider: string;
  logoKey: 'hdfc_life' | 'star_health' | 'icici_lombard' | 'lic' | 'sbi_life' | 'other';
  policy_type: InsuranceType;
  policy_number: string;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency: 'monthly' | 'quarterly' | 'yearly';
  renewal_date: string;
  days_remaining: number;
  is_urgent?: boolean;
  is_active: boolean;
}

export interface BudgetItem {
  id: string;
  category: string;
  categoryKey: TransactionCategory;
  allocated: number;
  spent: number;
  color: string;
}

export interface IncomeSource {
  id: string;
  title: string;
  amount: number;
  frequency: 'monthly' | 'one_time' | 'yearly';
  category: 'salary' | 'freelance' | 'dividend' | 'rental' | 'other';
  date: string;
}

export interface MonthlyCashFlowPoint {
  month: string;
  income: number;
  expense: number;
  surplus: number;
}

export interface KnowledgeSource {
  title: string;
  source_type: string;
  snippet: string;
  url?: string;
  date?: string;
}

export interface FinancialGoal {
  id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: GoalCategory;
  monthly_contribution: number;
  priority: GoalPriority;
  is_completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'en' | 'hi' | 'hinglish';
  widgetType?: 'expense_summary' | 'subscription_alert' | 'investment_tip' | 'none';
  widgetData?: any;
  sources?: KnowledgeSource[];
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export type NavTab = 'finance_hub' | 'ai_companion' | 'transactions' | 'insights' | 'goals' | 'reports' | 'documents' | 'settings';

export type FinanceSubTab = 'overview' | 'subscriptions' | 'insurances' | 'budget' | 'goals' | 'tax_calculator';

