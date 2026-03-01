import { NextRequest, NextResponse } from 'next/server';

// Demo contacts data
const CONTACTS = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', company: 'TechCorp', phone: '+1 555-0101', role: 'CTO', lastContact: '2026-02-25' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@startup.io', company: 'StartupXYZ', phone: '+1 555-0102', role: 'CEO', lastContact: '2026-02-24' },
  { id: '3', name: 'Mike Chen', email: 'mike@enterprise.co', company: 'Enterprise Inc', phone: '+1 555-0103', role: 'VP Engineering', lastContact: '2026-02-28' },
  { id: '4', name: 'Emily Davis', email: 'emily@growth.com', company: 'Growth Labs', phone: '+1 555-0104', role: 'Product Lead', lastContact: '2026-02-20' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organization_id');

  return NextResponse.json({
    contacts: CONTACTS,
    total: CONTACTS.length,
    organization_id: orgId || '56b94071-3455-4967-9300-60788486a4fb',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    const newContact = {
      id: String(CONTACTS.length + 1),
      name,
      email,
      company: company || '',
      phone: phone || '',
      role: role || '',
      lastContact: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({ success: true, contact: newContact });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
