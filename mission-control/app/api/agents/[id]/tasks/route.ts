import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { executeTask } from '@/lib/agents';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/agents/[id]/tasks?org_id=xxx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = request.nextUrl.searchParams.get('org_id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    const { data: tasks, error } = await supabaseAdmin
      .from('agent_tasks')
      .select('*')
      .eq('organization_id', orgId)
      .eq('agent_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents/[id]/tasks - Create and AUTO-EXECUTE task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { org_id, title, description, priority, input_data, auto_execute = true } = body;
    
    if (!org_id || !title) {
      return NextResponse.json({ error: 'org_id and title required' }, { status: 400 });
    }
    
    // Create task
    const { data: task, error } = await supabaseAdmin
      .from('agent_tasks')
      .insert({
        agent_id: id,
        organization_id: org_id,
        title,
        description,
        priority: priority || 'medium',
        input_data: input_data || {},
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Auto-execute if enabled
    if (auto_execute) {
      // Execute in background (don't wait)
      executeTask(task.id).then(result => {
        console.log('Auto-executed task:', task.id, result.success);
      });
    }
    
    return NextResponse.json({ task, auto_executed: auto_execute });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
