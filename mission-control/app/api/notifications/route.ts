import { NextRequest, NextResponse } from 'next/server';

// Demo notifications data
const NOTIFICATIONS = [
  { id: '1', title: 'Task Completed', message: 'Research AI trends finished', time: '5 min ago', type: 'success', read: false },
  { id: '2', title: 'New Lead', message: 'Mike Chen submitted a form', time: '1 hour ago', type: 'info', read: false },
  { id: '3', title: 'Agent Deployed', message: 'Sales Scout is now active', time: '2 hours ago', type: 'success', read: true },
  { id: '4', title: 'Usage Alert', message: 'You\'ve used 12% of monthly tasks', time: '3 hours ago', type: 'warning', read: true },
];

export async function GET(request: NextRequest) {
  const unread = NOTIFICATIONS.filter(n => !n.read).length;
  return NextResponse.json({ 
    notifications: NOTIFICATIONS,
    unread,
    total: NOTIFICATIONS.length 
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, id } = body;
  
  if (action === 'markRead') {
    return NextResponse.json({ success: true });
  }
  
  if (action === 'markAllRead') {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
