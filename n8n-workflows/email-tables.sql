-- Email Automation Suite - Additional Tables
-- Run this in Supabase SQL Editor to add email-specific tables

-- Email tracking table
CREATE TABLE IF NOT EXISTS email_tracking (
  id BIGSERIAL PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  email_type TEXT,
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent'
);

-- Follow-up sequences table
CREATE TABLE IF NOT EXISTS followup_sequences (
  id BIGSERIAL PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  step_number INTEGER,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  email_subject TEXT,
  email_body TEXT
);

-- Daily digest settings
CREATE TABLE IF NOT EXISTS digest_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  notify_email TEXT NOT NULL,
  send_time TIME DEFAULT '08:00:00',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email automation logs
CREATE TABLE IF NOT EXISTS email_automation_logs (
  id BIGSERIAL PRIMARY KEY,
  workflow_id TEXT,
  event_type TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_lead ON email_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_scheduled ON followup_sequences(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_followup_status ON followup_sequences(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON email_automation_logs(created_at);
