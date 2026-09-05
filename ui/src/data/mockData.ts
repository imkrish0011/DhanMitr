import {
  UserFinancialProfile,
  SpendingCategorySummary,
  Subscription,
  Insurance,
  BudgetItem,
  IncomeSource,
  MonthlyCashFlowPoint,
  ChatMessage,
  Transaction,
  FinancialGoal,
} from '@/types';

export const emptyProfile: UserFinancialProfile = {
  user_id: '',
  name: '',
  email: '',
  avatar_initial: 'U',
  is_premium: false,
  currency: 'INR',
  monthly_income: 0,
  monthly_expenses: 0,
  emergency_fund_balance: 0,
  total_investments: 0,
  total_liabilities: 0,
  risk_tolerance: 'moderate',
  employment_type: 'salaried',
  tax_regime: 'new',
  is_onboarded: false,
};

export const defaultSpendingCategories: SpendingCategorySummary[] = [
  {
    id: 'cat_housing',
    category: 'Housing',
    categoryKey: 'housing',
    amount: 0,
    percentage: 0,
    color: '#34D399', // Mint Green
  },
  {
    id: 'cat_investments',
    category: 'Investments',
    categoryKey: 'investments',
    amount: 0,
    percentage: 0,
    color: '#94A3B8', // Slate Gray
  },
  {
    id: 'cat_bills',
    category: 'Bills & Utilities',
    categoryKey: 'utilities',
    amount: 0,
    percentage: 0,
    color: '#FBBF24', // Amber/Orange
  },
  {
    id: 'cat_subscriptions',
    category: 'Subscriptions',
    categoryKey: 'subscriptions',
    amount: 0,
    percentage: 0,
    color: '#60A5FA', // Blue
  },
  {
    id: 'cat_insurance',
    category: 'Insurance',
    categoryKey: 'insurance',
    amount: 0,
    percentage: 0,
    color: '#C084FC', // Purple
  },
  {
    id: 'cat_others',
    category: 'Others',
    categoryKey: 'other',
    amount: 0,
    percentage: 0,
    color: '#FDE047', // Yellow
  },
];

export const emptyCashFlowTrend: MonthlyCashFlowPoint[] = [];
export const emptySubscriptions: Subscription[] = [];
export const emptyInsurances: Insurance[] = [];
export const emptyBudgetItems: BudgetItem[] = [];
export const emptyIncomeSources: IncomeSource[] = [];
export const emptyTransactions: Transaction[] = [];
export const emptyGoals: FinancialGoal[] = [];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: 'Namaste! I am धनMitr, your AI financial companion.\n\nAsk me anything about budgeting, expense optimization, OTT subscriptions, tax regimes, or financial planning in Hindi or English!',
    timestamp: 'Just now',
    language: 'en',
    widgetType: 'none',
  },
];

