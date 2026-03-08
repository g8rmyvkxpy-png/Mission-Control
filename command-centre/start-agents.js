#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' });

const cron = require('node-cron');
const { readFile, writeFile, replaceInFile, createBlogPost, restartWebsite, getWebsiteContext } = require('./lib/agentActions');

// ========== STANDALONE TAVILY SEARCH ==========
// This runs in Node.js - NOT inside Minimax prompt
async function standaloneTavilySearch(query) {
  const TAVILY_KEY = process.env.TAVILY_API_KEY;
  if (!TAVILY_KEY) {
    console.log('[Tavily] No API key configured');
    return null;
  }
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query,
        max_results: 5,
        search_depth: 'basic',
        include_answer: true
      })
    });
    if (!res.ok) {
      console.log(`[Tavily] API error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const snippets = data.results?.map(r =>
      `[${r.url}]\n${r.content?.slice(0, 300)}`
    ).join('\n\n') || '';
    return `Answer: ${data.answer || 'No answer'}\n\nSources:\n${snippets}`;
  } catch (err) {
    console.log(`[Tavily] Search failed: ${err.message}`);
    return null;
  }
}

// ========== PPVENTURES WEBSITE FILE READER ==========
// Read website files directly from server - no Tavily needed for our own site
const PPVENTURES_PATH = '/home/deva/ppventures-next';
const fs = require('fs');
const path = require('path');

function readWebsiteFile(filePath) {
  try {
    const full = path.join(PPVENTURES_PATH, filePath);
    if (!fs.existsSync(full)) return null;
    return fs.readFileSync(full, 'utf8');
  } catch (err) {
    return null;
  }
}

function readAllWebsitePages() {
  try {
    const pages = {};
    const dirs = ['app', 'components', 'content', 'lib'];
    
    for (const dir of dirs) {
      const full = path.join(PPVENTURES_PATH, dir);
      if (!fs.existsSync(full)) continue;
      
      function scanDir(dirPath, prefix = '') {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          if (item === 'node_modules' || item.startsWith('.')) continue;
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            scanDir(itemPath, prefix + item + '/');
          } else if (/\.(js|jsx|ts|tsx|md|html|css)$/.test(item)) {
            const content = fs.readFileSync(itemPath, 'utf8');
            pages[prefix + item] = content.slice(0, 3000);
          }
        }
      }
      scanDir(full);
    }
    return pages;
  } catch (err) {
    console.error('readAllWebsitePages error:', err.message);
    return {};
  }
}

// Duplicates removed - using lib/agentActions.js instead

// ========== OUTPUT SANITIZER ==========
function sanitiseAgentOutput(text) {
  if (!text) return '';
  return text
    .replace(/<minimax:tool_call[\s\S]*?<\/minimax:tool_call>/gi, '')
    .replace(/<minimax:[^>]*>/gi, '')
    .replace(/<invoke[\s\S]*?<\/invoke>/gi, '')
    .replace(/<tool[\s\S]*?<\/tool>/gi, '')
    .replace(/<parameter[\s\S]*?<\/parameter>/gi, '')
    .replace(/<function[\s\S]*?<\/function>/gi, '')
    .replace(/<name[\s\S]*?<\/name>/gi, '')
    .replace(/<arguments[\s\S]*?<\/arguments>/gi, '')
    .replace(/<json[\s\S]*?<\/json>/gi, '')
    .replace(/\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/gi, '')
    .replace(/\{tool[\s\S]*?\}/gi, '')
    .replace(/Let me (?:search|fetch|look up|check|find)[\s\S]*?\n/gi, '')
    .replace(/I'll (?:search|look|check|find)[\s\S]*?\n/gi, '')
    .replace(/Allow me to (?:search|look|find)[\s\S]*?\n/gi, '')
    .trim();
}

// Global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * PPVentures Autonomous Agent System
 * 
 * Zero Idle Policy - Agents never sit idle. They self-assign work 24/7.
 * 
 * Features:
 * - Zero Idle: Agents create their own tasks when backlog is empty
 * - Parallel Execution: All agents run independently every 90s
 * - Anti-Repetition: Agents avoid repeating recent work
 * - Daily Targets: Neo 4, Atlas 6, Orbit 6 tasks per day
 * - Startup Burst: Agents catch up on restart
 * - Full autonomous operation toward $1M revenue mission
 * 
 * Run: node start-agents.js
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Check environment
if (!MINIMAX_API_KEY || MINIMAX_API_KEY === 'your-minimax-api-key') {
  console.error('❌ ERROR: MINIMAX_API_KEY not set in .env.local');
  console.error('   Add: MINIMAX_API_KEY=your-key-here');
  process.exit(1);
}

// ========== CONFIGURATION ==========
const LOOP_INTERVAL_MS = 90 * 1000; // 90 seconds
const STARTUP_STAGGER_MS = 10 * 1000; // 10 seconds between agents
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const DAILY_TARGETS = {
  'Neo': 4,
  'Atlas': 6,
  'Orbit': 6
};

const activeAgents = new Map();

// ========== HELPER FUNCTIONS ==========

async function createAgentClient(apiKey) {
  return {
    async heartbeat(currentTask = 'idle') {
      const res = await fetch(`${API_BASE}/api/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, current_task: currentTask })
      });
      return res.json();
    },

    async log(message, logType = 'info') {
      const res = await fetch(`${API_BASE}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, message, log_type: logType })
      });
      return res.json();
    },

    async getBacklogTasks(agentId) {
      const res = await fetch(`${API_BASE}/api/tasks?agent_id=${agentId}&status=backlog`);
      const data = await res.json();
      return data.tasks || [];
    },

    async getRecentCompletedTasks(agentId, limit = 5) {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/api/tasks?agent_id=${agentId}&status=done&date=${today}&limit=${limit}&sort=updated_at`);
      const data = await res.json();
      return data.tasks || [];
    },

    async getDailyTaskCount(agentId) {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/api/tasks?agent_id=${agentId}&status=done&date=${today}`);
      const data = await res.json();
      return data.tasks?.length || 0;
    },

    async updateTaskStatus(taskId, status, result = null) {
      const body = { status };
      if (result) body.result = result;
      
      const res = await fetch(`${API_BASE}/api/tasks?id=${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return res.json();
    },

    async createTask(title, description, assignedTo, priority = 'medium') {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          assigned_to: assignedTo,
          status: 'backlog',
          priority
        })
      });
      const data = await res.json();
      return data.task;
    },

    async saveMemory(content, memoryType = 'conversation', summary = null) {
      const res = await fetch(`${API_BASE}/api/memories/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: apiKey, 
          content, 
          memory_type: memoryType,
          summary
        })
      });
      return res.json();
    },

    async saveDocument(title, content, category = 'general', format = 'markdown') {
      const res = await fetch(`${API_BASE}/api/docs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: apiKey, 
          title,
          content,
          category,
          format
        })
      });
      return res.json();
    },

    async webSearch(query, maxResults = 5) {
      if (!TAVILY_API_KEY) {
        throw new Error('Tavily API key not configured');
      }
      
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          max_results: maxResults
        })
      });

      if (!res.ok) {
        throw new Error(`Tavily API error: ${res.status}`);
      }

      const data = await res.json();
      
      return {
        query,
        results: data.results?.map(r => ({
          title: r.title,
          url: r.url,
          content: r.content?.substring(0, 300),
          score: r.score
        })) || [],
        answer: data.answer
      };
    }
  };
}

