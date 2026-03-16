-- Email Automation CRM Schema
-- Run this in Supabase SQL Editor

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  category TEXT DEFAULT 'other',
  source TEXT DEFAULT 'email',
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking table
CREATE TABLE IF NOT EXISTS email_tracking (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  email_type TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Follow-up sequences table
CREATE TABLE IF NOT EXISTS followup_sequences (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  step_number INTEGER,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending'
);

-- Daily digest settings
CREATE TABLE IF NOT EXISTS digest_settings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  notify_email TEXT NOT NULL,
  send_time TIME DEFAULT '08:00:00',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_followup_scheduled ON followup_sequences(scheduled_for);
