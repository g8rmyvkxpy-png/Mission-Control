import { NextRequest, NextResponse } from 'next/server';

// Demo integrations data
const INTEGRATIONS = [
  { id: '1', name: 'Stripe', status: 'connected', icon: '💳' },
  { id: '2', name: 'Slack', status: 'available', icon: '💬' },
  { id: '3', name: 'GitHub', status: 'available', icon: '🐙' },
  { id: '4', name: 'Google Workspace', status: 'available', icon: '📧' },
  { id: '5', name: 'Zapier', status: 'available', icon: '⚡' },
  { id: '6', name: 'Notion', status: 'available', icon: '📝' },
];

export async function GET(request: NextRequest) {
  return NextResponse.json({ integrations: INTEGRATIONS });
}
