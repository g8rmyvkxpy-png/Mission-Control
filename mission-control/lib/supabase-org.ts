import { createClient } from '@supabase/supabase-js';

// Server-side client (for API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get organization from Clerk org ID
export async function getOrganization(clerkOrgId: string) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('clerk_org_id', clerkOrgId)
    .single();
  
  if (error) throw error;
  return data;
}

// Get organization members
export async function getOrganizationMembers(orgId: string) {
  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) throw error;
  return data;
}

// Check if user is org member
export async function isOrganizationMember(orgId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .single();
  
  return !!data;
}

// Organization-scoped queries
export const orgQueries = {
  // Agents
  listAgents: (orgId: string) => 
    supabaseAdmin.from('managed_agents').select('*').eq('organization_id', orgId),
  
  getAgent: (orgId: string, agentId: string) =>
    supabaseAdmin.from('managed_agents').select('*').eq('organization_id', orgId).eq('id', agentId).single(),
  
  createAgent: (orgId: string, agent: any) =>
    supabaseAdmin.from('managed_agents').insert({ ...agent, organization_id: orgId }),
  
  // Tasks
  listTasks: (orgId: string, agentId?: string) => {
    let query = supabaseAdmin.from('agent_tasks').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
    if (agentId) query = query.eq('agent_id', agentId);
    return query;
  },
  
  createTask: (orgId: string, task: any) =>
    supabaseAdmin.from('agent_tasks').insert({ ...task, organization_id: orgId }),
  
  updateTask: (orgId: string, taskId: string, updates: any) =>
    supabaseAdmin.from('agent_tasks').update(updates).eq('organization_id', orgId).eq('id', taskId),
  
  // Workflows
  listWorkflows: (orgId: string) =>
    supabaseAdmin.from('workflows').select('*').eq('organization_id', orgId),
  
  createWorkflow: (orgId: string, workflow: any) =>
    supabaseAdmin.from('workflows').insert({ ...workflow, organization_id: orgId }),
  
  // Leads
  listLeads: (orgId: string) =>
    supabaseAdmin.from('leads').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
  
  // Activity
  listActivity: (orgId: string, limit = 50) =>
    supabaseAdmin.from('agent_activity').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(limit),
};
