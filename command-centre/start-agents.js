#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' });

const cron = require('node-cron');

// Global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Agent Launcher Script
 * 
 * Starts all agents from the Command Centre database.
 * Each agent runs an execution loop that:
 * - Polls for backlog tasks every 60 seconds
 * - Executes tasks via Minimax API
 * - Logs every step to the activity feed
 * - Sends heartbeat every 5 minutes
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

const activeAgents = new Map();

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
      
      // Format results nicely
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

async function executeWithMinimax(prompt, client = null, agent = null) {
  // Check if prompt needs web search - expanded detection
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

YOUR SETUP:
- Command Centre running at http://72.62.231.18:3001
- You have 3 agents: Neo (lead), Atlas (research), Orbit (operations)
- You have Tavily web search available for real-time internet research
- All your work is saved to Supabase and visible in the Command Centre
- Your owner checks your work via the Task Board, Memory, and Docs screens

YOUR ROLE:
- Neo: Lead agent — handles coordination, general tasks, and complex reasoning
- Atlas: Research agent — specializes in web research, analysis, and reports
- Orbit: Operations agent — handles monitoring, summaries, and operational tasks

RULES:
- Always use Tavily to search for real, current information before responding
- Never say you cannot access the internet — you have Tavily web search
- Always give specific, actionable, detailed responses with actual names, links, and data
- Never give generic responses — always tailor to the actual task
- Keep responses concise and structured

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
  
  // Check for API errors in response
  if (data.base_resp && data.base_resp.status_code && data.base_resp.status_code !== 0) {
    throw new Error(`Minimax API error: ${data.base_resp.status_msg}`);
  }
  
  // Try different response formats
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

async function runAgentLoop(agent) {
  try {
    const client = await createAgentClient(agent.api_key);
    
    console.log(`[${agent.name}] Starting...`);
    client.log(`Agent started - waiting for tasks`, 'info').catch(() => {});

    // Heartbeat every 5 minutes - wrapped in error handling
    const heartbeatInterval = setInterval(async () => {
      try {
        const agentData = activeAgents.get(agent.id) || agent;
        const status = agentData.currentTask || 'idle';
        await client.heartbeat(status);
        console.log(`[${agent.name}] 💓 Heartbeat sent`);
      } catch (e) {
        console.error(`[${agent.name}] Heartbeat error:`, e.message);
      }
    }, 5 * 60 * 1000);

    // Task polling every 60 seconds - wrapped in error handling
    const taskInterval = setInterval(async () => {
      try {
      const tasks = await client.getBacklogTasks(agent.id);
      
      if (tasks.length > 0) {
        const task = tasks[0];
        
        console.log(`[${agent.name}] 📋 Found task: ${task.title}`);
        client.log(`Picked up task: ${task.title}`, 'task');
        
        // Update to in-progress
        await client.updateTaskStatus(task.id, 'in-progress');
        
        // Update status
        activeAgents.set(agent.id, { ...agent, currentTask: task.title, status: 'online' });
        await client.heartbeat(task.title);
        
        // Execute
        client.log(`Executing: ${task.description || task.title}`, 'task');
        console.log(`[${agent.name}] 🔄 Executing: ${task.title}`);
        
        // Neo's collaboration logic - detect complex tasks and create subtasks
        let parentTask = task;
        if (agent.name === 'Neo' && task.status === 'backlog') {
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
              
              // Create subtasks
              for (const subtaskSpec of complexityResult.subtasks) {
                const targetAgent = subtaskSpec.assign_to === 'Atlas' ? atlasAgent : orbitAgent;
                if (!targetAgent) continue;
                
                const subtaskRes = await fetch(`${API_BASE}/api/tasks`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: subtaskSpec.title,
                    description: subtaskSpec.description,
                    assigned_to: targetAgent.id,
                    created_by: 'subtask',
                    priority: task.priority || 'medium',
                    status: 'backlog'
                  })
                });
                const subtaskData = await subtaskRes.json();
                
                if (subtaskData.task) {
                  // Create subtask relationship
                  await fetch(`${API_BASE}/api/subtasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      parent_task_id: task.id,
                      child_task_id: subtaskData.task.id,
                      assigned_by: agent.id,
                      reasoning: subtaskSpec.reasoning
                    })
                  });
                  
                  console.log(`[Neo] 🤝 Assigned subtask to ${targetAgent.name}: ${subtaskSpec.title}`);
                  client.log(`Assigned subtask to ${targetAgent.name}: ${subtaskSpec.title}`, 'task');
                }
              }
            }
          } catch (collabErr) {
            console.error(`[Neo] Collaboration error:`, collabErr.message);
          }
        }
        
        try {
          const prompt = `${task.title}${task.description ? '\n\n' + task.description : ''}`;
          const result = await executeWithMinimax(prompt, client);
          
          // Check if task needs review/approval (explicit in description)
          const needsReview = task.description && 
            (task.description.toLowerCase().includes('approve') || 
             task.description.toLowerCase().includes('review'));
          
          // Auto-complete unless approval explicitly requested
          if (needsReview) {
            await client.updateTaskStatus(task.id, 'review', result);
            client.log(`Task completed - awaiting review`, 'task');
            console.log(`[${agent.name}] ✅ Task completed (review): ${task.title}`);
          } else {
            await client.updateTaskStatus(task.id, 'done', result);
            client.log(`Task completed - auto-approved`, 'task');
            console.log(`[${agent.name}] ✅ Task completed: ${task.title}`);
          }
          
          // Auto-save memory
          try {
            await client.saveMemory(
              `${agent.name} completed: ${task.title}. Result: ${result.substring(0, 200)}`,
              'conversation',
              `Task: ${task.title}`
            );
            console.log(`[${agent.name}] 💾 Memory saved`);
          } catch (memErr) {
            console.error(`[${agent.name}] Memory save error:`, memErr.message);
          }
          
          // Auto-save document if result is substantial (>100 words)
          try {
            const wordCount = result.trim().split(/\s+/).length;
            if (wordCount > 100) {
              await client.saveDocument(
                `${task.title} - Result`,
                result,
                'general',
                'markdown'
              );
              console.log(`[${agent.name}] 📄 Document saved (${wordCount} words)`);
            }
          } catch (docErr) {
            console.error(`[${agent.name}] Document save error:`, docErr.message);
          }
        } catch (execError) {
          const errorResult = `Error: ${execError.message}`;
          await client.updateTaskStatus(task.id, 'review', errorResult);
          client.log(`Task failed: ${execError.message}`, 'error');
          console.error(`[${agent.name}] ❌ Error: ${execError.message}`);
        }
        
        // Reset to idle
        activeAgents.set(agent.id, { ...agent, currentTask: null, status: 'idle' });
        await client.heartbeat('idle');
      }
    } catch (e) {
      console.error(`[${agent.name}] Loop error:`, e.message);
      client.log(`Error: ${e.message}`, 'error');
    }
  }, 60 * 1000);

  activeAgents.set(agent.id, {
    ...agent,
    heartbeatInterval,
    taskInterval,
    currentTask: null,
    status: 'online'
  });
  } catch (err) {
    console.error(`[${agent.name}] ❌ Agent loop failed to start:`, err.message);
  }
}

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

async function startAllAgents() {
  console.log('\n🚀 Starting AI Agent Command Centre - Agent Launcher\n');
  console.log(`📡 API Base: ${API_BASE}`);
  console.log(`🤖 Minimax: ${MINIMAX_GROUP_ID ? 'configured' : 'using default group'}`);
  console.log(`🔍 Tavily Search: ${TAVILY_API_KEY ? 'configured' : 'not configured'}\n`);
  
  // Wait for server to be ready
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
  
  for (const agent of agents) {
    try {
      await runAgentLoop(agent);
      console.log(`[${agent.name}] ✅ Agent loop started successfully`);
    } catch (err) {
      console.error(`[${agent.name}] ❌ Failed to start agent loop:`, err.message);
    }
    await new Promise(r => setTimeout(r, 500)); // Stagger startup
  }
  
  // Start cron job scheduler
  await startCronJobs(agents);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All agents running!');
  console.log('📋 Polling for tasks every 60 seconds');
  console.log('💓 Sending heartbeats every 5 minutes');
  console.log('⏰ Cron jobs scheduled');
  console.log('='.repeat(50) + '\n');
}

// Cron job scheduler
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
      
      // Schedule the cron job
      const scheduled = cron.schedule(job.cron_expression, async () => {
        console.log(`⏰ [CRON] Running: ${job.title} for ${agent.name}`);
        
        // Create a task for the agent
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
          
          // Update last_run in cron_jobs
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

startAllAgents().catch(console.error);

// Schedule checker - checks every 5 minutes for scheduled blocks
setInterval(async () => {
  try {
    const now = new Date();
    
    // Fetch today's scheduled blocks
    const res = await fetch(`${API_BASE}/api/schedules?type=today`);
    const data = await res.json();
    const blocks = data.blocks || [];
    
    for (const block of blocks) {
      if (block.status !== 'scheduled') continue;
      
      const blockTime = new Date(block.scheduled_at);
      const diffMinutes = (blockTime - now) / 1000 / 60;
      
      // If within 5 minutes window and scheduled
      if (diffMinutes <= 5 && diffMinutes >= -5) {
        const agent = activeAgents.get(block.agent_id);
        if (!agent) {
          console.log(`⚠️ Schedule trigger: Agent for block not found`);
          continue;
        }
        
        console.log(`⏰ Schedule triggered for ${agent.name}: ${block.title}`);
        
        // Mark as running
        await fetch(`${API_BASE}/api/schedules/${block.id}?type=block`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'running' })
        });
        
        // Create a task for the agent
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
        
        // Log to activity
        console.log(`✅ Schedule task created: ${block.title} for ${agent.name}`);
      }
    }
  } catch (err) {
    console.error('Schedule check error:', err.message);
  }
}, 5 * 60 * 1000);

// ========== Website Improvement Cycle ==========
// Runs every day at 10AM - Atlas audits, Neo approves, Orbit implements

const WEBSITE_CONTEXT = `
ONGOING PROJECT — PPVENTURES WEBSITE (https://ppventures.tech):
This is a HIGH PRIORITY ongoing project. Every day work on improving the website.
`;

async function callMinimax(agentName, prompt) {
  const agent = [...activeAgents.values()].find(a => a.name === agentName);
  if (!agent) {
    throw new Error(`Agent ${agentName} not found`);
  }
  
  const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.5',
      messages: [
        { role: 'system', content: `You are ${agentName}. ${agentName === 'Atlas' ? 'Research specialist - find improvements.' : agentName === 'Neo' ? 'Leadership - make decisions.' : 'Operations - implement changes.'} ${WEBSITE_CONTEXT}` },
        { role: 'user', content: prompt }
      ]
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function websiteImprovementCycle() {
  try {
    console.log('🌐 Starting website improvement cycle...');
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    
    const atlas = agents.find(a => a.name === 'Atlas');
    const neo = agents.find(a => a.name === 'Neo');
    const orbit = agents.find(a => a.name === 'Orbit');
    
    if (!atlas || !neo || !orbit) {
      console.log('⚠️ Missing agents for website improvement cycle');
      return;
    }
    
    // 1. Atlas audits the live website
    console.log('🔍 Atlas auditing ppventures.tech...');
    const auditPrompt = `
You are Atlas, research specialist.
Use your Tavily web search to fetch and analyse https://ppventures.tech right now.

Look for these specific improvement opportunities:
1. Weak or vague copy that could be more compelling
2. Missing sections that top AI agency websites have
3. SEO improvements — missing keywords, weak headings
4. Missing social proof — testimonials, case studies, stats
5. Unclear CTAs — where should visitors click next
6. Missing content — pages that are empty or thin

Then pick the SINGLE highest impact improvement you can make right now.
It must be something you can implement by editing a file.

Respond in JSON only (no other text):
{
  "improvement": "what needs to be improved",
  "why": "why this will have high impact",
  "file_to_edit": "which file needs changing (relative to website root)",
  "current_content": "what is there now (brief excerpt)",
  "new_content": "the exact replacement content",
  "implementation_notes": "any special instructions"
}
`;
    
    const atlasResult = await callMinimax('Atlas', auditPrompt);
    let atlasAudit;
    try {
      atlasAudit = JSON.parse(atlasResult);
    } catch (e) {
      console.log('⚠️ Atlas returned non-JSON, using partial parse');
      const match = atlasResult.match(/\{[\s\S]*\}/);
      if (match) atlasAudit = JSON.parse(match[0]);
      else {
        console.log('⚠️ Could not parse Atlas response:', atlasResult.slice(0, 200));
        return;
      }
    }
    
    console.log('📋 Atlas found:', atlasAudit.improvement);
    
    // 2. Neo reviews and approves
    console.log('👀 Neo reviewing...');
    const reviewPrompt = `
You are Neo, lead agent.
Atlas has suggested this website improvement:

Improvement: ${atlasAudit.improvement}
Why: ${atlasAudit.why}
File to edit: ${atlasAudit.file_to_edit}
New content: ${atlasAudit.new_content}

Review this suggestion. Is it:
1. Safe to implement (no risk of breaking the site)
2. A genuine improvement (not just change for change's sake)
3. Within scope (copy, content, structure — not core functionality)

Respond in JSON only:
{
  "approved": true or false,
  "reason": "why approved or rejected",
  "modified_content": "improved version of the content if you want to adjust it"
}
`;
    
    const neoResult = await callMinimax('Neo', reviewPrompt);
    let neoReview;
    try {
      neoReview = JSON.parse(neoResult);
    } catch (e) {
      const match = neoResult.match(/\{[\s\S]*\}/);
      if (match) neoReview = JSON.parse(match[0]);
      else {
        console.log('⚠️ Could not parse Neo response');
        return;
      }
    }
    
    if (!neoReview.approved) {
      console.log('⚠️ Neo rejected:', neoReview.reason);
      // Log rejection
      await fetch(`${API_BASE}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: neo.api_key, message: `⚠️ Neo rejected website change: ${neoReview.reason}`, log_type: 'info' })
      });
      return;
    }
    
    console.log('✅ Neo approved!');
    
    // 3. Orbit implements
    const finalContent = neoReview.modified_content || atlasAudit.new_content;
    console.log('✏️ Orbit implementing...');
    
    const implementRes = await fetch(`${API_BASE}/api/website/implement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: orbit.api_key,
        action: 'update_file',
        file_path: atlasAudit.file_to_edit,
        content: finalContent,
        description: atlasAudit.improvement,
        backup: true
      })
    });
    
    const result = await implementRes.json();
    
    if (result.success) {
      console.log('✅ Website improved:', atlasAudit.improvement);
      
      // Log success
      await fetch(`${API_BASE}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: orbit.api_key, 
          message: `✅ Website improved: ${atlasAudit.improvement}`, 
          log_type: 'task' 
        })
      });
      
      // Save as completed task
      await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Website improvement: ${atlasAudit.improvement}`,
          description: atlasAudit.why,
          assigned_to: orbit.id,
          status: 'done',
          priority: 'high',
          result: `Changed ${atlasAudit.file_to_edit}`
        })
      });
    } else {
      console.log('❌ Implementation failed:', result.error);
    }
    
  } catch (err) {
    console.error('🌐 Website improvement cycle error:', err.message);
  }
}

// Run at 10AM daily
cron.schedule('0 10 * * *', websiteImprovementCycle);

// Run once on startup (delayed by 30 seconds)
setTimeout(() => {
  console.log('⏳ Running initial website improvement cycle in 30s...');
  websiteImprovementCycle();
}, 30000);

// ========== End Website Improvement Cycle ==========

// Watchdog timer - logs every 10 minutes to confirm process is alive
setInterval(() => {
  console.log('✅ Agents alive - watchdog ' + new Date().toISOString());
}, 10 * 60 * 1000);

// ========== Autonomous Enhancement System ==========

// Safety Rules
const CC_ALLOWED_PATHS = ['app/', 'components/', 'styles/', 'lib/'];
const CC_FORBIDDEN_PATHS = [
  'start-agents.js', 'ecosystem.config.js',
  '.env', '.env.local', 'next.config.js', 'package.json'
];
const WEB_ALLOWED_PATHS = ['app/', 'components/', 'content/', 'posts/', 'public/'];
const WEB_FORBIDDEN_PATHS = ['.env', 'next.config.js', 'package.json'];
const MAX_CC_CHANGES_PER_DAY = 3;
const MAX_WEB_CHANGES_PER_DAY = 5;
let lastRestartTime = 0;
const MIN_RESTART_INTERVAL_MS = 60 * 60 * 1000;

// Track daily changes
let dailyChanges = {
  cc: 0,
  web: 0,
  lastReset: new Date().toDateString()
};

function resetDailyCounts() {
  const today = new Date().toDateString();
  if (dailyChanges.lastReset !== today) {
    dailyChanges = { cc: 0, web: 0, lastReset: today };
    console.log('🔄 Daily change counters reset');
  }
}

function canMakeChange(target) {
  resetDailyCounts();
  if (target === 'command_centre' && dailyChanges.cc >= MAX_CC_CHANGES_PER_DAY) {
    return { allowed: false, reason: 'Max CC changes reached' };
  }
  if (target === 'website' && dailyChanges.web >= MAX_WEB_CHANGES_PER_DAY) {
    return { allowed: false, reason: 'Max website changes reached' };
  }
  return { allowed: true };
}

function recordChange(target) {
  if (target === 'command_centre') dailyChanges.cc++;
  else if (target === 'website') dailyChanges.web++;
}

// Save scan results to file (for Neo to read later)
async function saveScanResults(scan) {
  const fs = require('fs');
  const path = require('path');
  const scanFile = path.join(__dirname, '.atlas-scan.json');
  fs.writeFileSync(scanFile, JSON.stringify({
    scan,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log('💾 Scan results saved');
}

// Get latest scan results
async function getLatestScanResults() {
  const fs = require('fs');
  const path = require('path');
  const scanFile = path.join(__dirname, '.atlas-scan.json');
  if (fs.existsSync(scanFile)) {
    const data = JSON.parse(fs.readFileSync(scanFile, 'utf8'));
    return data.scan;
  }
  return null;
}

// Helper: call Minimax
async function callMinimax(agentName, prompt) {
  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model: 'abab6.5s-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Detect task type
function detectTaskType(task) {
  const text = (task.title + ' ' + task.description).toLowerCase();
  if (text.includes('ppventures') || text.includes('website') || text.includes('blog') || text.includes('content')) {
    return 'website';
  }
  if (text.includes('command centre') || text.includes('dashboard') || text.includes('screen') || text.includes('ui')) {
    return 'command_centre';
  }
  return 'general';
}

// Step 1: Atlas Daily Scan (8AM)
async function atlasDailyScan() {
  try {
    console.log('🔍 Starting Atlas daily scan...');
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    
    const atlas = agents.find(a => a.name === 'Atlas');
    if (!atlas) {
      console.log('⚠️ Atlas not found');
      return;
    }

    const scanPrompt = `
You are Atlas. Your job today is to find the highest impact improvements
for two things we own:

1. OUR COMMAND CENTRE (running at http://72.62.231.18:3001)
Scan every screen and look for:
- Any screen that looks unfinished or inconsistent
- Any missing data, empty states, or broken layouts
- Any UX friction — too many clicks, confusing labels, missing feedback
- Any performance issues — slow loading, unnecessary re-renders
- Any missing quality of life features — copy buttons, timestamps, counts

2. OUR WEBSITE (https://ppventures.tech)
Use Tavily to fetch every page and look for:
- Weak or vague copy that could be stronger
- Missing sections competitors have
- Thin pages with not enough content
- Missing SEO keywords in headings and text
- Unclear or missing calls to action
- No blog posts or outdated content

Also search for:
- "best AI agent company websites 2026" — what are competitors doing better
- "AI agent services landing page best practices" — what converts best
- "top AI consulting website design 2026" — what looks most credible

Produce a list of the top 5 improvements ranked by impact.
Each improvement must be specific and implementable today.

Respond in JSON only:
{
  "scan_summary": "one sentence of what you found overall",
  "improvements": [
    {
      "rank": 1,
      "target": "command_centre or website",
      "area": "which screen or page",
      "issue": "what is wrong",
      "improvement": "exactly what to change",
      "implementation": "how to implement it — file to edit or content to write",
      "impact": "high or medium",
      "effort": "small or medium"
    }
  ]
}
`;

    const scanResult = await callMinimax('Atlas', scanPrompt);
    let scan;
    try {
      scan = JSON.parse(scanResult);
    } catch (e) {
      const match = scanResult.match(/\{[\s\S]*\}/);
      if (match) scan = JSON.parse(match[0]);
      else {
        console.log('⚠️ Could not parse Atlas scan:', scanResult.slice(0, 200));
        return;
      }
    }

    console.log('📋 Atlas scan complete:', scan.scan_summary);
    
    // Save scan results
    await saveScanResults(scan);
    
    // Log to Command Centre
    await fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        api_key: atlas.api_key, 
        message: `🔍 Atlas scan complete: ${scan.scan_summary}`, 
        log_type: 'info' 
      })
    });
    
    // Log each improvement
    for (const imp of scan.improvements) {
      await fetch(`${API_BASE}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: atlas.api_key, 
          message: `   #${imp.rank}: [${imp.target}] ${imp.improvement}`, 
          log_type: 'info' 
        })
      });
    }
    
  } catch (err) {
    console.error('🔴 Atlas scan error:', err.message);
  }
}

