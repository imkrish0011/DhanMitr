/**
 * DhanMITR Shared Financial Constants
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

export const TRANSACTION_CATEGORIES = [
  { id: 'groceries', label: 'Groceries & Supplies', color: '#10B981', icon: 'ShoppingBag' },
  { id: 'dining', label: 'Dining & Food Delivery', color: '#F59E0B', icon: 'Utensils' },
  { id: 'utilities', label: 'Utilities & Bills', color: '#3B82F6', icon: 'Zap' },
  { id: 'rent', label: 'Rent & Housing', color: '#8B5CF6', icon: 'Home' },
  { id: 'shopping', label: 'Shopping & Lifestyle', color: '#EC4899', icon: 'Tag' },
  { id: 'travel', label: 'Travel & Commute', color: '#06B6D4', icon: 'Navigation' },
  { id: 'healthcare', label: 'Healthcare & Wellness', color: '#EF4444', icon: 'HeartPulse' },
  { id: 'education', label: 'Education & Upskilling', color: '#6366F1', icon: 'GraduationCap' },
  { id: 'entertainment', label: 'Entertainment & Leisure', color: '#F97316', icon: 'Film' },
  { id: 'salary', label: 'Salary & Primary Income', color: '#10B981', icon: 'Briefcase' },
  { id: 'freelance', label: 'Freelance & Side Gig', color: '#14B8A6', icon: 'Laptop' },
  { id: 'investment_return', label: 'Investment Dividends/Gains', color: '#84CC16', icon: 'TrendingUp' },
  { id: 'other', label: 'Other / Miscellaneous', color: '#6B7280', icon: 'MoreHorizontal' },
] as const;

export const DEFAULT_FINANCIAL_BENCHMARKS = {
  MIN_EMERGENCY_FUND_MONTHS: 6,
  MAX_HOUSING_RATIO: 0.3,
  MAX_DEBT_TO_INCOME_RATIO: 0.36,
  TARGET_SAVINGS_RATE: 0.2,
};

export const API_ROUTES = {
  HEALTH: '/health',
  CHAT: '/api/chat',
  CHAT_STREAM: '/api/chat/stream',
  VOICE: '/api/voice',
  VOICE_STREAM: '/api/voice/stream',
  FINANCE_PROFILE: '/api/finance/profile',
  FINANCE_METRICS: '/api/finance/metrics',
  TRANSACTIONS: '/api/finance/transactions',
  GOALS: '/api/finance/goals',
} as const;
