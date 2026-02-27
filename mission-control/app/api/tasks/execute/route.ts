import { NextRequest, NextResponse } from 'next/server';
import { executeTask } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id } = body;
    
    if (!task_id) {
      return NextResponse.json({ error: 'task_id required' }, { status: 400 });
    }
    
    const result = await executeTask(task_id);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
