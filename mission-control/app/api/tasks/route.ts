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

// All 19 agents with avatars
const AGENTS = [
  // Sales Team
  { id: 'atlas', name: 'Atlas', specialty: 'Lead Generation', avatar: '💰', team: 'sales' },
  { id: 'pulse', name: 'Pulse', specialty: 'Prospecting', avatar: '🎯', team: 'sales' },
  { id: 'hunter', name: 'Hunter', specialty: 'Cold Outreach', avatar: '🏹', team: 'sales' },
  { id: 'phoenix', name: 'Phoenix', specialty: 'Conversion', avatar: '🔥', team: 'sales' },
  // Research Team
  { id: 'scout', name: 'Scout', specialty: 'Analysis', avatar: '🔬', team: 'research' },
  { id: 'radar', name: 'Radar', specialty: 'SEO', avatar: '🔍', team: 'research' },
  { id: 'compass', name: 'Compass', specialty: 'Monitoring', avatar: '🧭', team: 'research' },
  { id: 'trends', name: 'Trends', specialty: 'Market Trends', avatar: '📈', team: 'research' },
  // Retention Team
  { id: 'bond', name: 'Bond', specialty: 'Churn Prevention', avatar: '🛡️', team: 'retention' },
  { id: 'mend', name: 'Mend', specialty: 'Issue Resolution', avatar: '🩹', team: 'retention' },
  { id: 'grow', name: 'Grow', specialty: 'Upsell', avatar: '🌱', team: 'retention' },
  // Dev Team
  { id: 'byte', name: 'Byte', specialty: 'Project Management', avatar: '💻', team: 'dev' },
  { id: 'pixel', name: 'Pixel', specialty: 'Frontend', avatar: '🎨', team: 'dev' },
  { id: 'server', name: 'Server', specialty: 'Backend', avatar: '⚙️', team: 'dev' },
  { id: 'auto', name: 'Auto', specialty: 'Automation', avatar: '🤖', team: 'dev' },
  // Content Team
  { id: 'ink', name: 'Ink', specialty: 'Blog Writing', avatar: '✍️', team: 'content' },
  { id: 'blaze', name: 'Blaze', specialty: 'Social Media', avatar: '📱', team: 'content' },
  { id: 'cinema', name: 'Cinema', specialty: 'Video', avatar: '🎬', team: 'content' },
  { id: 'draft', name: 'Draft', specialty: 'Email Campaigns', avatar: '📧', team: 'content' },
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

// === NEO ORCHESTRATION - Task Analysis & Splitting ===

// Agent capabilities mapping
const agentCapabilities: Record<string, string[]> = {
  scout: ['research', 'analyze', 'find', 'search', 'investigate'],
  radar: ['seo', 'ranking', 'keywords', 'visibility'],
  compass: ['competitor', 'competition', 'market analysis'],
  trends: ['trend', 'forecast', 'predict', 'future'],
  atlas: ['lead', 'prospect', 'customers'],
  pulse: ['outbound', 'discovery', 'find leads'],
  hunter: ['cold', 'outreach', 'call', 'contact'],
  phoenix: ['convert', 'demo', 'nurture', 'warm'],
  bond: ['retention', 'churn', 'prevent'],
  mend: ['issue', 'problem', 'resolve', 'fix'],
  grow: ['upsell', 'expand', 'grow', 'revenue'],
  byte: ['build', 'project', 'manage', 'github', 'git', 'commit', 'push', 'deploy'],
  pixel: ['ui', 'frontend', 'design'],
  server: ['backend', 'api', 'database'],
  auto: ['automate', 'zapier', 'integration'],
  ink: ['blog', 'write', 'article', 'content'],
  blaze: ['twitter', 'social', 'post', 'tweet'],
  cinema: ['video', 'youtube', 'film'],
  draft: ['email', 'newsletter', 'campaign'],
  care: ['support', 'help', 'ticket'],
  neo: ['orchestrate', 'coordinate', 'manage', 'sync', 'github'],
};

// Determine which agent is best for a task
function determineAgent(taskTitle: string, taskDesc: string): string | null {
  const text = `${taskTitle} ${taskDesc}`.toLowerCase();
  
  for (const [agent, keywords] of Object.entries(agentCapabilities)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return agent;
      }
    }
  }
  return null;
}

