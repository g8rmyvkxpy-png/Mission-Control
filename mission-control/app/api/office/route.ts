import { NextResponse } from 'next/server';

// Mock virtual office data
const rooms = [
  {
    id: 'room-1',
    name: 'Main Hall',
    description: 'Central hub for team collaboration',
    icon: '🏠',
    members: [
      { id: 'user-1', name: 'Deva', status: 'online', avatar: 'D' },
      { id: 'agent-1', name: 'Neo', status: 'online', avatar: '🦅' }
    ],
    lastActivity: '2026-03-02T09:30:00Z'
  },
  {
    id: 'room-2',
    name: 'War Room',
    description: 'Strategic planning and decisions',
    icon: '⚔️',
    members: [
      { id: 'user-1', name: 'Deva', status: 'away', avatar: 'D' }
    ],
    lastActivity: '2026-03-01T18:45:00Z'
  },
  {
    id: 'room-3',
    name: 'Content Studio',
    description: 'Content creation and review',
    icon: '🎨',
    members: [
      { id: 'agent-2', name: 'Content Bot', status: 'online', avatar: '📝' }
    ],
    lastActivity: '2026-03-02T08:15:00Z'
  },
  {
    id: 'room-4',
    name: 'Development',
    description: 'Building and coding space',
    icon: '💻',
    members: [],
    lastActivity: '2026-03-01T22:30:00Z'
  },
  {
    id: 'room-5',
    name: 'Lounge',
    description: 'Casual conversations and coffee',
    icon: '☕',
    members: [],
    lastActivity: '2026-02-28T16:20:00Z'
  }
];

export async function GET() {
  const onlineMembers = rooms.reduce((acc, room) => 
    acc + room.members.filter(m => m.status === 'online').length, 0
  );
  
  return NextResponse.json({
    rooms,
    total: rooms.length,
    onlineMembers,
    organization_id: '56b94071-3455-4967-9300-60788486a4fb'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRoom = {
      id: `room-${Date.now()}`,
      ...body,
      members: [],
      lastActivity: new Date().toISOString()
    };
    rooms.push(newRoom);
    return NextResponse.json({ success: true, room: newRoom });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
