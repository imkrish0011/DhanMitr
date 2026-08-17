-- ==============================================================================
-- DhanMITR Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables and security policies.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Stores user financial profile & onboarding info)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_initial TEXT,
    currency TEXT DEFAULT 'INR',
    monthly_income NUMERIC DEFAULT 0,
    monthly_expenses NUMERIC DEFAULT 0,
    emergency_fund_balance NUMERIC DEFAULT 0,
    total_investments NUMERIC DEFAULT 0,
    total_liabilities NUMERIC DEFAULT 0,
    risk_tolerance TEXT DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    employment_type TEXT DEFAULT 'salaried' CHECK (employment_type IN ('salaried', 'self_employed', 'freelancer', 'student', 'retired')),
    tax_regime TEXT DEFAULT 'new' CHECK (tax_regime IN ('new', 'old', 'not_applicable')),
    is_onboarded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_initial, is_onboarded)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    NEW.email,
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'U'), 1, 1)),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Subscriptions Table (OTT & Recurring Services)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT,
    logo_key TEXT DEFAULT 'other',
    plan_name TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'weekly')),
    category TEXT DEFAULT 'Entertainment',
    next_renewal_date TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
ON public.subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Insurances Table (Health, Term Life, Motor, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    provider TEXT,
    logo_key TEXT DEFAULT 'other',
    policy_type TEXT DEFAULT 'term_life' CHECK (policy_type IN ('health', 'term_life', 'motor', 'home', 'critical_illness', 'other')),
    policy_number TEXT,
    coverage_amount NUMERIC DEFAULT 0,
    premium_amount NUMERIC NOT NULL DEFAULT 0,
    premium_frequency TEXT DEFAULT 'yearly' CHECK (premium_frequency IN ('monthly', 'quarterly', 'yearly')),
    renewal_date TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.insurances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own insurances"
ON public.insurances FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. Income Sources Table (Salary, Freelance, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'one_time', 'yearly')),
    category TEXT DEFAULT 'salary',
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own income sources"
ON public.income_sources FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. Budget Items Table (Category Limits & Spend Targets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    category_key TEXT NOT NULL,
    allocated NUMERIC NOT NULL DEFAULT 0,
    spent NUMERIC NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#34D399',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budget items"
ON public.budget_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. Transactions Table (Expenses, Incomes & Transfers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'investment')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    account_name TEXT,
    is_recurring BOOLEAN DEFAULT false,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions"
ON public.transactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
