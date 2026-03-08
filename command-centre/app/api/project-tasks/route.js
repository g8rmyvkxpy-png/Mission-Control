import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/project-tasks - list all project-task links
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_tasks')
      .select('*');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ project_tasks: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/project-tasks - create project-task link
export async function POST(request) {
  try {
    const { project_id, task_id } = await request.json();
    
    if (!project_id || !task_id) {
      return NextResponse.json({ error: 'project_id and task_id required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('project_tasks')
      .insert({ project_id, task_id })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, project_tasks: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/project-tasks - remove project-task link
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const task_id = searchParams.get('task_id');
    
    if (!project_id || !task_id) {
      return NextResponse.json({ error: 'project_id and task_id required' }, { status: 400 });
    }
    
    const { error } = await supabaseAdmin
      .from('project_tasks')
      .delete()
      .eq('project_id', project_id)
      .eq('task_id', task_id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