// ========== MINIMAX EXECUTION ==========

async function executeWithMinimax(prompt, client = null, agent = null) {
  const webSearchKeywords = /current|recent|latest|today|what is the|who is|news|weather|stock price|review|website|browse|check|analyse|research|find|search|compare|price|product|domain|\.com|\.io|\.net|\.org|http|www/i;
  const needsWebSearch = webSearchKeywords.test(prompt);
  
  let context = '';
  if (needsWebSearch && TAVILY_API_KEY && client) {
    try {
      console.log(`[Web Search] Searching for: ${prompt.substring(0, 50)}...`);
      const searchResults = await client.webSearch(prompt, 5);
      
      if (searchResults.results?.length > 0) {
        context = '\n\nRelevant information from web search:\n';
        searchResults.results.forEach((r, i) => {
          context += `${i + 1}. ${r.title} (${r.url})\n${r.content}\n\n`;
        });
        
        if (searchResults.answer) {
          context += `Summary: ${searchResults.answer}\n`;
        }
        
        console.log(`[Web Search] Found ${searchResults.results.length} results`);
      }
    } catch (e) {
      console.error(`[Web Search] Error: ${e.message}`);
    }
  }

  const fullPrompt = context ? `${prompt}\n${context}` : prompt;
  const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.5',
      messages: [
        { role: 'system', content: `You are ${agent?.name || 'an AI agent'}, an autonomous AI agent working inside a Command Centre.

════════════════════════════════════════
CRITICAL OUTPUT RULE — READ THIS FIRST:
════════════════════════════════════════
You are a PURE text generation model with NO tools and NO plugins.
You CANNOT call Tavily. You CANNOT call any APIs.
You CANNOT output XML, JSON tool calls, or any markup syntax like &lt;invoke&gt;, minimax:tool_call, [TOOL_CALL].
ALL research data you need is already provided in this prompt.
Begin your response with the actual deliverable immediately.
Never write "Let me search", "Let me fetch", "I'll search", "I'll look up", or any tool call syntax.
If you write any tool call syntax your response will be REJECTED.
Just write the content directly — no preamble, no tool calls.
════════════════════════════════════════

YOUR SETUP:
- Command Centre running at http://72.62.231.18:3001
- You have 3 agents: Neo (lead), Atlas (research), Orbit (operations)
- You have Tavily web search available for real-time internet research
- All your work is saved to Supabase and visible in the Command Centre
- Your owner checks your work via the Task Board, Memory, and Docs screens

YOUR ROLE:
- Neo: Lead agent — handles coordination, general tasks, complex reasoning, strategic copy
- Atlas: Research agent — specializes in web research, analysis, and reports
- Orbit: Operations agent — handles monitoring, summaries, and operational tasks

MISSION: $1M Revenue for PPVentures

════════════════════════════════════════
MOST IMPORTANT RULE — ALL AGENTS
════════════════════════════════════════
NEVER ask the owner for information, data, URLs, or content.
NEVER respond with a list of questions.
NEVER say "I don't have access to".
NEVER say "please provide".
NEVER say "I need more information".

ALWAYS fetch data yourself from:
- Supabase API endpoints (/api/tasks, /api/docs, /api/goals etc)
- Tavily web search for any public URL or topic
- Memory files for past context

If you genuinely cannot find something after searching —
say what you found, what you tried, and give your best answer
based on available information. Then move on.

Deva hired you to do the work — not to ask him to do it for you.
════════════════════════════════════════

ATLAS CARDINAL RULES:
- Never ask for a URL — you already know our website is https://ppventures.tech
- Never ask for content — use Tavily to fetch it yourself immediately
- Never ask the owner for anything — find it yourself
- Always use Tavily web search as your first action on any research task
- Always produce a complete deliverable — never a list of questions
- IF A TASK SAYS "analyse X" — immediately search for X with Tavily
- IF A TASK SAYS "review Y" — immediately fetch Y with Tavily
- IF A TASK SAYS "research Z" — immediately search Z with Tavily

WEBSITES YOU ALWAYS HAVE ACCESS TO:
- Our website: https://ppventures.tech
- Our Command Centre: http://localhost:3001
- Any public URL — use Tavily to fetch and analyse it

DATA ACCESS — YOU HAVE FULL ACCESS TO:
- All tasks ever created and completed → GET /api/tasks
- All documents and reports created → GET /api/docs
- All memories saved → GET /api/memories
- All agent activity logs → GET /api/logs
- All projects and their status → GET /api/projects
- All goals and progress → GET /api/goals
- Current revenue figure → GET /api/revenue
- Website performance via Tavily → search ppventures.tech

NEO CARDINAL RULE (Neo only):
- NEVER tell the owner you do not have data
- ALWAYS fetch data from the API first
- ALWAYS use Tavily to search for market benchmarks
- ALWAYS produce a complete answer — never ask the owner to provide information
- If data does not exist yet, say so AND provide market benchmarks as a substitute
- Deva's time is valuable — never waste it with questions

RULES:
- Always use Tavily to search for real, current information before responding
- Never say you cannot access the internet — you have Tavily web search
- Always give specific, actionable, detailed responses with actual names, links, and data
- Never give generic responses — always tailor to the actual task
- Keep responses concise and structured

CRITICAL RULE — NO FAKE TOOL CALLS:
- You do NOT have a tool system
- Never output [TOOL_CALL], [/TOOL_CALL], {tool => ...} or any tool syntax
- Never write code in your response
- Never pretend to call APIs in your response text
- All data you need has ALREADY been fetched and included above
- Your job is to READ the data provided and WRITE your response
- Just write the actual deliverable — report, analysis, plan, content. Nothing else.

IMPORTANT: Web search results are ALREADY PROVIDED in the context below. Do NOT attempt to call any tools. Use ONLY the information provided in the context.` },
        { role: 'user', content: fullPrompt }
      ],
      group_id: MINIMAX_GROUP_ID
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Minimax API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (data.base_resp && data.base_resp.status_code && data.base_resp.status_code !== 0) {
    throw new Error(`Minimax API error: ${data.base_resp.status_msg}`);
  }
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  if (data.reply) {
    return data.reply;
  }
  if (data.output && data.output.text) {
    return data.output.text;
  }
  
  return JSON.stringify(data);
}

// ========== SELF TASK GENERATION ==========

