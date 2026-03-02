import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'tasks.db');
let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Failed to connect to database:', error);
}

// Agent configurations
const AGENTS: Record<string, any> = {
  builder: { name: 'Builder', avatar: '🔨', specialty: 'Code & Build' },
  scout: { name: 'Scout', avatar: '🔍', specialty: 'Research' },
  ink: { name: 'Ink', avatar: '✍️', specialty: 'Content' },
  blaze: { name: 'Blaze', avatar: '📱', specialty: 'Social' },
  spark: { name: 'Spark', avatar: '💡', specialty: 'Analysis' }
};

function assignAgent(title: string): string {
  const t = title.toLowerCase();
  // Builder: code, build, fix, create, add, update, git, deploy
  if (t.includes('build') || t.includes('code') || t.includes('fix') || t.includes('bug') || t.includes('git') || t.includes('deploy') || t.includes('create') || t.includes('add') || t.includes('update') || t.includes('improve')) return 'builder';
  // Scout: research, find, search, analyze, look
  if (t.includes('research') || t.includes('find') || t.includes('search') || t.includes('analyze') || t.includes('look')) return 'scout';
  // Ink: write, content, blog, article, document
  if (t.includes('write') || t.includes('blog') || t.includes('content') || t.includes('article') || t.includes('document')) return 'ink';
  // Blaze: social media, twitter, linkedin, post, outreach
  if (t.includes('twitter') || t.includes('social') || t.includes('post') || t.includes('outreach') || t.includes('linkedin') || t.includes('instagram')) return 'blaze';
  return 'scout';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const title = body.get('title') as string;
    const description = body.get('description') as string;
    const organizationId = body.get('organization_id') as string || 'default';

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskId = `task_${Date.now()}`;
    const agentId = assignAgent(title);
    const agent = AGENTS[agentId] || AGENTS.scout;
    const timestamp = Date.now();

    // Save task as pending - worker will pick it up
    if (!db) {
      console.error('Database not connected');
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }
    
    try {
      const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, assigned_to, agent_name, agent_avatar, organization_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(taskId, title, description || '', 'pending', agentId, agent.name, agent.avatar, organizationId, timestamp, timestamp);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error: ' + String(dbError) }, { status: 500 });
    }

    // Trigger worker to process immediately
    try {
      await fetch('http://localhost:3000/api/worker', { 
        method: 'POST',
        cache: 'no-store'
      });
    } catch (workerError) {
      console.log('Worker not reachable, will be picked up by cron');
    }

    return NextResponse.json({
      success: true,
      task: {
        id: taskId,
        title,
        description,
        status: 'pending',
        assigned_to: agentId,
        agent_name: agent.name,
        agent_avatar: agent.avatar,
        organization_id: organizationId,
        created_at: new Date(timestamp).toISOString()
      },
      message: `Task created! ${agent.name} will start working on it shortly.`
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to create a task',
    agents: Object.keys(AGENTS),
    example: { title: 'Research AI trends', organization_id: 'org-id' }
  });
}
