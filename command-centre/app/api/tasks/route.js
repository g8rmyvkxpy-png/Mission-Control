import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const agentId = searchParams.get('agent_id');
    const priority = searchParams.get('priority'); // P0, P1, P2, P3
    const includeOverdue = searchParams.get('includeOverdue');
    
    let query = supabaseAdmin
      .from('tasks')
      .select('*, agents:assigned_to(name, status)')
      .order('priority_score', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (status === 'backlog') {
      query = query.eq('status', 'backlog');
    } else if (status) {
      query = query.eq('status', status);
    }
    
    if (agentId && agentId !== 'self') {
      query = query.eq('assigned_to', agentId);
    }
    
    if (priority) {
      const priorityMap = { P0: 0, P1: 1, P2: 2, P3: 3 };
      query = query.eq('priority_score', priorityMap[priority] ?? 2);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Mark overdue tasks
    const now = new Date();
    const tasks = (data || []).map(task => ({
      ...task,
      isOverdue: task.due_date && new Date(task.due_date) < now && task.status !== 'done'
    }));
    
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('Tasks GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      assigned_to, 
      priority = 'P2', 
      task_type = 'general', 
      implementation_details = {},
      due_date,
      tags
    } = body;
    
    const priorityMap = { P0: 0, P1: 1, P2: 2, P3: 3 };
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        title,
        description,
        assigned_to,
        priority: priority === 'P0' ? 'high' : priority === 'P3' ? 'low' : 'medium',
        priority_score: priorityMap[priority] ?? 2,
        status: 'backlog',
        task_type,
        implementation_details,
        due_date,
        tags: tags || []
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ task: data });
  } catch (err) {
    console.error('Tasks POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, 
      status, 
      result, 
      assigned_to, 
      task_type, 
      implementation_details,
      priority,
      due_date,
      tags
    } = body;
    
    const updateData = { updated_at: new Date().toISOString() };
    
    if (status) updateData.status = status;
    if (result) updateData.result = result;
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (task_type) updateData.task_type = task_type;
    if (implementation_details) updateData.implementation_details = implementation_details;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (tags) updateData.tags = tags;
    
    if (priority) {
      const priorityMap = { P0: 0, P1: 1, P2: 2, P3: 3 };
      updateData.priority_score = priorityMap[priority] ?? 2;
      updateData.priority = priority === 'P0' ? 'high' : priority === 'P3' ? 'low' : 'medium';
    }
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ task: data });
  } catch (err) {
    console.error('Tasks PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }
    
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tasks DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