// Check if task needs multiple agents (complex task)
function analyzeComplexTask(title: string, description: string): { isComplex: boolean; subtasks: { title: string; agent: string; description: string }[] } {
  const text = `${title} ${description}`.toLowerCase();
  const subtasks: { title: string; agent: string; description: string }[] = [];
  
  // Check if involves research + content creation
  const needsResearch = text.includes('research') || text.includes('find') || text.includes('investigate');
  const needsContent = text.includes('blog') || text.includes('article') || text.includes('write') || text.includes('content');
  const needsSocial = text.includes('twitter') || text.includes('tweet') || text.includes('social') || text.includes('share');
  const needsDev = text.includes('build') || text.includes('code') || text.includes('create app') || text.includes('develop');
  const needsSEO = text.includes('seo') || text.includes('rank');
  
  // Only add research if explicitly asked, not just for blog
  if (text.includes('research') || text.includes('find')) {
    subtasks.push({
      title: `Research: ${title}`,
      agent: 'scout',
      description: 'Research and gather information'
    });
  }
  
  if (needsSEO) {
    subtasks.push({
      title: `SEO Analysis: ${title}`,
      agent: 'radar',
      description: 'Analyze SEO opportunities'
    });
  }
  
  if (needsContent) {
    subtasks.push({
      title: `Write: ${title}`,
      agent: 'ink',
      description: 'Create content based on research'
    });
  }
  
  if (needsSocial) {
    subtasks.push({
      title: `Social: ${title}`,
      agent: 'blaze',
      description: 'Post to social media'
    });
  }
  
  if (needsDev) {
    subtasks.push({
      title: `Build: ${title}`,
      agent: 'byte',
      description: 'Development task'
    });
  }
  
  return {
    isComplex: subtasks.length > 1,
    subtasks
  };
}

// Create subtasks for complex tasks
async function createSubtasks(parentTask: Task) {
  const analysis = analyzeComplexTask(parentTask.title, parentTask.description);
  
  if (analysis.isComplex && analysis.subtasks.length > 0) {
    console.log(`[Neo] Splitting complex task "${parentTask.title}" into ${analysis.subtasks.length} subtasks`);
    
    for (let i = 0; i < analysis.subtasks.length; i++) {
      const subtask = analysis.subtasks[i];
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: subtask.title,
        description: subtask.description,
        assignedTo: subtask.agent,
        priority: parentTask.priority,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: { ...parentTask.metadata, parent: parentTask.id, step: i + 1 },
      };
      
      tasks.push(newTask);
      saveTask(newTask);
      console.log(`[Neo] Created subtask: ${subtask.agent} -> ${subtask.title}`);
    }
    
    // Mark parent as completed (orchestrated)
    parentTask.status = 'completed';
    parentTask.result = { orchestrated: true, subtasks: analysis.subtasks.length };
    parentTask.updatedAt = Date.now();
    saveTask(parentTask);
    
    return true;
  }
  
  return false;
}

// === TOOL IMPLEMENTATIONS ===

