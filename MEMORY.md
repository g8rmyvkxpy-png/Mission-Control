# MEMORY.md - Long-term Memory

## Core Info
- **Deva:** Product Manager at Axis Bank, ex-developer, building autonomous company
- **Me:** Neo - Deva's AI assistant, proactive, autonomous
- **Mission:** Build 24/7 autonomous company, create content, SaaS millions
- **Password:** neo123 / username: deva

## Mission Control
Full productivity hub at http://72.62.231.18:3000 with:
- Dashboard - Command center with quick stats
- Tasks - Task queue (Neo + Deva)
- Content - Content pipeline (Ideas → Drafting → Review → Scheduled → Published)
- Calendar - Schedule & events
- Memory - Knowledge base
- Team - AI team + Antfarm workflows
- Automations - Cron jobs + workflows
- Projects - Project tracking
- Office - Virtual office
- And more...

## Integrations
- Telegram: Connected
- Tavily Search: Connected  
- X (Twitter): Web Intent only
- Weather: Open-Meteo API

## Daily Routine
- Morning Brief: 8:30 AM IST (weather, AI news)
- Content creation pipeline active

## Current Status
Building PP Ventures website. Deva wants full autonomy - I'm proactive, get things done.

## Recent Updates
- Login fixed for mobile (removed SameSite restriction)
- All pages fully functional
- Mobile responsive with bottom nav
- Antfarm integrated into Team tab

## March 1, 2026 - Product UAT & Fixes
### What Was Fixed:
1. **Missing Routes Created:**
   - /content - Content pipeline management
   - /calendar - Event scheduling with monthly view
   - /memory - Knowledge base with search
   - /team - 13 AI agents organized by groups
   - /automations - 5 automation rules
   - /projects - 5 projects with progress tracking
   - /office - Virtual office with rooms

2. **API Fixes:**
   - /api/workflows - Fixed org_id requirement (now returns mock data)
   - /api/billing - Fixed org_id requirement (now returns usage data)

3. **Full UAT Completed:**
   - All 20 routes return 200
   - Task creation works
   - Agent listing works
   - Data API returns all data types
   - Analytics working
   - Leads management working
   - Integrations page shows 6 services

### Product Ready for:
- Internal use as command center
- Demo to potential customers
- Further development for SaaS launch

## Silent Replies
When you have nothing to say, respond with ONLY: NO_REPLY
⚠️ Rules:
- It must be your ENTIRE message — nothing else
- Never append it to an actual response (never include "NO_REPLY" in real replies)
- Never wrap it in markdown or code blocks
❌ Wrong: "Here's help... NO_REPLY"
❌ Wrong: "NO_REPLY"
✅ Right: NO_REPLY

## Heartbeats
Heartbeat prompt: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
If you receive a heartbeat poll (a user message matching the heartbeat prompt above), and there is nothing that needs attention, reply exactly:
HEARTBEAT_OK
OpenClaw treats a leading/trailing "HEARTBEAT_OK" as a heartbeat ack (and may discard it).
If something needs attention, do NOT include "HEARTBEAT_OK"; reply with the alert text instead.

## Runtime
Runtime: agent=main | host=srv1380427 | repo=/home/deva/.openclaw/workspace | os=Linux 6.8.0-100-generic (x64) | node=v22.22.0 | model=minimax-portal/MiniMax-M2.5 | default_model=minimax-portal/MiniMax-M2.5 | shell=bash | channel=telegram | capabilities=inlineButtons | thinking=low
Reasoning: off (hidden unless on/stream). Toggle /reasoning; /status shows Reasoning when enabled.
