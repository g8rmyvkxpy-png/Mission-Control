import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

//s - Create POST /api/log log entry
export async function POST(request) {
  try {
    const { api_key, message, log_type = 'info' } = await request.json();
    
    if (!api_key || !message) {
      return NextResponse.json({ error: 'API key and message required' }, { status: 400 });
    }
    
    // Find agent by API key
    const { data: agent, error: findError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('api_key', api_key)
      .single();
    
    if (findError || !agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // Insert log
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        agent_id: agent.id,
        message,
        log_type
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, log: data });
    
  } catch (err) {
    console.error('Log error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/logs?agent_id=xxx&limit=xxx
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query = supabaseAdmin
      .from('activity_logs')
      .select(`
        *,
        agent:agents(name, avatar_color)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ logs: data });
    
  } catch (err) {
    console.error('Get logs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