// Web Search (Tavily)
async function searchWeb(query: string, maxResults = 5) {
  // Try env var first
  let TAVILY_API_KEY = process.env.TAVILY_API_KEY || process.env.NEXT_PUBLIC_TAVILY_API_KEY;
  
  // Fallback to known working key
  if (!TAVILY_API_KEY) {
    TAVILY_API_KEY = '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';
  }
  
  if (!TAVILY_API_KEY) return { success: false, error: 'Tavily API key not configured' };
  
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

// Twitter/X Web Intent
async function postTweet(content: string) {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.substring(0, 280))}`;
  return { success: true, url: tweetUrl, content: content.substring(0, 280) };
}

// GitHub Issue
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

// MiniMax Content Generation - fallback to Gemini
async function generateContent(prompt: string, maxTokens = 500) {
  const GEMINI_KEY = 'AIzaSyCoN8mAiKmYFGy1w9HGG3cMssJ5JJNeMmI';
  
  // Try Gemini first
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { success: true, content: data.candidates[0].content.parts[0].text, from: 'gemini' };
    }
    
    if (data.error?.code === 429) {
      console.log('[Gemini] Quota exceeded, trying fallback...');
    }
  } catch (e) {
    console.log('[Gemini] Failed:', e);
  }
  
  // Fallback: Use web search to generate content
  const topic = prompt.replace(/Write a.*about:|Write a professional.*about:/gi, '').trim().substring(0, 100);
  const searchResult = await searchWeb(`${topic} comprehensive guide`, 3);
  
  if (searchResult.success && searchResult.results?.length) {
    return {
      success: true,
      fromSearch: true,
      content: `# ${topic}\n\nBased on latest research and trends:\n\n${searchResult.results.map((r: any) => `## ${r.title}\n${r.content?.substring(0, 300)}...`).join('\n\n')}\n\n---\n*Generated using web search*`,
    };
  }
  
  // Final fallback to mock
  return {
    success: true,
    mock: true,
    content: `# ${topic}\n\n[Content generation requires API key]\n\nFor real AI content, add a valid LLM API key.`,
  };
}

// Email Send (simulated - would need SMTP config)
async function sendEmail(to: string, subject: string, body: string) {
  // For now, return a "mailto" link
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { success: true, message: 'Email ready', url: mailtoUrl, to, subject };
}

// Competitor Analysis
async function analyzeCompetitors(query: string) {
  const searchResult = await searchWeb(`${query} competitors analysis`, 5);
  return {
    success: true,
    competitors: searchResult.results?.slice(0, 5).map((r: any) => ({
      name: r.title,
      url: r.url,
      summary: r.content?.substring(0, 200)
    })) || [],
    note: 'Competitor analysis based on web search'
  };
}

// SEO Analysis
async function analyzeSEO(topic: string) {
  const searchResult = await searchWeb(`${topic} SEO best practices`, 5);
  return {
    success: true,
    keywords: [topic, `${topic} guide`, `${topic} tips`, `${topic} 2026`],
    tips: searchResult.results?.slice(0, 3).map((r: any) => r.content?.substring(0, 150)) || [],
    note: 'SEO recommendations based on top results'
  };
}

// Customer Research
async function researchCustomer(customerInfo: string) {
  const searchResult = await searchWeb(`${customerInfo} customer case study`, 5);
  return {
    success: true,
    customerInfo,
    caseStudies: searchResult.results?.slice(0, 3).map((r: any) => ({
      title: r.title,
      url: r.url
    })) || [],
    note: 'Customer research based on web search'
  };
}

// Video Script Generation
async function generateVideoScript(topic: string, duration = '5 minutes') {
  const result = await generateContent(`Write a ${duration} video script about: ${topic}. Include intro, main points, and conclusion.`, 1000);
  if (result.mock) {
    return {
      success: true,
      mock: true,
      title: topic,
      duration,
      scenes: [
        { time: '0:00', content: `Opening: Introduction to ${topic}` },
        { time: '1:00', content: 'Main point 1: Key concepts and background' },
        { time: '2:30', content: 'Main point 2: Practical examples and demonstrations' },
        { time: '4:00', content: 'Conclusion and call to action' },
      ],
      note: 'Configure API for real script generation'
    };
  }
  return result;
}

// === EXECUTE AGENT TASK ===

