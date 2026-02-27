import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/agents?org_id=xxx - List agents
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    const { data: agents, error } = await supabaseAdmin
      .from('managed_agents')
      .select('*')
      .eq('organization_id', orgId);
    
    if (error) throw error;
    
    return NextResponse.json({ agents: agents || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents - Create agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, name, role, specialty, avatar, color, system_prompt, tools } = body;
    
    if (!org_id || !name || !role) {
      return NextResponse.json({ error: 'org_id, name, role required' }, { status: 400 });
    }
    
    const { data: agent, error } = await supabaseAdmin
      .from('managed_agents')
      .insert({
        organization_id: org_id,
        name,
        role,
        specialty,
        avatar: avatar || '🤖',
        color: color || '#6366f1',
        system_prompt,
        tools: tools || [],
        status: 'inactive'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ agent, created: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
