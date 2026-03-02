import { NextResponse } from 'next/server';

// Mock knowledge base / memory data
const memories = [
  {
    id: 'mem-1',
    title: 'PP Ventures Mission',
    content: 'Build a 24/7 autonomous company creating value through AI agents and SaaS products.',
    category: 'company',
    tags: ['mission', 'vision', 'goals'],
    createdAt: '2026-02-20',
    updatedAt: '2026-02-25'
  },
  {
    id: 'mem-2',
    title: 'Product Roadmap 2026',
    content: 'Q1: Mission Control launch, Q2: AI Agent services, Q3: Stripe integration, Q4: Enterprise features',
    category: 'product',
    tags: ['roadmap', 'planning', '2026'],
    createdAt: '2026-02-21',
    updatedAt: '2026-02-28'
  },
  {
    id: 'mem-3',
    title: 'Tech Stack',
    content: 'Next.js 16, Supabase, SQLite, Tailwind CSS, OpenClaw for automation',
    category: 'technical',
    tags: ['tech', 'stack', 'infrastructure'],
    createdAt: '2026-02-20',
    updatedAt: '2026-02-22'
  },
  {
    id: 'mem-4',
    title: 'Target Customers',
    content: 'Startup founders, Product Managers, Small businesses needing automation',
    category: 'sales',
    tags: ['customers', 'target', 'market'],
    createdAt: '2026-02-21',
    updatedAt: '2026-02-24'
  }
];

export async function GET() {
  return NextResponse.json({
    memories,
    total: memories.length,
    byCategory: {
      company: memories.filter(m => m.category === 'company').length,
      product: memories.filter(m => m.category === 'product').length,
      technical: memories.filter(m => m.category === 'technical').length,
      sales: memories.filter(m => m.category === 'sales').length
    },
    organization_id: '56b94071-3455-4967-9300-60788486a4fb'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMem = {
      id: `mem-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    memories.push(newMem);
    return NextResponse.json({ success: true, memory: newMem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}
