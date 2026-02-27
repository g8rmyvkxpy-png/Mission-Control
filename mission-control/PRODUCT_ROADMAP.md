# Mission Control - Product Roadmap
## Phase-wise Implementation Plan

---

## Phase 1: Foundation (Week 1-2)
### Goal: Multi-tenant architecture with authentication

### 1.1 Multi-Organization Support
```
Technical Implementation:
- Add organization tables
- Create organizations_id to all table
- Clerk org ID mapping to Supabase
- Middleware for org context
```

**Database Schema:**
```sql
-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add to existing tables
ALTER TABLE tasks ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE team ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE agent_activity ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

**Files to Modify:**
- `/app/api/` - Add org_id to all queries
- `/middleware.ts` - Extract org from Clerk
- `/lib/supabase.ts` - Org context

### 1.2 Organization Switcher UI
```
Components:
- OrgSwitcher component in Navbar
- Org settings page (/settings)
- Invite members (/settings/team)
```

### 1.3 Plan Management (Stripe)
```
- Create stripe customer on org creation
- Store stripe_customer_id in organizations
- Webhook handler for subscription events
```

---

## Phase 2: Agent System (Week 3-4)
### Goal: Deployable AI agents with task execution

### 2.1 Agent Definition Schema
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  avatar TEXT,
  color TEXT,
  status TEXT DEFAULT 'inactive',
  system_prompt TEXT,
  tools JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Agent Execution Engine
```
/api/agents/execute - POST
- Accepts: agent_id, task input
- Queues task to agent
- Returns task_id for polling

/api/agents/[id]/tasks - GET
- Returns task history for agent

/api/agents/[id]/execute - POST  
- Execute single task
- Returns result
```

### 2.3 Pre-built Agent Templates
```typescript
const agentTemplates = [
  {
    name: 'Sales Scout',
    role: 'Lead Researcher',
    system_prompt: 'You research prospects and find contact info...',
    tools: ['web_search', 'scrape']
  },
  {
    name: 'Content Writer', 
    role: 'Blog Author',
    system_prompt: 'Write SEO-optimized blog posts...',
    tools: ['write', 'publish']
  },
  {
    name: 'Support Agent',
    role: 'Customer Success',
    system_prompt: 'Handle customer inquiries professionally...',
    tools: ['email', 'chat']
  }
];
```

---

## Phase 3: Workflows (Week 5-6)
### Goal: Visual automation builder

### 3.1 Workflow Schema
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL,  // Array of {id, type, config}
  edges JSONB NOT NULL,  // Array of {from, to}
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  organization_id UUID REFERENCES organizations(id),
  status TEXT DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  logs JSONB DEFAULT '[]'
);
```

### 3.2 Workflow Engine
```
POST /api/workflows/[id]/execute
- Parse nodes/edges
- Execute each node
- Pass output to next node
- Return combined result

GET /api/workflows/[id]/runs - History
```

### 3.3 Visual Editor (React Flow)
```
/app/workflows/editor/page.tsx
- Drag and drop nodes
- Connect with edges
- Configure node properties
- Save/activate workflow
```

---

## Phase 4: Analytics (Week 7-8)
### Goal: Performance metrics and ROI tracking

### 4.1 Metrics Collection
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Events: task_completed, agent_active, workflow_run, etc.
```

### 4.2 Dashboard Queries
```sql
-- Tasks completed this month
SELECT COUNT(*) FROM agent_tasks 
WHERE organization_id = $1 
AND status = 'completed' 
AND completed_at > now() - interval '30 days';

-- Average task duration
SELECT AVG(completed_at - started_at) FROM agent_tasks
WHERE organization_id = $1 AND status = 'completed';

-- Cost calculation (based on agent compute time)
SELECT 
  a.name,
  COUNT(t.id) as tasks,
  SUM(EXTRACT(EPOCH FROM (t.completed_at - t.started_at))) as compute_seconds
FROM agents a
LEFT JOIN agent_tasks t ON t.agent_id = a.id
WHERE a.organization_id = $1
GROUP BY a.id;
```

### 4.3 ROI Calculator
```
/app/analytics/roi/page.tsx
- Input: Number of agents, hours saved
- Calculate: Monthly savings vs cost
- Show comparison table
```

---

## Phase 5: Integrations (Week 9-10)
### Goal: Connect to external services

### 5.1 Integration Schema
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL,  // slack, zapier, hubspot, etc.
  credentials JSONB,  // Encrypted
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id),
  direction TEXT,  // inbound, outbound
  payload JSONB,
  status TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Built-in Integrations
```
Slack:
- Post to channels on events
- Slash commands for agent control

