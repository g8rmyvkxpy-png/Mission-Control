import { NextRequest, NextResponse } from 'next/server';
import { getBillingInfo, checkLimits, updatePlan, PLANS } from '@/lib/billing';

// GET /api/billing?org_id=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id');
    const type = request.nextUrl.searchParams.get('type'); // agent, task, workflow
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    if (type) {
      const limits = await checkLimits(orgId, type as any);
      return NextResponse.json(limits);
    }
    
    const billing = await getBillingInfo(orgId);
    
    return NextResponse.json(billing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/billing - Update plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, plan } = body;
    
    if (!org_id || !plan) {
      return NextResponse.json({ error: 'org_id and plan required' }, { status: 400 });
    }
    
    const { organization, error } = await updatePlan(org_id, plan);
    
    if (error) throw error;
    
    return NextResponse.json({ organization, updated: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