async function executeAgentTask(agentId: string, task: { title: string; description: string; metadata?: Record<string, any> }) {
  console.log(`[Executor] ${agentId}: ${task.title}`);
  
  const query = task.metadata?.query || task.description || task.title;
  
  switch (agentId) {
    // === RESEARCH TEAM ===
    case 'scout':
      return await searchWeb(query, 5);
    case 'radar':
      return await analyzeSEO(task.title);
    case 'compass':
      return await analyzeCompetitors(query);
    case 'trends':
      return await searchWeb(`${query} trends 2026`, 5);
    
    // === SALES TEAM ===
    case 'atlas':
    case 'pulse':
      return await searchWeb(`companies ${query} leads`, 5);
    case 'hunter':
      return await sendEmail(
        task.metadata?.to || 'lead@example.com',
        task.title,
        task.description
      );
    case 'phoenix':
      return await sendEmail(
        task.metadata?.to || 'lead@example.com',
        `Re: ${task.title}`,
        task.description || 'Following up on our conversation...'
      );
    
    // === RETENTION TEAM ===
    case 'bond':
      return await searchWeb(`${query} customer success best practices`, 3);
    case 'mend':
      return await researchCustomer(query);
    case 'grow':
      return await searchWeb(`${query} upsell opportunities`, 3);
    
    // === DEV TEAM ===
    case 'byte':
    case 'server': {
      const repo = task.metadata?.repo || 'g8rmyvkxpy-png/Mission-Control';
      const [owner, repoName] = repo.split('/');
      return await createGitHubIssue(owner, repoName, task.title, task.description);
    }
    case 'pixel':
      return { success: true, message: 'Frontend task noted', title: task.title };
    case 'auto':
      return { success: true, message: 'Automation task noted', title: task.title };
    
    // === CONTENT TEAM ===
    case 'ink':
      return await generateContent(`Write a compelling blog post about: ${task.title}. ${task.description}`, 1500);
    case 'blaze':
      return await postTweet(task.metadata?.content || task.description || task.title);
    case 'draft':
      return await generateContent(`Write a professional email about: ${task.title}. ${task.description}`, 500);
    case 'cinema':
      return await generateVideoScript(task.title, task.metadata?.duration || '5 minutes');
    
    // === NEO ORCHESTRATOR ===
    case 'neo':
      // Neo handles GitHub sync and orchestration
      if (task.title.toLowerCase().includes('github') || task.title.toLowerCase().includes('git')) {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO = process.env.GITHUB_REPO || 'g8rmyvkxpy-png/Mission-Control';
        
        if (!GITHUB_TOKEN) {
          return { success: false, error: 'GitHub token not configured. Set GITHUB_TOKEN env var.' };
        }
        
        // Create a GitHub issue for the task
        try {
          const [owner, repo] = REPO.split('/');
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: { 
              'Authorization': `token ${GITHUB_TOKEN}`, 
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              title: task.title,
              body: `${task.description}\n\n---\nCreated by Neo Orchestrator`,
              labels: ['auto-created']
            }),
          });
          
          const data = await response.json();
          if (response.ok) {
            return { success: true, message: 'GitHub issue created', url: data.html_url, issueNumber: data.number };
          }
          return { success: false, error: data.message };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
      return { success: true, message: 'Neo acknowledged task', task: task.title };
    
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
    // If no agent assigned, analyze and handle the task
    if (!task.assignedTo) {
      // First check if it's a complex task that needs splitting
      const analysis = analyzeComplexTask(task.title, task.description);
      
      if (analysis.isComplex && analysis.subtasks.length > 1) {
        // Split into subtasks
        const split = await createSubtasks(task);
        if (split) continue; // Parent handled, move to next task
      }
      
      // Try to determine best single agent
      const agent = determineAgent(task.title, task.description);
      
      if (agent) {
        // Single agent can handle it - assign directly
        task.assignedTo = agent;
        task.status = 'processing';
        task.updatedAt = Date.now();
        saveTask(task);
        console.log(`[Neo] Auto-assigned task to ${agent}`);
      } else {
        // Could not handle - mark as failed
        task.status = 'failed';
        task.error = 'No agent could be assigned';
        saveTask(task);
        continue;
      }
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