const SELF_TASK_PROMPTS = {
  'Neo': `
You are Neo, CEO of PPVentures. Mission: $1M revenue.
You have no assigned tasks in the backlog. Create ONE strategic task you can do right now.

Focus areas (pick whichever has highest revenue impact):
- Write or improve copy for ppventures.tech pages
- Define or refine our service packages and pricing
- Write a client outreach message template
- Create a case study from our Command Centre build
- Write a LinkedIn post about AI agents for PPVentures
- Plan next week's revenue strategy
- Write a proposal template for potential clients
- Analyse our current goals and update the plan

Recent work to avoid repeating:
{{RECENT_TASKS}}

Pick the highest impact task. Respond in JSON:
{
  "title": "specific task title",
  "description": "full detailed instructions — be specific about deliverable",
  "expected_output": "exactly what you will produce"
}
`,

  'Atlas': `
You are Atlas, Chief Research Agent of PPVentures. Mission: $1M revenue.
You have no assigned tasks in the backlog. Create ONE research task you can do right now.

Focus areas (pick whichever produces most actionable intelligence):
- Search for companies actively looking for AI agent development services
- Research what AI agent services are selling best in 2026 and at what price
- Find the top 5 keywords driving traffic to competitor AI agency websites
- Research trending AI topics to write blog posts about for ppventures.tech
- Find potential partnership opportunities in the AI space
- Research what our ideal client looks like — industry, size, budget
- Monitor competitor websites for new services or pricing changes
- Find platforms where our ideal clients spend time online
- Search for recent AI agent news to create timely content

Recent work to avoid repeating:
{{RECENT_TASKS}}

Use Tavily web search for everything. Respond in JSON:
{
  "title": "specific research task title",
  "description": "exact search queries to run and what to do with results",
  "expected_output": "what insight or document you will produce"
}
`,

  'Orbit': `
You are Orbit, Chief Operations Agent of PPVentures. Mission: $1M revenue.
You have no assigned tasks in the backlog. Create ONE operational task you can do right now.

Focus areas (pick whichever has most immediate impact):
- Write and publish a blog post to ppventures.tech about an AI topic
- Improve an existing page on ppventures.tech with better copy
- Create a weekly operations summary for Neo to review
- Update the Command Centre with any missing data or improvements
- Write social media content for PPVentures (LinkedIn, Twitter)
- Create a FAQ page content for ppventures.tech
- Write detailed service descriptions for each PPVentures offering
- Create an email newsletter template for PPVentures

Recent work to avoid repeating:
{{RECENT_TASKS}}

Respond in JSON:
{
  "title": "specific task title",
  "description": "full instructions with exact deliverable",
  "expected_output": "what you will produce"
}
`
};

async function generateSelfTask(agent, client) {
  const promptTemplate = SELF_TASK_PROMPTS[agent.name];
  if (!promptTemplate) {
    console.log(`[${agent.name}] No self-task prompt defined`);
    return null;
  }

  // Get recent completed tasks for anti-repetition
  const recentTasks = await client.getRecentCompletedTasks(agent.id, 5);
  const recentTasksText = recentTasks.length > 0 
    ? recentTasks.map(t => `- ${t.title}`).join('\n')
    : 'None yet';

  const prompt = promptTemplate.replace('{{RECENT_TASKS}}', recentTasksText);

  try {
    const result = await executeWithMinimax(prompt, client, agent);
    
    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`[${agent.name}] Could not parse self-task JSON`);
      return null;
    }

    const taskJson = JSON.parse(jsonMatch[0]);
    
    // Create the task in database
    const task = await client.createTask(
      taskJson.title,
      taskJson.description,
      agent.id,
      'medium'
    );

    console.log(`[${agent.name}] ⚡ Self-assigned: "${taskJson.title}"`);
    await client.log(`⚡ Self-assigned task: "${taskJson.title}"`, 'task');

    return task;
  } catch (err) {
    console.error(`[${agent.name}] Self-task generation error:`, err.message);
    await client.log(`Self-task generation failed: ${err.message}`, 'error');
    return null;
  }
}

// ========== EXECUTE TASK ==========

