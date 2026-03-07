import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/team
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('created_at');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Build hierarchy
    const members = data || [];
    const withReports = members.map(m => ({
      ...m,
      reports_to_name: members.find(p => p.id === m.reports_to)?.name || null
    }));
    
    return NextResponse.json({ team: withReports });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/team
export async function POST(request) {
  try {
    const { name, role, type, model, device, status, avatar_color, reports_to, agent_id, description } = await request.json();
    
    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert({
        name,
        role,
        type: type || 'agent',
        model,
        device,
        status: status || 'offline',
        avatar_color: avatar_color || '#6366f1',
        reports_to: reports_to || null,
        agent_id: agent_id || null,
        description
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, member: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/team
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    const { name, role, type, model, device, status, avatar_color, reports_to, agent_id, description } = body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (type !== undefined) updateData.type = type;
    if (model !== undefined) updateData.model = model;
    if (device !== undefined) updateData.device = device;
    if (status !== undefined) updateData.status = status;
    if (avatar_color !== undefined) updateData.avatar_color = avatar_color;
    if (reports_to !== undefined) updateData.reports_to = reports_to;
    if (agent_id !== undefined) updateData.agent_id = agent_id;
    if (description !== undefined) updateData.description = description;
    
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, member: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/team
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
