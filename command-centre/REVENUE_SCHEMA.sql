-- ============================================
-- ENHANCED REVENUE & PIPELINE TABLES
-- Add to existing schema
-- ============================================

-- ============================================
-- REVENUE_ENTRIES TABLE - Track all revenue
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12,2) NOT NULL,
  source TEXT NOT NULL, -- 'subscription', 'one_time', 'consulting', 'other'
  customer_name TEXT,
  customer_email TEXT,
  description TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'refunded')),
  recurring BOOLEAN DEFAULT false,
  frequency TEXT CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  received_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PIPELINE TABLE - Track leads/opportunities
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT, -- 'inbound', 'outbound', 'referral', 'cold_call', 'website', 'other'
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value DECIMAL(12,2),
  probability INTEGER DEFAULT 10, -- 0-100
  expected_close_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- ============================================
-- ENHANCED TASKS TABLE - Add more priority levels
-- ============================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 2; -- 0=P0(critical), 1=P1(high), 2=P2(medium), 3=P3(low)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ============================================
-- MILESTONES TABLE - Track revenue milestones
-- ============================================
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  reached BOOLEAN DEFAULT false,
  reached_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_revenue_entries_status ON revenue_entries(status);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_received_date ON revenue_entries(received_date);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_assigned ON pipeline(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority_score);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_revenue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_revenue_entries_updated_at 
  BEFORE UPDATE ON revenue_entries
  FOR EACH ROW EXECUTE FUNCTION update_revenue_updated_at();

CREATE TRIGGER update_pipeline_updated_at 
  BEFORE UPDATE ON pipeline
  FOR EACH ROW EXECUTE FUNCTION update_revenue_updated_at();

-- ============================================
-- SEED DEFAULT MILESTONES
-- ============================================
INSERT INTO milestones (title, target_amount) VALUES
  ('First Revenue', 1000),
  ('Getting Started', 5000),
  ('Breaking $10K', 10000),
  ('Breaking $50K', 50000),
  ('Breaking $100K', 100000),
  ('Half Way', 500000),
  ('Million Dollar', 1000000)
ON CONFLICT DO NOTHING;