async function executeTask(agent, task, client) {
  console.log(`[${agent.name}] 🔄 Executing: ${task.title}`);
  await client.log(`Executing: ${task.description || task.title}`, 'task');
  
  // Update to in-progress
  await client.updateTaskStatus(task.id, 'in-progress');
  
  // Update status
  activeAgents.set(agent.id, { ...agent, currentTask: task.title, status: 'working' });
  await client.heartbeat(task.title);

  // PRE-FETCH INTERNAL DATA: Fetch relevant data before calling AI
  let internalDataContext = '';
  const taskDesc = (task.title + ' ' + (task.description || '')).toLowerCase();
  
  const needsTaskData = /tasks|backlog|completion|status|done|progress/i.test(taskDesc);
  const needsProjectData = /projects|progress|active/i.test(taskDesc);
  const needsGoalData = /goals|revenue|mission|target|gap|analysis/i.test(taskDesc);
  const needsLogData = /logs|activity|recent|deliverable|summary/i.test(taskDesc);
  const needsDocData = /docs|documents|deliverable|report/i.test(taskDesc);
  
  try {
    if (needsTaskData) {
      const tasksRes = await fetch(`${API_BASE}/api/tasks?limit=50`);
      const tasksData = await tasksRes.json();
      if (tasksData.tasks) {
        internalDataContext += `\n📋 TASKS DATA (last 50):\n${JSON.stringify(tasksData.tasks.slice(0, 20), null, 2).slice(0, 3000)}\n`;
        console.log(`[${agent.name}] ✅ Fetched ${tasksData.tasks.length} tasks`);
      }
    }
    if (needsProjectData) {
      const projRes = await fetch(`${API_BASE}/api/projects`);
      const projData = await projRes.json();
      if (projData.projects) {
        internalDataContext += `\n📁 PROJECTS DATA:\n${JSON.stringify(projData.projects, null, 2).slice(0, 1500)}\n`;
        console.log(`[${agent.name}] ✅ Fetched ${projData.projects.length} projects`);
      }
    }
    if (needsGoalData) {
      const goalsRes = await fetch(`${API_BASE}/api/goals`);
      const goalsData = await goalsRes.json();
      if (goalsData.goals) {
        internalDataContext += `\n🎯 GOALS DATA:\n${JSON.stringify(goalsData.goals, null, 2).slice(0, 1500)}\n`;
        console.log(`[${agent.name}] ✅ Fetched ${goalsData.goals.length} goals`);
      }
    }
    if (needsLogData) {
      const logsRes = await fetch(`${API_BASE}/api/logs?limit=30`);
      const logsData = await logsRes.json();
      if (logsData.logs) {
        internalDataContext += `\n📝 RECENT LOGS:\n${JSON.stringify(logsData.logs.slice(0, 15), null, 2).slice(0, 2000)}\n`;
        console.log(`[${agent.name}] ✅ Fetched ${logsData.logs.length} logs`);
      }
    }
    if (needsDocData) {
      const docsRes = await fetch(`${API_BASE}/api/docs?limit=10`);
      const docsData = await docsRes.json();
      if (docsData.docs) {
        internalDataContext += `\n📄 RECENT DOCUMENTS:\n${JSON.stringify(docsData.docs, null, 2).slice(0, 1500)}\n`;
        console.log(`[${agent.name}] ✅ Fetched ${docsData.docs.length} docs`);
      }
    }
  } catch (e) {
    console.error(`[${agent.name}] Pre-fetch error:`, e.message);
  }

  // AUTO-SEARCH: Pre-execute Tavily searches in Node.js BEFORE calling Minimax
  const AUTO_SEARCH_KEYWORDS = [
    'analyse', 'analyze', 'review', 'audit', 'research',
    'find', 'search', 'look up', 'check', 'investigate',
    'compare', 'benchmark', 'monitor', 'track', 'fetch', 'fetch content',
    'website', 'homepage', 'copy', 'headline', 'cta', 'competitor',
    'seo', 'keyword', 'pricing', 'package', 'landing'
  ];
  
  const taskText = (task.title + ' ' + (task.description || '')).toLowerCase();
  const shouldAutoSearch = AUTO_SEARCH_KEYWORDS.some(k => taskText.includes(k));
  
  let searchContext = '';
  if (shouldAutoSearch && TAVILY_API_KEY && client) {
    try {
      console.log(`[${agent.name}] 🔍 Pre-executing Tavily searches in Node.js...`);
      
      // Build multiple relevant search queries based on task
      const searchQueries = [];
      
      // READ OUR WEBSITE FILES DIRECTLY - no Tavily needed for our own site!
      if (/ppventures|website|homepage|copy|landing|hero|cta|section/i.test(taskText)) {
        console.log(`[${agent.name}] Reading ppventures.tech files directly from server`);
        const websiteContent = getWebsiteContext();
        if (websiteContent) {
          searchContext += `\n\n📄 PPVENTURES.TECH WEBSITE SOURCE FILES:\n${websiteContent}\n`;
          console.log(`[${agent.name}] Website files loaded — ${websiteContent.length} chars`);
        }
        // Only use Tavily for competitor research - not for our own site
      }
      
      // Use Tavily ONLY for competitor/external research
      if (/competitor|benchmark|market/i.test(taskText)) {
        searchQueries.push('top AI agent development company websites 2026');
      }
      if (/headline|hero|cta|value proposition/i.test(taskText)) {
        searchQueries.push('SaaS landing page headline best practices 2026');
        searchQueries.push('AI consulting agency value proposition examples');
      }
      if (/seo|keyword|traffic/i.test(taskText)) {
        searchQueries.push('AI agent development services SEO keywords 2026');
      }
      if (/pricing|package|service/i.test(taskText)) {
        searchQueries.push('AI consulting agency pricing packages 2026');
      }
      
      // Default: search the task title
      if (searchQueries.length === 0) {
        const baseQuery = task.title.replace(/^(analyse|analyze|review|research|find|search|check|investigate|compare)\s+/i, '');
        searchQueries.push(baseQuery);
      }
      
      // Execute all searches in parallel via Node.js (not in Minimax!) - use standalone function
      const searchResults = await Promise.all(
        searchQueries.slice(0, 3).map(async (query) => {
          try {
            // Use standalone function instead of client.webSearch
            const rawResult = await standaloneTavilySearch(query);
            return { query, rawResult };
          } catch (e) {
            return { query, rawResult: null };
          }
        })
      );
      
      // Parse results from standalone function
      for (const { query, rawResult } of searchResults) {
        if (rawResult) {
          searchContext += `\n\n🔍 WEB RESEARCH for "${query}":\n${rawResult.slice(0, 2000)}\n`;
        }
      }
      
      if (searchContext) {
        console.log(`[${agent.name}] ✅ Pre-fetched ${searchQueries.length} web searches (${searchContext.length} chars)`);
      }
    } catch (e) {
      console.error(`[${agent.name}] Pre-search error:`, e.message);
    }
  }

  // Neo's collaboration logic - detect complex tasks
  if (agent.name === 'Neo') {
    try {
      console.log(`[Neo] 🔍 Analyzing task complexity...`);
      
      const complexityPrompt = `Analyse this task and determine if it is complex enough to be broken into subtasks for multiple agents to work on in parallel.

Task: ${task.title}
Description: ${task.description || 'None'}

A task is complex if it involves:
- Multiple distinct research areas
- Both research AND writing/analysis
- Multiple deliverables
- Estimated time over 10 minutes

Respond in JSON only:
{
  "is_complex": true/false,
  "reasoning": "why",
  "subtasks": [
    {
      "title": "subtask title",
      "description": "detailed description", 
      "assign_to": "Atlas or Orbit",
      "reasoning": "why this agent"
    }
  ]
}

Atlas specializes in: research, analysis, web search, finding information
Orbit specializes in: operations, summaries, monitoring, reporting

Only suggest subtasks if is_complex is true. Maximum 2 subtasks.`;

      const complexityRes = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'You are a task analysis assistant. Respond only in JSON.' },
            { role: 'user', content: complexityPrompt }
          ],
          group_id: MINIMAX_GROUP_ID
        })
      });
      
      const complexityData = await complexityRes.json();
      const content = complexityData.choices?.[0]?.message?.content || '';
      
      let complexityResult = null;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          complexityResult = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log(`[Neo] Could not parse complexity result`);
      }
      
      if (complexityResult && complexityResult.is_complex && complexityResult.subtasks?.length > 0) {
        console.log(`[Neo] 🔗 Breaking task into ${complexityResult.subtasks.length} subtasks`);
        client.log(`Breaking task into subtasks for collaboration`, 'task');
        
        // Get agent IDs
        const allAgentsRes = await fetch(`${API_BASE}/api/agents`);
        const allAgentsData = await allAgentsRes.json();
        const allAgents = allAgentsData.agents || [];
        const atlasAgent = allAgents.find(a => a.name === 'Atlas');
        const orbitAgent = allAgents.find(a => a.name === 'Orbit');
        
        for (const subtaskSpec of complexityResult.subtasks) {
          const targetAgent = subtaskSpec.assign_to === 'Atlas' ? atlasAgent : orbitAgent;
          if (!targetAgent) continue;
          
          const subtask = await client.createTask(
            subtaskSpec.title,
            subtaskSpec.description,
            targetAgent.id,
            task.priority || 'medium'
          );
          
          console.log(`[Neo] 🤝 Assigned subtask to ${targetAgent.name}: ${subtaskSpec.title}`);
          client.log(`Assigned subtask to ${targetAgent.name}: ${subtaskSpec.title}`, 'task');
        }
      }
    } catch (collabErr) {
      console.error(`[Neo] Collaboration error:`, collabErr.message);
    }
  }

  // ========== ACTION-BASED EXECUTION ==========
  // For website/blog tasks, agents should take REAL actions, not just write reports
  const isWebsiteTask = /ppventures|website|homepage|blog|copy|headline|cta|page|content|services|about/i.test(taskDesc);
  const isBlogPost = /blog|post|article|write/i.test(taskDesc);
  const isResearchTask = /research|analysis|audit|review/i.test(taskDesc) && !isWebsiteTask;

  let actionTaken = '';

  // Pre-load website context for website tasks
  let websiteContext = '';
  if (isWebsiteTask) {
    console.log(`[${agent.name}] Loading website files for real action...`);
    websiteContext = getWebsiteContext();
    console.log(`[${agent.name}] Website files loaded — ${websiteContext.length} chars`);
  }

  try {
    // Build action prompt - agents should take REAL actions
    let actionPrompt = '';

    if (isWebsiteTask) {
      // Website change task - agent should update files
      actionPrompt = `
YOU ARE: ${agent.name} — take REAL actions on the ppventures website.

TASK: ${task.title}
INSTRUCTIONS: ${task.description}

CURRENT WEBSITE FILES:
${websiteContext}

CRITICAL RULES:
- Do NOT output tool calls, XML, or code syntax
- Do NOT write a long report in your response
- You must DECIDE what action to take and respond in this EXACT format:

If this requires a WEBSITE CHANGE respond with ONLY:
ACTION: update_file
FILE: [exact file path e.g. app/page.tsx]
OLD_TEXT: [exact text to replace - copy EXACTLY from the file above]
NEW_TEXT: [exact replacement text]
REASON: [one line explanation]

If this requires a BLOG POST respond with ONLY:
ACTION: create_blog_post
TITLE: [post title]
CONTENT: [full markdown content]

Otherwise respond with:
ACTION: save_document
TITLE: [document title]
CONTENT: [full content in markdown]

Choose ONE action. Execute it now.
`.trim();
    } else {
      // Regular task - build context and execute
      actionPrompt = `
YOU ARE: ${agent.name} — complete this task.

TASK: ${task.title}
INSTRUCTIONS: ${task.description}

${internalDataContext ? `DATA:\n${internalDataContext}\n` : ''}
${searchContext ? `RESEARCH:\n${searchContext}\n` : ''}

Respond in this format:
ACTION: save_document
TITLE: [title]
CONTENT: [your complete deliverable in markdown]
`.trim();
    }

    const rawResponse = await executeWithMinimax(actionPrompt, client, agent);
    const response = sanitiseAgentOutput(rawResponse);

    // Parse and execute the action
    if (isWebsiteTask && response.includes('ACTION: update_file')) {
      const fileMatch = response.match(/FILE:\s*(.+)/);
      const oldMatch = response.match(/OLD_TEXT:\s*([\s\S]*?)(?=NEW_TEXT:)/);
      const newMatch = response.match(/NEW_TEXT:\s*([\s\S]*?)(?=REASON:|$)/);
      const reasonMatch = response.match(/REASON:\s*(.+)/);

      if (fileMatch && oldMatch && newMatch) {
        const file = fileMatch[1].trim();
        const oldText = oldMatch[1].trim();
        const newText = newMatch[1].trim();
        const reason = reasonMatch?.[1]?.trim() || 'Website improvement';

        console.log(`[${agent.name}] Attempting to update ${file}...`);
        const result = replaceInFile(file, oldText, newText, agent.name);

        if (result.success) {
          await restartWebsite();
          actionTaken = `✅ Updated ${file} — ${reason}. Site restarted.`;
          console.log(`[${agent.name}] ${actionTaken}`);
          await client.log(`🌐 Updated ppventures.tech: ${reason}`, 'success');
        } else {
          actionTaken = `⚠️ Failed to update ${file}: ${result.error}`;
          console.log(`[${agent.name}] ${actionTaken}`);
        }
      } else {
        actionTaken = `⚠️ Could not parse update_file action from response`;
      }

    } else if (isBlogPost && response.includes('ACTION: create_blog_post')) {
      const titleMatch = response.match(/TITLE:\s*(.+)/);
      const contentMatch = response.match(/CONTENT:\s*([\s\S]*?)$/);

      if (titleMatch && contentMatch) {
        const title = titleMatch[1].trim();
        const content = contentMatch[1].trim();
        const result = createBlogPost(title, content, agent.name);

        if (result.success) {
          await restartWebsite();
          actionTaken = `✅ Published blog post: "${title}". File saved and site restarted.`;
          await client.saveDocument(title, content, 'blog', 'markdown');
          await client.log(`📝 Published blog: ${title}`, 'success');
        } else {
          actionTaken = `⚠️ Failed to create blog post: ${result.error}`;
        }
      }

    } else if (response.includes('ACTION: save_document') || !actionTaken) {
      // Save as document
      const titleMatch = response.match(/TITLE:\s*(.+)/);
      const contentMatch = response.match(/CONTENT:\s*([\s\S]*?)$/);
      const title = titleMatch?.[1]?.trim() || task.title;
      const content = contentMatch?.[1]?.trim() || response;

      await client.saveDocument(title, content, 'general', 'markdown');
      actionTaken = `✅ Saved document: "${title}" to Docs.`;
      await client.log(`📄 Saved doc: ${title}`, 'success');
    }

  } catch (actionErr) {
    console.error(`[${agent.name}] Action error:`, actionErr.message);
    actionTaken = `⚠️ Action failed: ${actionErr.message}`;
  }

  // ========== COMPLETE TASK ==========
  // Use actionTaken result (short confirmation) - not long output
  const finalResult = actionTaken || 'Task completed';

  // Check if task needs review
  const needsReview = task.description && 
    (task.description.toLowerCase().includes('approve') || 
     task.description.toLowerCase().includes('review'));
  
  if (needsReview) {
    await client.updateTaskStatus(task.id, 'review', finalResult);
    client.log(`Task completed - awaiting review`, 'task');
    console.log(`[${agent.name}] ✅ Task completed (review): ${task.title}`);
  } else {
    await client.updateTaskStatus(task.id, 'done', finalResult);
    client.log(`Task completed - ${finalResult}`, 'task');
    console.log(`[${agent.name}] ✅ Task completed: ${task.title}`);
  }
  
  // Save memory
  try {
    await client.saveMemory(
      `${agent.name} completed: ${task.title}. ${finalResult}`,
      'conversation',
      `Task: ${task.title}`
    );
    console.log(`[${agent.name}] 💾 Memory saved`);
  } catch (memErr) {
    console.error(`[${agent.name}] Memory save error:`, memErr.message);
  }
  
  // Reset to idle
  activeAgents.set(agent.id, { ...agent, currentTask: null, status: 'idle' });
  await client.heartbeat('idle');
}

