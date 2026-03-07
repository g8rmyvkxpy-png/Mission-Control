import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/crons - List all cron jobs
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('cron_jobs')
      .select(`
        *,
        agent:agents(name, avatar_color)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ cron_jobs: data });
    
  } catch (err) {
    console.error('Get crons error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crons - Create new cron job
export async function POST(request) {
  try {
    const { agent_id, title, description, cron_expression } = await request.json();
    
    if (!agent_id || !title || !cron_expression) {
      return NextResponse.json({ error: 'Agent ID, title, and cron expression required' }, { status: 400 });
    }
    
    // Basic validation - check cron is not empty
    if (cron_expression.length < 9 || cron_expression.length > 20) {
      return NextResponse.json({ error: 'Invalid cron expression format' }, { status: 400 });
    }
    
    // Calculate next run (simplified - 1 hour from now as default)
    const nextRun = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('cron_jobs')
      .insert({
        agent_id,
        title,
        description,
        cron_expression,
        status: 'active',
        next_run: nextRun
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, cron_job: data });
    
  } catch (err) {
    console.error('Create cron error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crons/:id - Pause/resume cron job
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cronId = searchParams.get('id');
    const { status } = await request.json();
    
    if (!status || !['active', 'paused'].includes(status)) {
      return NextResponse.json({ error: 'Status must be active or paused' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('cron_jobs')
      .update({ status })
      .eq('id', cronId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, cron_job: data });
    
  } catch (err) {
    console.error('Update cron error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
