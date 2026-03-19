-- Agents table (department heads / primary AI workers)
CREATE TABLE agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  description text,
  avatar text DEFAULT '🤖',
  status text DEFAULT 'idle',
  model text DEFAULT 'claude-sonnet',
  assigned_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  current_task text,
  tasks_completed integer DEFAULT 0,
  tasks_failed integer DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sub-agents table (specialized workers under agents)
CREATE TABLE sub_agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text NOT NULL,
  description text,
  avatar text DEFAULT '🔧',
  status text DEFAULT 'idle',
  assigned_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  current_task text,
  tasks_completed integer DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Agent activity log
CREATE TABLE agent_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  sub_agent_id uuid REFERENCES sub_agents(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (for now)
CREATE POLICY "Allow all agents" ON agents FOR ALL TO anon USING (true);
CREATE POLICY "Allow all sub_agents" ON sub_agents FOR ALL TO anon USING (true);
CREATE POLICY "Allow all agent_activity" ON agent_activity FOR ALL TO anon USING (true);