Zapier:
- Webhook triggers
- Action webhooks

Calendar:
- Sync agent availability
- Schedule meetings
```

---

## Phase 6: Billing (Week 11-12)
### Goal: Stripe subscription management

### 6.1 Stripe Setup
```typescript
// Products in Stripe Dashboard:
- Starter ($49/mo): 5 agents, 1000 tasks
- Growth ($149/mo): 20 agents, 10000 tasks  
- Enterprise (Custom): Unlimited

// Metadata:
// - organizations: stripe_customer_id, subscription_id
// - agents: compute_seconds (for overage)
```

### 6.2 Usage Tracking
```sql
-- Check limits before creating
SELECT 
  (SELECT COUNT(*) FROM agents WHERE organization_id = $1) as agent_count,
  (SELECT COUNT(*) FROM agent_tasks WHERE organization_id = $1 
   AND created_at > date_trunc('month', NOW())) as task_count;

-- Alert if approaching limit
```

### 6.3 Billing Portal
```
/app/settings/billing/page.tsx
- Current plan display
- Usage meters
- Upgrade/downgrade buttons
- Invoice history
- Payment method update (Stripe Customer Portal link)
```

---

## Testing Checklist

### Phase 1 Tests:
- [ ] Create organization via Clerk
- [ ] Switch between organizations
- [ ] Data isolation verified
- [ ] Invite member works

### Phase 2 Tests:
- [ ] Deploy agent from template
- [ ] Assign task to agent
- [ ] Task completes with output
- [ ] Task history shows

### Phase 3 Tests:
- [ ] Create workflow with 2 nodes
- [ ] Execute workflow
- [ ] Output passes between nodes
- [ ] Workflow history

### Phase 4 Tests:
- [ ] Dashboard shows correct counts
- [ ] ROI calculator accurate
- [ ] Date range filters work

### Phase 5 Tests:
- [ ] Connect Slack webhook
- [ ] Receive event in Slack
- [ ] Zapier trigger fires

### Phase 6 Tests:
- [ ] Upgrade to Growth
- [ ] Usage tracked correctly
- [ ] Overage calculated
- [ ] Invoice generated

---

## File Structure

```
mission-control/
├── app/
│   ├── api/
│   │   ├── agents/
│   │   │   ├── route.ts          # List, create agents
│   │   │   ├── execute.ts        # Execute task
│   │   │   └── [id]/
│   │   │       └── route.ts       # Get agent, tasks
│   │   ├── workflows/
│   │   │   ├── route.ts          # List, create
│   │   │   ├── execute.ts        # Run workflow
│   │   │   └── [id]/route.ts     # Get, update
│   │   ├── analytics/
│   │   │   └── route.ts          # Metrics
│   │   ├── integrations/
│   │   │   └── route.ts          # CRUD integrations
│   │   ├── billing/
│   │   │   └── webhook.ts        # Stripe webhooks
│   │   └── organizations/
│   │       └── route.ts          # Org management
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── agents/
│   │   ├── page.tsx              # Agent list
│   │   ├── [id]/page.tsx         # Agent detail
│   │   └── deploy/page.tsx       # Deploy new
│   ├── workflows/
│   │   ├── page.tsx              # List
│   │   └── editor/page.tsx       # Visual editor
│   ├── analytics/
│   │   ├── page.tsx              # Overview
│   │   └── roi/page.tsx          # ROI calculator
│   ├── settings/
│   │   ├── page.tsx              # Org settings
│   │   ├── billing/page.tsx      # Subscription
│   │   └── team/page.tsx         # Members
│   └── components/
│       ├── AgentCard.tsx
│       ├── WorkflowBuilder.tsx
│       ├── OrgSwitcher.tsx
│       ├── UsageMeter.tsx
│       └── IntegrationCard.tsx
├── lib/
│   ├── supabase.ts               # Client with org context
│   ├── agents.ts                 # Agent execution logic
│   ├── workflows.ts              # Workflow engine
│   ├── stripe.ts                 # Billing
│   └── integrations.ts           # External services
└── config/
    └── agent-templates.ts        # Pre-built agents
```

---

## Quick Start Commands

```bash
# Run locally
npm run dev

# Deploy to staging
vercel --prod

# Check Supabase
supabase dashboard
```
