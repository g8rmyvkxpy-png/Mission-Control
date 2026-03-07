import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/brain - list all entries
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('second_brain')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ entries: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/brain - create entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, type, tags, source, agent_id, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('second_brain')
      .insert({
        title,
        content,
        type: type || 'note',
        tags: tags || [],
        source,
        agent_id,
        status: status || 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: data, created: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
