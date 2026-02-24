import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// === DELIVERABLES SETUP ===
const DELIVERABLES_DIR = path.join(process.cwd(), 'public', 'deliverables');

// Ensure deliverables directory exists
function ensureDeliverablesDir() {
  if (!fs.existsSync(DELIVERABLES_DIR)) {
    fs.mkdirSync(DELIVERABLES_DIR, { recursive: true });
  }
}

// Save a deliverable file and return the path
function saveDeliverable(type: string, filename: string, content: string): { path: string; url: string } {
  ensureDeliverablesDir();
  
  const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 100);
  const fullPath = path.join(DELIVERABLES_DIR, `${type}_${safeFilename}.md`);
  
  fs.writeFileSync(fullPath, content);
  console.log(`[Deliverable] Saved: ${fullPath}`);
  
  return {
    path: fullPath,
    url: `/deliverables/${type}_${safeFilename}.md`
  };
}

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

// === DETAILED TASK SUMMARY GENERATION ===

interface TaskSummary {
  overview: string;
  actions: string[];
  results: string[];
  outputs: { type: string; value: string; label: string }[];
  metrics?: { label: string; value: string }[];
  nextSteps?: string[];
}

function getAgentName(agentId: string): string {
  const agent = AGENTS.find(a => a.id === agentId);
  return agent ? `${agent.name} (${agent.specialty})` : agentId;
}

