# Product Delivery Workflow

## Email Automation Suite - Delivery Process

### Step 1: Payment Received
- Customer buys via Stripe link
- Webhook triggers → adds to "customers" table
- Email sent to customer with onboarding form

### Step 2: Onboarding
Customer fills form with:
- Gmail/Outlook credentials
- What emails to automate
- Rules/categorization requirements

### Step 3: Setup (3-7 days)
- Connect their email to n8n
- Configure automation rules
- Test with real emails

### Step 4: Handover
- Walk customer through dashboard
- Provide documentation
- Set up support channel

---

## Payment Links (Stripe)

### Email Automation
- Starter (₹16,000): https://buy.stripe.com/xxx
- Professional (₹25,000): https://buy.stripe.com/xxx  
- Business (₹41,000): https://buy.stripe.com/xxx

### Report Automation
- Starter (₹12,000): https://buy.stripe.com/xxx
- Professional (₹20,000): https://buy.stripe.com/xxx
- Business (₹33,000): https://buy.stripe.com/xxx

---

## Customer Table Schema

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  company TEXT,
  product TEXT,
  plan TEXT,
  status TEXT DEFAULT 'pending_setup',
  paid_amount INTEGER,
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE automation_configs (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  email_provider TEXT,
  email_address TEXT,
  rules JSONB,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Next Steps

1. Create Stripe account
2. Generate payment links
3. Add to product pages
4. Create customer table in Supabase
5. Build delivery workflow
