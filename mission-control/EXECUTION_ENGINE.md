# Mission Control - Agent Execution Engine

## Phase 2: Making Agents Actually Work

### Current Problem
Agents only RESPOND to tasks with text. They don't actually MAKE CHANGES.

### Goal
Create an execution engine where agents can:
1. Analyze task requirements
2. Execute real actions (git, file edits, etc.)
3. Report progress in real-time
4. Show actual results/changes made

## Architecture

```
Task Created → Queue → Agent Worker → Execution → Results → Display
```

### Components

#### 1. Task Queue (Redis/SQLite)
- Tasks with status: pending → analyzing → in_progress → completed/failed
- Priority queue
- Agent assignment

#### 2. Agent Workers
- Background processes that pick up tasks
- Execute based on agent capabilities
- Report progress
- Commit results

#### 3. Execution Actions
- Git clone/pull
- File edits
- npm build/deploy
- Git commit/push

#### 4. Progress Tracking
- Real-time status updates
- Activity log
- Results with diffs

## Implementation

### Step 1: Task Queue System
- Add status field to track progress
- Create worker endpoint

### Step 2: Agent Capabilities
- Define what each agent CAN do
- Scout: Research (web search, API calls)
- Builder: Code (git operations, file edits)
- Ink: Content (write files)
- Blaze: Social (API integrations)

### Step 3: Execution Engine
- Worker process that runs continuously
- Picks pending tasks
- Executes based on agent type
- Updates status and results
