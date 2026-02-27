import { NextRequest, NextResponse } from 'next/server';
import { listIntegrations, createIntegration, deleteIntegration } from '@/lib/integrations';

// GET /api/integrations?org_id=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    const { integrations, error } = await listIntegrations(orgId);
    
    return NextResponse.json({ integrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/integrations - Create integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, provider, name, credentials } = body;
    
    if (!org_id || !provider || !name) {
      return NextResponse.json({ error: 'org_id, provider, name required' }, { status: 400 });
    }
    
    const { integration, error } = await createIntegration(org_id, provider, name, credentials);
    
    if (error) throw error;
    
    return NextResponse.json({ integration, created: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/integrations?id=xxx&org_id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const orgId = request.nextUrl.searchParams.get('org_id');
    
    if (!id || !orgId) {
      return NextResponse.json({ error: 'id and org_id required' }, { status: 400 });
    }
    
    const { error } = await deleteIntegration(id, orgId);
    
    if (error) throw error;
    
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