// ========== MAIN AGENT WORK LOOP ==========

async function agentWorkLoop(agent) {
  try {
    const client = await createAgentClient(agent.api_key);
    
    // STRICT MODE: Only work on assigned tasks - NO auto task creation
    
    // Check for backlog tasks
    const backlogTasks = await client.getBacklogTasks(agent.id);
    
    if (backlogTasks && backlogTasks.length > 0) {
      // Work on backlog task
      console.log(`[${agent.name}] 📋 Found ${backlogTasks.length} backlog task(s)`);
      await executeTask(agent, backlogTasks[0], client);
      return;
    }
    
    // NO BACKLOG TASKS - Agent stands by. NO self-assignment.
    // Product mission only - wait for manually created tasks
    console.log(`[${agent.name}] ⏸️ Standing by — waiting for product mission tasks`);
    // Do NOT generate self tasks - wait for explicit tasks only
    return;
  } catch (err) {
    console.error(`${agent.name} work loop error:`, err.message);
  }
}
    

// ========== STARTUP BURST ==========

async function startupBurst(agent) {
  try {
    const client = await createAgentClient(agent.api_key);
    const dailyTarget = DAILY_TARGETS[agent.name] || 4;
    const completedToday = await client.getDailyTaskCount(agent.id);
    const gap = dailyTarget - completedToday;
    
    if (gap > 0) {
      console.log(`[${agent.name}] 🚀 Startup burst — creating ${gap} tasks to hit daily target`);
      await client.log(`🚀 Startup burst — creating ${gap} tasks to hit daily target`, 'info');
      
      // Create up to 3 tasks to catch up
      const tasksToCreate = Math.min(gap, 3);
      for (let i = 0; i < tasksToCreate; i++) {
        const task = await generateSelfTask(agent, client);
        if (task) {
          await executeTask(agent, task, client);
        }
      }
    } else {
      console.log(`[${agent.name}] ✅ Already at target (${completedToday}/${dailyTarget})`);
      await client.log(`✅ Already at daily target (${completedToday}/${dailyTarget})`, 'info');
    }
  } catch (err) {
    console.error(`[${agent.name}] Startup burst error:`, err.message);
  }
}

