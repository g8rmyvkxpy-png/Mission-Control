import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// PATCH /api/brain/:id - update entry
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from('second_brain')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: data, updated: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/brain/:id - delete entry
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('second_brain')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
