import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/notifications - list notifications
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const unreadCount = data?.filter(n => !n.read).length || 0;

    return NextResponse.json({ 
      notifications: data || [],
      unreadCount 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/notifications - create notification
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, type, agent_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({ title, message, type: type || 'info', agent_id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ notification: data, created: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/notifications - mark as read
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { markAllRead } = body;

    if (markAllRead) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