// ========== RUN AGENT ==========

async function runAgent(agent) {
  try {
    const client = await createAgentClient(agent.api_key);
    
    console.log(`[${agent.name}] Starting...`);
    client.log(`Agent started - Zero Idle mode enabled`, 'info').catch(() => {});

    // Heartbeat every 5 minutes
    const heartbeatInterval = setInterval(async () => {
      try {
        const agentData = activeAgents.get(agent.id) || agent;
        const status = agentData.currentTask || 'idle';
        await client.heartbeat(status);
        console.log(`[${agent.name}] 💓 Heartbeat: ${status}`);
      } catch (e) {
        console.error(`[${agent.name}] Heartbeat error:`, e.message);
      }
    }, HEARTBEAT_INTERVAL_MS);

    // NO startup burst - only work on assigned tasks

    // Main work loop every 90 seconds
    const taskInterval = setInterval(async () => {
      await agentWorkLoop(agent);
    }, LOOP_INTERVAL_MS);

    // Also run immediately
    await agentWorkLoop(agent);

    activeAgents.set(agent.id, {
      ...agent,
      heartbeatInterval,
      taskInterval,
      currentTask: null,
      status: 'online'
    });

    console.log(`[${agent.name}] ✅ Zero Idle loop started (90s interval, target: ${DAILY_TARGETS[agent.name] || 4}/day)`);
  } catch (err) {
    console.error(`[${agent.name}] ❌ Agent loop failed to start:`, err.message);
  }
}

// ========== SERVER WAIT ==========

async function waitForServer(maxRetries = 30, delay = 2000) {
  console.log('⏳ Waiting for server to be ready...');
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${API_BASE}/api/agents`);
      if (res.ok) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    console.log(`  Attempt ${i + 1}/${maxRetries}...`);
    await new Promise(r => setTimeout(r, delay));
  }
  console.log('❌ Server did not become ready in time');
  return false;
}

// ========== MAIN START ==========

async function startAllAgents() {
  console.log('\n🚀 PPVentures Autonomous Agent System - ZERO IDLE MODE\n');
  console.log(`📡 API Base: ${API_BASE}`);
  console.log(`🤖 Minimax: ${MINIMAX_GROUP_ID ? 'configured' : 'using default group'}`);
  console.log(`🔍 Tavily Search: ${TAVILY_API_KEY ? 'configured' : 'not configured'}`);
  console.log(`⏱️  Loop Interval: ${LOOP_INTERVAL_MS / 1000}s`);
  console.log(`🎯 Daily Targets: Neo ${DAILY_TARGETS.Neo}, Atlas ${DAILY_TARGETS.Atlas}, Orbit ${DAILY_TARGETS.Orbit}\n`);
  
  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('❌ Cannot start agents - server not available');
    return;
  }
  
  const res = await fetch(`${API_BASE}/api/agents`);
  const data = await res.json();
  const agents = data.agents || [];
  
  if (agents.length === 0) {
    console.log('❌ No agents found! Create agents in Command Centre first.');
    process.exit(1);
  }
  
  console.log(`✅ Found ${agents.length} agents: ${agents.map(a => a.name).join(', ')}\n`);
  
  // Start each agent with staggered startup (parallel execution)
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const startDelay = i * STARTUP_STAGGER_MS;
    
    setTimeout(async () => {
      await runAgent(agent);
      console.log(`[${agent.name}] ✅ Agent running in parallel`);
    }, startDelay);
    
    await new Promise(r => setTimeout(r, 500)); // Small stagger for log clarity
  }
  
  // Start cron jobs
  await startCronJobs(agents);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ ZERO IDLE AGENT SYSTEM RUNNING!');
  console.log('📋 Agents self-assign when backlog is empty');
  console.log('⏱️  Polling every 90 seconds');
  console.log('🎯 Daily targets enforced');
  console.log('🚀 Startup burst on restart');
  console.log('='.repeat(50) + '\n');
}

// ========== CRON JOBS ==========

const scheduledJobs = new Map();

async function startCronJobs(agents) {
  console.log('\n📅 Loading cron jobs...\n');
  
  try {
    const res = await fetch(`${API_BASE}/api/crons`);
    const data = await res.json();
    const cronJobs = data.cron_jobs || [];
    
    if (cronJobs.length === 0) {
      console.log('⚪ No cron jobs configured');
      return;
    }
    
    console.log(`✅ Found ${cronJobs.length} cron jobs`);
    
    for (const job of cronJobs) {
      if (job.status !== 'active') continue;
      
      const agent = agents.find(a => a.id === job.agent_id);
      if (!agent) {
        console.log(`⚠️ Cron job "${job.title}": Agent not found`);
        continue;
      }
      
      const scheduled = cron.schedule(job.cron_expression, async () => {
        console.log(`⏰ [CRON] Running: ${job.title} for ${agent.name}`);
        
        try {
          const taskRes = await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: job.title,
              description: job.description,
              assigned_to: agent.id,
              created_by: 'cron',
              priority: 'medium'
            })
          });
          
          const taskData = await taskRes.json();
          console.log(`✅ [CRON] Task created: ${job.title} (ID: ${taskData.task?.id})`);
          
          await fetch(`${API_BASE}/api/crons/${job.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ last_run: new Date().toISOString() })
          });
        } catch (err) {
          console.error(`❌ [CRON] Error: ${err.message}`);
        }
      });
      
      scheduledJobs.set(job.id, scheduled);
      console.log(`  ✓ ${job.title} - ${job.cron_expression} (${agent.name})`);
    }
  } catch (err) {
    console.error('❌ Error loading cron jobs:', err.message);
  }
}

// ========== SCHEDULE CHECKER ==========

