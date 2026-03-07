import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const { api_key, current_task } = await request.json();
    
    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }
    
    // Find agent by API key
    const { data: agent, error: findError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('api_key', api_key)
      .single();
    
    if (findError || !agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // Determine status based on time since last heartbeat
    let newStatus = 'online';
    if (agent.last_heartbeat) {
      const lastHeartbeat = new Date(agent.last_heartbeat);
      const now = new Date();
      const minutesSince = (now - lastHeartbeat) / (1000 * 60);
      
      if (minutesSince > 10) {
        newStatus = 'idle';
      }
    }
    
    // Update agent heartbeat
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update({
        last_heartbeat: new Date().toISOString(),
        current_task: current_task || agent.current_task,
        status: newStatus
      })
      .eq('id', agent.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Log heartbeat
    await supabaseAdmin.from('activity_logs').insert({
      agent_id: agent.id,
      message: `Heartbeat received - ${current_task || 'idle'}`,
      log_type: 'heartbeat'
    });
    
    return NextResponse.json({ 
      success: true, 
      agent: data,
      message: 'Heartbeat recorded'
    });
    
  } catch (err) {
    console.error('Heartbeat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
