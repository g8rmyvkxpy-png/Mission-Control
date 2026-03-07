-- ===========================================
-- SAAS REVENUE TRACKING
-- Run in Supabase SQL Editor
-- ===========================================

-- ===========================================
-- VENTURE REVENUE TABLE (SaaS Metrics)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.venture_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('Basic', 'Pro', 'Ultra', 'Enterprise')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    revenue_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    customer_email TEXT,
    customer_name TEXT,
    stripe_payment_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    founder_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.venture_revenue ENABLE ROW LEVEL SECURITY;

-- RLS: Only founder can view revenue
CREATE POLICY "Founders can view revenue" ON public.venture_revenue
    FOR SELECT USING (founder_id = auth.uid());

-- RLS: Service can insert
CREATE POLICY "Service can insert revenue" ON public.venture_revenue
    FOR INSERT WITH CHECK (true);

-- ===========================================
-- SAAS METRICS TABLE (Aggregated)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.saas_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    mrr DECIMAL(10,2) DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0,
    active_agents INTEGER DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    founder_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.saas_metrics ENABLE ROW LEVEL SECURITY;

-- RLS: Only founder can view metrics
CREATE POLICY "Founders can view metrics" ON public.saas_metrics
    FOR SELECT USING (founder_id = auth.uid());

-- RLS: Service can insert metrics
CREATE POLICY "Service can insert metrics" ON public.saas_metrics
    FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_revenue_date ON public.venture_revenue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON public.saas_metrics(metric_date DESC);
