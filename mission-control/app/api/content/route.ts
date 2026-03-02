import { NextResponse } from 'next/server';

// Mock content data
const content = [
  {
    id: 'content-1',
    title: 'Post about AI Agents',
    description: 'Post about the rise of autonomous AI agents in 2026',
    stage: 'drafting',
    platform: 'linkedin',
    createdAt: '2026-02-21',
    scheduledAt: '',
    publishedAt: '',
    content: 'AI agents are transforming how we work...'
  },
  {
    id: 'content-2',
    title: 'PP Ventures Launch',
    description: 'Announce the launch of PP Ventures website',
    stage: 'scheduled',
    platform: 'twitter',
    createdAt: '2026-02-20',
    scheduledAt: '2026-02-22T10:00:00',
    publishedAt: '',
    content: '🚀 Excited to announce PP Ventures - Building the future of AI!'
  },
  {
    id: 'content-3',
    title: 'Mission Control Demo',
    description: 'Show off Mission Control capabilities',
    stage: 'idea',
    platform: '',
    createdAt: '2026-02-21',
    scheduledAt: '',
    publishedAt: '',
    content: ''
  }
];

export async function GET() {
  return NextResponse.json({
    content,
    total: content.length,
    byStage: {
      idea: content.filter(c => c.stage === 'idea').length,
      drafting: content.filter(c => c.stage === 'drafting').length,
      review: content.filter(c => c.stage === 'review').length,
      scheduled: content.filter(c => c.stage === 'scheduled').length,
      published: content.filter(c => c.stage === 'published').length
    },
    organization_id: '56b94071-3455-4967-9300-60788486a4fb'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newContent = {
      id: `content-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString().split('T')[0],
      stage: body.stage || 'idea'
    };
    content.push(newContent);
    return NextResponse.json({ success: true, content: newContent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
