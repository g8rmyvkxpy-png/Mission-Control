import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/goals - List all goals
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      // Table might not exist, try to create it
      if (error.code === '42P01') {
        return NextResponse.json({ goals: [], needsSetup: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ goals: data });
  } catch (err) {
    return NextResponse.json({ goals: [], error: err.message }, { status: 200 });
  }
}

// POST /api/goals - Create a new goal
export async function POST(request) {
  try {
    const { title, description, category, priority, timeframe, status } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('goals')
      .insert({
        title,
        description,
        category: category || 'general',
        priority: priority || 1,
        timeframe: timeframe || 'longterm',
        status: status || 'active'
      })
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
