/**
 * DhanMITR Shared TypeScript Type Definitions
 * Auto-aligned with /shared/schemas
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export type EmploymentType = 'salaried' | 'self_employed' | 'freelancer' | 'student' | 'retired';

export type TaxRegime = 'new' | 'old' | 'not_applicable';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';

export type TransactionCategory =
  | 'groceries'
  | 'dining'
  | 'utilities'
  | 'rent'
  | 'shopping'
  | 'travel'
  | 'healthcare'
  | 'education'
  | 'entertainment'
  | 'salary'
  | 'freelance'
  | 'investment_return'
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

// -----------------------------------------------------------------------------
// User Profile & Context
// -----------------------------------------------------------------------------

export interface UserFinancialProfile {
  user_id: string;
  currency: CurrencyCode;
  monthly_income: number;
  monthly_expenses: number;
  emergency_fund_balance: number;
  total_investments: number;
  total_liabilities: number;
  risk_tolerance: RiskTolerance;
  employment_type: EmploymentType;
  tax_regime: TaxRegime;
  updated_at?: string;
}

export interface SpendingCategorySummary {
  category: TransactionCategory;
  amount: number;
  percentage: number;
}

export interface FinancialContext {
  profile?: UserFinancialProfile;
  net_worth?: number;
  savings_rate_percentage?: number;
  runway_months?: number;
  debt_to_income_ratio?: number;
  top_spending_categories?: SpendingCategorySummary[];
  active_goals_count?: number;
  active_subscriptions_total?: number;
  active_insurance_coverages?: string[];
}

// -----------------------------------------------------------------------------
// Core Domain Entities
// -----------------------------------------------------------------------------

export interface Transaction {
  id: string;
  user_id?: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  account_name?: string;
  is_recurring?: boolean;
  tags?: string[];
}

export interface Subscription {
  id: string;
  user_id?: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  billing_cycle: BillingCycle;
  category?: string;
  next_renewal_date?: string;
  is_active: boolean;
}

export interface Insurance {
  id: string;
  user_id?: string;
  policy_name: string;
  provider: string;
  policy_type: InsuranceType;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency: 'monthly' | 'quarterly' | 'yearly';
  renewal_date?: string;
  policy_number?: string;
}

export interface FinancialGoal {
  id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: GoalCategory;
  monthly_contribution?: number;
  priority: GoalPriority;
  is_completed: boolean;
}

// -----------------------------------------------------------------------------
// Chat & Voice API Contracts
// -----------------------------------------------------------------------------

export interface KnowledgeSource {
  title: string;
  source_type: string;
  snippet: string;
  url?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  user_id?: string;
  stream?: boolean;
  language?: string;
  financial_context?: FinancialContext;
}

export interface ChatResponse {
  message_id: string;
  conversation_id: string;
  reply: string;
  sources?: KnowledgeSource[];
  suggested_actions?: string[];
  metrics_snapshot?: Record<string, any>;
  created_at: string;
}

export interface ChatStreamChunk {
  type: 'delta' | 'source' | 'suggestion' | 'done' | 'error';
  content?: string;
  source?: KnowledgeSource;
  suggestions?: string[];
  error?: string;
}

export interface STTTelemetry {
  provider: string;
  latency_ms: number;
}

export interface TTSTelemetry {
  provider: string;
  voice: string;
  latency_ms: number;
}

export interface VoiceTimingTelemetry {
  total_ms: number;
}

export interface VoiceHealthProviderStatus {
  provider: string;
  loaded: boolean;
  warmed_up: boolean;
  error?: string | null;
  warmup_ms: number;
}

export interface VoiceHealthResponse {
  status: string;
  service: string;
  stt: VoiceHealthProviderStatus | Record<string, unknown>;
  tts: VoiceHealthProviderStatus | Record<string, unknown>;
  uptime_ready: boolean;
}

export interface VoiceRequest {
  audio_base64?: string;
  text?: string;
  voice_id?: string;
  language?: string;
  stream_output?: boolean;
  user_id?: string;
  financial_context?: FinancialContext;
}

export interface VoiceResponse {
  transcript: string;
  answer?: string;
  reply_text?: string;
  audio_base64?: string;
  audio_format?: string;
  language?: string;
  duration_seconds?: number;
  latency_ms?: number;
  stt?: STTTelemetry;
  tts?: TTSTelemetry;
  timing?: VoiceTimingTelemetry;
}

