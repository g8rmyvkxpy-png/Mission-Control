import { NextRequest, NextResponse } from 'next/server';

// Demo leads data
const LEADS = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', company: 'TechCorp', status: 'qualified', source: 'Website', score: 85, createdAt: '2026-02-25' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@startup.io', company: 'StartupXYZ', status: 'contacted', source: 'LinkedIn', score: 72, createdAt: '2026-02-24' },
  { id: '3', name: 'Mike Chen', email: 'mike@enterprise.co', company: 'Enterprise Inc', status: 'new', source: 'Referral', score: 90, createdAt: '2026-02-28' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organization_id');

  // Return demo leads
  return NextResponse.json({
    leads: LEADS,
    total: LEADS.length,
    byStatus: {
      new: LEADS.filter(l => l.status === 'new').length,
      contacted: LEADS.filter(l => l.status === 'contacted').length,
      qualified: LEADS.filter(l => l.status === 'qualified').length,
      converted: 0,
    },
    organization_id: orgId || '56b94071-3455-4967-9300-60788486a4fb',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, source } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    // Create new lead (demo - would save to database)
    const newLead = {
      id: String(LEADS.length + 1),
      name,
      email,
      company: company || '',
      status: 'new',
      source: source || 'Manual',
      score: Math.floor(Math.random() * 30) + 50,
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
