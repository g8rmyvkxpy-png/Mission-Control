import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// === DATABASE SETUP ===
const DB_PATH = path.join(process.cwd(), 'data', 'tasks.db');
let db: Database.Database;

try {
  db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      completed_at INTEGER,
      result TEXT,
      error TEXT,
      metadata TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
  `);
  console.log('[DB] SQLite initialized at', DB_PATH);
} catch (e) {
  console.error('[DB] Failed to init SQLite:', e);
  db = null as any;
}

// Agent definitions with avatars
const AGENTS = [
  { id: 'atlas', name: 'Atlas', specialty: 'Lead Generation', avatar: '💰' },
  { id: 'pulse', name: 'Pulse', specialty: 'Prospecting', avatar: '🎯' },
  { id: 'hunter', name: 'Hunter', specialty: 'Calling', avatar: '🏹' },
  { id: 'phoenix', name: 'Phoenix', specialty: 'Conversion', avatar: '🔥' },
  { id: 'scout', name: 'Scout', specialty: 'Analysis', avatar: '🔬' },
  { id: 'radar', name: 'Radar', specialty: 'SEO', avatar: '🔍' },
  { id: 'compass', name: 'Compass', specialty: 'Monitoring', avatar: '🧭' },
  { id: 'trends', name: 'Trends', specialty: 'Trends', avatar: '📈' },
  { id: 'bond', name: 'Bond', specialty: 'Churn', avatar: '🛡️' },
  { id: 'mend', name: 'Mend', specialty: 'Resolution', avatar: '🩹' },
  { id: 'grow', name: 'Grow', specialty: 'Upsell', avatar: '🌱' },
  { id: 'byte', name: 'Byte', specialty: 'Build', avatar: '💻' },
  { id: 'pixel', name: 'Pixel', specialty: 'UI', avatar: '🎨' },
  { id: 'server', name: 'Server', specialty: 'APIs', avatar: '⚙️' },
  { id: 'auto', name: 'Auto', specialty: 'Automation', avatar: '🤖' },
  { id: 'ink', name: 'Ink', specialty: 'Blogs', avatar: '✍️' },
  { id: 'blaze', name: 'Blaze', specialty: 'Twitter', avatar: '📱' },
  { id: 'cinema', name: 'Cinema', specialty: 'Video', avatar: '🎬' },
  { id: 'draft', name: 'Draft', specialty: 'Newsletters', avatar: '📧' },
];

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

// === LOAD TASKS FROM DB ===
let tasks: Task[] = [];

function loadTasks() {
  if (!db) return;
  try {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as any[];
    tasks = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      assignedTo: row.assigned_to || undefined,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at || undefined,
      result: row.result ? JSON.parse(row.result) : undefined,
      error: row.error || undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
    console.log('[DB] Loaded', tasks.length, 'tasks');
  } catch (e) {
    console.error('[DB] Load error:', e);
  }
}

function saveTask(task: Task) {
  if (!db) return;
  try {
    db.prepare(`
      INSERT OR REPLACE INTO tasks (id, title, description, assigned_to, status, priority, created_at, updated_at, completed_at, result, error, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.id,
      task.title,
      task.description,
      task.assignedTo || null,
      task.status,
      task.priority,
      task.createdAt,
      task.updatedAt,
      task.completedAt || null,
      task.result ? JSON.stringify(task.result) : null,
      task.error || null,
      task.metadata ? JSON.stringify(task.metadata) : null
    );
  } catch (e) {
    console.error('[DB] Save error:', e);
  }
}

loadTasks();

// === TOOL IMPLEMENTATIONS ===

