import { NextRequest, NextResponse } from 'next/server';
import { getBillingInfo, checkLimits, updatePlan, PLANS } from '@/lib/billing';

// GET /api/billing?org_id=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id') || 'default-org';
    const type = request.nextUrl.searchParams.get('type'); // agent, task, workflow
    
    // Return mock billing info if no org_id
    const mockBilling = {
      plan: 'starter',
      planName: 'Starter',
      price: 4900,
      usage: {
        agents: 3,
        agentLimit: 5,
        tasks: 127,
        taskLimit: 1000,
        workflows: 3,
        workflowLimit: 3
      },
      features: {
        apiAccess: false,
        prioritySupport: false,
        customIntegrations: false
      }
    };
    
    if (type === 'agent') {
      return NextResponse.json({ allowed: mockBilling.usage.agents < mockBilling.usage.agentLimit, current: mockBilling.usage.agents, limit: mockBilling.usage.agentLimit });
    }
    if (type === 'task') {
      return NextResponse.json({ allowed: mockBilling.usage.tasks < mockBilling.usage.taskLimit, current: mockBilling.usage.tasks, limit: mockBilling.usage.taskLimit });
    }
    if (type === 'workflow') {
      return NextResponse.json({ allowed: mockBilling.usage.workflows < mockBilling.usage.workflowLimit, current: mockBilling.usage.workflows, limit: mockBilling.usage.workflowLimit });
    }
    
    return NextResponse.json(mockBilling);
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
