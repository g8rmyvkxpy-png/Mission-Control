import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const customersFilePath = join(process.cwd(), 'data', 'customers.json');
const leadsFilePath = join(process.cwd(), 'data', 'leads.json');

function getCustomers() {
  if (!existsSync(customersFilePath)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(customersFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

function getLeads() {
  if (!existsSync(leadsFilePath)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(leadsFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLeads(leads: any[]) {
  writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));
}

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';

async function tavilySearch(query: string) {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        max_results: 10,
        search_depth: 'advanced',
        include_answer: true,
        exclude_domains: ['linkedin.com', 'facebook.com', 'twitter.com', 'x.com']
      })
    });
    return await res.json();
  } catch (e) {
    return { results: [] };
  }
}

async function findLeadsForCustomer(industry: string, location: string, customerId: string) {
  const searches = await Promise.all([
    tavilySearch(`${industry} companies in ${location} contact email`),
    tavilySearch(`${industry} agency ${location} website`),
    tavilySearch(`${industry} consultant ${location} hire`)
  ]);

  const leads: any[] = [];
  const seen = new Set<string>();

  for (const search of searches) {
    if (!search.results) continue;
    for (const result of search.results) {
      if (!result.url || seen.has(result.url)) continue;
      seen.add(result.url);

      let companyName = 'Unknown Company';
      try {
        const urlObj = new URL(result.url);
        const domain = urlObj.hostname.replace('www.', '');
        companyName = result.title?.split(' - ')?.[0]?.split(' | ')?.[0]?.slice(0, 60) || domain;
      } catch {}

      leads.push({
        id: crypto.randomUUID(),
        customer_id: customerId,
        company_name: companyName,
        website: result.url,
        industry,
        location,
        why_good_fit: `${industry} business in ${location} likely needs automation`,
        contact_title: 'Founder / Owner',
        status: 'new',
        source: 'ai_lead_finder',
        found_at: new Date().toISOString()
      });

      if (leads.length >= 10) break;
    }
    if (leads.length >= 10) break;
  }

  return leads;
}

// POST — run lead finder for all active customers
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET || 'ppventures_cron_secret_2026';
  
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customers = getCustomers().filter((c: any) => c.status === 'active');
  const results = [];

  for (const customer of customers) {
    const config = customer.lead_finder_config || {};
    if (!config.industry || !config.location) {
      results.push({ customer: customer.email, status: 'skipped', reason: 'No config' });
      continue;
    }

    try {
      const leads = await findLeadsForCustomer(config.industry, config.location, customer.id);
      
      // Save leads
      const existingLeads = getLeads();
      saveLeads([...existingLeads, ...leads]);
      
      results.push({ customer: customer.email, leads_found: leads.length });
      console.log(`✅ Daily lead finder: ${customer.email} - ${leads.length} leads`);
    } catch (err: any) {
      results.push({ customer: customer.email, error: err.message });
    }
  }

  return NextResponse.json({ success: true, results });
}
