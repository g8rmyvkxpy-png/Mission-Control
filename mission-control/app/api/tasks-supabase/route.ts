import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client for tasks
const supabaseUrl = 'https://hizmosyxhwgighzxvbrj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTA3MSwiZXhwIjoyMDg3NzYxMDcxfQ.z3bA-ijk11SFJzdw5dnjsHe9yU8_YF3seiuQfFSQ0gc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Default organization ID
const DEFAULT_ORG = '56b94071-3455-4967-9300-60788486a4fb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id') || DEFAULT_ORG;
    const status = searchParams.get('status');

    // Fetch from Supabase
    let query = supabase
      .from('agent_tasks')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      if (status === 'active') {
        query = query.in('status', ['pending', 'processing', 'in_progress']);
      } else if (status === 'completed') {
        query = query.in('status', ['completed', 'done']);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data: supabaseTasks, error } = await query.limit(100);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to match UI format
    const tasks = (supabaseTasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      agent_name: task.agent_name,
      agent_avatar: task.agent_avatar,
      result: task.output_data,
      error: task.error,
      createdAt: task.created_at ? new Date(task.created_at).getTime() : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at).getTime() : undefined,
    }));

    return NextResponse.json({ 
      tasks,
      total: tasks.length,
      organization_id: orgId 
    });
  } catch (error: any) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organization_id || DEFAULT_ORG;

    // Create task in Supabase
    const { data, error } = await supabase
      .from('agent_tasks')
      .insert({
        organization_id: orgId,
        title: body.title,
        description: body.description || '',
        status: 'pending',
        priority: body.priority || 'medium',
        input_data: body.input_data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ 
      success: true, 
      task: {
        id: data.id,
        title: data.title,
        status: data.status,
        organization_id: data.organization_id,
      }
    });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID required' });
    }

    const { error } = await supabase
      .from('agent_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
