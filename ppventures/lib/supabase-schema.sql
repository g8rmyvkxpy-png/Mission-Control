-- ===========================================
-- PPVENTURES SUPABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ===========================================

-- ===========================================
-- LEADS TABLE (Contact Form Submissions)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    service_interest TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    source TEXT DEFAULT 'website',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    founder_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Founder can see all leads
CREATE POLICY "Founders can view all leads" ON public.leads
    FOR SELECT USING (founder_id = auth.uid() OR auth.role() = 'service_role');

-- RLS Policy: Anyone can insert leads (for contact form)
CREATE POLICY "Anyone can insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- ===========================================
-- AGENT ACTIVITY TABLE (Intelligence Modal)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.agent_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('task_created', 'task_completed', 'task_failed', 'message_sent', 'lead_captured')),
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    founder_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.agent_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Founder can see all agent activity
CREATE POLICY "Founders can view agent activity" ON public.agent_activity
    FOR SELECT USING (founder_id = auth.uid() OR auth.role() = 'service_role');

-- RLS Policy: Service role can insert
CREATE POLICY "Service can insert agent activity" ON public.agent_activity
    FOR INSERT WITH CHECK (true);

-- ===========================================
-- VENTURE ASSETS TABLE (Founder Data - Private)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.venture_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type TEXT NOT NULL CHECK (asset_type IN ('property', 'stock', 'crypto', 'bank', 'other')),
    asset_name TEXT NOT NULL,
    asset_value DECIMAL(15,2),
    asset_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    founder_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.venture_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: ONLY founder can see their own assets
CREATE POLICY "Founders can only view own assets" ON public.venture_assets
    FOR ALL USING (founder_id = auth.uid());

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent ON public.agent_activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created ON public.agent_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_venture_assets_type ON public.venture_assets(asset_type);

-- ===========================================
-- FUNCTION: Update updated_at trigger
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leads
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create trigger for venture_assets
CREATE TRIGGER update_venture_assets_updated_at
    BEFORE UPDATE ON public.venture_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
