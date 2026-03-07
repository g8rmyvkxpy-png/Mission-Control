import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/subtasks?parent_id=xxx - get subtasks for a parent task
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_id');
    
    let query = supabaseAdmin
      .from('subtasks')
      .select(`
        *,
        parent_task:tasks!parent_task_id(title, status),
        child_task:tasks!child_task_id(id, title, status, assigned_to, agent:agents(name, avatar_color))
      `);
    
    if (parentId) {
      query = query.eq('parent_task_id', parentId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ subtasks: [], error: error.message }, { status: 200 });
    }
    
    return NextResponse.json({ subtasks: data || [] });
  } catch (err) {
    return NextResponse.json({ subtasks: [], error: err.message }, { status: 200 });
  }
}

// POST /api/subtasks - create a subtask relationship
export async function POST(request) {
  try {
    const { parent_task_id, child_task_id, assigned_by, reasoning } = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('subtasks')
      .insert({
        parent_task_id,
        child_task_id,
        assigned_by,
        reasoning
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ subtask: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
