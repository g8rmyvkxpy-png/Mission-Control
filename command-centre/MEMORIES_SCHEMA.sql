-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  summary TEXT,
  memory_type TEXT DEFAULT 'conversation',
  tags TEXT[],
  memory_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE memories;

-- Seed data
INSERT INTO memories (content, summary, memory_type, memory_date) VALUES
  ('Neo completed weather research for Bengaluru. Result was clear skies 28°C.', 'Weather task completed', 'conversation', CURRENT_DATE),
  ('Atlas identified 3 competitor pricing changes during weekly scan.', 'Pricing scan done', 'conversation', CURRENT_DATE - 1),
  ('Orbit noted that task response times improve when tasks are under 20 words.', 'Performance insight', 'insight', CURRENT_DATE - 1),
  ('Command Centre is running on port 3001 with Supabase backend.', 'Infrastructure fact', 'longterm', CURRENT_DATE - 2),
  ('All three agents Neo Atlas Orbit are configured and operational.', 'Agent setup fact', 'longterm', CURRENT_DATE - 2);
