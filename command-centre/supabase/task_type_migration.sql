-- Add task_type column to tasks table for task classification
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'general';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS implementation_details JSONB DEFAULT '{}';

-- Create index for faster filtering by task_type
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);

-- Update existing tasks to have explicit types based on their content
UPDATE tasks SET task_type = 'research' 
WHERE LOWER(title) LIKE '%research%' OR LOWER(description) LIKE '%research%' OR LOWER(title) LIKE '%analyz%';

UPDATE tasks SET task_type = 'content' 
WHERE LOWER(title) LIKE '%blog%' OR LOWER(title) LIKE '%post%' OR LOWER(title) LIKE '%write%' OR LOWER(title) LIKE '%content%';

UPDATE tasks SET task_type = 'code_fix' 
WHERE LOWER(title) LIKE '%fix%' OR LOWER(title) LIKE '%bug%' OR LOWER(title) LIKE '%implement%' OR LOWER(title) LIKE '%update%' OR LOWER(title) LIKE '%add%' OR LOWER(title) LIKE '%create%';
