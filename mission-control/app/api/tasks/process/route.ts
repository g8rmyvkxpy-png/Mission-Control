import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { executeTask } from '@/lib/agents';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, agent_id } = body;
    
    if (!org_id) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    let query = supabaseAdmin
      .from('agent_tasks')
      .select('*')
      .eq('organization_id', org_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (agent_id) query = query.eq('agent_id', agent_id);
    
    const { data: tasks } = await query;
    
    if (!tasks?.length) {
      return NextResponse.json({ message: 'No pending tasks', processed: 0 });
    }
    
    const results = [];
    for (const task of tasks) {
      const result = await executeTask(task.id);
      results.push({ task_id: task.id, ...result });
    }
    
    return NextResponse.json({ 
      processed: results.length,
      successful: results.filter(r => r.success).length,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
