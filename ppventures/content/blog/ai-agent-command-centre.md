---
title: "Building an AI Agent Command Centre: From Vision to Reality"
date: "2026-03-05"
excerpt: "How we built a real-time dashboard to manage, monitor, and orchestrate AI agents for 24/7 autonomous operations."
tags: ["Engineering", "AI Agents", "Tutorial", "Open Source"]
---

# Building an AI Agent Command Centre: From Vision to Reality

When you're running a company that never sleeps, you need a way to see what's happening. That's why we built the AI Agent Command Centre—a real-time dashboard for managing autonomous agents.

## The Problem

Traditional monitoring tools weren't built for AI agents. We needed something that could:

- Track agent heartbeats in real-time
- Manage tasks across multiple agents
- Schedule recurring jobs
- Provide a "single pane of glass" for the entire operation

So we built it ourselves.

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Agents    │────▶│  Supabase   │◀────│  Command    │
│  (OpenClaw) │     │  (Backend)  │     │   Centre    │
└─────────────┘     └─────────────┘     └─────────────┘
     │                   │                   │
     │   Heartbeat       │   Realtime        │   Dashboard
     └──────────────────▶│◀──────────────────┘
```

### Tech Stack

- **Frontend:** Next.js 14 with React
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime subscriptions

## Key Features

### 1. Real-Time Agent Monitoring

Each agent sends a heartbeat every few minutes. The Command Centre tracks:

- Online/offline status
- Last seen timestamp
- Task throughput

```javascript
// Agent heartbeat endpoint
app.post('/api/heartbeat', async (req, res) => {
  const { agentId, status, tasksCompleted } = req.body;
  
  await supabase
    .from('agents')
    .upsert({ 
      id: agentId, 
      last_heartbeat: new Date(),
      status,
      tasks_completed: tasksCompleted 
    });
    
  res.json({ success: true });
});
```

### 2. Kanban Task Board

Tasks flow through columns: **Backlog → In Progress → Review → Done**

- Drag and drop interface
- Real-time updates across all connected clients
- Agent assignment with load balancing

### 3. Cron Scheduling

Schedule recurring tasks for agents:

```javascript
// Create a cron job
POST /api/crons
{
  "agentId": "neo",
  "schedule": "0 9 * * *",  // Daily at 9 AM
  "task": {
    "title": "Morning research sweep",
    "description": "Scan industry news and summarize"
  }
}
```

### 4. Activity Logging

Every action gets logged:

- Task created/completed
- Agent heartbeats
- Errors and warnings

## The Agent Integration

Adding a new agent is simple:

```javascript
import { initAgent, log, getTasks, updateTaskStatus } from './agentClient';

initAgent({
  name: 'Neo',
  apiKey: 'agent_neo_sk_xxx',
  color: '#10b981',
  onTask: async (task) => {
    log(`Processing: ${task.title}`);
    // Do work...
    await updateTaskStatus(task.id, 'review');
  }
});
```

## Mobile-First Design

The Command Centre works on phones too:

- PWA installable
- Bottom tab navigation
- Push notifications for:
  - Task completion
  - Agent offline alerts
  - Review requests

## What's Next

We're just getting started. Upcoming features:

- **Multi-team support** - Separate workspaces
- **Analytics dashboard** - Performance metrics
- **Cost tracking** - Per-agent spend
- **Agent marketplace** - Pre-built agents

## Try It Yourself

The Command Centre is open source. Set it up in minutes:

1. Create a Supabase project
2. Run the schema SQL
3. Configure environment variables
4. Start the dev server

```bash
git clone https://github.com/ppventures/command-centre
cd command-centre
cp .env.local.example .env.local
# Add your Supabase credentials
npm install
npm run dev
```

## The Bigger Picture

The Command Centre isn't just a dashboard—it's the nerve center of our autonomous company. It lets us:

- See what's happening at a glance
- Intervene when needed
- Let agents do their thing when they don't

This is what 24/7 operations looks like.

---

*Want to build your own Command Centre?* [Let's talk →](/contact)

*Or meet the agents that run our company:* [AI Agents →](/ai-agents)
