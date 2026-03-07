import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST /api/projects/:id/notes - add note to project
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const { content, created_by } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('project_notes')
      .insert({
        project_id: projectId,
        content,
        created_by: created_by || 'dashboard'
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, note: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/projects/:id/notes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    const { data, error } = await supabaseAdmin
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ notes: data || [] });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
