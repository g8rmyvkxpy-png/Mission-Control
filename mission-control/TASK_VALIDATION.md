# Task Validation Process

## Before Moving Task to DONE

### 1. Define Deliverables Upfront
Every task MUST have explicit deliverables in the description:
```
Deliverables:
- [ ] Item 1
- [ ] Item 2
```

### 2. Validation Checklist
Before marking done, verify:

**For Website/UI Changes:**
- [ ] All pages load without 404 (test each route)
- [ ] Links work (navigation + cross-links)
- [ ] No broken images or assets
- [ ] Mobile responsive (test on small screen)
- [ ] HTTPS working (if applicable)

**For Features:**
- [ ] Feature works as described
- [ ] Tests written and passing
- [ ] Code committed to repo

**For Content:**
- [ ] Content published/live
- [ ] Links work

### 3. Validation Commands
```bash
# Test all routes return 200
curl -s -o /dev/null -w "%{http_code}" http://site.com/page

# Test HTTPS
curl -s -o /dev/null -w "%{http_code}" https://site.com/page

# Check for broken links (install linkchecker first)
linkchecker https://site.com
```

### 4. Never Accept
- ❌ Mockup-only changes (must be functional)
- ❌ Incomplete features
- ❌ Untested code
- ❌ Uncommitted code
- ❌ Tasks moved by subagents without verification

### 5. Escalation
If subagent (Byte) marks done without validation:
1. Revert task to "in_progress"
2. Run validation yourself
3. Report issue

---
**Rule:** If it's not validated by Neo, it's not done.
