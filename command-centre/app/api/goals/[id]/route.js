import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// PATCH /api/goals/:id - Update a goal
// DELETE /api/goals/:id - Delete a goal
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ goal: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const { error } = await supabaseAdmin
      .from('goals')
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