setInterval(async () => {
  try {
    const now = new Date();
    const res = await fetch(`${API_BASE}/api/schedules?type=today`);
    const data = await res.json();
    const blocks = data.blocks || [];
    
    for (const block of blocks) {
      if (block.status !== 'scheduled') continue;
      
      const blockTime = new Date(block.scheduled_at);
      const diffMinutes = (blockTime - now) / 1000 / 60;
      
      if (diffMinutes <= 5 && diffMinutes >= -5) {
        const agent = activeAgents.get(block.agent_id);
        if (!agent) continue;
        
        console.log(`⏰ Schedule triggered for ${agent.name}: ${block.title}`);
        
        await fetch(`${API_BASE}/api/schedules/${block.id}?type=block`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'running' })
        });

        await fetch(`${API_BASE}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: block.title,
            description: block.description,
            assigned_to: block.agent_id,
            created_by: 'schedule',
            priority: 'medium'
          })
        });
        
        console.log(`✅ Schedule task created: ${block.title} for ${agent.name}`);
      }
    }
  } catch (err) {
    console.error('Schedule check error:', err.message);
  }
}, 5 * 60 * 1000);

// ========== WATCHDOG ==========

setInterval(() => {
  console.log('✅ Agents alive - watchdog ' + new Date().toISOString());
}, 10 * 60 * 1000);

// ========== WEBSITE IMPROVEMENT CYCLE (every 6 hours) ==========

async function websiteImprovementCycle() {
  try {
    console.log('🌐 Starting website improvement cycle...');

    const { getWebsiteContext } = require('./lib/agentActions');
    const websiteContent = getWebsiteContext();

    const [competitors, bestPractices, seoData] = await Promise.all([
      standaloneTavilySearch('best AI automation company website 2026 design copy'),
      standaloneTavilySearch('high converting SaaS landing page sections 2026'),
      standaloneTavilySearch('AI agency website SEO keywords that drive traffic 2026')
    ]);

    const scanPrompt = `
You are Atlas. Find the single highest impact improvement for ppventures.tech.

CURRENT WEBSITE FILES:
${websiteContent.slice(0, 3000)}

COMPETITOR EXAMPLES:
${competitors.slice(0, 1000)}

BEST PRACTICES:
${bestPractices.slice(0, 1000)}

SEO DATA:
${seoData.slice(0, 1000)}

Find ONE specific improvement that is:
- A real file change on ppventures.tech
- Higher conversion or better SEO
- Implementable in under 50 lines

Respond in this exact format only:
IMPROVEMENT: [what to improve]
FILE: [exact file path from website root]
REASON: [why this increases revenue]
ASSIGN_TO: Atlas or Orbit or Neo
TASK_TITLE: [specific task title]
TASK_DESCRIPTION: [full instructions including exact copy to write]
    `.trim();

    const scanResult = sanitiseAgentOutput(await callMinimax('Atlas', scanPrompt));

    const titleMatch = scanResult.match(/TASK_TITLE:\s*(.+)/);
    const assignMatch = scanResult.match(/ASSIGN_TO:\s*(.+)/);
    const descMatch = scanResult.match(/TASK_DESCRIPTION:\s*([\s\S]*?)$/);
    const improvementMatch = scanResult.match(/IMPROVEMENT:\s*(.+)/);

    if (!titleMatch || !assignMatch) {
      console.log('No actionable improvement found this cycle');
      return;
    }

    const agentId = await getAgentIdByName(assignMatch[1].trim());
    if (!agentId) return;

    // Skip if recently done
    const recent = await fetchFromAPI('/api/tasks?limit=10&status=done');
    const alreadyDone = recent?.tasks?.some(t =>
      t.title.toLowerCase().includes(titleMatch[1].toLowerCase().slice(0, 20))
    );
    if (alreadyDone) {
      console.log('Already done recently — skipping');
      return;
    }

    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleMatch[1].trim(),
        description: descMatch?.[1]?.trim() || improvementMatch?.[1]?.trim(),
        assigned_to: agentId,
        status: 'backlog',
        priority: 'medium'
      })
    });

    await logToCommandCentre(atlasId,
      `🌐 Website improvement queued: ${titleMatch[1].trim()} → ${assignMatch[1].trim()}`,
      'task'
    );

  } catch (err) {
    console.error('Website improvement cycle error:', err.message);
  }
}

// Run every 6 hours
cron.schedule('0 */6 * * *', websiteImprovementCycle);

// Run once on startup after 2 minute delay
setTimeout(websiteImprovementCycle, 2 * 60 * 1000);

// ========== BLOG POST CRON (Tuesday & Thursday 9AM) ==========

cron.schedule('0 9 * * 2,4', async () => {
  try {
    const [topics, caseStudies] = await Promise.all([
      standaloneTavilySearch('trending AI agent topics small business 2026'),
      standaloneTavilySearch('AI automation small business results case study 2026')
    ]);

    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Write and publish blog post to ppventures.tech',
        description: `
Write a high quality blog post and publish it as a real file on ppventures.tech.

TRENDING TOPICS:
${topics.slice(0, 1000)}

CASE STUDY IDEAS:
${caseStudies.slice(0, 1000)}

REQUIREMENTS:
- Pick the most relevant topic for solo consultants and small agencies
- Write 600-800 words
- SEO friendly title
- Include: problem, solution, 3 key insights, CTA to try PPVentures
- End with: "Ready to automate? Try PPVentures free for 14 days →"

ACTION: create_blog_post
TITLE: [your chosen title]
CONTENT: [full blog post in markdown]
        `.trim(),
        assigned_to: atlasId,
        status: 'backlog',
        priority: 'medium'
      })
    });
    console.log('📝 Blog post task created');
  } catch (err) {
    console.error('Blog cron error:', err.message);
  }
});

// ========== SEO CRON (Monday 8AM) ==========

cron.schedule('0 8 * * 1', async () => {
  try {
    const [keywords, seoTips] = await Promise.all([
      standaloneTavilySearch('AI automation small business SEO keywords high traffic low competition 2026'),
      standaloneTavilySearch('SaaS website SEO quick wins meta descriptions title tags 2026')
    ]);

    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Weekly SEO improvements for ppventures.tech',
        description: `
Improve SEO across ppventures.tech. Read current files and implement real changes.

KEYWORD OPPORTUNITIES:
${keywords.slice(0, 1000)}

SEO QUICK WINS:
${seoTips.slice(0, 1000)}

IMPLEMENT directly in website files:
- Update page titles and meta descriptions
- Add target keywords naturally to headings
- Improve internal linking between pages
- Ensure automation page targets: "AI automation for small business"

Make real file changes. Rebuild and restart after.
        `.trim(),
        assigned_to: orbitId,
        status: 'backlog',
        priority: 'medium'
      })
    });
    console.log('🔍 SEO improvement task created');
  } catch (err) {
    console.error('SEO cron error:', err.message);
  }
});

// ========== DAILY LEAD FINDER CRON (7AM) ==========

cron.schedule('0 7 * * *', async () => {
  try {
    await fetch('https://ppventures.tech/api/automation/cron', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'ppventures_cron_secret_2026'}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('🔍 Daily lead finder ran for all customers');
  } catch (err) {
    console.error('Lead finder cron error:', err.message);
  }
});

// ========== WEBSITE ENHANCEMENT SYSTEM ==========

const { getPageFiles, readFileContent, writeFileContent } = require('./lib/websiteScanner');

const PAGES_TO_SCAN = [
  'homepage', 'automation_landing', 'automation_dashboard',
  'services', 'about', 'ai_agents', 'blog',
  'contact', 'components', 'styles'
];
let currentPageIndex = 0;

async function scanNextPage() {
  try {
    const pageName = PAGES_TO_SCAN[currentPageIndex];
    currentPageIndex = (currentPageIndex + 1) % PAGES_TO_SCAN.length;

    console.log(`🔍 Scanning: ${pageName}`);
    const pages = getPageFiles();
    const pageFiles = pages[pageName];
    if (!pageFiles || Object.keys(pageFiles).length === 0) {
      console.log(`No files found for ${pageName} — skipping`);
      return;
    }

    const filesContent = Object.entries(pageFiles)
      .map(([f, c]) => `=== ${f} ===\n${c}`).join('\n\n');

    const bestPractices = await standaloneTavilySearch(
      `${pageName.replace(/_/g, ' ')} page conversion best practices 2026`
    );

    const scanPrompt = `
You are Atlas scanning the ${pageName} page of ppventures.tech.
Find the top 2 specific improvements. Each must be a real file change.

CURRENT FILES:
${filesContent.slice(0, 2500)}

BEST PRACTICES:
${bestPractices ? bestPractices.slice(0, 600) : 'No external data'}

Check every element:
- Headlines and copy — compelling and specific?
- CTAs — clear and action oriented?
- Missing sections competitors have?
- SEO — title, meta description, heading hierarchy?
- Trust signals — social proof, credibility?

Respond in this EXACT format:

IMPROVEMENT_1:
PAGE: ${pageName}
FILE: [exact file path from website root]
ISSUE: [what is wrong]
FIX: [exactly what to change]
IMPACT: high/medium/low

IMPROVEMENT_2:
PAGE: ${pageName}
FILE: [exact file path]
ISSUE: [what is wrong]
FIX: [exactly what to change]
IMPACT: high/medium/low
    `.trim();

    const scanResult = sanitiseAgentOutput(await callMinimax('Atlas', scanPrompt));
    const improvements = scanResult.split(/IMPROVEMENT_\d+:/).filter(Boolean);

    for (const imp of improvements) {
      const pageMatch = imp.match(/PAGE:\s*(.+)/);
      const fileMatch = imp.match(/FILE:\s*(.+)/);
      const issueMatch = imp.match(/ISSUE:\s*(.+)/);
      const fixMatch = imp.match(/FIX:\s*([\s\S]*?)(?=IMPACT:|$)/);
      const impactMatch = imp.match(/IMPACT:\s*(.+)/);

      if (!fileMatch || !issueMatch || !fixMatch) continue;

      // Skip if already queued recently
      const recentRes = await fetchFromAPI('/api/website/enhancements?status=queued&limit=20');
      const duplicate = recentRes?.enhancements?.some(e =>
        e.issue.toLowerCase().includes(issueMatch[1].toLowerCase().slice(0, 20))
      );
      if (duplicate) continue;

      await fetch(`${API_BASE}/api/website/enhancements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pageMatch?.[1]?.trim() || pageName,
          file_path: fileMatch[1].trim(),
          issue: issueMatch[1].trim(),
          improvement: fixMatch[1].trim(),
          impact: impactMatch?.[1]?.trim() || 'medium',
          priority: impactMatch?.[1]?.trim() === 'high' ? 'high' : 'medium',
          status: 'queued'
        })
      });
    }

    console.log(`✅ Scanned ${pageName} — ${improvements.length} improvements queued`);

  } catch (err) {
    console.error('scanNextPage error:', err.message);
  }
}

