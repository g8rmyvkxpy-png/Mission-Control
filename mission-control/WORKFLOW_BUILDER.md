# Real Workflows - Visual Workflow Builder

## Overview
Build a visual workflow builder where users can create automated processes by connecting nodes on a canvas.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Workflow Builder UI                           │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │   Node      │  │          Canvas                          │   │
│  │   Palette   │  │    ┌─────┐      ┌─────┐               │   │
│  │             │  │    │Trigger├──────►│Action│              │   │
│  │ [Trigger]   │  │    └─────┘      └─────┘               │   │
│  │ [Action]    │  │         │            │                  │   │
│  │ [Condition] │  │         ▼            ▼                  │   │
│  │ [Agent]     │  │    ┌─────┐      ┌─────┐               │   │
│  │             │  │    │Condition├────►│Action│              │   │
│  └─────────────┘  │    └─────┘      └─────┘               │   │
│                   └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Workflow Engine                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   Trigger    │──►│   Executor   │──►│   Result     │       │
│  │   (schedule) │   │   (nodes)    │   │   (output)  │       │
│  └──────────────┘   └──────────────┘   └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Node Types

### 1. Trigger Nodes (Start)
- **Schedule** - Cron-based (daily, weekly, etc.)
- **Webhook** - HTTP endpoint trigger
- **Event** - When something happens (new lead, task complete)

### 2. Action Nodes (Do)
- **Send Email** - Send via SMTP/API
- **Create Task** - Add task to queue
- **Run Agent** - Execute an AI agent
- **HTTP Request** - Call external API
- **Update Record** - Modify database

### 3. Logic Nodes (Control)
- **Condition** - If/else branching
- **Delay** - Wait X minutes
- **Loop** - Repeat N times

### 4. Agent Nodes
- **Sales Scout** - Find leads
- **Content Writer** - Generate content
- **Research Agent** - Gather info

## Data Model

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

interface Node {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'agent';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

## Implementation Plan

### Phase 1: Canvas UI (This Session)
- [ ] Drag-and-drop canvas with React Flow
- [ ] Node palette sidebar
- [ ] Node configuration panel
- [ ] Save/load workflows

### Phase 2: Workflow Engine
- [ ] Execute workflow from trigger
- [ ] Node execution engine
- [ ] Pass data between nodes

### Phase 3: Triggers & Actions
- [ ] Schedule trigger (cron)
- [ ] Webhook trigger
- [ ] Common actions (email, task, API)

## UI Components

1. **Canvas** - React Flow for visual editing
2. **Sidebar** - Draggable node types
3. **Config Panel** - Edit selected node
4. **Toolbar** - Save, run, test buttons

## Tech Stack
- React Flow (canvas)
- Zustand (state)
- Supabase (persist workflows)
