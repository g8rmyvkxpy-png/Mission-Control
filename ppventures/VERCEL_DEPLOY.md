# Vercel Deployment Guide

## Quick Deploy

```bash
cd ppventures-next

# Login to Vercel
vercel login

# Link project (creates .vercel folder)
vercel link

# Add env vars (use your Supabase keys)
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://hizmosyxhwgighzxvbrj.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODUwNzEsImV4cCI6MjA4Nzc2MTA3MX0.nPlxv-9SIMTIdHq-FFqC1j_9l0ba2KDSax_l7NKpmt8

# Deploy
vercel --prod
```

## After Deploy

1. Test contact form at `/contact`
2. Check leads in Supabase dashboard
3. Run Lighthouse audit
