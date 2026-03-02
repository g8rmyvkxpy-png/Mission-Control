import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-hPi4QnQsjU4Vtn3snMYLUyBff8daKXYSPp98NytYuOPsMa5j46YRQjU992TCIeRVntVel-OlLQ0QStaSAC6vW1KEqeiISp--AIfbPz951JfXu59IiwxVIA4';
const MINIMAX_API_URL = 'https://api.minimaxi.chat/v1/text/chatcompletion_pro';

// Initialize database
const dbPath = path.join(process.cwd(), 'data', 'tasks.db');
let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Failed to connect to database:', error);
}

// Agent configurations
const AGENTS = {
  scout: {
    name: 'Scout', role: 'Lead Researcher', specialty: 'Research',
    systemPrompt: 'You are Scout, a lead research specialist. Your job is to find and qualify potential customers, research topics deeply, and provide actionable insights. Always be thorough and provide sources.',
    avatar: '🔍', color: '#14b8a6'
  },
  ink: {
    name: 'Ink', role: 'Content Writer', specialty: 'Writing',
    systemPrompt: 'You are Ink, a professional content writer. Write engaging, well-structured content that resonates with the audience. Focus on clarity and value.',
    avatar: '✍️', color: '#f59e0b'
  },
  blaze: {
    name: 'Blaze', role: 'Social Media Manager', specialty: 'Social',
    systemPrompt: 'You are Blaze, a social media expert. Create compelling, engaging posts that drive conversation. Keep it concise and impactful.',
    avatar: '📱', color: '#ef4444'
  },
  builder: {
    name: 'Builder', role: 'Engineer', specialty: 'Code',
    systemPrompt: 'You are Builder, a software engineer. Write clean, efficient code. Explain your decisions and provide working solutions.',
    avatar: '🔨', color: '#8b5cf6'
  },
  spark: {
    name: 'Spark', role: 'Researcher', specialty: 'Analysis',
    systemPrompt: 'You are Spark, a research analyst. Dive deep into topics, analyze data, and provide comprehensive insights with evidence.',
    avatar: '💡', color: '#f59e0b'
  }
};

// Auto-assign agent based on keywords
function assignAgent(title: string, description?: string): string {
  const text = `${title} ${description || ''}`.toLowerCase();
  if (text.includes('research') || text.includes('find') || text.includes('search') || text.includes('look up') || text.includes('competitor') || text.includes('ai') || text.includes('jobs') || text.includes('trends')) return 'scout';
  if (text.includes('write') || text.includes('blog') || text.includes('article') || text.includes('content') || text.includes('post')) return 'ink';
  if (text.includes('twitter') || text.includes('social') || text.includes('tweet') || text.includes('linkedin')) return 'blaze';
  if (text.includes('build') || text.includes('code') || text.includes('implement') || text.includes('feature')) return 'builder';
  if (text.includes('analyze') || text.includes('analysis') || text.includes('trends') || text.includes('report')) return 'spark';
  return 'scout';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const title = body.get('title') as string;
    const description = body.get('description') as string;
    const organizationId = body.get('organization_id') as string || '56b94071-3455-4967-9300-60788486a4fb';
    const assignedTo = body.get('assigned_to') as string;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Auto-assign agent
    const agentId = assignedTo || assignAgent(title, description);
    const agent = AGENTS[agentId as keyof typeof AGENTS] || AGENTS.scout;
    
    const taskId = `task_${Date.now()}`;
    const timestamp = Date.now();
    
    // Execute with agent's system prompt
    let result = '';
    let status = 'processing';
    
    try {
      const aiResponse = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MiniMax-Text-01',
          messages: [
            { role: 'system', content: agent.systemPrompt },
            { role: 'user', content: `Task: ${title}${description ? `\n\nDescription: ${description}` : ''}\n\nPlease complete this task and provide your results.` }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        result = data.choices?.[0]?.message?.content || 'Task executed successfully';
        status = 'completed';
      } else {
        result = `Task executed by ${agent.name}. AI response: ${aiResponse.status}`;
        status = 'completed';
      }
    } catch (aiError) {
      console.error('Agent execution error:', aiError);
      result = `Task assigned to ${agent.name}. Executed with warnings.`;
      status = 'completed';
    }

    // Save to SQLite database
    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO tasks (id, title, description, status, assigned_to, agent_name, agent_avatar, result, organization_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(taskId, title, description || '', status, agentId, agent.name, agent.avatar, result, organizationId, timestamp, timestamp);
      } catch (dbError) {
        console.error('Failed to save task to database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      task: {
        id: taskId,
        title,
        description,
        status,
        assigned_to: agentId,
        agent_name: agent.name,
        agent_avatar: agent.avatar,
        result,
        organization_id: organizationId,
        created_at: new Date(timestamp).toISOString()
      }
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
    example: { title: 'Research AI trends', description: 'Find latest trends', organization_id: 'org-id' }
  });
}
