# Vercel Deployment Guide

## Quick Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link project
cd ppventures-next
vercel link

# 3. Add Environment Variables in Vercel Dashboard:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - CLERK_PUBLISHABLE_KEY (future)
# - CLERK_SECRET_KEY (future)

# 4. Deploy
vercel --prod
```

## Manual Setup (Alternative)

1. Go to https://vercel.com
2. Import GitHub repo or upload
3. Add environment variables
4. Deploy

## Environment Variables Required

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://xxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJxxx |
| NEXT_PUBLIC_APP_URL | https://ppventures.tech |

## Supabase Setup

Run these in Supabase SQL Editor:

1. `lib/supabase-schema.sql` - Core tables
2. `lib/supabase-wealth-schema.sql` - Wealth tracking

## Wealth Dashboard

Access: `/mission-control/wealth`

Protected by RLS - only your Founder ID can view.