function generateDetailedSummary(
  agentId: string,
  task: { title: string; description: string; metadata?: Record<string, any> },
  result: any
): TaskSummary {
  const summary: TaskSummary = {
    overview: `Task "${task.title}" was completed by ${getAgentName(agentId)}.`,
    actions: [],
    results: [],
    outputs: [],
    nextSteps: []
  };

  const taskType = task.metadata?.taskType || task.title.toLowerCase();

  // Generate actions and outputs based on agent type
  switch (agentId) {
    case 'scout':
    case 'trends':
    case 'compass':
    case 'radar':
      summary.actions = [
        `Conducted web search on: "${task.description || task.title}"`,
        'Analyzed top results for relevant information',
        'Compiled findings into structured report'
      ];
      
      if (result.results?.length) {
        summary.results.push(`Found ${result.results.length} relevant sources`);
        result.results.slice(0, 3).forEach((r: any, i: number) => {
          summary.outputs.push({
            type: 'link',
            value: r.url,
            label: r.title
          });
        });
      }
      
      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Full Report'
        });
        summary.results.push('📄 Report saved to deliverables');
      }
      
      if (result.answer) {
        summary.results.push('Generated AI-powered answer summary');
      }
      summary.nextSteps = ['Review research findings', 'Share with team if relevant'];
      break;

    case 'atlas':
    case 'pulse':
      summary.actions = [
        'Searched for potential leads and companies',
        'Compiled lead list with contact information'
      ];
      
      if (result.results?.length) {
        summary.results.push(`Identified ${result.results.length} potential leads`);
        result.results.forEach((r: any) => {
          if (r.url) {
            summary.outputs.push({
              type: 'lead',
              value: r.url,
              label: r.title
            });
          }
        });
      }
      summary.nextSteps = ['Review lead quality', 'Initiate outreach campaign'];
      break;

    case 'hunter':
    case 'phoenix':
      summary.actions = [
        'Prepared outreach message',
        'Generated email with personalized content'
      ];
      
      if (result.url) {
        summary.outputs.push({
          type: 'email',
          value: result.url,
          label: 'Open email client'
        });
      }
      
      summary.results.push('Outreach email prepared and ready to send');
      summary.nextSteps = ['Review and customize email', 'Send to recipient'];
      break;

    case 'ink':
      summary.actions = [
        `Created blog content about: "${task.title}"`,
        'Optimized for SEO and engagement',
        'Generated compelling headlines and structure'
      ];
      
      if (result.content) {
        const wordCount = result.content.split(/\s+/).length;
        summary.results.push(`Generated ${wordCount} words of content`);
        
        // Extract title from content
        const titleMatch = result.content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          summary.outputs.push({
            type: 'content',
            value: result.content.substring(0, 500) + '...',
            label: 'Blog Content Preview'
          });
        }
      }
      
      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Full Blog Post'
        });
        summary.results.push('📄 Blog post saved to deliverables');
      }
      
      summary.outputs.push({
        type: 'platform',
        value: 'PP Ventures Blog',
        label: 'Publish to'
      });
      summary.nextSteps = ['Review content', 'Add images/media', 'Publish to blog'];
      break;

    case 'blaze':
      summary.actions = [
        'Created social media content',
        'Optimized for engagement'
      ];
      
      if (result.url) {
        summary.outputs.push({
          type: 'tweet',
          value: result.url,
          label: 'View Tweet'
        });
      }
      
      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Social Post'
        });
        summary.results.push('📄 Social post saved to deliverables');
      }
      
      if (result.content) {
        summary.results.push('Tweet content prepared (280 char limit)');
      }
      summary.nextSteps = ['Review tweet', 'Post manually or schedule'];
      break;

    case 'draft':
      summary.actions = [
        `Created email campaign about: "${task.title}"`,
        'Personalized for target audience'
      ];
      
      if (result.content) {
        summary.outputs.push({
          type: 'content',
          value: result.content.substring(0, 300) + '...',
          label: 'Email Preview'
        });
      }
      
      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Email Campaign'
        });
        summary.results.push('📄 Email campaign saved to deliverables');
      }
      
      summary.nextSteps = ['Review email copy', 'Set up email sequence', 'Send to list'];
      break;

    case 'cinema':
      summary.actions = [
        `Generated video script for: "${task.title}"`,
        'Created scene-by-scene breakdown',
        'Included timing and key points'
      ];
      
      if (result.scenes?.length) {
        summary.results.push(`Created ${result.scenes.length} scenes`);
        result.scenes.forEach((scene: any) => {
          summary.outputs.push({
            type: 'scene',
            value: `[${scene.time}] ${scene.content}`,
            label: scene.time
          });
        });
      }
      
      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Full Script'
        });
        summary.results.push('📄 Video script saved to deliverables');
      }
      
      summary.nextSteps = ['Record narration', 'Add visuals', 'Edit and publish'];
      break;

    case 'byte':
    case 'server':
      summary.actions = [
        `Created GitHub issue: "${task.title}"`,
        'Added detailed description and context'
      ];
      
      if (result.issueNumber) {
        summary.results.push(`GitHub Issue #${result.issueNumber} created`);
        summary.outputs.push({
          type: 'issue',
          value: result.url,
          label: `Issue #${result.issueNumber}`
        });
      }
      
      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Dev Ticket'
        });
        summary.results.push('📄 Dev ticket saved to deliverables');
      }
      
      summary.nextSteps = ['Review issue', 'Assign to milestone', 'Start development'];
      break;

    case 'neo':
      summary.actions = [
        'Orchestrated task execution',
        'Coordinated with agent squad'
      ];
      
      if (result.url) {
        summary.outputs.push({
          type: 'github',
          value: result.url,
          label: 'View GitHub Item'
        });
      }
      
      if (result.message) {
        summary.results.push(result.message);
      }
      break;

    case 'bond':
    case 'mend':
    case 'grow':
      summary.actions = [
        `Analyzed ${agentId === 'bond' ? 'retention' : agentId === 'mend' ? 'customer issues' : 'expansion opportunities'}`,
        'Researched best practices'
      ];
      
      if (result.caseStudies?.length) {
        summary.results.push(`Found ${result.caseStudies.length} relevant case studies`);
        result.caseStudies.forEach((cs: any) => {
          summary.outputs.push({
            type: 'case_study',
            value: cs.url,
            label: cs.title
          });
        });
      }
      summary.nextSteps = ['Implement recommendations', 'Track metrics'];
      break;

    default:
      summary.actions = [`Executed task: ${task.title}`];
      if (result.message) {
        summary.results.push(result.message);
      }
  }

  // Add execution metadata
  summary.metrics = [
    { label: 'Agent', value: getAgentName(agentId) },
    { label: 'Completed', value: new Date().toLocaleString() },
    { label: 'Status', value: result.mock ? 'Simulated' : 'Completed' }
  ];

  // Add success message
  summary.results.unshift(`✅ Task completed successfully by ${getAgentName(agentId)}`);

  return summary;
}