// Step 2: Neo Creates Tasks from Scan (9AM)
async function neoCreateTasks() {
  try {
    console.log('📋 Neo creating tasks from scan...');
    
    const scan = await getLatestScanResults();
    if (!scan) {
      console.log('⚠️ No scan results found');
      return;
    }
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    
    const neo = agents.find(a => a.name === 'Neo');
    const atlas = agents.find(a => a.name === 'Atlas');
    const orbit = agents.find(a => a.name === 'Orbit');
    
    if (!neo) {
      console.log('⚠️ Neo not found');
      return;
    }

    const planPrompt = `
You are Neo, lead agent.
Atlas completed a scan and found these improvements:
${JSON.stringify(scan.improvements, null, 2)}

Create specific actionable tasks from these findings.
Assign each task to the right agent:
- Atlas: research, copy writing, content creation, SEO
- Orbit: implementing UI changes, file edits, reporting
- Neo: complex changes, coordination, strategic copy

For website tasks — the task description must include
the EXACT new content or code to implement.
Agents must be able to execute without asking questions.

For Command Centre tasks — specify exactly which file
to edit and what change to make in under 20 lines.

Respond in JSON only:
{
  "tasks": [
    {
      "title": "specific task title",
      "description": "full implementation instructions with exact content",
      "assign_to": "Neo or Atlas or Orbit",
      "target": "command_centre or website",
      "file_path": "exact file to edit if known",
      "priority": "high or medium"
    }
  ]
}
`;

    const planResult = await callMinimax('Neo', planPrompt);
    let plan;
    try {
      plan = JSON.parse(planResult);
    } catch (e) {
      const match = planResult.match(/\{[\s\S]*\}/);
      if (match) plan = JSON.parse(match[0]);
      else {
        console.log('⚠️ Could not parse Neo plan:', planResult.slice(0, 200));
        return;
      }
    }

    // Create tasks in database
    for (const task of plan.tasks) {
      let agentId;
      if (task.assign_to === 'Atlas') agentId = atlas?.id;
      else if (task.assign_to === 'Orbit') agentId = orbit?.id;
      else agentId = neo.id;
      
      await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          assigned_to: agentId,
          status: 'backlog',
          priority: task.priority
        })
      });
      
      await fetch(`${API_BASE}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: neo.api_key, 
          message: `📋 Created task: "${task.title}" → ${task.assign_to}`, 
          log_type: 'task' 
        })
      });
    }
    
    console.log(`✅ Neo created ${plan.tasks.length} tasks`);
    
  } catch (err) {
    console.error('🔴 Neo task creation error:', err.message);
  }
}

// Step 3: Execute Enhancement Tasks (runs throughout day)
async function executeEnhancementTask(task, agent) {
  const taskType = detectTaskType(task);
  const canChange = canMakeChange(taskType);
  
  if (!canChange.allowed) {
    console.log(`⚠️ ${canChange.reason} for ${taskType}`);
    return { success: false, reason: canChange.reason };
  }

  try {
    if (taskType === 'command_centre') {
      // Execute CC change
      const taskDesc = task.description;
      // Parse file path and content from description
      const fileMatch = taskDesc.match(/file[:\s]+([^\n]+)/i);
      const contentMatch = taskDesc.match(/content[:\s]+([\s\S]+?)(?:\n\n|$)/i);
      
      if (fileMatch && contentMatch) {
        const filePath = fileMatch[1].trim();
        const newContent = contentMatch[1].trim();
        
        // Security check
        const isAllowed = CC_ALLOWED_PATHS.some(p => filePath.startsWith(p)) && 
          !CC_FORBIDDEN_PATHS.some(p => filePath.includes(p));
        
        if (!isAllowed) {
          return { success: false, reason: 'Path not allowed' };
        }
        
        // In production, we'd edit the file here
        console.log(`✏️ Would edit ${filePath} for Command Centre`);
        recordChange('command_centre');
        
        return { success: true, what: `Updated ${filePath}` };
      }
    } else if (taskType === 'website') {
      // Execute website change via API
      const implementRes = await fetch(`${API_BASE}/api/website/implement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: agent.api_key,
          action: 'update_file',
          description: task.title,
          backup: true
        })
      });
      
      const result = await implementRes.json();
      if (result.success) {
        recordChange('website');
      }
      return result;
    }
    
    return { success: false, reason: 'Could not parse task' };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

