import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST /api/memories/save - agent saves a memory
export async function POST(request) {
  try {
    const { api_key, content, summary, memory_type, tags } = await request.json();
    
    if (!api_key || !content) {
      return NextResponse.json({ error: 'API key and content required' }, { status: 400 });
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
    
    const { data, error } = await supabaseAdmin
      .from('memories')
      .insert({
        content,
        summary,
        memory_type: memory_type || 'conversation',
        tags: tags || null,
        agent_id: agent.id
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, memory: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
