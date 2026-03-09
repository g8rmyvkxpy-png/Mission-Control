import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'ai-automation-service', 'data', 'automation.db');
export const db = new Database(dbPath);

// Initialize RPA tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rpa_tasks (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    agent_id TEXT,
    task_type TEXT NOT NULL,
    target_url TEXT,
    instructions TEXT,
    status TEXT DEFAULT 'pending',
    result TEXT,
    screenshot_path TEXT,
    video_path TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_rpa_tasks_client_id ON rpa_tasks(client_id);
  CREATE INDEX IF NOT EXISTS idx_rpa_tasks_status ON rpa_tasks(status);
`);

console.log('RPA tables initialized');