// Step 4: Orbit Evening Report (6PM)
async function orbitEveningReport() {
  try {
    console.log('📊 Generating evening report...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const tasksRes = await fetch(`${API_BASE}/api/tasks?status=done&date=${today}`);
    const tasksData = await tasksRes.json();
    const tasks = tasksData.tasks || [];
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    
    const orbit = agents.find(a => a.name === 'Orbit');
    const neo = agents.find(a => a.name === 'Neo');
    
    if (!orbit) {
      console.log('⚠️ Orbit not found');
      return;
    }

    const reportPrompt = `
You are Orbit. Write a concise evening enhancement report.

TASKS COMPLETED TODAY:
${tasks.map(t => `- [${t.assigned_agent?.name || 'Agent'}] ${t.title}`).join('\n') || 'None'}

Cover:
1. Command Centre improvements made today
2. Website improvements made today
3. Content published today
4. What was not completed and why
5. Priority focus for tomorrow

Keep it under 150 words. Be specific. List actual changes made.
Format as clean markdown.
`;

    const report = await callMinimax('Orbit', reportPrompt);
    
    // Save to docs
    await fetch(`${API_BASE}/api/docs/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: orbit.api_key,
        title: `Enhancement Report — ${today}`,
        content: report,
        format: 'markdown',
        category: 'report'
      })
    });
    
    await fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        api_key: orbit.api_key, 
        message: `📊 Evening report saved: Enhancement Report — ${today}`, 
        log_type: 'info' 
      })
    });
    
    // Also log to Neo
    if (neo) {
      await fetch(`${API_BASE}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: neo.api_key, 
          message: `📊 Evening report generated for ${today}`, 
          log_type: 'info' 
        })
      });
    }
    
    console.log('✅ Evening report saved');
    
  } catch (err) {
    console.error('🔴 Evening report error:', err.message);
  }
}

