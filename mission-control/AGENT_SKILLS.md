# Mission Control Agent Skills Configuration

## Skill to Agent Mappings

Based on the installed skills and agent specialties:

### Research Team
| Agent | Specialty | Skills Assigned |
|-------|-----------|----------------|
| **Scout** | Analysis | `deep-research-pro`, `agent-browser` |
| **Radar** | SEO | `agent-browser`, `deep-research-pro` |
| **Trends** | Market Trends | `deep-research-pro` |
| **Compass** | Monitoring | `agent-browser` |

### Sales Team
| Agent | Specialty | Skills Assigned |
|-------|-----------|----------------|
| **Hunter** | Cold Outreach | `email-send` |
| **Phoenix** | Conversion | `email-send` |
| **Atlas** | Lead Generation | `email-send`, `deep-research-pro` |
| **Pulse** | Prospecting | `deep-research-pro` |

### Content Team
| Agent | Specialty | Skills Assigned |
|-------|-----------|----------------|
| **Draft** | Email Campaigns | `email-send` |
| **Ink** | Blog Writing | `deep-research-pro` |
| **Blaze** | Social Media | `agent-browser` |

### Dev Team
| Agent | Specialty | Skills Assigned |
|-------|-----------|----------------|
| **Byte** | Project Management | `codex-orchestrator` |
| **Pixel** | Frontend | `agent-browser`, `codex-orchestrator` |
| **Auto** | Automation | `codex-orchestrator` |
| **Server** | Backend | `codex-orchestrator` |

## Available Skills

### Installed
- `agent-browser` - Headless browser automation (web scraping, testing, form filling)
- `deep-research-pro` - Multi-source deep research (web search, analysis)
- `codex-orchestrator` - Coordinate multiple AI workers for parallel execution
- `email-send` - Send emails via SMTP

### Ready to Install
- `gh-issues` - GitHub issue management + auto-fix
- `notion` - Notion integration for notes/databases
- `obsidian` - Obsidian vault management
- `gog` - Google Workspace (Gmail, Calendar, Drive)

## Usage

Agents will automatically use these skills based on:
1. Task type matching (research → deep-research-pro)
2. Agent specialty alignment
3. Tool requirements (browser → agent-browser)

Skills are loaded from `~/.openclaw/workspace/skills/` and registered in the OpenClaw workspace.
