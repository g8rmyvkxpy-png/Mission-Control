---
title: "Meet Neo, Atlas and Orbit — The 3 AI Agents Running Our Business"
date: "2026-03-08"
excerpt: "Honest introduction to our 3 agents, what they actually do, how they're built, and real examples of tasks they've completed."
tags: ["ai-agents"]
category: "ai-agents"
---

# Meet Neo, Atlas and Orbit — The 3 AI Agents Running Our Business

We don't have 21 agents. We have 3. Here's what each one actually does.

## Neo — Lead Agent

**Role:** Primary autonomous agent
**Tech:** Minimax M2.5, Node.js, Supabase, Playwright RPA

Neo is the workhorse. When something needs doing, Neo picks it up.

### What Neo Does

- **Task execution** — Picks up tasks from the Command Centre and executes them
- **Lead generation** — Finds and qualifies leads based on client niches
- **Outreach writing** — Writes personalized messages for every lead
- **Document Q&A** — Answers questions from client documents using RAG
- **Real-time logging** — Every action gets recorded

### Real Example

Last week, I told Neo: "Find 10 SaaS companies in India with >50 employees."

In 23 minutes, Neo:
1. Scraped LinkedIn for companies matching criteria
2. Validated each company website
3. Found decision-maker emails
4. Created a structured lead list
5. Wrote personalized outreach for each

Result: 10 qualified leads, ready to contact.

---

## Atlas — Research Agent

**Role:** Research and analysis
**Tech:** Minimax M2.5, Node.js, Supabase

Atlas thinks. While Neo does, Atlas researches.

### What Atlas Does

- **Deep research** — Topic deep-dives when we need to understand something
- **Competitor analysis** — Monitors competitor websites, pricing, features
- **Industry news** — Scrapes and summarizes relevant news every morning
- **Data analysis** — Makes sense of datasets
- **Document summarization** — Long docs → short summaries

### Real Example

I asked Atlas: "What's every competitor in the AI automation space charging for lead generation services?"

Atlas:
1. Visited 15 competitor websites
2. Extracted pricing pages
3. Organized into comparison table
4. Flagged pricing patterns

Done in 45 minutes. Would have taken me half a day.

---

## Orbit — Operations Agent

**Role:** Operations and monitoring
**Tech:** Minimax M2.5, Node.js, Supabase

Orbit keeps things running. It's the glue.

### What Orbit Does

- **Scheduling** — Runs tasks on cron schedules
- **Monitoring** — Checks system health, agent status
- **Reporting** — Generates daily performance summaries
- **Alerting** — Flags issues before they become problems

### Real Example

Every morning at 8 AM, Orbit:
1. Checks all agent activity from past 24 hours
2. Compiles task completion stats
3. Generates a daily report
4. Sends to my inbox

I wake up, read the report, know exactly what happened.

---

## How They Work Together

Here's a real workflow:

1. **Orbit** runs scheduled check → "Competitor X updated pricing"
2. **Orbit** creates task in Command Centre
3. **Neo** picks up task → researches the change
4. **Atlas** analyzes impact → "Should we adjust our pricing?"
5. **Orbit** adds analysis to daily report
6. I wake up → informed decision

All autonomous. All coordinated.

---

## The Numbers

- **3 agents** (not 21)
- **24/7 operation** since late 2025
- **500+ tasks** completed
- **0 sick days**

---

## What We Learned

1. **Fewer is better** — 3 working agents > 21 fake ones
2. **Specialization wins** — Each agent has a clear role
3. **Visibility matters** — Without Command Centre, we'd be lost

---

*Want these agents working for your business?* [Start free trial →](/automation)
