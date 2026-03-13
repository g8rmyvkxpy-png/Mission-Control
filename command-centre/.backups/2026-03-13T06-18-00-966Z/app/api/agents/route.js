import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .order('name');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ agents: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, api_key, avatar_color } = await request.json();
    
    if (!name || !api_key) {
      return NextResponse.json({ error: 'Name and api_key required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert({ name, api_key, avatar_color: avatar_color || '#10b981' })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, agent: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
