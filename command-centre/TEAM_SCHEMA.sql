-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT DEFAULT 'agent',
  model TEXT,
  device TEXT,
  status TEXT DEFAULT 'offline',
  avatar_color TEXT DEFAULT '#6366f1',
  reports_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission statements table
CREATE TABLE IF NOT EXISTS mission_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

-- Seed data
INSERT INTO mission_statements (content) VALUES
  ('Build an autonomous organisation of AI agents that produce value 24/7 and continuously move closer to our goals.');

INSERT INTO team_members (name, role, type, model, device, status, avatar_color, description) VALUES
  ('You', 'Founder & Director', 'human', 'Human', 'MacBook', 'online', '#f59e0b', 'Owner and director of the operation. Sets goals and approves work.'),
  ('Neo', 'Lead Agent', 'agent', 'Minimax', 'Server', 'online', '#10b981', 'Primary agent. Handles research, tasks and coordination.'),
  ('Atlas', 'Research Agent', 'agent', 'Minimax', 'Server', 'idle', '#3b82f6', 'Handles deep research tasks and analysis.'),
  ('Orbit', 'Operations Agent', 'agent', 'Minimax', 'Server', 'idle', '#f97316', 'Manages operational tasks and monitoring.');
