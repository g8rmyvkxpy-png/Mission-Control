# Email Automation Suite - Setup Guide

## Prerequisites

1. **n8n** - Run with: `n8n start`
2. **Supabase** - For CRM storage
3. **Gmail Account** - With App Password or OAuth

---

## Step 1: Set up Supabase

1. Go to your Supabase project
2. Open SQL Editor
3. Run the contents of `schema.sql`

This creates:
- `leads` - Store incoming leads
- `email_tracking` - Track email opens/clicks
- `followup_sequences` - Automated follow-ups
- `digest_settings` - Daily digest preferences

---

## Step 2: Configure n8n Credentials

### Gmail OAuth2
1. In n8n, go to Credentials
2. Add "Gmail OAuth2"
3. Create OAuth app in Google Cloud Console
4. Connect your Gmail account

### Supabase
1. Add "Supabase" credential
2. Enter your Supabase:
   - URL: `https://your-project.supabase.co`
   - Key: Your anon/public key

---

## Step 3: Import Workflow

1. Open n8n (http://localhost:5678)
2. Click "Import from File"
3. Select `email-automation.json`
4. Update credentials in each node
5. Activate workflow

---

## Step 4: Configure Daily Digest

Set up a user in `digest_settings`:
```sql
INSERT INTO digest_settings (user_id, notify_email) 
VALUES ('user_123', 'your@email.com');
```

---

## Workflow Features

| Feature | Description |
|---------|-------------|
| Watch Inbox | Monitors Gmail for new emails |
| Categorize | Separates leads from other emails |
| Auto-Reply | Sends instant responses |
| CRM Sync | Saves to Supabase |
| Follow-up | Sends follow-up after 3 days |
| Daily Digest | Morning summary report |

---

## Pricing Tiers

| Tier | Emails/mo | Rules | Auto-responses |
|------|-----------|-------|----------------|
| Starter | 500 | 3 | 1 |
| Professional | Unlimited | 10 | 5 |
| Business | Unlimited | Unlimited | Unlimited |

---

## Support

Questions? Contact: support@ppventures.tech
