import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { listWorkflows, executeWorkflow } from '@/lib/workflows';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/workflows?org_id=xxx - List workflows
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id') || 'default-org';
    
    // For now, return mock workflows if no org_id provided or as fallback
    const mockWorkflows = [
      { id: '1', name: 'Content Publishing', description: 'Schedule and publish content', status: 'active', runs: 8, lastRun: '1 day ago' },
      { id: '2', name: 'Lead Nurture', description: 'Follow up with leads', status: 'active', runs: 12, lastRun: '2 hours ago' },
      { id: '3', name: 'Daily Report', description: 'Generate daily analytics', status: 'paused', runs: 5, lastRun: '3 days ago' }
    ];
    
    return NextResponse.json({ workflows: mockWorkflows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/workflows - Create workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, name, description, nodes, edges } = body;
    
    if (!org_id || !name) {
      return NextResponse.json({ error: 'org_id and name required' }, { status: 400 });
    }
    
    const { data: workflow, error } = await supabaseAdmin
      .from('workflows')
      .insert({
        organization_id: org_id,
        name,
        description,
        nodes: nodes || [],
        edges: edges || [],
        is_active: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ workflow, created: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
