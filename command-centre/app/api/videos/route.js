import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/videos - List all demo videos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status');
    
    let query = supabaseAdmin
      .from('demo_videos')
      .select(`
        *,
        agent:agents(name, avatar_color),
        task:tasks(title, status)
      `)
      .order('created_at', { ascending: false });
    
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ videos: [], error: error.message }, { status: 200 });
    }
    
    return NextResponse.json({ videos: data || [] });
  } catch (err) {
    return NextResponse.json({ videos: [], error: err.message }, { status: 200 });
  }
}

// POST /api/videos - Create a new video record
export async function POST(request) {
  try {
    const { task_id, agent_id, title, file_path, status, duration_seconds } = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('demo_videos')
      .insert({
        task_id,
        agent_id,
        title,
        file_path,
        status: status || 'ready',
        duration_seconds
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Create notification
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('name')
      .eq('id', agent_id)
      .single();
    
    await supabaseAdmin
      .from('notifications')
      .insert({
        title: 'New Demo Video',
        message: `🎥 ${agent?.name || 'Agent'} recorded a demo for: ${title}`,
        type: 'video',
        read: false
      });
    
    return NextResponse.json({ video: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
