import { NextResponse } from 'next/server';

// Agent definitions (mirrored from server/agents/definitions.ts)
const AGENTS = [
  { id: 'atlas', name: 'Atlas', specialty: 'Lead Generation' },
  { id: 'pulse', name: 'Pulse', specialty: 'Prospecting' },
  { id: 'hunter', name: 'Hunter', specialty: 'Calling' },
  { id: 'phoenix', name: 'Phoenix', specialty: 'Conversion' },
  { id: 'scout', name: 'Scout', specialty: 'Analysis' },
  { id: 'radar', name: 'Radar', specialty: 'SEO' },
  { id: 'compass', name: 'Compass', specialty: 'Monitoring' },
  { id: 'trends', name: 'Trends', specialty: 'Trends' },
  { id: 'bond', name: 'Bond', specialty: 'Churn' },
  { id: 'mend', name: 'Mend', specialty: 'Resolution' },
  { id: 'grow', name: 'Grow', specialty: 'Upsell' },
  { id: 'byte', name: 'Byte', specialty: 'Build' },
  { id: 'pixel', name: 'Pixel', specialty: 'UI' },
  { id: 'server', name: 'Server', specialty: 'APIs' },
  { id: 'auto', name: 'Auto', specialty: 'Automation' },
  { id: 'ink', name: 'Ink', specialty: 'Blogs' },
  { id: 'blaze', name: 'Blaze', specialty: 'Twitter' },
  { id: 'cinema', name: 'Cinema', specialty: 'Video' },
  { id: 'draft', name: 'Draft', specialty: 'Newsletters' },
];

// In-memory task queue
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

let tasks: Task[] = [];
const priorityOrder = { high: 0, medium: 1, low: 2 };

function enqueueTask(task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Task {
  const newTask: Task = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Sort by priority
  const insertIndex = tasks.findIndex(t => priorityOrder[t.priority] > priorityOrder[newTask.priority]);
  
  if (insertIndex === -1) {
    tasks.push(newTask);
  } else {
    tasks.splice(insertIndex, 0, newTask);
  }

  return newTask;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    
    let filteredTasks = [...tasks];
    
    // Filter by status
    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }
    
    // Filter by assignee
    if (assignee) {
      filteredTasks = filteredTasks.filter(t => t.assignedTo === assignee);
    }
    
    const queueStatus = {
      pending: tasks.filter(t => t.status === 'pending').length,
      processing: tasks.filter(t => t.status === 'processing').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      total: tasks.length,
    };
    
    return NextResponse.json({
      tasks: filteredTasks,
      queueStatus,
      agents: AGENTS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, assignedTo, priority, metadata } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const task = enqueueTask({
      title,
      description: description || '',
      assignedTo,
      priority: priority || 'medium',
      metadata,
    });
    
    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { taskId, action } = body;
    
    if (!taskId || !action) {
      return NextResponse.json({ error: 'taskId and action are required' }, { status: 400 });
    }
    
    let result = false;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      
      if (action === 'cancel' && task.status === 'pending') {
        task.status = 'failed';
        task.error = 'Cancelled by user';
        task.updatedAt = Date.now();
        result = true;
      } else if (action === 'retry' && task.status === 'failed') {
        task.status = 'pending';
        task.error = undefined;
        task.updatedAt = Date.now();
        result = true;
      }
    }
    
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clear = searchParams.get('clear');
    
    if (clear === 'history') {
      tasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');
      return NextResponse.json({ success: true, message: 'History cleared' });
    }
    
    return NextResponse.json({ error: 'Invalid delete action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
