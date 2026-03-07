import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ agent: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
