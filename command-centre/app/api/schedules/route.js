import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/schedules - List all recurring schedules
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'recurring' or 'blocks' or 'today' or 'week'
    const agentId = searchParams.get('agent_id');
    
    let query = supabaseAdmin.from('agent_schedules').select('*').order('start_time');
    
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    
    const { data: recurring, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If requesting blocks
    if (type === 'blocks' || type === 'today' || type === 'week') {
      let blocksQuery = supabaseAdmin
        .from('schedule_blocks')
        .select('*, agent:agents(name, avatar_color)')
        .order('scheduled_at');
      
      if (type === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        blocksQuery = blocksQuery
          .gte('scheduled_at', today.toISOString())
          .lt('scheduled_at', tomorrow.toISOString());
      } else if (type === 'week') {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        
        blocksQuery = blocksQuery
          .gte('scheduled_at', startOfWeek.toISOString())
          .lt('scheduled_at', endOfWeek.toISOString());
      }
      
      const { data: blocks, error: blocksError } = await blocksQuery;
      
      if (blocksError) {
        return NextResponse.json({ error: blocksError.message }, { status: 500 });
      }
      
      return NextResponse.json({ schedules: recurring, blocks });
    }
    
    return NextResponse.json({ schedules: recurring });
    
  } catch (err) {
    console.error('Get schedules error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/schedules - Create new schedule or block
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;
    
    // Determine if it's a recurring schedule or a one-time block
    if (type === 'block') {
      // Create a one-time block
      const { data: block, error } = await supabaseAdmin
        .from('schedule_blocks')
        .insert({
          agent_id: data.agent_id,
          title: data.title,
          description: data.description,
          scheduled_at: data.scheduled_at,
          duration_minutes: data.duration_minutes || 60,
          task_type: data.task_type || 'general',
          status: 'scheduled'
        })
        .select('*, agent:agents(name, avatar_color)')
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, block });
    } else {
      // Create recurring schedule
      const { data: schedule, error } = await supabaseAdmin
        .from('agent_schedules')
        .insert({
          agent_id: data.agent_id,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          task_type: data.task_type || 'general',
          label: data.label,
          colour: data.colour,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, schedule });
    }
    
  } catch (err) {
    console.error('Create schedule error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/schedules - Delete schedule or block
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteType = searchParams.get('type'); // 'schedule' or 'block'
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const table = deleteType === 'block' ? 'schedule_blocks' : 'agent_schedules';
    
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error('Delete schedule error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
