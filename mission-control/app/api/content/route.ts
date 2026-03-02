import { NextResponse } from 'next/server';

// PP Ventures Blog Content Pipeline
const content = [
  {
    id: 'content-1',
    title: 'How AI Agents Are Replacing Traditional SaaS',
    description: 'Analysis of AI agent trends in 2026 - why autonomous agents are the next big thing',
    stage: 'idea',
    platform: 'linkedin',
    createdAt: '2026-03-02',
    scheduledAt: '',
    publishedAt: '',
    content: ''
  },
  {
    id: 'content-2',
    title: 'Building Your First AI Agent: A Step-by-Step Guide',
    description: 'Complete tutorial for developers looking to build their first AI agent',
    stage: 'drafting',
    platform: 'blog',
    createdAt: '2026-03-01',
    scheduledAt: '',
    publishedAt: '',
    content: '# Building Your First AI Agent\n\nStep-by-step guide...'
  },
  {
    id: 'content-3',
    title: 'The ROI of AI Agents: Real Numbers from 2026',
    description: 'Case study with metrics showing real return on investment',
    stage: 'review',
    platform: 'linkedin',
    createdAt: '2026-03-01',
    scheduledAt: '',
    publishedAt: '',
    content: ''
  },
  {
    id: 'content-4',
    title: 'Small Business Automation with AI Agents',
    description: 'Practical guide for small businesses to automate with AI',
    stage: 'scheduled',
    platform: 'blog',
    createdAt: '2026-02-28',
    scheduledAt: '2026-03-10',
    publishedAt: '',
    content: ''
  },
  {
    id: 'content-5',
    title: 'Autonomous Companies: The Future of Work',
    description: 'Vision piece about the future of fully autonomous companies',
    stage: 'idea',
    platform: 'blog',
    createdAt: '2026-03-02',
    scheduledAt: '',
    publishedAt: '',
    content: ''
  },
  {
    id: 'content-6',
    title: 'PP Ventures Launch Announcement',
    description: 'Announce the launch of PP Ventures website',
    stage: 'published',
    platform: 'twitter',
    createdAt: '2026-02-20',
    scheduledAt: '2026-02-22',
    publishedAt: '2026-02-22',
    content: '🚀 Excited to announce PP Ventures - Building the future of AI!'
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
