import { NextResponse } from 'next/server';

// Mock automation rules data
const automations = [
  {
    id: 'auto-1',
    name: 'Morning Briefing',
    description: 'Send daily AI news summary at 8:30 AM',
    trigger: 'schedule',
    schedule: '0 8 * * *',
    action: 'send_message',
    status: 'active',
    lastRun: '2026-03-02T08:30:00Z',
    runCount: 28
  },
  {
    id: 'auto-2',
    name: 'New Lead Notification',
    description: 'Notify when new lead is added',
    trigger: 'event',
    event: 'lead.created',
    action: 'send_notification',
    status: 'active',
    lastRun: '2026-03-01T14:22:00Z',
    runCount: 15
  },
  {
    id: 'auto-3',
    name: 'Task Completion Alert',
    description: 'Alert when AI agent completes a task',
    trigger: 'event',
    event: 'task.completed',
    action: 'send_message',
    status: 'active',
    lastRun: '2026-03-01T16:45:00Z',
    runCount: 42
  },
  {
    id: 'auto-4',
    name: 'Weekly Content Publish',
    description: 'Publish scheduled content automatically',
    trigger: 'schedule',
    schedule: '0 18 * * 5',
    action: 'publish_content',
    status: 'paused',
    lastRun: '2026-02-28T18:00:00Z',
    runCount: 8
  },
  {
    id: 'auto-5',
    name: 'Usage Warning',
    description: 'Alert when usage exceeds 80% of limit',
    trigger: 'threshold',
    metric: 'tasks',
    threshold: 80,
    action: 'send_notification',
    status: 'active',
    lastRun: null,
    runCount: 0
  }
];

export async function GET() {
  return NextResponse.json({
    automations,
    total: automations.length,
    byStatus: {
      active: automations.filter(a => a.status === 'active').length,
      paused: automations.filter(a => a.status === 'paused').length
    },
    organization_id: '56b94071-3455-4967-9300-60788486a4fb'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAuto = {
      id: `auto-${Date.now()}`,
      ...body,
      status: body.status || 'active',
      lastRun: null,
      runCount: 0
    };
    automations.push(newAuto);
    return NextResponse.json({ success: true, automation: newAuto });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 });
  }
}
