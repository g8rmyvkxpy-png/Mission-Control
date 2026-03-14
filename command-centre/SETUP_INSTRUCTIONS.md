/**
 * Revenue & Pipeline Schema Setup
 * 
 * Run this SQL in your Supabase SQL Editor to enable revenue tracking:
 */

-- ============================================
-- ENHANCED REVENUE & PIPELINE TABLES
-- ============================================

-- REVENUE_ENTRIES TABLE - Track all revenue
CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12,2) NOT NULL,
  source TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  description TEXT,
  status TEXT DEFAULT 'confirmed',
  recurring BOOLEAN DEFAULT false,
  frequency TEXT,
  received_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PIPELINE TABLE - Track leads/opportunities
CREATE TABLE IF NOT EXISTS pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT,
  stage TEXT DEFAULT 'lead',
  value DECIMAL(12,2),
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- MILESTONES TABLE
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  reached BOOLEAN DEFAULT false,
  reached_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to tasks if not exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 2;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revenue_entries_status ON revenue_entries(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority_score);

-- Seed milestones
INSERT INTO milestones (title, target_amount) VALUES
  ('First Revenue', 1000),
  ('Getting Started', 5000),
  ('Breaking $10K', 10000),
  ('Breaking $50K', 50000),
  ('Breaking $100K', 100000),
  ('Half Way', 500000),
  ('Million Dollar', 1000000)
ON CONFLICT DO NOTHING;
