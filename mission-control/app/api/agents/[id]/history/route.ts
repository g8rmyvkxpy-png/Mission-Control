import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'tasks.db');
const db = new Database(dbPath);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get tasks for this agent - using correct column names
    const tasks = db.prepare(`
      SELECT id, title, description, status, priority, created_at, completed_at, error
      FROM tasks 
      WHERE assigned_to = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(id);
    
    // Transform to camelCase for frontend
    const transformedTasks = tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      error: task.error,
    }));
    
    return NextResponse.json({ tasks: transformedTasks });
  } catch (error) {
    console.error('Failed to fetch agent history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
