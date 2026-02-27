import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plan limits
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 4900, // cents
    agents: 5,
    tasks: 1000,
    workflows: 3,
    support: 'email'
  },
  growth: {
    name: 'Growth',
    price: 14900,
    agents: 20,
    tasks: 10000,
    workflows: 10,
    support: 'priority'
  },
  enterprise: {
    name: 'Enterprise',
    price: 0, // custom
    agents: -1, // unlimited
    tasks: -1,
    workflows: -1,
    support: 'dedicated'
  }
};

export type PlanType = 'starter' | 'growth' | 'enterprise';

// Get organization billing info
export async function getBillingInfo(orgId: string) {
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();
  
  if (!org) return null;
  
  // Get usage
  const { count: agentCount } = await supabaseAdmin
    .from('managed_agents')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);
  
  const { count: taskCount } = await supabaseAdmin
    .from('agent_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
  
  const { count: workflowCount } = await supabaseAdmin
    .from('workflows')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);
  
  const plan = org.plan || 'starter';
  const planLimits = PLANS[plan as PlanType] || PLANS.starter;
  
  return {
    plan,
    planName: planLimits.name,
    price: planLimits.price,
    stripeCustomerId: org.settings?.stripe_customer_id,
    usage: {
      agents: agentCount || 0,
      agentLimit: planLimits.agents,
      tasks: taskCount || 0,
      taskLimit: planLimits.tasks,
      workflows: workflowCount || 0,
      workflowLimit: planLimits.workflows
    }
  };
}

// Check if org can create more agents/tasks
export async function checkLimits(orgId: string, type: 'agent' | 'task' | 'workflow'): Promise<{ allowed: boolean; current: number; limit: number }> {
  const billing = await getBillingInfo(orgId);
  if (!billing) return { allowed: false, current: 0, limit: 0 };
  
  if (type === 'agent') {
    return {
      allowed: billing.usage.agents < billing.usage.agentLimit || billing.usage.agentLimit === -1,
      current: billing.usage.agents,
      limit: billing.usage.agentLimit
    };
  }
  if (type === 'task') {
    return {
      allowed: billing.usage.tasks < billing.usage.taskLimit || billing.usage.taskLimit === -1,
      current: billing.usage.tasks,
      limit: billing.usage.taskLimit
    };
  }
  return {
    allowed: billing.usage.workflows < billing.usage.workflowLimit || billing.usage.workflowLimit === -1,
    current: billing.usage.workflows,
    limit: billing.usage.workflowLimit
  };
}

// Create Stripe customer (would be called from webhook or on org creation)
export async function createStripeCustomer(orgId: string, email: string) {
  // In production, call Stripe API:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const customer = await stripe.customers.create({ email });
  
  // For now, just store placeholder
  await supabaseAdmin
    .from('organizations')
    .update({
      settings: {
        stripe_customer_id: `cus_placeholder_${Date.now()}`,
        stripe_email: email
      }
    })
    .eq('id', orgId);
  
  return { customerId: `cus_placeholder_${Date.now()}` };
}

// Upgrade plan
export async function updatePlan(orgId: string, plan: PlanType) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .update({ plan })
    .eq('id', orgId)
    .select()
    .single();
  
  return { organization: data, error };
}
