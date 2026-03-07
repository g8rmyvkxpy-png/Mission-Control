-- Goals table for Agent Brain Dump feature
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('business', 'personal', 'content', 'technical', 'financial', 'health', 'general')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused')),
  timeframe TEXT DEFAULT 'longterm' CHECK (timeframe IN ('daily', 'weekly', 'monthly', 'quarterly', 'longterm')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent generated tasks table
CREATE TABLE IF NOT EXISTS agent_generated_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  generated_date DATE DEFAULT CURRENT_DATE,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime on goals
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- Add goals table to API
CREATE POLICY "Allow all access to goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to agent_generated_tasks" ON agent_generated_tasks FOR ALL USING (true) WITH CHECK (true);

-- Seed data
INSERT INTO goals (title, description, category, priority, timeframe) VALUES
  ('Grow Command Centre capabilities', 'Keep building and improving the AI agent Command Centre with new features', 'technical', 5, 'monthly'),
  ('Automate daily research', 'Have agents automatically research relevant topics every day without manual input', 'business', 4, 'weekly'),
  ('Build content pipeline', 'Set up agents to research, write and prepare content automatically', 'content', 4, 'monthly'),
  ('Maximise agent productivity', 'Ensure Neo Atlas and Orbit are completing meaningful tasks every single day', 'business', 5, 'daily');
