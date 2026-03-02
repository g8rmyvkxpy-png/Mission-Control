import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'better-sqlite3';

const db = new sqlite3('./data/usage.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id TEXT NOT NULL,
    type TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function POST(request: NextRequest) {
  try {
    const { organization_id, type, count = 1 } = await request.json();

    if (!organization_id || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    db.prepare('INSERT INTO usage (organization_id, type, count) VALUES (?, ?, ?)')
      .run(organization_id, type, count);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization_id = searchParams.get('organization_id') || '56b94071-3455-4967-9300-60788486a4fb';

  try {
    const tasks = db.prepare(`
      SELECT SUM(count) as total FROM usage 
      WHERE organization_id = ? AND type = 'task'
    `).get(organization_id) as any;

    const agents = db.prepare(`
      SELECT COUNT(DISTINCT organization_id) as total FROM usage 
      WHERE organization_id = ? AND type = 'agent'
    `).get(organization_id) as any;

    return NextResponse.json({
      tasks: tasks?.total || 0,
      agents: agents?.total || 0,
      plan_limits: {
        starter: { tasks: 1000, agents: 5 },
        growth: { tasks: 10000, agents: 20 },
        enterprise: { tasks: -1, agents: -1 }
      }
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
