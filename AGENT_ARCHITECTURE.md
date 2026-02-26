# Common Agent Architecture - Operational Framework

## Overview
This architecture defines the standard 4-Phase cycle for all sub-agents in Mission Control. Neo (the chief orchestrator) oversee all sub-agents following this framework.

## 4-Phase Execution Cycle

### Phase 1: Task Analysis (MiniMax Parser)
- **Purpose**: Validate and deconstruct tasks into structured components
- **Process**:
  1. Parse task title & description
  2. Extract: intent, actionType, keywords, entities, successCriteria
  3. Calculate confidence score (0-1)
  4. If confidence < 0.5 OR ambiguous → Trigger Neo Escalation
- **Output**: TaskAnalysis object with intent, confidence, successCriteria

### Phase 2: Discovery (Data Gathering)
- **Purpose**: Gather raw data based on Phase 1 blueprint
- **Process**:
  1. Use agent-specific tools (web search, file search, API calls)
  2. Gather RawData[] (leads, code, content, etc.)
  3. Use MiniMax to evaluate relevance against success criteria
  4. If insufficient results → Refine query → Retry (max 2 attempts)
  5. Consolidate validated data into RawData[]
- **Output**: DiscoveryResult with RawData[], refinedQuery, sufficiency flag

### Phase 3: Processing (Core Transformation)
- **Purpose**: Transform RawData into meaningful output
- **Process**:
  1. Apply agent-specific processing logic
  2. Use MiniMax to synthesize/analyze/transform
  3. Validate against success criteria
  4. If validation fails OR logic impasse → Trigger Neo Escalation
- **Output**: ProcessedResult with output, confidence, meetsCriteria[]

### Phase 4: Deliverables (Output Generation)
- **Purpose**: Generate final outputs and notify completion
- **Process**:
  1. Create agent-specific deliverable (Markdown report, CSV, code, etc.)
  2. Save to /public/deliverables/{agent}_{timestamp}.md
  3. Generate summary with metrics (itemsProcessed, confidence, criteriaMet)
  4. Signal SUCCESS: Complete status
- **Output**: Files saved, task marked as done

## Neo Escalation Trigger Conditions
- Task confidence < 0.5 (Phase 1)
- Task is ambiguous/unclear (Phase 1)
- Discovery yields no data (Phase 2)
- Processing validation fails (Phase 3)
- Any tool/API failure

## Frontend Status Mapping
| Status | Phase | Description |
|--------|-------|-------------|
| 📥 Inbox | - | pending - waiting to be picked up |
| 📋 Assigned | Phase 1 | Task Analysis - MiniMax validating |
| ⚡ In Progress | Phases 2-3 | Discovery + Processing |
| ⚠️ Review | Escalation | Neo needs human intervention |
| ✅ Done | Phase 4 | Deliverables saved - complete |

## Agent Teams
- **Sales**: Atlas (Lead Gen), Pulse (Prospecting), Hunter (Outreach), Phoenix (Conversion)
- **Research**: Scout (Analysis), Radar (SEO), Compass (Competitors), Trends (Market)
- **Retention**: Bond (Churn), Mend (Issues), Grow (Upsell)
- **Dev**: Byte (Full-Stack), Pixel (Frontend), Server (Backend), Auto (Automation)
- **Content**: Ink (Blog), Blaze (Social), Cinema (Video), Draft (Email)
- **Support**: Care (Tickets)

## Implementation Notes
- MiniMax M2.1 with Gemini fallback for all AI operations
- Task IDs: 3 letters + 6 numbers (e.g., ABC123456)
- All agents use same interface: analyze → discover → process → deliver
- Neo (agentId: 'neo') is excluded - acts as orchestrator
