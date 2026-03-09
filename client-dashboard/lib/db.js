import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'ai-automation-service', 'data', 'automation.db');
export const db = new Database(dbPath);
