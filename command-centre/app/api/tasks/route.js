import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/tasks?agent_id=xxx&status=xxx
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status');
    
    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        agent:agents(name, avatar_color, status)
      `)
      .order('created_at', { ascending: false });
    
    if (agentId && agentId !== 'self') {
      query = query.eq('assigned_to', agentId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ tasks: data });
    
  } catch (err) {
    console.error('Get tasks error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request) {
  try {
    const { title, description, assigned_to, created_by, priority = 'medium' } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }
    
    console.log('Creating task with:', { title, assigned_to });
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        title,
        description,
        assigned_to,
        created_by,
        priority,
        status: 'backlog'
      })
      .select()
      .single();
    
    console.log('Result:', { data, error });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, task: data });
    
  } catch (err) {
    console.error('Create task error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

// PATCH /api/tasks/:id - Update task
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    const body = await request.json();
    
    const { status, title, description, priority, assigned_to, result, project_id } = body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (result !== undefined) updateData.result = result;
    if (project_id !== undefined) updateData.project_id = project_id;
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, task: data });
    
  } catch (err) {
    console.error('Update task error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

// DELETE /api/tasks?id=xxx
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }
    
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error('Delete task error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
