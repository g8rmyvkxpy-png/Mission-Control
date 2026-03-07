/**
 * Agent Execution Engine
 * 
 * Full execution loop for each agent:
 * - Polls for backlog tasks every 60 seconds
 * - Executes tasks using Minimax API
 * - Logs every step to activity feed (with personality)
 * - Sends heartbeat every 5 minutes
 * - Wires personality into system prompts
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;

// In-memory store for running agents
const activeAgents = new Map();

/**
 * Fetch agent personality profile from Supabase
 */
async function fetchAgentProfile(agentId) {
  try {
    const res = await fetch(`${API_BASE}/api/agents/${agentId}/personality`);
    const data = await res.json();
    return data.personality || null;
  } catch (e) {
    console.error(`[Agent ${agentId}] Failed to fetch personality:`, e.message);
    return null;
  }
}

/**
 * Create a configured fetch client for the agent
 */
function createAgentClient(apiKey, agentName = 'Agent') {
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
    }
  };
}

/**
 * Get personality-based activity log message
 */
function getActivityLogMessage(agentName, personality, action, data = {}) {
  const personalityLower = (personality?.personality || '').toLowerCase();
  
  // Neo - Leadership/coordination personality
  if (agentName.toLowerCase() === 'neo') {
    switch (action) {
      case 'start_task':
        return `Taking command of: ${data.task}`;
      case 'delegate':
        return `Delegating to ${data.target}: ${data.task}`;
      case 'complete':
        return `Mission complete. Let's get this done.`;
      case 'error':
        return `Hit a snag: ${data.error}. Adjusting approach.`;
      default:
        return `${data.message || action}`;
    }
  }
  
  // Atlas - Research/analysis personality
  if (agentName.toLowerCase() === 'atlas') {
    switch (action) {
      case 'start_task':
        return `Initiating deep research on: ${data.task}`;
      case 'finding':
        return `The data tells an interesting story — ${data.finding}`;
      case 'complete':
        return `Research complete. Sources verified.`;
      case 'error':
        return `Anomalies detected: ${data.error}. Re-calculating.`;
      default:
        return `${data.message || action}`;
    }
  }
  
  // Orbit - Operations/monitoring personality
  if (agentName.toLowerCase() === 'orbit') {
    switch (action) {
      case 'start_task':
        return `Tracking task: ${data.task}`;
      case 'progress':
        return `Everything is accounted for — ${data.summary}`;
      case 'complete':
        return `Operation complete. All systems nominal.`;
      case 'error':
        return `Gap detected: ${data.error}. Logging for follow-up.`;
      default:
        return `${data.message || action}`;
    }
  }
  
  // Default messages for unknown agents
  return `${agentName}: ${data.message || action}`;
}

/**
 * Execute a task using Minimax API with personality
 */
async function executeWithMinimax(prompt, agent) {
  if (!MINIMAX_API_KEY || MINIMAX_API_KEY === 'your-minimax-api-key') {
    throw new Error('MINIMAX_API_KEY not configured');
  }

  // Build system prompt with personality
  const p = agent.personality || {};
  
  // PPVenture website project context
  const websiteContext = `
  
---
ONGOING PROJECT — PPVENTURES WEBSITE (https://ppventures.tech):
This is a HIGH PRIORITY ongoing project. When working on website tasks:
- Write blog posts about AI agents, autonomous companies, or PPVentures' work
- Research competitors and benchmark positioning
- Write improved copy for specific pages
- Find SEO keywords and write optimised content
- Research case studies and success stories for social proof
- Write detailed descriptions of AI agent services
Always save website-related documents with category: blog or website.`;

  const systemPrompt = `You are ${agent.name}, an autonomous AI agent.

YOUR PERSONALITY:
${p.personality || 'Helpful and professional.'}

YOUR TONE:
${p.tone || 'Clear and concise.'}

YOUR SPECIALISATION:
${p.specialisation || 'General assistance'}

YOUR WORKING STYLE:
${p.working_style || 'Thorough and reliable.'}

YOUR CATCHPHRASE: "${p.catchphrase || ''}"

YOUR BACKSTORY:
${p.backstory || 'An AI agent in the Command Centre.'}

${agent.name === 'Atlas' || agent.name === 'Neo' ? websiteContext : ''}

CORE RULES:
- Always respond in your unique tone and voice
- Always use your specialisation when approaching tasks
- Always follow your working style
- You have Tavily web search — use it for any research tasks
- Never say you cannot do something — find a way
- Sign off responses with your catchphrase occasionally
- Use structured formatting appropriate to your role
- Stay in character as ${agent.name}`;

  const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      group_id: MINIMAX_GROUP_ID || undefined
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Minimax API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Extract the response content
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  
  return JSON.stringify(data);
}

