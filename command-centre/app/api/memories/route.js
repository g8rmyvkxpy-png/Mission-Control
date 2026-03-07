import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/memories - list all memories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const longterm = searchParams.get('longterm');
    
    let query = supabaseAdmin
      .from('memories')
      .select('*, agent:agents(name, avatar_color)')
      .order('memory_date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (longterm === 'true') {
      query = query.eq('memory_type', 'longterm');
    }
    
    if (date) {
      query = query.eq('memory_date', date);
    }
    
    if (type) {
      query = query.eq('memory_type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Filter by search if provided (client-side for now)
    let memories = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      memories = memories.filter(m => 
        m.content?.toLowerCase().includes(searchLower) ||
        m.summary?.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({ memories });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/memories - create memory
export async function POST(request) {
  try {
    const { content, summary, memory_type, tags, agent_id, memory_date } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('memories')
      .insert({
        content,
        summary,
        memory_type: memory_type || 'conversation',
        tags: tags || null,
        agent_id: agent_id || null,
        memory_date: memory_date || new Date().toISOString().split('T')[0]
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

// DELETE /api/memories
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const { error } = await supabaseAdmin
      .from('memories')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