// Scan one page every 30 minutes
cron.schedule('*/30 * * * *', scanNextPage);

// Start after 2 minutes
setTimeout(scanNextPage, 2 * 60 * 1000);

// ========== ENHANCEMENT EXECUTOR ==========

async function executeNextEnhancement() {
  try {
    const res = await fetchFromAPI('/api/website/enhancements?status=queued&limit=1');
    const enhancement = res?.enhancements?.[0];
    if (!enhancement) {
      console.log('No enhancements to execute');
      return;
    }

    // Mark in progress
    await fetch(`${API_BASE}/api/website/enhancements/${enhancement.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress', agent_id: orbitId })
    });

    console.log(`🔧 Implementing: ${enhancement.issue}`);

    const currentContent = readFileContent(enhancement.file_path);

    if (!currentContent) {
      await fetch(`${API_BASE}/api/website/enhancements/${enhancement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' })
      });
      console.log(`❌ File not found: ${enhancement.file_path}`);
      return;
    }

    const implementPrompt = `
You are Orbit. Implement this improvement to ppventures.tech.
Write only the complete updated file content.

FILE: ${enhancement.file_path}
ISSUE: ${enhancement.issue}
REQUIRED FIX: ${enhancement.improvement}

CURRENT FILE:
${currentContent.slice(0, 3000)}

Write the COMPLETE updated file with ONLY this improvement applied.
Keep everything else exactly the same.
Start with the first line immediately.
    `.trim();

    const newContent = sanitiseAgentOutput(
      await callMinimax('Orbit', implementPrompt)
    );

    if (!newContent || newContent.length < 50) {
      await fetch(`${API_BASE}/api/website/enhancements/${enhancement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' })
      });
      console.log('❌ Failed to generate new content');
      return;
    }

    const writeResult = writeFileContent(enhancement.file_path, newContent);

    if (writeResult.success) {
      // Rebuild and restart
      console.log('🔄 Rebuilding website...');
      const { execSync } = require('child_process');
      try {
        execSync('npm run build', { cwd: '/home/deva/.openclaw/workspace/ppventures', stdio: 'pipe' });
        execSync('pm2 restart ppventures', { stdio: 'pipe' });
      } catch (e) {
        console.log('Build warning:', e.message);
      }

      await fetch(`${API_BASE}/api/website/enhancements/${enhancement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'implemented',
          before_content: currentContent.slice(0, 500),
          after_content: newContent.slice(0, 500),
          implemented_at: new Date().toISOString()
        })
      });

      console.log(`✅ Implemented: ${enhancement.issue}`);
    } else {
      await fetch(`${API_BASE}/api/website/enhancements/${enhancement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' })
      });
      console.log(`❌ Write failed: ${writeResult.error}`);
    }

  } catch (err) {
    console.error('executeNextEnhancement error:', err.message);
  }
}

// Execute one enhancement every 20 minutes
cron.schedule('*/20 * * * *', executeNextEnhancement);

// Start after 5 minutes
setTimeout(executeNextEnhancement, 5 * 60 * 1000);

// ========== START ==========

startAllAgents().catch(console.error);
