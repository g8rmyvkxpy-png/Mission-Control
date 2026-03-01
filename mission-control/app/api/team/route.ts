import { NextRequest, NextResponse } from 'next/server';

// Demo team members
const TEAM = [
  { id: '1', name: 'Deva', email: 'deva@example.com', role: 'Owner', avatar: 'D', status: 'active' },
];

export async function GET(request: NextRequest) {
  return NextResponse.json({ team: TEAM });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, role } = body;
  
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
  }

  const newMember = {
    id: String(TEAM.length + 1),
    name,
    email,
    role: role || 'Member',
    avatar: name[0].toUpperCase(),
    status: 'active',
  };

  return NextResponse.json({ success: true, member: newMember });
}
