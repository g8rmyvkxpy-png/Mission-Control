import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST /api/trigger - Manually trigger a task for an agent
export async function POST(request) {
  try {
    const { agent_id, title, description, priority = 'medium', created_by = 'manual' } = await request.json();
    
    if (!agent_id || !title) {
      return NextResponse.json({ error: 'Agent ID and title required' }, { status: 400 });
    }
    
    // Verify agent exists
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, name')
      .eq('id', agent_id)
      .single();
    
    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    // Create task in backlog
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert({
        title,
        description,
        assigned_to: agent_id,
        created_by,
        priority,
        status: 'backlog'
      })
      .select()
      .single();
    
    if (taskError) {
      return NextResponse.json({ error: taskError.message }, { status: 500 });
    }
    
    // Log the trigger
    await supabaseAdmin.from('activity_logs').insert({
      agent_id,
      message: `Task triggered manually: ${title}`,
      log_type: 'task'
    });
    
    return NextResponse.json({ 
      success: true, 
      task,
      message: `Task "${title}" queued for ${agent.name}`
    });
    
  } catch (err) {
    console.error('Trigger error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