async function searchWeb(query: string, maxResults = 5) {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY || process.env.NEXT_PUBLIC_TAVILY_API_KEY;
  
  if (!TAVILY_API_KEY) {
    return { success: false, error: 'Tavily API key not configured' };
  }
  
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_API_KEY, query, max_results: maxResults }),
    });
    const data = await response.json();
    return { success: true, results: data.results || [], answer: data.answer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function postTweet(content: string) {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.substring(0, 280))}`;
  return { success: true, url: tweetUrl, content: content.substring(0, 280) };
}

async function createGitHubIssue(owner: string, repo: string, title: string, body: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return { success: false, error: 'GitHub token not configured' };
  
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({ title, body }),
    });
    const data = await response.json();
    if (response.ok) return { success: true, issueNumber: data.number, url: data.html_url };
    return { success: false, error: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function generateContent(prompt: string, maxTokens = 500) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return { success: false, error: 'OpenAI API key not configured' };
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens }),
    });
    const data = await response.json();
    if (response.ok && data.choices?.[0]?.message?.content) {
      return { success: true, content: data.choices[0].message.content, usage: data.usage };
    }
    return { success: false, error: data.error?.message || 'Failed to generate' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeAgentTask(agentId: string, task: { title: string; description: string; metadata?: Record<string, any> }) {
  console.log(`[Executor] ${agentId}: ${task.title}`);
  
  switch (agentId) {
    case 'scout':
    case 'radar':
    case 'compass':
    case 'trends':
      return await searchWeb(task.metadata?.query || task.description || task.title);
    case 'ink':
      return await generateContent(`Write a blog post about: ${task.title}. ${task.description}`, 1500);
    case 'blaze':
      return await postTweet(task.metadata?.content || task.description || task.title);
    case 'draft':
      return await generateContent(`Write email about: ${task.title}. ${task.description}`, 500);
    case 'byte':
    case 'server': {
      const repo = task.metadata?.repo || 'g8rmyvkxpy-png/Mission-Control';
      const [owner, repoName] = repo.split('/');
      return await createGitHubIssue(owner, repoName, task.title, task.description);
    }
    default:
      return { success: false, error: `No handler for agent: ${agentId}` };
  }
}

// === TASK PROCESSOR ===

let processorInterval: NodeJS.Timeout | null = null;

function startProcessor() {
  if (processorInterval) return;
  processorInterval = setInterval(async () => await processTasks(), 10000);
  processTasks();
}

async function processTasks() {
  const pending = tasks.filter(t => t.status === 'pending');
  if (!pending.length) return;
  
  console.log(`[Processor] ${pending.length} pending tasks`);
  
  for (const task of pending) {
    if (!task.assignedTo) {
      task.status = 'failed';
      task.error = 'No agent assigned';
      saveTask(task);
      continue;
    }
    
    task.status = 'processing';
    task.updatedAt = Date.now();
    saveTask(task);
    
    try {
      const result: any = await executeAgentTask(task.assignedTo, { title: task.title, description: task.description, metadata: task.metadata });
      if (result.success) {
        task.status = 'completed';
        task.result = result;
      } else {
        task.status = 'failed';
        task.error = result.error;
      }
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
    }
    
    task.completedAt = Date.now();
    task.updatedAt = Date.now();
    saveTask(task);
  }
}

startProcessor();

// === API ROUTES ===

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    
    let filtered = [...tasks];
    if (status) filtered = filtered.filter(t => t.status === status);
    if (assignee) filtered = filtered.filter(t => t.assignedTo === assignee);
    
    const queueStatus = {
      pending: tasks.filter(t => t.status === 'pending').length,
      processing: tasks.filter(t => t.status === 'processing').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      total: tasks.length,
    };
    
    return NextResponse.json({ tasks: filtered, queueStatus, agents: AGENTS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, assignedTo, priority, metadata } = body;
    
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || '',
      assignedTo,
      priority: priority || 'medium',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    };
    
    const insertIndex = tasks.findIndex(t => priorityOrder[t.priority] > priorityOrder[task.priority]);
    if (insertIndex === -1) tasks.push(task);
    else tasks.splice(insertIndex, 0, task);
    
    saveTask(task);
    console.log(`[Queue] Task ${task.id} -> ${assignedTo || 'unassigned'}`);
    
    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { taskId, action } = body;
    if (!taskId || !action) return NextResponse.json({ error: 'taskId and action required' }, { status: 400 });
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return NextResponse.json({ success: false, error: 'Task not found' });
    
    const task = tasks[taskIndex];
    let result = false;
    
    if (action === 'cancel' && task.status === 'pending') {
      task.status = 'failed';
      task.error = 'Cancelled';
      task.updatedAt = Date.now();
      result = true;
    } else if (action === 'retry' && task.status === 'failed') {
      task.status = 'pending';
      task.error = undefined;
      task.updatedAt = Date.now();
      result = true;
    }
    
    if (result) saveTask(task);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('clear') === 'history') {
      tasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');
      if (db) db.prepare("DELETE FROM tasks WHERE status IN ('completed', 'failed')").run();
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
