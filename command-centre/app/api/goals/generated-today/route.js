import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/goals/generated-today - List all agent generated tasks from today
export async function GET(request) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseAdmin
      .from('agent_generated_tasks')
      .select(`
        *,
        goal:goals(title, category),
        task:tasks(id, title, status, assigned_to, agent:agents(name, avatar_color))
      `)
      .eq('generated_date', today)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ tasks: [], error: error.message }, { status: 200 });
    }
    
    return NextResponse.json({ tasks: data || [] });
  } catch (err) {
    return NextResponse.json({ tasks: [], error: err.message }, { status: 200 });
  }
}
