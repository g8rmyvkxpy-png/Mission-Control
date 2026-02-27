import { supabaseAdmin } from '@/lib/supabase-org';
import { NextRequest, NextResponse } from 'next/server';
import { orgQueries } from '@/lib/supabase-org';

// GET /api/agents/[id]?org_id=xxx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = request.nextUrl.searchParams.get('org_id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    const { data: agent, error } = await orgQueries.getAgent(orgId, id);
    
    if (error) throw error;
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ agent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { org_id, ...updates } = body;
    
    if (!org_id) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    const { data: agent, error } = await supabaseAdmin
      .from('managed_agents')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', org_id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ agent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/agents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = request.nextUrl.searchParams.get('org_id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    const { error } = await supabaseAdmin
      .from('managed_agents')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);
    
    if (error) throw error;
    
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
