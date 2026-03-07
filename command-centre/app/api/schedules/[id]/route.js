import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// PATCH /api/schedules/:id
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const updateType = searchParams.get('type'); // 'schedule' or 'block'
    const updates = await request.json();
    
    const table = updateType === 'block' ? 'schedule_blocks' : 'agent_schedules';
    
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq('id', id)
      .select('*, agent:agents(name, avatar_color)')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, [updateType || 'item']: data });
    
  } catch (err) {
    console.error('Update schedule error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
