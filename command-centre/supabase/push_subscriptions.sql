-- Push Subscriptions Table for PWA
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;

-- Enable RLS but allow public insert
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON push_subscriptions FOR ALL USING (auth.role() = 'service_role');
