# Next.js Migration Plan - PPVentures

## Phase 1: Current State
- Static HTML site (10 pages)
- No backend, no database, no auth
- Simple CSS styling

## Phase 2: Discovery - Tech Stack Selection

### Authentication Options
| Provider | Pros | Cons | Best For |
|---------|------|------|----------|
| **Clerk** | Full-featured, React-native, Easy UI | Paid for teams | Fast MVP |
| **NextAuth** (Auth.js) | Free, Open source, Flexible | More setup | Budget-conscious |
| **Supabase Auth** | Free tier, Built-in with DB | Vendor lock-in | Already using Supabase |

**Recommendation:** **Clerk** for MVP speed, migrate to NextAuth if cost becomes issue.

### Database Options
| Provider | Pros | Cons | Best For |
|---------|------|------|----------|
| **Supabase** | Free tier, PostgreSQL, Built-in Auth | Vendor lock-in | Full-stack MVP |
| **Prisma + PostgreSQL** | Type-safe, Flexible | More setup | Developer experience |
| **Turso (LibSQL)** | Free tier, Edge-ready | Newer, less docs | Serverless |

**Recommendation:** **Supabase** - Free tier is generous, auth+DB in one, perfect for MVP.

### Hosting
- **Vercel** - Best for Next.js, free tier excellent
- **Netlify** - Alternative, good free tier

---

## Phase 3: Architecture

### Target Stack
```
┌─────────────────────────────────────────┐
│           Next.js 14 (App Router)        │
├─────────────────────────────────────────┤
│  UI: React Components + Tailwind CSS    │
├─────────────────────────────────────────┤
│  Auth: Clerk (or NextAuth)              │
├─────────────────────────────────────────┤
│  DB: Supabase (PostgreSQL)              │
├─────────────────────────────────────────┤
│  Deployment: Vercel                      │
└─────────────────────────────────────────┘
```

### Agent Integration with Backend
```
┌──────────────────────────────────────────┐
│         Mission Control (Neo + Agents)    │
├──────────────────────────────────────────┤
│  21 Sub-agents → API Routes → Supabase  │
│                                                  │
│  • Byte (Dev)     → /api/dev              │
│  • Radar (SEO)    → /api/seo             │
│  • Ink (Content)   → /api/content         │
│  • Atlas (Sales)   → /api/leads           │
│  • Bond (Support)  → /api/tickets         │
│  ...                                        │
└──────────────────────────────────────────┘
```

### Agent Database Schema
```sql
-- Core tables for agent operations
agents (id, name, role, group, status, created_at)
tasks (id, title, description, assigned_to, status, priority, result, created_at)
leads (id, name, email, company, status, source, created_at)
content (id, title, body, status, author, published_at)
tickets (id, subject, status, priority, customer_id, assigned_to)
```

---

## Phase 4: Migration Steps

### Week 1: Foundation
- [ ] Initialize Next.js project
- [ ] Set up Clerk authentication
- [ ] Configure Supabase + connect schema

### Week 2: Core Features
- [ ] Build agent dashboard UI
- [ ] Create API routes for each agent group
- [ ] Implement task management

### Week 3: Agent Integration
- [ ] Connect agents to API routes
- [ ] Build workflow automation
- [ ] Add real-time updates (Supabase Realtime)

### Week 4: Launch Prep
- [ ] SEO migration (redirects from static pages)
- [ ] Performance optimization
- [ ] Deploy to Vercel

---

## Cost Estimation (MVP)
| Service | Free Tier | Paid (MVP) |
|---------|-----------|-------------|
| Vercel | ✅ Unlimited | $20/mo (pro) |
| Clerk | ✅ 25K/mo | $25/mo (team) |
| Supabase | ✅ 500MB | $25/mo (pro) |
| **Total** | **$0** | **~$70/mo** |

---

## Success Metrics
- 100 paying customers = $70K MRR (at $99/mo avg)
- Target: $1M ARR = ~10,000 customers or higher tier
