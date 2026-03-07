-- ===========================================
-- VENTURE ASSETS - Private Wealth Tracking
-- Run this in Supabase SQL Editor
-- ===========================================

-- ===========================================
-- VENTURE ASSETS TABLE
-- ===========================================
DROP TABLE IF EXISTS public.venture_assets;

CREATE TABLE IF NOT EXISTS public.venture_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Real Estate', 'Crypto', 'Stocks', 'Bank', 'Other')),
    current_value DECIMAL(15,2) DEFAULT 0,
    location TEXT,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    founder_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.venture_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: ONLY the founder can see their assets
-- This ensures total isolation - even if URL is discovered, data is protected
CREATE POLICY "Founders can only access own assets" 
    ON public.venture_assets 
    FOR ALL 
    USING (founder_id = auth.uid());

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_venture_assets_category ON public.venture_assets(category);
CREATE INDEX IF NOT EXISTS idx_venture_assets_founder ON public.venture_assets(founder_id);

-- ===========================================
-- FUNCTION: Auto-set founder_id on insert
-- ===========================================
CREATE OR REPLACE FUNCTION set_founder_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.founder_id IS NULL THEN
        NEW.founder_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_venture_assets_founder
    BEFORE INSERT ON public.venture_assets
    FOR EACH ROW
    EXECUTE FUNCTION set_founder_id();
