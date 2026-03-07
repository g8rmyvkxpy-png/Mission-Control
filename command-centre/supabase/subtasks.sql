-- Subtasks table for multi-agent collaboration
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  child_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES agents(id) ON DELETE SET NULL,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;

-- Allow access
CREATE POLICY "Allow all access to subtasks" ON subtasks FOR ALL USING (true) WITH CHECK (true);
