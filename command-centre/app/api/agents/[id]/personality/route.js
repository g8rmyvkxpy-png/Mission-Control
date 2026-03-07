import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('id, name, personality, tone, specialisation, backstory, catchphrase, working_style')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ personality: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();
    
    // Validate allowed fields
    const allowedFields = ['personality', 'tone', 'specialisation', 'backstory', 'catchphrase', 'working_style'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, personality: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