/**
 * Main execution loop for a single agent
 */
async function runAgentLoop(agent) {
  const client = createAgentClient(agent.api_key, agent.name);
  
  // Fetch agent personality
  const personality = await fetchAgentProfile(agent.id);
  const agentWithPersonality = { ...agent, personality };
  
  console.log(`[${agent.name}] Starting execution loop...`);
  await client.log(getActivityLogMessage(agent.name, personality, 'start', { message: `Agent started - waiting for tasks` }), 'info');

  // Heartbeat every 5 minutes
  const heartbeatInterval = setInterval(async () => {
    try {
      const status = activeAgents.get(agent.id)?.currentTask || 'idle';
      await client.heartbeat(status);
      console.log(`[${agent.name}] Heartbeat sent`);
    } catch (e) {
      console.error(`[${agent.name}] Heartbeat error:`, e.message);
    }
  }, 5 * 60 * 1000);

  // Task polling every 60 seconds
  const taskInterval = setInterval(async () => {
    try {
      // Check for backlog tasks
      const tasks = await client.getBacklogTasks(agent.id);
      
      if (tasks.length > 0) {
        const task = tasks[0]; // Pick first task
        
        console.log(`[${agent.name}] Found task: ${task.title}`);
        await client.log(getActivityLogMessage(agent.name, personality, 'start_task', { task: task.title }), 'task');
        
        // Update status to in-progress
        await client.updateTaskStatus(task.id, 'in-progress');
        
        // Update in-memory status
        activeAgents.set(agent.id, { 
          ...agentWithPersonality, 
          currentTask: task.title,
          status: 'online' 
        });
        
        // Send heartbeat with current task
        await client.heartbeat(task.title);
        
        // Execute the task
        await client.log(getActivityLogMessage(agent.name, personality, 'start', { message: `Executing: ${task.description || task.title}` }), 'task');
        
        try {
          const prompt = `${task.title}${task.description ? '\n\n' + task.description : ''}`;
          const result = await executeWithMinimax(prompt, agentWithPersonality);
          
          // Check if task needs review/approval (explicit in description)
          const needsReview = task.description && 
            (task.description.toLowerCase().includes('approve') || 
             task.description.toLowerCase().includes('review'));
          
          // Auto-complete unless approval explicitly requested
          if (needsReview) {
            await client.updateTaskStatus(task.id, 'review', result);
            await client.log(getActivityLogMessage(agent.name, personality, 'complete', { message: 'Task completed - awaiting review' }), 'task');
          } else {
            await client.updateTaskStatus(task.id, 'done', result);
            await client.log(getActivityLogMessage(agent.name, personality, 'complete', { message: 'Task completed - auto-approved' }), 'task');
          }
          
          console.log(`[${agent.name}] Task completed: ${task.title}`);
        } catch (execError) {
          // On execution error, save error message and move to review
          const errorResult = `Error: ${execError.message}`;
          await client.updateTaskStatus(task.id, 'review', errorResult);
          await client.log(getActivityLogMessage(agent.name, personality, 'error', { error: execError.message }), 'error');
        }
        
        // Reset status to idle
        activeAgents.set(agent.id, { ...agentWithPersonality, currentTask: null, status: 'idle' });
        await client.heartbeat('idle');
      }
    } catch (e) {
      console.error(`[${agent.name}] Loop error:`, e.message);
      await client.log(getActivityLogMessage(agent.name, personality, 'error', { error: e.message }), 'error');
    }
  }, 60 * 1000); // Poll every 60 seconds

  // Store interval IDs for cleanup
  activeAgents.set(agent.id, {
    ...agentWithPersonality,
    heartbeatInterval,
    taskInterval,
    currentTask: null,
    status: 'online'
  });
}

/**
 * Start all agents from the Command Centre
 */
async function startAllAgents() {
  console.log('Fetching agents from Command Centre...');
  
  const res = await fetch(`${API_BASE}/api/agents`);
  const data = await res.json();
  const agents = data.agents || [];
  
  if (agents.length === 0) {
    console.log('No agents found in database!');
    return;
  }
  
  console.log(`Found ${agents.length} agents: ${agents.map(a => a.name).join(', ')}`);
  
  // Start each agent in parallel
  for (const agent of agents) {
    runAgentLoop(agent);
  }
  
  console.log('\n✅ All agents started!');
  console.log('Tasks will be polled every 60 seconds.');
  console.log('Heartbeats sent every 5 minutes.');
  console.log('\nPress Ctrl+C to stop.\n');
}

// Export for use
module.exports = { startAllAgents, runAgentLoop, createAgentClient, fetchAgentProfile };

// Run if executed directly
if (require.main === module) {
  startAllAgents().catch(console.error);
}
