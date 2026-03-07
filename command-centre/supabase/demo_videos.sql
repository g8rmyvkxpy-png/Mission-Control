-- Demo Videos table for agent task recordings
CREATE TABLE IF NOT EXISTS demo_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'ready', 'failed')),
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE demo_videos;

-- Allow access
CREATE POLICY "Allow all access to demo_videos" ON demo_videos FOR ALL USING (true) WITH CHECK (true);
