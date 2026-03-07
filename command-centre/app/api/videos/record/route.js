import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { recordTaskDemo } from '@/lib/videoRecorder';

// POST /api/videos/record - Trigger a recording for a completed task
export async function POST(request) {
  try {
    const { api_key, task_id, agent_id, title } = await request.json();
    
    // Simple API key check
    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }
    
    // Get task details
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .single();
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    // Create video record with 'recording' status
    const { data: video, error: createError } = await supabaseAdmin
      .from('demo_videos')
      .insert({
        task_id,
        agent_id,
        title: title || `Demo: ${task.title}`,
        status: 'recording'
      })
      .select()
      .single();
    
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    
    // Try to record the video
    try {
      const videoPath = await recordTaskDemo(task_id, task.title, agent_id);
      
      if (videoPath) {
        await supabaseAdmin
          .from('demo_videos')
          .update({ status: 'ready', file_path: videoPath })
          .eq('id', video.id);
        
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
            message: `🎥 ${agent?.name || 'Agent'} recorded a demo for: ${task.title}`,
            type: 'video',
            read: false
          });
        
        return NextResponse.json({ success: true, video_id: video.id, video_path: videoPath });
      } else {
        await supabaseAdmin
          .from('demo_videos')
          .update({ status: 'failed' })
          .eq('id', video.id);
        
        return NextResponse.json({ error: 'Recording failed', video_id: video.id }, { status: 500 });
      }
    } catch (recErr) {
      await supabaseAdmin
        .from('demo_videos')
        .update({ status: 'failed' })
        .eq('id', video.id);
      
      return NextResponse.json({ error: recErr.message }, { status: 500 });
    }
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
