import { NextResponse } from 'next/server';

// Mock projects data
const projects = [
  {
    id: 'proj-1',
    name: 'Mission Control',
    description: 'AI-powered productivity dashboard for PP Ventures',
    status: 'in_progress',
    progress: 75,
    priority: 'high',
    startDate: '2026-02-15',
    dueDate: '2026-03-15',
    team: ['Neo', 'Deva'],
    tasks: { total: 24, completed: 18 }
  },
  {
    id: 'proj-2',
    name: 'PP Ventures Website',
    description: 'Marketing website for PP Ventures',
    status: 'completed',
    progress: 100,
    priority: 'high',
    startDate: '2026-02-01',
    dueDate: '2026-02-28',
    team: ['Neo'],
    tasks: { total: 12, completed: 12 }
  },
  {
    id: 'proj-3',
    name: 'AI Agent Services',
    description: 'Launch AI agent services for customers',
    status: 'planning',
    progress: 20,
    priority: 'medium',
    startDate: '2026-03-01',
    dueDate: '2026-06-30',
    team: ['Neo', 'Deva'],
    tasks: { total: 8, completed: 2 }
  },
  {
    id: 'proj-4',
    name: 'Content Pipeline',
    description: 'Automated content creation and distribution',
    status: 'in_progress',
    progress: 45,
    priority: 'medium',
    startDate: '2026-02-20',
    dueDate: '2026-04-30',
    team: ['Neo'],
    tasks: { total: 15, completed: 7 }
  },
  {
    id: 'proj-5',
    name: 'Lead Generation',
    description: 'Automated lead capture and nurturing',
    status: 'in_progress',
    progress: 30,
    priority: 'low',
    startDate: '2026-02-25',
    dueDate: '2026-05-31',
    team: ['Neo', 'Sales Scout'],
    tasks: { total: 10, completed: 3 }
  }
];

export async function GET() {
  return NextResponse.json({
    projects,
    total: projects.length,
    byStatus: {
      planning: projects.filter(p => p.status === 'planning').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length
    },
    organization_id: '56b94071-3455-4967-9300-60788486a4fb'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProj = {
      id: `proj-${Date.now()}`,
      ...body,
      status: body.status || 'planning',
      progress: 0,
      tasks: { total: 0, completed: 0 }
    };
    projects.push(newProj);
    return NextResponse.json({ success: true, project: newProj });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
