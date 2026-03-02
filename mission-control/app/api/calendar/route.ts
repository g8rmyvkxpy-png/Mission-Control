import { NextResponse } from 'next/server';

// Mock calendar events data
const events = [
  {
    id: 'event-1',
    title: 'Team Standup',
    date: '2026-03-02',
    time: '09:00',
    type: 'meeting',
    description: 'Daily team sync'
  },
  {
    id: 'event-2',
    title: 'Product Review',
    date: '2026-03-02',
    time: '14:00',
    type: 'meeting',
    description: 'Review new features'
  },
  {
    id: 'event-3',
    title: 'Content Deadline',
    date: '2026-03-05',
    time: '18:00',
    type: 'deadline',
    description: 'Submit weekly newsletter'
  },
  {
    id: 'event-4',
    title: 'AI News Briefing',
    date: '2026-03-03',
    time: '08:30',
    type: 'reminder',
    description: 'Daily AI news summary'
  },
  {
    id: 'event-5',
    title: 'Sprint Planning',
    date: '2026-03-06',
    time: '10:00',
    type: 'meeting',
    description: 'Plan next sprint tasks'
  }
];

export async function GET() {
  return NextResponse.json({
    events,
    total: events.length,
    byType: {
      meeting: events.filter(e => e.type === 'meeting').length,
      deadline: events.filter(e => e.type === 'deadline').length,
      reminder: events.filter(e => e.type === 'reminder').length,
      task: events.filter(e => e.type === 'task').length
    },
    organization_id: '56b94071-3455-4967-9300-60788486a4fb'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEvent = {
      id: `event-${Date.now()}`,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0]
    };
    events.push(newEvent);
    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
