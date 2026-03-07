-- Second Brain Table for Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS second_brain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'note' CHECK (type IN ('note', 'link', 'book', 'idea', 'task', 'reminder', 'resource')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'done')),
  tags TEXT[],
  source TEXT,
  agent_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE second_brain;

-- Insert seed data
INSERT INTO second_brain (title, content, type, tags) VALUES
  ('Read: Thinking Fast and Slow', 'Book recommendation from a friend about decision making and cognitive biases', 'book', ARRAY['reading', 'psychology']),
  ('Idea: AI newsletter for developers', 'Weekly curated AI news specifically for developers building with LLMs', 'idea', ARRAY['content', 'business']),
  ('Resource: Minimax API docs', 'https://platform.minimaxi.com/document/guides', 'link', ARRAY['minimax', 'api']),
  ('Reminder: Check agent heartbeats daily', 'Make sure all 3 agents are heartbeating every morning', 'reminder', ARRAY['agents', 'ops']),
  ('Note: Command Centre running on port 3001', 'Separate Next.js app from main OpenClaw workspace', 'note', ARRAY['infra', 'setup']);
