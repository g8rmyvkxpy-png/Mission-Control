# MEMORY.md - Quick Reference (Keep Under 100 Lines)

## Core Facts
- **Deva:** Product Manager at Axis Bank, building autonomous company
- **Me:** Neo - AI assistant, proactive, autonomous
- **Mission:** Build 24/7 autonomous company, SaaS millions

## Command Centre (http://72.62.231.18:3001)
- Full productivity hub with Tasks, Content, Calendar, Team, Projects
- **Supabase:** https://iglfjgsqqknionzmmprj.supabase.co
- **PM2:** `pm2 list`, `pm2 restart all`

## Agent API Keys
- Neo: `agent_neo_sk_123` 
- Atlas: `agent_atlas_sk_456`
- Orbit: `agent_orbit_sk_789`

## Personalities
- **Neo:** Direct, decisive. "Let's get this done."
- **Atlas:** Analytical. "The data tells an interesting story."
- **Orbit:** Systematic. "Everything is accounted for."

## Technical
- OpenClaw workspace: `~/.openclaw/workspace/`
- Memory files: `memory/YYYY-MM-DD.md`
- OpenClaw config: `~/.openclaw/openclaw.json`

## Key Decisions
- Use Supabase for Command Centre database
- MiniMax-M2.5 as primary model
- Personality system wired into agent execution
- Memory flush configured for 40K token reserve
## Recent Key Decisions
- [2026-03-16] ### Email Automation Product Built
  - Built /email-automation landing page with pricing ($197/$297/$497)
  - Created /products page showing all products
  - Built n8n workflow in /n8n-workflows/
  - Created Supabase schema (needs API key to run)
  - Started n8n server at localhost:5678
  - Published blog post: "How to Automate Your Inbox"
  - Created sales pipeline in /marketing/sales-pipeline.md
  - Website live at localhost:8080
- [2026-03-14] ### Revenue & Task Priorities Implemented
  - Created REVENUE_SCHEMA.sql with revenue_entries, pipeline, milestones tables
  - Enhanced tasks table with priority_score (P0-P3) and due_date
  - Built /dashboard/revenue page with full CRUD UI
  - Enhanced KanbanBoard with priority badges and filters
  - Updated NewTaskModal with P0-P1-P2-P3 priority selector
  - Server running at localhost:3001
  - Pending: Supabase schema execution
- [2026-03-08] ### Zero Idle Agent System
- [2026-03-08] ### Agent Data Access Fix
- [2026-03-08] ### Fake Tool Call Fix
- [2026-03-08] ### Direct File Reading
- [2026-03-08] ### Action-Based Execution
- [2026-03-08] ### Product Discovery Mission Started
- [2026-03-07] ### PP Ventures Pricing Page Added
- [2026-03-04] ### PP Ventures Blog Enhancement
- [2026-03-04] ### Summary
- [2026-03-04] ### PP Ventures Blog Addition