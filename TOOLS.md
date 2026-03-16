# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### APIs

- **Tavily Search API:** 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
- **OpenAI API Key:** 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

### Supabase

- **URL:** https://iglfjgsqqknionzmmprj.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjI1NjIsImV4cCI6MjA4ODE5ODU2Mn0.y6rfeWhG-ExBCiQarPXgvLqaDv6NBaA4MB9FbSbB_3w
- **Service Role:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYyMjU2MiwiZXhwIjoyMDg4MTk4NTYyfQ.PnJsNMApnfKxGNE_bIiWapEpinVp1xkIXlORGV7pf7A

### Domains

- **ppventures.tech** - Main venture website (needs deployment)

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

### Projects

- **Mission Control:** http://72.62.231.18:3000 - Main dashboard with tasks, activity, and all projects
- **PP Ventures:** http://72.62.231.18:8080 - Venture website

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

<!-- antfarm:workflows -->
# Antfarm Workflows

Antfarm CLI (always use full path to avoid PATH issues):
`node ~/.openclaw/workspace/antfarm/dist/cli/cli.js`

Commands:
- Install: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js workflow install <name>`
- Run: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js workflow run <workflow-id> "<task>"`
- Status: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js workflow status "<task title>"`
- Logs: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js logs`

Workflows are self-advancing via per-agent cron jobs. No manual orchestration needed.
<!-- /antfarm:workflows -->