// ========== Revenue-Focused Daily Planning (Neo) ==========

async function neoRevenuePlanning() {
  try {
    console.log('💰 Neo running revenue-focused daily planning...');
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    
    const neo = agents.find(a => a.name === 'Neo');
    const atlas = agents.find(a => a.name === 'Atlas');
    const orbit = agents.find(a => a.name === 'Orbit');
    
    if (!neo) {
      console.log('⚠️ Neo not found');
      return;
    }

    const revenuePlanPrompt = `
  You are Neo, CEO of PPVentures. Mission: $1M revenue.

  TODAY'S PLANNING SESSION

  REVENUE LEVERS (focus here):
  - Website traffic and SEO for ppventures.tech
  - Lead generation and conversion
  - Content that builds authority and attracts clients
  - Service positioning and pricing clarity
  - Outreach opportunities and partnerships

  WHAT ATLAS SHOULD RESEARCH TODAY:
  Assign 2 research tasks that will directly inform revenue decisions.
  Examples:
  - "Research top 10 AI agent services clients are paying for in 2026"
  - "Find 5 companies actively hiring AI consultants who could be clients"
  - "Research what ppventures.tech competitors charge for agent development"
  - "Find the top 3 keywords driving traffic to AI agency websites"

  WHAT ORBIT SHOULD IMPLEMENT TODAY:
  Assign 2 implementation tasks based on yesterday's findings.
  Examples:
  - "Update ppventures.tech services page with specific pricing and packages"
  - "Write and publish a blog post targeting [keyword] to drive inbound leads"
  - "Update the AI Agents page to showcase our 3 agents as a service offering"

  WHAT NEO SHOULD DO TODAY:
  1 strategic task that only you can do.
  Examples:
  - "Write the outreach message template for cold contacting potential clients"
  - "Define PPVentures service packages and pricing for the website"
  - "Write a compelling case study from our Command Centre build"

  Respond in JSON only:
  {
    "tasks": [
      {
        "title": "task title",
        "description": "full implementation instructions",
        "assign_to": "Neo or Atlas or Orbit",
        "priority": "high or medium"
      }
    ]
  }
`;

    const planResult = await callMinimax('Neo', revenuePlanPrompt);
    let plan;
    try {
      plan = JSON.parse(planResult);
    } catch (e) {
      const match = planResult.match(/\{[\s\S]*\}/);
      if (match) plan = JSON.parse(match[0]);
      else {
        console.log('⚠️ Could not parse Neo revenue plan');
        return;
      }
    }

    // Create tasks
    for (const task of plan.tasks) {
      let agentId;
      if (task.assign_to === 'Atlas') agentId = atlas?.id;
      else if (task.assign_to === 'Orbit') agentId = orbit?.id;
      else agentId = neo.id;
      
      await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          assigned_to: agentId,
          status: 'backlog',
          priority: task.priority
        })
      });
    }
    
    console.log(`✅ Neo created ${plan.tasks.length} revenue-focused tasks`);
    
    await fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        api_key: neo.api_key, 
        message: `💰 Revenue planning complete: ${plan.tasks.length} tasks created`, 
        log_type: 'task' 
      })
    });
    
  } catch (err) {
    console.error('🔴 Revenue planning error:', err.message);
  }
}

