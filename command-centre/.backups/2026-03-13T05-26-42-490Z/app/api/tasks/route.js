import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // When polling for backlog, return all backlog tasks (unassigned)
    if (status === 'backlog') {
      const { data } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('status', 'backlog')
        .order('priority', { ascending: false })
        .limit(20);
      return NextResponse.json({ tasks: data || [] });
    }
    
    // Other queries - use agent_id
    const agentId = searchParams.get('agent_id');
    let query = supabaseAdmin.from('tasks').select('*').order('created_at', { ascending: false });
    
    if (agentId && agentId !== 'self') query = query.eq('assigned_to', agentId);
    if (status) query = query.eq('status', status);
    
    const { data } = await query;
    return NextResponse.json({ tasks: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, description, assigned_to, priority = 'medium', task_type = 'general', implementation_details = {} } = await request.json();
    const { data } = await supabaseAdmin.from('tasks').insert({ 
      title, 
      description, 
      assigned_to, 
      priority, 
      status: 'backlog',
      task_type,
      implementation_details
    }).select();
    return NextResponse.json({ task: data[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status, result, assigned_to, task_type, implementation_details } = await request.json();
    const updateData = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (result) updateData.result = result;
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (task_type) updateData.task_type = task_type;
    if (implementation_details) updateData.implementation_details = implementation_details;
    
    const { data } = await supabaseAdmin.from('tasks').update(updateData).eq('id', id).select();
    return NextResponse.json({ task: data[0] });
  } catch (err) {
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
    
    await supabaseAdmin.from('tasks').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
