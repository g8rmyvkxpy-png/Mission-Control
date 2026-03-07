import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST /api/projects/:id/tasks - link task to project
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const { task_id } = await request.json();
    
    if (!task_id) {
      return NextResponse.json({ error: 'task_id required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('project_tasks')
      .insert({
        project_id: projectId,
        task_id
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, link: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/projects/:id/tasks?task_id=xxx - unlink task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const taskId = searchParams.get('task_id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'task_id required' }, { status: 400 });
    }
    
    const { error } = await supabaseAdmin
      .from('project_tasks')
      .delete()
      .eq('project_id', projectId)
      .eq('task_id', taskId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