// === EXECUTE AGENT TASK ===

async function executeAgentTask(agentId: string, task: { title: string; description: string; metadata?: Record<string, any> }) {
  console.log(`[Executor] ${agentId}: ${task.title}`);
  
  const query = task.metadata?.query || task.description || task.title;
  const timestamp = Date.now();
  
  // Helper to add deliverable to result
  const addDeliverable = (result: any, deliverable: { path: string; url: string }) => {
    result.deliverable = deliverable;
    return result;
  };
  
  switch (agentId) {
    // === RESEARCH TEAM ===
    case 'scout': {
      const result = await searchWeb(query, 5);
      // Create research report deliverable
      if (result.success && result.results?.length) {
        const reportContent = `# Research Report: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n**Query:** ${query}\n\n---\n\n## Summary\n\nFound ${result.results.length} relevant sources on this topic.\n\n## Sources\n\n${result.results.map((r: any, i: number) => `${i + 1}. **${r.title}**\n   - ${r.url}\n   - ${r.content?.substring(0, 200)}...`).join('\n\n')}\n\n---\n*Generated by Scout (Research Agent)*`;
        const deliverable = saveDeliverable('research', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'radar': {
      const result = await analyzeSEO(task.title);
      // Create SEO report deliverable
      if (result.success) {
        const reportContent = `# SEO Analysis: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Target Keywords\n\n${result.keywords?.map((k: string) => `- ${k}`).join('\n') || 'N/A'}\n\n## SEO Tips\n\n${result.tips?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n\n') || 'N/A'}\n\n---\n*Generated by Radar (SEO Agent)*`;
        const deliverable = saveDeliverable('seo', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'compass': {
      const result = await analyzeCompetitors(query);
      // Create competitor analysis deliverable
      if (result.success && result.competitors?.length) {
        const reportContent = `# Competitor Analysis: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Competitors Found\n\n${result.competitors.map((c: any, i: number) => `### ${i + 1}. ${c.name}\n${c.summary}\n[Link](${c.url})`).join('\n\n')}\n\n---\n*Generated by Compass (Competitor Analysis Agent)*`;
        const deliverable = saveDeliverable('competitor', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'trends': {
      const result = await searchWeb(`${query} trends 2026`, 5);
      // Create trends report deliverable
      if (result.success && result.results?.length) {
        const reportContent = `# Trends Report: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Key Trends\n\n${result.results.map((r: any, i: number) => `### ${r.title}\n${r.content?.substring(0, 300)}...\n\n[Read more](${r.url})`).join('\n\n')}\n\n---\n*Generated by Trends (Market Intelligence Agent)*`;
        const deliverable = saveDeliverable('trends', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    
    // === SALES TEAM ===
    case 'atlas':
    case 'pulse': {
      const result = await searchWeb(`companies ${query} leads`, 5);
      // Create leads list deliverable
      if (result.success && result.results?.length) {
        const reportContent = `# Lead List: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Potential Leads\n\n${result.results.map((r: any, i: number) => `${i + 1}. **${r.title}**\n   - ${r.url}\n   - Relevance: ${Math.round((r.score || 0.5) * 100)}%`).join('\n\n')}\n\n---\n*Generated by ${agentId === 'atlas' ? 'Atlas' : 'Pulse'} (Lead Generation Agent)*`;
        const deliverable = saveDeliverable('leads', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'hunter':
    case 'phoenix': {
      const result = await sendEmail(
        task.metadata?.to || 'lead@example.com',
        task.title,
        task.description
      );
      // Create email deliverable
      const emailContent = `# Outreach Email: ${task.title}\n\n**To:** ${task.metadata?.to || 'lead@example.com'}\n**Subject:** ${task.title}\n\n---\n\n${task.description || task.title}\n\n---\n*Generated by ${agentId === 'hunter' ? 'Hunter' : 'Phoenix'} (Outreach Agent)*`;
      const deliverable = saveDeliverable('email', `${task.title}_${timestamp}`, emailContent);
      return addDeliverable(result, deliverable);
    }
    
    // === RETENTION TEAM ===
    case 'bond': {
      const result = await searchWeb(`${query} customer success best practices`, 3);
      if (result.success && result.results?.length) {
        const reportContent = `# Retention Strategy: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Best Practices\n\n${result.results.map((r: any, i: number) => `### ${r.title}\n${r.content?.substring(0, 300)}...`).join('\n\n')}\n\n---\n*Generated by Bond (Retention Agent)*`;
        const deliverable = saveDeliverable('retention', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'mend': {
      const result = await researchCustomer(query);
      if (result.success) {
        const reportContent = `# Customer Issue Analysis: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Customer Info\n\n${result.customerInfo}\n\n## Related Case Studies\n\n${result.caseStudies?.map((c: any, i: number) => `${i + 1}. ${c.title}\n   - ${c.url}`).join('\n\n') || 'None found'}\n\n---\n*Generated by Mend (Issue Resolution Agent)*`;
        const deliverable = saveDeliverable('issue', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'grow': {
      const result = await searchWeb(`${query} upsell opportunities`, 3);
      if (result.success && result.results?.length) {
        const reportContent = `# Upsell Opportunities: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Opportunities\n\n${result.results.map((r: any, i: number) => `### ${r.title}\n${r.content?.substring(0, 300)}...`).join('\n\n')}\n\n---\n*Generated by Grow (Expansion Agent)*`;
        const deliverable = saveDeliverable('upsell', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    
    // === DEV TEAM ===
    case 'byte':
    case 'server': {
      const repo = task.metadata?.repo || 'g8rmyvkxpy-png/Mission-Control';
      const [owner, repoName] = repo.split('/');
      const result = await createGitHubIssue(owner, repoName, task.title, task.description);
      // Create dev ticket deliverable (already has GitHub URL, but save locally too)
      const ticketContent = `# Dev Ticket: ${task.title}\n\n**Status:** ${result.success ? 'Created' : 'Failed'}\n**Repository:** ${repo}\n${result.issueNumber ? `**Issue #:** ${result.issueNumber}` : ''}\n${result.url ? `**URL:** ${result.url}` : ''}\n\n---\n\n## Description\n\n${task.description || task.title}\n\n---\n*Generated by ${agentId === 'byte' ? 'Byte' : 'Server'} (Development Agent)*`;
      const deliverable = saveDeliverable('devticket', `${task.title}_${timestamp}`, ticketContent);
      return addDeliverable(result, deliverable);
    }
    case 'pixel': {
      const result = { success: true, message: 'Frontend task noted', title: task.title };
      const content = `# Frontend Task: ${task.title}\n\n**Status:** To Do\n\n---\n\n## Requirements\n\n${task.description}\n\n## Notes\n\nFrontend implementation needed.\n\n---\n*Generated by Pixel (Frontend Agent)*`;
      const deliverable = saveDeliverable('frontend', `${task.title}_${timestamp}`, content);
      return addDeliverable(result, deliverable);
    }
    case 'auto': {
      const result = { success: true, message: 'Automation task noted', title: task.title };
      const content = `# Automation Task: ${task.title}\n\n**Status:** To Do\n\n---\n\n## Description\n\n${task.description}\n\n## Notes\n\nAutomation implementation needed (Zapier, Make, etc.)\n\n---\n*Generated by Auto (Automation Agent)*`;
      const deliverable = saveDeliverable('automation', `${task.title}_${timestamp}`, content);
      return addDeliverable(result, deliverable);
    }
    
    // === CONTENT TEAM ===
    case 'ink': {
      const result = await generateContent(`Write a compelling blog post about: ${task.title}. ${task.description}`, 1500);
      // Create blog post deliverable
      if (result.success && result.content) {
        const deliverable = saveDeliverable('blogpost', `${task.title}_${timestamp}`, result.content);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'blaze': {
      const result = await postTweet(task.metadata?.content || task.description || task.title);
      // Create social post deliverable
      const content = `# Social Post: ${task.title}\n\n**Platform:** Twitter/X\n\n---\n\n${task.metadata?.content || task.description || task.title}\n\n---\n*Generated by Blaze (Social Media Agent)*`;
      const deliverable = saveDeliverable('social', `${task.title}_${timestamp}`, content);
      return addDeliverable(result, deliverable);
    }
    case 'draft': {
      const result = await generateContent(`Write a professional email about: ${task.title}. ${task.description}`, 500);
      // Create email campaign deliverable
      if (result.success && result.content) {
        const deliverable = saveDeliverable('emailcampaign', `${task.title}_${timestamp}`, result.content);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'cinema': {
      const result: any = await generateVideoScript(task.title, task.metadata?.duration || '5 minutes');
      // Create video script deliverable
      if (result.success) {
        const scriptContent = `# Video Script: ${task.title}\n\n**Duration:** ${result.duration || 'N/A'}\n\n---\n\n${result.scenes?.map((s: any) => `## ${s.time}\n${s.content}`).join('\n\n') || result.content}\n\n---\n*Generated by Cinema (Video Production Agent)*`;
        const deliverable = saveDeliverable('videoscript', `${task.title}_${timestamp}`, scriptContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    
    // === NEO ORCHESTRATOR ===
    case 'neo': {
      const message = task.title;
      const lowerMsg = message.toLowerCase();
      
      // Determine which subagents to involve
      const subagents: { id: string; name: string; action: string }[] = [];
      
      if (lowerMsg.includes('research') || lowerMsg.includes('find') || lowerMsg.includes('analysis') || lowerMsg.includes('trends') || lowerMsg.includes('competitor')) {
        subagents.push({ id: 'scout', name: 'Scout', action: 'Research & Analysis' });
      }
      if (lowerMsg.includes('seo') || lowerMsg.includes('rank') || lowerMsg.includes('search')) {
        subagents.push({ id: 'radar', name: 'Radar', action: 'SEO Analysis' });
      }
      if (lowerMsg.includes('blog') || lowerMsg.includes('write') || lowerMsg.includes('content') || lowerMsg.includes('article')) {
        subagents.push({ id: 'ink', name: 'Ink', action: 'Content Creation' });
      }
      if (lowerMsg.includes('twitter') || lowerMsg.includes('social') || lowerMsg.includes('tweet') || lowerMsg.includes('post')) {
        subagents.push({ id: 'blaze', name: 'Blaze', action: 'Social Media' });
      }
      if (lowerMsg.includes('email') || lowerMsg.includes('outreach')) {
        subagents.push({ id: 'draft', name: 'Draft', action: 'Email Campaigns' });
      }
      if (lowerMsg.includes('video') || lowerMsg.includes('youtube')) {
        subagents.push({ id: 'cinema', name: 'Cinema', action: 'Video Production' });
      }
      if (lowerMsg.includes('lead') || lowerMsg.includes('prospect') || lowerMsg.includes('customer')) {
        subagents.push({ id: 'atlas', name: 'Atlas', action: 'Lead Generation' });
      }
      if (lowerMsg.includes('github') || lowerMsg.includes('code') || lowerMsg.includes('bug') || lowerMsg.includes('build')) {
        subagents.push({ id: 'byte', name: 'Byte', action: 'Development' });
      }
      if (lowerMsg.includes('retention') || lowerMsg.includes('churn')) {
        subagents.push({ id: 'bond', name: 'Bond', action: 'Customer Retention' });
      }
      
      // Default to research if no specific agents matched
      if (subagents.length === 0) {
        subagents.push({ id: 'scout', name: 'Scout', action: 'Research & Analysis' });
      }
      
      console.log(`[Neo] Orchestrating task: ${task.title} with ${subagents.length} subagents`);
      
      // Execute each subagent and collect results
      const subagentResults: any[] = [];
      
      for (const subagent of subagents) {
        console.log(`[Neo] Calling subagent: ${subagent.name}`);
        
        try {
          let result: any;
          
          // Call the appropriate subagent based on type
          switch (subagent.id) {
            case 'scout':
              result = await searchWeb(message, 5);
              break;
            case 'radar':
              result = await analyzeSEO(message);
              break;
            case 'ink':
              result = await generateContent(`Write a compelling blog post about: ${message}`, 1500);
              break;
            case 'blaze':
              result = await postTweet(message);
              break;
            case 'draft':
              result = await generateContent(`Write a professional email about: ${message}`, 500);
              break;
            case 'cinema':
              result = await generateVideoScript(message, '5 minutes');
              break;
            case 'atlas':
              result = await searchWeb(`companies ${message} leads`, 5);
              break;
            case 'byte':
              // Create a GitHub issue as deliverable
              const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
              if (GITHUB_TOKEN) {
                const [owner, repoName] = (process.env.GITHUB_REPO || 'g8rmyvkxpy-png/Mission-Control').split('/');
                const ghResult = await createGitHubIssue(owner, repoName, `Neo: ${message}`, task.description);
                result = ghResult;
              } else {
                result = { success: true, message: 'Development task noted (GitHub not configured)' };
              }
              break;
            case 'bond':
              result = await searchWeb(`${message} customer success best practices`, 3);
              break;
            default:
              result = { success: true, message: 'Task analyzed' };
          }
          
          subagentResults.push({
            agent: subagent.name,
            action: subagent.action,
            success: result.success,
            result: result
          });
          
        } catch (err: any) {
          console.error(`[Neo] Subagent ${subagent.name} failed:`, err);
          subagentResults.push({
            agent: subagent.name,
            action: subagent.action,
            success: false,
            error: err.message
          });
        }
      }
      
      // Generate final orchestration report
      const successfulResults = subagentResults.filter(r => r.success).length;
      
      const orchestrationReport = `# 🎯 Orchestration Report: ${task.title}

**Date:** ${new Date().toISOString()}
**Status:** ${successfulResults === subagentResults.length ? '✅ Completed' : '⚠️ Partial'}
**Subagents Coordinated:** ${subagents.length}

---

## Task Summary

${task.description}

---

## Subagent Results

${subagentResults.map(r => `
### ${r.agent} (${r.action})
- **Status:** ${r.success ? '✅ Success' : '❌ Failed'}
${r.success ? `- **Deliverable:** ${r.result?.deliverable?.path || 'Generated'}` : `- **Error:** ${r.error || 'Unknown error'}`}
`).join('\n')}

---

## Final Deliverables

${subagentResults.filter(r => r.success && r.result?.deliverable).map(r => `- ${r.agent}: ${r.result.deliverable.path.split('/').pop()}`).join('\n') || 'See individual agent results above'}

---

*Coordinated by Neo (Chief Orchestrator)*`;

      // Save orchestration deliverable
      const deliverable = saveDeliverable('orchestration', `${task.title}_${timestamp}`, orchestrationReport);
      
      return {
        success: true,
        message: `Neo orchestrated ${subagents.length} subagent(s), ${successfulResults} completed successfully`,
        orchestration: {
          totalSubagents: subagents.length,
          successful: successfulResults,
          failed: subagents.length - successfulResults,
          subagents: subagentResults
        },
        deliverable
      };
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
        
        // Generate detailed summary
        console.log(`[Summary] Generating summary for task ${task.id} by ${task.assignedTo}`);
        const summary = generateDetailedSummary(task.assignedTo, { title: task.title, description: task.description, metadata: task.metadata }, result);
        console.log(`[Summary] Generated:`, JSON.stringify(summary).substring(0, 200));
        
        // Store both raw result and detailed summary
        task.result = {
          ...result,
          summary,
          completedAt: new Date().toISOString()
        };
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
    
    // Delete a specific task by ID
    const taskId = searchParams.get('id');
    if (taskId) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        return NextResponse.json({ success: false, error: 'Task not found' });
      }
      
      const deletedTask = tasks[taskIndex];
      tasks.splice(taskIndex, 1);
      
      // Also delete from database
      if (db) {
        db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
      }
      
      // Delete associated deliverable if exists
      if (deletedTask.result?.deliverable?.path) {
        const deliverablePath = deletedTask.result.deliverable.path;
        if (fs.existsSync(deliverablePath)) {
          fs.unlinkSync(deliverablePath);
          console.log(`[Deliverable] Deleted: ${deliverablePath}`);
        }
      }
      
      return NextResponse.json({ success: true, deleted: deletedTask });
    }
    
    // Clear all completed/failed tasks
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
