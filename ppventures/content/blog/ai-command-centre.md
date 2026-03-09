---
title: "Building an AI Command Centre: From Concept to Production"
date: "2026-03-09"
excerpt: "How we built a real-time dashboard to monitor and orchestrate 21 AI agents running in production. Tech stack, challenges, and lessons learned."
tags: ["Engineering", "AI Agents", "Technical", "Open Source"]
---

# Building an AI Command Centre: From Concept to Production

When you have 21 AI agents running 24/7, you need a way to see what they're doing. Here's how we built our Command Centre—from zero to production in 3 weeks.

## The Problem

We had agents for:
- Research
- Content creation
- Outreach
- Sales
- Support
- Analytics

But no unified way to see:
- Which agents were running
- What tasks they were working on
- How much they were costing
- What errors were occurring

**We were flying blind.**

## The Solution: Mission Control

We built a real-time dashboard that gives us complete visibility into our autonomous operations.

### Features

| Feature | Description |
|---------|-------------|
| Agent Status | Live health monitoring for all 21 agents |
| Task Queue | See what each agent is working on |
| Cost Tracking | Real-time API spend per agent |
| Error Logging | Instant alerts when something breaks |
| Performance Metrics | Success rates, latency, throughput |
| Manual Controls | Start/stop/restart agents from UI |

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                   Frontend                          │
│  Next.js 14 + React + Tailwind CSS                 │
│  Real-time updates via Server-Sent Events          │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   Backend                            │
│  Node.js + Express                                 │
│  WebSocket for real-time communication              │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│               Agent Orchestration                   │
│  Custom agent scheduler                            │
│  SQLite for task persistence                       │
│  Redis for caching                                 │
└─────────────────────────────────────────────────────┘
```

### Why This Stack?

- **Next.js**: Fast dev velocity, great DX
- **SSE over WebSocket**: Simpler for one-way updates
- **SQLite**: No infrastructure, perfect for our scale
- **Custom scheduler**: More control than off-the-shelf

## Architecture

### The Agent Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  IDLE    │───▶│ FETCHING │───▶│ EXECUTING │───▶│ COMPLETE │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     ▲                                              │
     └──────────────────────────────────────────────┘
                    (on new task)
```

1. **Idle**: Agent waiting for work
2. **Fetching**: Pulling task from queue
3. **Executing**: Running the agent
4. **Complete**: Reporting results

### Data Flow

```
User Action
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│  API Layer  │────▶│   SQLite    │
│  (Next.js)  │◀────│  (Express)  │◀────│  (Tasks)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │   Agents    │
       │            │  (Workers)  │
       │            └─────────────┘
       ▼
┌─────────────┐
│  Dashboard │
│  (Live UI) │
└─────────────┘
```

## Key Implementation Details

### 1. Real-time Updates

We used Server-Sent Events (SSE) instead of WebSockets:

```typescript
// Simple SSE endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  
  const interval = setInterval(() => {
    const agents = getAgentStatus();
    res.write(`data: ${JSON.stringify(agents)}\n\n`);
  }, 1000);
  
  req.on('close', () => clearInterval(interval));
});
```

**Why SSE?** 
- Simpler than WebSockets
- Works over HTTP (no WS upgrade issues)
- Perfect for one-way data flow

### 2. Agent Task Queue

```typescript
interface Task {
  id: string;
  agentId: string;
  type: 'research' | 'content' | 'outreach' | 'sales';
  priority: number;
  payload: any;
  status: 'pending' | 'running' | 'complete' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}
```

### 3. Cost Tracking

Every agent call gets logged:

```typescript
async function trackCost(agentId: string, tokens: number, model: string) {
  const costPer1k = modelCosts[model];
  const cost = (tokens / 1000) * costPer1k;
  
  await db.agentCosts.create({
    agentId,
    tokens,
    cost,
    timestamp: new Date()
  });
}
```

### 4. Error Handling

Critical errors trigger instant alerts:

```typescript
agent.on('error', async (error) => {
  await notifySlack({
    channel: '#alerts',
    message: `🚨 Agent ${agentId} failed: ${error.message}`
  });
  
  await db.errors.create({
    agentId,
    error: error.message,
    stack: error.stack,
    timestamp: new Date()
  });
});
```

## Challenges We Faced

### Challenge 1: Race Conditions

Multiple agents trying to fetch the same task:

```typescript
// Problem: Two agents grab same task
const task = await db.tasks.findOne({ status: 'pending' });
await db.tasks.update(task.id, { status: 'running' });
```

**Solution:** Database-level locking:

```typescript
// Atomic update with status check
const task = await db.tasks.findOneAndUpdate(
  { status: 'pending' },
  { status: 'running', agentId },
  { returnNewDocument: true }
);
```

### Challenge 2: Agent Memory

Agents losing context between tasks:

**Solution:** Centralized context storage:

```typescript
const agentMemory = new Map<string, AgentContext>();

function getContext(agentId: string): AgentContext {
  if (!agentMemory.has(agentId)) {
    agentMemory.set(agentId, loadFromDb(agentId));
  }
  return agentMemory.get(agentId);
}
```

### Challenge 3: Rate Limiting

Too many parallel agent runs:

**Solution:** Token bucket algorithm:

```typescript
const bucket = {
  capacity: 10,
  tokens: 10,
  refillRate: 2 // per second
};

async function acquireToken(): Promise<boolean> {
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }
  return false;
}
```

## Results

After 3 weeks of development:

| Metric | Before | After |
|--------|--------|-------|
| Agent visibility | 0% | 100% |
| Mean time to detect errors | 4 hours | 30 seconds |
| Manual intervention needed | 20x/day | 2x/day |
| Agent utilization | ~60% | ~85% |

### Cost

- **Development time**: 3 weeks
- **Infrastructure**: $50/month (VPS)
- **Total investment**: ~$2,000 (one-time)

## What We'd Do Different

### ❌ Mistakes We Made

1. **Started with WebSocket**
   - Overengineered for our needs
   - Switched to SSE in week 2

2. **No logging initially**
   - Debugging was painful
   - Added structured logging in week 1

3. **Monolithic first**
   - Should have split agents into microservices from start

### ✅ What Worked Well

1. **SQLite for everything**
   - No database运维 needed
   - Perfect for our scale

2. **SSE for updates**
   - Simple, reliable, HTTP-compatible

3. **UI-first development**
   - Built the dashboard first, then connected agents

## Future Plans

- [ ] Agent-to-agent communication visualization
- [ ] Predictive cost forecasting
- [ ] Automatic agent scaling
- [ ] Mobile app for alerts

## Get the Code

Want to build your own Command Centre?

**We're open-sourcing it.**

Sign up for early access at [ppventures.tech/mission-control](/mission-control)

---

*Questions about the architecture?* [Let's chat →](/contact)
