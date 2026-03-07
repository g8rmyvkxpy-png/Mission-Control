import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/mission
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('mission_statements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ mission: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/mission
export async function PATCH(request) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    
    // Get latest mission
    const { data: existing } = await supabaseAdmin
      .from('mission_statements')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let result;
    if (existing) {
      // Update
      const { data, error } = await supabaseAdmin
        .from('mission_statements')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      // Create
      const { data, error } = await supabaseAdmin
        .from('mission_statements')
        .insert({ content })
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }
    
    return NextResponse.json({ success: true, mission: result });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