// ========== Neo's Daily CEO Report to Deva (7PM) ==========

async function neoCEOReport() {
  try {
    console.log('📊 Neo generating CEO report...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's completed tasks
    const tasksRes = await fetch(`${API_BASE}/api/tasks?status=done&date=${today}`);
    const tasksData = await tasksRes.json();
    const tasks = tasksData.tasks || [];
    
    // Get agents
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    
    const neo = agents.find(a => a.name === 'Neo');
    const atlas = agents.find(a => a.name === 'Atlas');
    const orbit = agents.find(a => a.name === 'Orbit');
    
    if (!neo) {
      console.log('⚠️ Neo not found');
      return;
    }

    // Group tasks by agent
    const neoTasks = tasks.filter(t => t.assigned_to === neo.id).map(t => t.title).join('\n') || 'None';
    const atlasTasks = tasks.filter(t => t.assigned_to === atlas?.id).map(t => t.title).join('\n') || 'None';
    const orbitTasks = tasks.filter(t => t.assigned_to === orbit?.id).map(t => t.title).join('\n') || 'None';

    const ceoReportPrompt = `
    You are Neo, CEO of PPVentures. Write your daily report to Deva.

    NEO COMPLETED TODAY:
    ${neoTasks}

    ATLAS COMPLETED TODAY:
    ${atlasTasks}

    ORBIT COMPLETED TODAY:
    ${orbitTasks}

    Write a CEO-style daily report using this exact format:

    ---
    📈 PROGRESS TOWARD $1M
    [One sentence on how today moved us closer to $1M revenue]

    ✅ DONE TODAY
    [Bullet list — only the 3 most impactful things completed]

    🔍 INTELLIGENCE
    [1-2 key insights from Atlas's research that Deva should know]

    🚀 TOMORROW'S FOCUS
    [What Neo, Atlas and Orbit will each work on tomorrow]

    ⚠️ DECISIONS NEEDED
    [Any decisions only Deva can make — or NONE if nothing needed]
    ---

    Keep the entire report under 200 words.
    Be direct. CEO to founder. No fluff.
    `;

    const report = await callMinimax('Neo', ceoReportPrompt);
    
    // Save as document
    await fetch(`${API_BASE}/api/docs/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: neo.api_key,
        title: `Neo CEO Report — ${today}`,
        content: report,
        format: 'markdown',
        category: 'report'
      })
    });
    
    // Save as notification
    await fetch(`${API_BASE}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Neo's Daily Report — ${today}`,
        message: report,
        type: 'report'
      })
    });
    
    await fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        api_key: neo.api_key, 
        message: `📊 Neo sent daily CEO report to Deva`, 
        log_type: 'info' 
      })
    });
    
    console.log('✅ CEO report saved and notification sent');
    
  } catch (err) {
    console.error('🔴 CEO report error:', err.message);
  }
}

// Schedule Autonomous Enhancement Crons
// Atlas scan at 8AM daily
cron.schedule('0 8 * * *', atlasDailyScan);

// Neo creates tasks at 9AM daily
cron.schedule('0 9 * * *', neoCreateTasks);

// Neo revenue-focused planning at 7AM daily (before Atlas)
cron.schedule('0 7 * * *', neoRevenuePlanning);

// Orbit evening report at 6PM daily
cron.schedule('0 18 * * *', orbitEveningReport);

// Neo CEO report to Deva at 7PM daily
cron.schedule('0 19 * * *', neoCEOReport);

// Run initial scan on startup (delayed)
setTimeout(() => {
  console.log('⏳ Running initial Atlas scan in 60s...');
  atlasDailyScan();
  neoRevenuePlanning();
}, 60000);

console.log('✅ Autonomous Enhancement System loaded');
console.log('   - Neo revenue planning: 7AM daily');
console.log('   - Atlas scan: 8AM daily');
console.log('   - Neo tasks: 9AM daily');
console.log('   - Orbit report: 6PM daily');
console.log('   - Neo CEO report: 7PM daily');
