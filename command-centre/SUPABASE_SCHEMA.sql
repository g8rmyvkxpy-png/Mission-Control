-- ============================================
-- AI Agent Command Centre - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'idle')),
  current_task TEXT,
  last_heartbeat TIMESTAMPTZ,
  avatar_color TEXT DEFAULT '#10b981',
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for agents
ALTER PUBLICATION supabase_realtime ADD TABLE agents;

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_by TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in-progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- ============================================
-- ACTIVITY_LOGS TABLE
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  log_type TEXT DEFAULT 'info' CHECK (log_type IN ('heartbeat', 'task', 'error', 'info')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

-- ============================================
-- CRON_JOBS TABLE
-- ============================================
CREATE TABLE cron_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cron_expression TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for cron_jobs
ALTER PUBLICATION supabase_realtime ADD TABLE cron_jobs;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_activity_logs_agent_id ON activity_logs(agent_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_cron_jobs_agent_id ON cron_jobs(agent_id);
CREATE INDEX idx_cron_jobs_status ON cron_jobs(status);
CREATE INDEX idx_agents_api_key ON agents(api_key);

-- ============================================
-- ROW LEVEL SECURITY (OPTIONAL - for user auth)
-- ============================================
-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust as needed)
CREATE POLICY "Allow full access to authenticated users" ON agents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access to authenticated users" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access to authenticated users" ON activity_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access to authenticated users" ON cron_jobs FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTION: Update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tasks
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================
-- INSERT INTO agents (name, status, avatar_color, api_key) VALUES 
--   ('Neo', 'online', '#10b981', 'agent_neo_sk_123'),
--   ('Atlas', 'idle', '#3b82f6', 'agent_atlas_sk_456'),
--   ('Orbit', 'offline', '#f59e0b', 'agent_orbit_sk_789');
