import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const leadsFilePath = join(process.cwd(), 'data', 'leads.json');
const customersFilePath = join(process.cwd(), 'data', 'customers.json');

function ensureDataDir() {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    const fs = require('fs');
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getLeads() {
  ensureDataDir();
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
  ensureDataDir();
  writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));
}

function getCustomers() {
  ensureDataDir();
  if (!existsSync(customersFilePath)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(customersFilePath, 'utf-8'));
  } catch {
    return [];
  }
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
        include_domains: [],
        exclude_domains: ['linkedin.com', 'facebook.com', 'twitter.com', 'x.com']
      })
    });
    return await res.json();
  } catch (e) {
    console.error('Tavily search error:', e);
    return { results: [], answer: '' };
  }
}

async function findLeadsWithAI(industry: string, location: string, customerId: string) {
  console.log(`🔍 Searching for ${industry} in ${location}...`);
  
  // Run multiple targeted searches
  const searches = await Promise.all([
    tavilySearch(`${industry} companies in ${location} contact email`),
    tavilySearch(`${industry} agency ${location} website`),
    tavilySearch(`${industry} consultant ${location} hire`),
    tavilySearch(`best ${industry} firms ${location} 2026`)
  ]);

  // Extract leads from search results
  const leads: any[] = [];
  const seen = new Set<string>();

  for (const search of searches) {
    if (!search.results) continue;
    for (const result of search.results) {
      if (!result.url || seen.has(result.url)) continue;
      seen.add(result.url);

      // Extract company info from search result
      let domain = '';
      let companyName = '';
      try {
        const urlObj = new URL(result.url);
        domain = urlObj.hostname.replace('www.', '');
        companyName = result.title?.split(' - ')?.[0]
          ?.split(' | ')?.[0]
          ?.slice(0, 60) || domain;
      } catch {
        companyName = result.title?.slice(0, 60) || 'Unknown Company';
        domain = result.url;
      }

      // Build lead object
      const lead = {
        id: crypto.randomUUID(),
        customer_id: customerId,
        company_name: companyName,
        website: result.url,
        industry,
        location,
        why_good_fit: `${industry} business in ${location} likely needs automation to save time and get more clients`,
        contact_title: 'Founder / Owner',
        status: 'new',
        source: 'ai_lead_finder',
        found_at: new Date().toISOString()
      };
      leads.push(lead);

      if (leads.length >= 10) break;
    }
    if (leads.length >= 10) break;
  }

  // Save leads to file
  const existingLeads = getLeads();
  const allLeads = [...existingLeads, ...leads];
  saveLeads(allLeads);

  console.log(`✅ Found ${leads.length} leads for customer ${customerId}`);
  return leads;
}

// GET — fetch leads for a customer
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customer_id');
  if (!customerId) {
    // Return all leads if no customer_id
    const leads = getLeads();
    return NextResponse.json({ leads });
  }

  const allLeads = getLeads();
  const customerLeads = allLeads
    .filter((l: any) => l.customer_id === customerId)
    .sort((a: any, b: any) => new Date(b.found_at).getTime() - new Date(a.found_at).getTime())
    .slice(0, 50);

  return NextResponse.json({ leads: customerLeads });
}

// POST — run the lead finder now
export async function POST(req: NextRequest) {
  try {
    const { customer_id, industry, location } = await req.json();
    if (!customer_id || !industry || !location) {
      return NextResponse.json(
        { error: 'customer_id, industry and location required' },
        { status: 400 }
      );
    }

    const leads = await findLeadsWithAI(industry, location, customer_id);

    return NextResponse.json({
      success: true,
      leads_found: leads.length,
      leads
    });
  } catch (err: any) {
    console.error('Lead finder error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update lead status
export async function PATCH(req: NextRequest) {
  const { lead_id, status } = await req.json();
  
  const allLeads = getLeads();
  const leadIndex = allLeads.findIndex((l: any) => l.id === lead_id);
  
  if (leadIndex === -1) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  
  allLeads[leadIndex].status = status;
  saveLeads(allLeads);
  
  return NextResponse.json({ lead: allLeads[leadIndex] });
}
