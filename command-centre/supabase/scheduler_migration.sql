-- Agent Scheduler Tables
-- Run this in Supabase SQL Editor

-- Agent recurring schedules (weekly patterns)
CREATE TABLE IF NOT EXISTS agent_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  task_type TEXT DEFAULT 'general' CHECK (task_type IN ('general', 'research', 'operations', 'reporting', 'maintenance')),
  label TEXT,
  colour TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One-time schedule blocks
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  task_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'running', 'completed', 'skipped')),
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE agent_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_blocks;

-- Seed data for default schedules
INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 1, '08:00', '09:00', 'general', 'Morning Coordination', '#10b981'
FROM agents WHERE name = 'Neo'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 2, '08:00', '09:00', 'general', 'Morning Coordination', '#10b981'
FROM agents WHERE name = 'Neo'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 3, '08:00', '09:00', 'general', 'Morning Coordination', '#10b981'
FROM agents WHERE name = 'Neo'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 4, '08:00', '09:00', 'general', 'Morning Coordination', '#10b981'
FROM agents WHERE name = 'Neo'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 5, '08:00', '09:00', 'general', 'Morning Coordination', '#10b981'
FROM agents WHERE name = 'Neo'
ON CONFLICT DO NOTHING;

-- Atlas research blocks
INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 1, '09:00', '11:00', 'research', 'Deep Research Block', '#3b82f6'
FROM agents WHERE name = 'Atlas'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 2, '09:00', '11:00', 'research', 'Deep Research Block', '#3b82f6'
FROM agents WHERE name = 'Atlas'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 3, '09:00', '11:00', 'research', 'Deep Research Block', '#3b82f6'
FROM agents WHERE name = 'Atlas'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 4, '09:00', '11:00', 'research', 'Deep Research Block', '#3b82f6'
FROM agents WHERE name = 'Atlas'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 5, '09:00', '11:00', 'research', 'Deep Research Block', '#3b82f6'
FROM agents WHERE name = 'Atlas'
ON CONFLICT DO NOTHING;

-- Orbit daily summaries
INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 1, '18:00', '19:00', 'reporting', 'Daily Summary Report', '#f97316'
FROM agents WHERE name = 'Orbit'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 2, '18:00', '19:00', 'reporting', 'Daily Summary Report', '#f97316'
FROM agents WHERE name = 'Orbit'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 3, '18:00', '19:00', 'reporting', 'Daily Summary Report', '#f97316'
FROM agents WHERE name = 'Orbit'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 4, '18:00', '19:00', 'reporting', 'Daily Summary Report', '#f97316'
FROM agents WHERE name = 'Orbit'
ON CONFLICT DO NOTHING;

INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, task_type, label, colour)
SELECT id, 5, '18:00', '19:00', 'reporting', 'Daily Summary Report', '#f97316'
FROM agents WHERE name = 'Orbit'
ON CONFLICT DO NOTHING;
