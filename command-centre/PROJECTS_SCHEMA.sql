-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  owner_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Tasks linking table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime on projects
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Seed data
INSERT INTO projects (title, description, status, progress, priority) VALUES
  ('Command Centre Build', 'Building the full agent mission control dashboard', 'active', 60, 'high'),
  ('Agent Automation', 'Setting up Neo Atlas Orbit to run autonomous tasks', 'active', 30, 'high'),
  ('Content Factory', 'Research to scripts to thumbnails pipeline', 'paused', 10, 'medium');
