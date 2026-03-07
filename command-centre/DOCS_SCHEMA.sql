-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT DEFAULT 'markdown',
  category TEXT DEFAULT 'general',
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  tags TEXT[],
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- Seed data
INSERT INTO documents (title, content, format, category, word_count) VALUES
  ('Weekly Newsletter Draft - March 2026', '# Weekly AI Update\n\nThis week in AI was packed with announcements from major labs. We saw new model releases from Anthropic, OpenAI continues to push boundaries with GPT updates. The big story is agents becoming production-ready.', 'markdown', 'newsletter', 46),
  ('Command Centre Architecture Plan', '## Architecture\n\nThe Command Centre runs on Next.js 14 with Supabase backend.\n\nComponents:\n- Dashboard UI with React\n- API routes for all CRUD operations\n- Supabase for storage and realtime\n- Agent execution engine\n\nTech Stack:\n- Next.js 14\n- Supabase\n- Minimax API\n- React', 'markdown', 'plan', 42),
  ('Competitor Research Report', 'Competitor analysis shows pricing changes across 3 major players:\n\n1. Anthropic - increased API pricing by 15%\n2. OpenAI - introduced new tier structure\n3. Google - expanded free tier limits\n\nRecommendation: Monitor closely and adjust pricing strategy accordingly.', 'plaintext', 'research', 35);
